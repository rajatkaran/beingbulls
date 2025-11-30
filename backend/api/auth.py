# backend/api/auth.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from config import (
    SMTP_SENDER,
    SMTP_PASSWORD,
    SMTP_HOST,
    SMTP_PORT,
    JWT_SECRET,
    JWT_EXPIRY_SECONDS
)
from jose import jwt
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from random import randint

# Import your DB collections
# (These must exist in database/mongo.py — users collection required)
from database.mongo import users

router = APIRouter()

# Temporary in-memory store (fallback)
otp_store = {}


# ============================
# MODELS
# ============================
class OTPRequest(BaseModel):
    email: EmailStr


class OTPVerify(BaseModel):
    email: EmailStr
    otp: str


# ============================
# SEND EMAIL FUNCTION
# ============================
def send_otp_email(receiver: str, otp: str):
    msg = MIMEText(f"Your OTP for BeingBulls login is: {otp}")
    msg["Subject"] = "BeingBulls OTP Login"
    msg["From"] = SMTP_SENDER
    msg["To"] = receiver

    # Safety check
    if not SMTP_SENDER or not SMTP_PASSWORD:
        raise HTTPException(
            status_code=500,
            detail="SMTP credentials missing in environment variables"
        )

    try:
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(SMTP_SENDER, SMTP_PASSWORD)
        server.sendmail(SMTP_SENDER, receiver, msg.as_string())
        server.quit()
    except Exception as e:
        print("SMTP Error:", e)
        raise HTTPException(status_code=500, detail=f"Email failed: {str(e)}")


# ============================
# SEND OTP
# ============================
@router.post("/send-otp")
def send_otp(req: OTPRequest):
    otp = str(randint(100000, 999999))

    # Save OTP in memory
    otp_store[req.email] = otp

    # Mail OTP
    send_otp_email(req.email, otp)

    return {"message": "OTP sent successfully"}


# ============================
# VERIFY OTP → ISSUE JWT
# ============================
@router.post("/verify-otp")
def verify_otp(req: OTPVerify):
    # Check OTP
    if otp_store.get(req.email) != req.otp:
        raise HTTPException(status_code=401, detail="Invalid OTP")

    # Delete OTP after use
    otp_store.pop(req.email, None)

    # Ensure user exists in DB
    user = users.find_one({"email": req.email})
    if not user:
        users.insert_one({
            "email": req.email,
            "created_at": datetime.utcnow(),
            "isSubscribed": False,
            "plan": None,
            "txn_id": None
        })

    # Generate JWT
    payload = {
        "sub": req.email,
        "exp": datetime.utcnow() + timedelta(seconds=JWT_EXPIRY_SECONDS)
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")

    return {
        "access_token": token,
        "token_type": "bearer",
        "email": req.email
    }


# ============================
# HEALTH CHECK
# ============================
@router.get("/check")
def health():
    return {"status": "auth router running"}
