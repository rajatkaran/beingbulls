from fastapi import APIRouter, Request, HTTPException
from config import RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
from datetime import datetime, timedelta
from database.mongo import get_db
import razorpay
import hmac
import hashlib
import json

router = APIRouter()

client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

# ----------------------------
# Create Razorpay Order
# ----------------------------
@router.post("/create-order")
def create_order(request: Request):
    data = request.query_params
    plan = data.get("plan")  # 'weekly' or 'monthly'
    email = data.get("email")

    if not plan or not email:
        raise HTTPException(status_code=400, detail="Missing plan or email")

    if plan == "weekly":
        amount = 5900  # ₹59 in paise
        duration = 7
    elif plan == "monthly":
        amount = 21900  # ₹219 in paise
        duration = 28
    else:
        raise HTTPException(status_code=400, detail="Invalid plan")

    order = client.order.create({
        "amount": amount,
        "currency": "INR",
        "payment_capture": 1,
        "notes": {"email": email, "plan": plan}
    })

    return {
        "id": order["id"],
        "amount": amount,
        "currency": "INR",
        "plan": plan
    }

# ----------------------------
# Razorpay Webhook Handler
# ----------------------------
@router.post("/webhook")
async def razorpay_webhook(req: Request):
    body = await req.body()
    signature = req.headers.get("x-razorpay-signature")

    if not signature:
        raise HTTPException(status_code=400, detail="Missing signature")

    secret = RAZORPAY_KEY_SECRET.encode()
    expected = hmac.new(secret, body, hashlib.sha256).hexdigest()

    if not hmac.compare_digest(expected, signature):
        raise HTTPException(status_code=403, detail="Invalid signature")

    payload = json.loads(body)
    if payload["event"] == "payment.captured":
        email = payload["payload"]["payment"]["entity"]["notes"]["email"]
        plan = payload["payload"]["payment"]["entity"]["notes"]["plan"]

        duration = 7 if plan == "weekly" else 28
        expiry = datetime.utcnow() + timedelta(days=duration)

        db = get_db()
        db.users.update_one(
            {"email": email},
            {"$set": {
                "subscription_active": True,
                "subscription_type": plan,
                "subscription_expiry": expiry
            }},
            upsert=True
        )

    return {"status": "success"}
