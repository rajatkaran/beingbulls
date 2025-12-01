# backend/api/auth.py
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from random import randint
import smtplib
from email.mime.text import MIMEText
from jose import jwt, JWTError
import bcrypt

from config import (
    SMTP_SENDER,
    SMTP_PASSWORD,
    SMTP_HOST,
    SMTP_PORT,
    JWT_SECRET,
    JWT_EXPIRY_SECONDS
)

from database.mongo import users

router = APIRouter()

# OTP memory store
otp_store = {}
RESET_PREFIX = "reset:"


# ======================================================
# MODELS
# ======================================================
class OTPRequest(BaseModel):
    email: EmailStr

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str

class ResetRequest(BaseModel):
    email: EmailStr

class ResetVerify(BaseModel):
    email: EmailStr
    otp: str
    new_password: str


# ======================================================
# EMAIL SENDER
# ======================================================
def send_otp_email(receiver: str, otp: str):
    if not SMTP_SENDER or not SMTP_PASSWORD:
        raise HTTPException(status_code=500, detail="SMTP credentials missing")

    msg = MIMEText(f"Your OTP for BeingBulls is: {otp}")
    msg["Subject"] = "BeingBulls Verification OTP"
    msg["From"] = SMTP_SENDER
    msg["To"] = receiver

    try:
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(SMTP_SENDER, SMTP_PASSWORD)
        server.sendmail(SMTP_SENDER, receiver, msg.as_string())
        server.quit()
    except Exception as e:
        print("SMTP ERROR:", e)
        raise HTTPException(status_code=500, detail="Failed to send OTP email")


# ======================================================
# OTP LOGIN FLOW
# ======================================================
@router.post("/send-otp")
def send_otp(req: OTPRequest):
    otp = str(randint(100000, 999999))
    otp_store[req.email] = otp
    send_otp_email(req.email, otp)
    return {"message": "OTP sent successfully"}


@router.post("/verify-otp")
def verify_otp(req: OTPVerify):
    stored = otp_store.get(req.email)
    if not stored or stored != req.otp:
        raise HTTPException(status_code=401, detail="Invalid OTP")

    otp_store.pop(req.email, None)

    # Ensure user exists
    user = users.find_one({"email": req.email})
    if not user:
        users.insert_one({
            "email": req.email,
            "created_at": datetime.utcnow(),
            "isSubscribed": False,
            "subscription_expiry": None,
            "plan": None,
            "password_hash": None
        })

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


# ======================================================
# PASSWORD RESET (OTP BASED)
# ======================================================
@router.post("/send-reset-otp")
def send_reset_otp(req: ResetRequest):
    otp = str(randint(100000, 999999))
    otp_store[RESET_PREFIX + req.email] = otp
    send_otp_email(req.email, otp)
    return {"message": "Password reset OTP sent"}


@router.post("/reset-password")
def reset_password(req: ResetVerify):
    key = RESET_PREFIX + req.email
    stored = otp_store.get(key)

    if not stored or stored != req.otp:
        raise HTTPException(status_code=401, detail="Invalid OTP")

    otp_store.pop(key, None)

    hashed_pw = bcrypt.hashpw(req.new_password.encode(), bcrypt.gensalt()).decode()

    users.update_one(
        {"email": req.email},
        {"$set": {"password_hash": hashed_pw}},
        upsert=True
    )

    return {"message": "Password reset successful"}


# ======================================================
# AUTH /me — SINGLE CLEAN VERSION
# ======================================================
def decode_token(token: str):
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"]).get("sub")
    except:
        return None


@router.get("/me")
def get_me(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization required")

    parts = authorization.split()
    token = parts[1] if len(parts) > 1 else parts[0]
    email = decode_token(token)

    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = users.find_one({"email": email})

    if not user:
        # auto create (first login)
        users.insert_one({
            "email": email,
            "isSubscribed": False,
            "subscription_expiry": None,
            "plan": None,
            "created_at": datetime.utcnow()
        })
        user = users.find_one({"email": email})

    expiry = user.get("subscription_expiry")
    is_sub = False
    remaining_days = 0

    if expiry:
        try:
            dt = datetime.fromisoformat(expiry)
            rem = (dt - datetime.utcnow()).days
            if rem > 0:
                is_sub = True
                remaining_days = rem
        except:
            pass

    return {
        "email": email,
        "isSubscribed": is_sub,
        "subscription_expiry": expiry,
        "plan": user.get("plan"),
        "remaining_days": remaining_days
    }
