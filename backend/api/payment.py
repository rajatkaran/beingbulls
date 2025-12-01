# backend/api/payment.py
from fastapi import APIRouter, HTTPException, Header, Request, status
from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime, timedelta
import hmac
import hashlib
import json
import os

import razorpay  # ensure razorpay is in requirements

from jose import jwt, JWTError
from config import (
    RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET,
    RAZORPAY_WEBHOOK_SECRET,  # optional, fallback to RAZORPAY_KEY_SECRET if not set
    JWT_SECRET
)
from database.mongo import users, payments as payments_coll, get_db

router = APIRouter()


# -----------------------
# Request models
# -----------------------
class CreateOrderRequest(BaseModel):
    plan: Optional[str] = None  # "weekly" or "monthly"
    amount: Optional[int] = None  # amount in paise (optional)


class VerifyPaymentRequest(BaseModel):
    order_id: str
    payment_id: str
    signature: str
    plan: Optional[str] = None
    days: Optional[int] = None


# -----------------------
# Helpers
# -----------------------
def verify_token_value(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload.get("sub")
    except JWTError:
        return None


def compute_expiry_from_plan(plan: Optional[str], custom_days: Optional[int] = None) -> datetime:
    if custom_days and isinstance(custom_days, int) and custom_days > 0:
        days = custom_days
    else:
        if not plan:
            days = 7
        else:
            p = plan.lower()
            if "month" in p:
                days = 28
            elif "week" in p:
                days = 7
            else:
                days = 7
    return datetime.utcnow() + timedelta(days=days)


def verify_razorpay_signature(order_id: str, payment_id: str, signature: str) -> bool:
    try:
        payload = f"{order_id}|{payment_id}".encode("utf-8")
        secret = (RAZORPAY_KEY_SECRET or "").encode("utf-8")
        expected = hmac.new(secret, payload, hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, signature)
    except Exception as e:
        print("[payment] signature verify error:", e)
        return False


# -----------------------
# CREATE ORDER
# -----------------------
@router.post("/create-order")
async def create_order(req: CreateOrderRequest, authorization: Optional[str] = Header(None)):
    """
    Creates a Razorpay order.
    Accepts either { "plan": "weekly"/"monthly" } or { "amount": 5900 } (paise).
    Requires Authorization: Bearer <JWT> to identify user.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization required")

    token = authorization.split()[1] if len(authorization.split()) > 1 else authorization
    email = verify_token_value(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")

    # determine amount (paise)
    if req.amount and isinstance(req.amount, int) and req.amount > 0:
        amount = req.amount
    else:
        plan = (req.plan or "weekly").lower()
        amount = 21900 if "month" in plan else 5900

    try:
        client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
        order = client.order.create({
            "amount": int(amount),
            "currency": "INR",
            "payment_capture": 1
        })
    except Exception as e:
        print("[payment] create order error:", e)
        raise HTTPException(status_code=500, detail="Failed to create order")

    # persist a pre-payment record (upsert)
    try:
        payments_coll.update_one(
            {"order_id": order.get("id")},
            {"$set": {
                "order_id": order.get("id"),
                "amount": order.get("amount"),
                "currency": order.get("currency"),
                "email": email,
                "plan": req.plan or None,
                "status": "created",
                "created_at": datetime.utcnow()
            }},
            upsert=True
        )
    except Exception as e:
        print("[payment] payments write failed:", e)

    return {"order_id": order.get("id"), "amount": order.get("amount")}


# -----------------------
# VERIFY PAYMENT (frontend calls after checkout)
# -----------------------
@router.post("/verify")
async def verify_payment(payload: VerifyPaymentRequest, authorization: Optional[str] = Header(None)):
    """
    Verify payment signature sent by frontend after Razorpay checkout.
    Requires Authorization header to identify user performing the verification.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization required")

    token = authorization.split()[1] if len(authorization.split()) > 1 else authorization
    email = verify_token_value(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")

    # verify signature
    ok = verify_razorpay_signature(payload.order_id, payload.payment_id, payload.signature)
    if not ok:
        raise HTTPException(status_code=400, detail="Signature mismatch")

    # compute expiry
    expiry_dt = compute_expiry_from_plan(payload.plan, payload.days)

    # upsert payment record
    try:
        payments_coll.update_one(
            {"order_id": payload.order_id},
            {"$set": {
                "order_id": payload.order_id,
                "payment_id": payload.payment_id,
                "signature": payload.signature,
                "email": email,
                "plan": payload.plan or "weekly",
                "status": "paid",
                "verified_at": datetime.utcnow()
            }},
            upsert=True
        )
    except Exception as e:
        print("[payment] payments update failed:", e)

    # update user subscription state
    try:
        users.update_one(
            {"email": email},
            {"$set": {
                "isSubscribed": True,
                "subscription_expiry": expiry_dt.isoformat(),
                "plan": payload.plan or "weekly",
                "txn_id": payload.payment_id
            }},
            upsert=True
        )
    except Exception as e:
        print("[payment] users update failed:", e)
        raise HTTPException(status_code=500, detail="Failed to update subscription")

    return {"status": "ok", "email": email, "subscription_expiry": expiry_dt.isoformat()}


# -----------------------
# WEBHOOK (Razorpay -> this endpoint)
# -----------------------
@router.post("/webhook")
async def razorpay_webhook(request: Request, x_razorpay_signature: Optional[str] = Header(None)):
    """
    Razorpay webhook receiver. Verifies signature using webhook secret and stores event.
    Use RAZORPAY_WEBHOOK_SECRET in config; falls back to RAZORPAY_KEY_SECRET if not set.
    """
    raw = await request.body()
    text_body = raw.decode("utf-8", errors="ignore")

    secret = (RAZORPAY_WEBHOOK_SECRET or RAZORPAY_KEY_SECRET or "").encode("utf-8")
    try:
        expected = hmac.new(secret, text_body.encode("utf-8"), hashlib.sha256).hexdigest()
        if not x_razorpay_signature or not hmac.compare_digest(expected, x_razorpay_signature):
            print("[payment:webhook] signature mismatch")
            raise HTTPException(status_code=400, detail="Invalid signature")
    except HTTPException:
        raise
    except Exception as e:
        print("[payment:webhook] signature verify exception:", e)
        raise HTTPException(status_code=400, detail="Signature error")

    # parse event
    try:
        payload = json.loads(text_body)
    except Exception as e:
        print("[payment:webhook] json parse error:", e)
        payload = {"raw": text_body}

    # store webhook event (best-effort)
    try:
        db = get_db()
        db["payment_webhooks"].insert_one({"received_at": datetime.utcnow(), "payload": payload})
    except Exception as e:
        print("[payment:webhook] store failed:", e)

    # Reconcile payment.captured or order.paid events
    try:
        event = payload.get("event") or ""
        if event in ("payment.captured", "order.paid"):
            # try to extract order_id and payment_id
            ent = payload.get("payload", {}).get("payment", {}).get("entity") or payload.get("payload", {}).get("order", {}).get("entity")
            if ent:
                order_id = ent.get("order_id") or ent.get("order_id") or ent.get("id")
                payment_id = ent.get("id")
                rec = payments_coll.find_one({"order_id": order_id})
                if rec and rec.get("email"):
                    plan = rec.get("plan") or "weekly"
                    expiry_dt = compute_expiry_from_plan(plan)
                    users.update_one({"email": rec["email"]}, {"$set": {
                        "isSubscribed": True,
                        "subscription_expiry": expiry_dt.isoformat(),
                        "txn_id": payment_id
                    }})
                    payments_coll.update_one({"order_id": order_id}, {"$set": {"status": "paid", "payment_id": payment_id}})
    except Exception as e:
        print("[payment:webhook] reconcile failed:", e)

    return {"status": "ok"}
