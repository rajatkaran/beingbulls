# backend/api/payment.py
from fastapi import APIRouter, HTTPException, Header, Request
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import os
import hmac
import hashlib
import json
import logging

from jose import jwt, JWTError
from config import RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, JWT_SECRET
from database.mongo import users, get_db

# optional: razorpay client (lazy init)
try:
    from razorpay import Client as RazorpayClient
except Exception:
    RazorpayClient = None

logger = logging.getLogger("beingbulls.payment")
router = APIRouter()

# --- Request model used by frontend to verify payment after checkout
class PaymentVerifyRequest(BaseModel):
    order_id: str
    payment_id: str
    signature: str
    plan: Optional[str] = None  # "weekly" or "monthly" (frontend should send)
    days: Optional[int] = None  # optional custom days


class OrderCreate(BaseModel):
    amount: int  # amount in paise


# --- helper to decode JWT and get user email
def verify_token_value(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload.get("sub")
    except JWTError:
        return None


# --- helper: calculate expiry based on plan
def compute_expiry(plan: Optional[str], custom_days: Optional[int] = None) -> datetime:
    if custom_days and isinstance(custom_days, int) and custom_days > 0:
        days = custom_days
    else:
        if not plan:
            days = 7
        else:
            plan_l = plan.lower()
            if "week" in plan_l:
                days = 7
            elif "month" in plan_l:
                days = 28
            else:
                days = 7
    return datetime.utcnow() + timedelta(days=days)


# --- verify razorpay signature helper (for frontend verify)
def verify_razorpay_signature(order_id: str, payment_id: str, signature: str) -> bool:
    try:
        payload = f"{order_id}|{payment_id}".encode("utf-8")
        secret = (RAZORPAY_KEY_SECRET or "").encode("utf-8")
        expected = hmac.new(secret, payload, hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, signature)
    except Exception as e:
        logger.exception("[payment] signature verify error")
        return False


# --- helper: get razorpay client (lazy)
def get_razorpay_client():
    if not RazorpayClient:
        raise RuntimeError("razorpay python package not installed")
    if not (RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET):
        raise RuntimeError("RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not set")
    return RazorpayClient(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))


# --- POST /payment/verify : called by frontend after checkout to confirm payment and update subscription
@router.post("/verify")
async def verify_payment(payload: PaymentVerifyRequest, authorization: Optional[str] = Header(None)):
    """
    Verify Razorpay payment signature and mark user subscribed.
    Frontend should call this after successful checkout and send:
    { order_id, payment_id, signature, plan }
    Authorization: Bearer <JWT> required (to identify user)
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization required")

    token = authorization.split()[1] if len(authorization.split()) > 1 else authorization
    user_email = verify_token_value(token)
    if not user_email:
        raise HTTPException(status_code=401, detail="Invalid token")

    # Verify signature
    ok = verify_razorpay_signature(payload.order_id, payload.payment_id, payload.signature)
    if not ok:
        raise HTTPException(status_code=400, detail="Payment signature mismatch")

    # Compute expiry
    expiry_dt = compute_expiry(payload.plan, payload.days)

    db = get_db()
    payments = db["payments"]

    # Upsert payment record (helps webhook to reconcile)
    try:
        payments.update_one(
            {"order_id": payload.order_id},
            {"$set": {
                "order_id": payload.order_id,
                "payment_id": payload.payment_id,
                "signature": payload.signature,
                "email": user_email,
                "plan": payload.plan,
                "status": "paid",
                "verified_at": datetime.utcnow(),
            }},
            upsert=True
        )
    except Exception as e:
        logger.exception("[payment] payments collection write failed")

    # Update user subscription
    try:
        users.update_one(
            {"email": user_email},
            {"$set": {
                "isSubscribed": True,
                "subscription_expiry": expiry_dt.isoformat(),
                "plan": payload.plan or "weekly",
                "txn_id": payload.payment_id,
            }},
            upsert=True
        )
    except Exception as e:
        logger.exception("[payment] users update failed")
        raise HTTPException(status_code=500, detail="Failed to update subscription")

    return {"status": "ok", "email": user_email, "subscription_expiry": expiry_dt.isoformat()}


# --- POST /payment/webhook : Razorpay webhook endpoint
@router.post("/webhook")
async def razorpay_webhook(request: Request):
    """
    Raw webhook receiver for Razorpay. Verify signature header and store event.
    If payment captured event and we already have a mapping in payments collection, update user subscription.
    Razorpay sends header: 'X-Razorpay-Signature'
    """
    signature_header = request.headers.get("X-Razorpay-Signature") or request.headers.get("x-razorpay-signature")
    body = await request.body()
    text_body = body.decode("utf-8", errors="ignore")

    # verify signature using webhook secret (use same key secret here if that's your webhook secret)
    try:
        secret = (RAZORPAY_KEY_SECRET or "").encode("utf-8")
        expected = hmac.new(secret, text_body.encode("utf-8"), hashlib.sha256).hexdigest()
        if not signature_header or not hmac.compare_digest(expected, signature_header):
            logger.warning("[payment:webhook] signature mismatch")
            raise HTTPException(status_code=400, detail="Invalid signature")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("[payment:webhook] signature verify exception")
        raise HTTPException(status_code=400, detail="Signature error")

    # parse JSON payload
    try:
        payload = json.loads(text_body)
    except Exception as e:
        logger.exception("[payment:webhook] json parse error")
        payload = {"raw": text_body}

    # store webhook event
    db = get_db()
    webhooks = db["payment_webhooks"]
    try:
        webhooks.insert_one({
            "received_at": datetime.utcnow(),
            "payload": payload
        })
    except Exception as e:
        logger.exception("[payment:webhook] webhook store failed")

    # If it's a payment captured event, attempt to reconcile
    try:
        event = payload.get("event") or ""
        if event in ("payment.captured", "order.paid", "payment.authorized"):
            # navigate payload to find payment id / order id
            ent = (payload.get("payload", {}).get("payment", {}).get("entity")
                   or payload.get("payload", {}).get("order", {}).get("entity"))
            if ent:
                order_id = ent.get("order_id") or ent.get("id")
                payment_id = ent.get("id") or ent.get("payment_id")
                payments = db["payments"]
                rec = payments.find_one({"order_id": order_id})
                if rec and rec.get("email"):
                    plan = rec.get("plan")
                    expiry_dt = compute_expiry(plan)
                    users.update_one({"email": rec["email"]}, {"$set": {
                        "isSubscribed": True,
                        "subscription_expiry": expiry_dt.isoformat(),
                        "txn_id": payment_id
                    }})
                    payments.update_one({"order_id": order_id}, {"$set": {"status": "paid", "payment_id": payment_id}})
    except Exception as e:
        logger.exception("[payment:webhook] reconcile failed")

    return {"status": "ok"}


# --- NEW: POST /payment/create-order : create Razorpay order (call from frontend)
@router.post("/create-order")
def create_order(payload: OrderCreate, authorization: Optional[str] = Header(None)):
    """
    Creates a Razorpay order server-side to avoid exposing secret logic in frontend.
    Body: { amount: int }  # in paise
    Returns: { order_id, amount }
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Auth required")

    token = authorization.split()[1] if len(authorization.split()) > 1 else authorization
    user_email = verify_token_value(token)
    if not user_email:
        raise HTTPException(status_code=401, detail="Invalid token")

    # create razorpay client
    try:
        client = get_razorpay_client()
    except Exception as e:
        logger.exception("[payment:create-order] razorpay client init failed")
        raise HTTPException(status_code=500, detail="Payment gateway not configured")

    try:
        order = client.order.create({
            "amount": int(payload.amount),
            "currency": "INR",
            "payment_capture": 1,
            "notes": {"email": user_email}
        })
        # store a minimal pending payment record
        db = get_db()
        payments = db["payments"]
        payments.update_one(
            {"order_id": order.get("id")},
            {"$set": {
                "order_id": order.get("id"),
                "amount": payload.amount,
                "currency": "INR",
                "status": "created",
                "email": user_email,
                "created_at": datetime.utcnow()
            }},
            upsert=True
        )
        return {"order_id": order.get("id"), "amount": payload.amount}
    except Exception as e:
        logger.exception("[payment:create-order] order create failed")
        raise HTTPException(status_code=500, detail="Order create failed")

# ------------------------------------------
# CREATE ORDER (Frontend → Razorpay order)
# ------------------------------------------
@router.post("/create-order")
async def create_order(payload: dict, authorization: Optional[str] = Header(None)):
    token = authorization.split()[1] if authorization else None
    email = verify_token_value(token)
    if not email:
        raise HTTPException(401, "Invalid token")

    plan = payload.get("plan")
    if plan == "monthly":
        amount = 219 * 100
    else:
        amount = 59 * 100

    import razorpay
    client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

    order = client.order.create({
        "amount": amount,
        "currency": "INR",
        "payment_capture": 1
    })

    return {
        "order_id": order["id"],
        "amount": amount
    }


