# backend/api/auth.py
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, EmailStr
from config import SMTP_SENDER, SMTP_PASSWORD, SMTP_HOST, SMTP_PORT, JWT_SECRET, JWT_EXPIRY_SECONDS
from jose import jwt
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from random import randint

from database.mongo import users

router = APIRouter()
otp_store = {}  # short-term; later move to DB TTL

class OTPRequest(BaseModel):
    email: EmailStr

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str

def send_otp_email(receiver: str, otp: str):
    if not SMTP_SENDER or not SMTP_PASSWORD:
        raise HTTPException(status_code=500, detail="SMTP not configured")
    msg = MIMEText(f"Your OTP for BeingBulls login is: {otp}")
    msg["Subject"] = "BeingBulls OTP"
    msg["From"] = SMTP_SENDER
    msg["To"] = receiver
    try:
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(SMTP_SENDER, SMTP_PASSWORD)
        server.sendmail(SMTP_SENDER, receiver, msg.as_string())
        server.quit()
    except Exception as e:
        print("SMTP error:", e)
        raise HTTPException(status_code=500, detail="Email send failed")

@router.post("/send-otp")
def send_otp(req: OTPRequest):
    otp = str(randint(100000, 999999))
    otp_store[req.email] = otp
    send_otp_email(req.email, otp)
    return {"message": "OTP sent"}

@router.post("/verify-otp")
def verify_otp(req: OTPVerify):
    if otp_store.get(req.email) != req.otp:
        raise HTTPException(status_code=401, detail="Invalid OTP")
    otp_store.pop(req.email, None)
    # ensure user exists
    user = users.find_one({"email": req.email})
    if not user:
        users.insert_one({
            "email": req.email,
            "created_at": datetime.utcnow(),
            "isSubscribed": False,
            "subscription_expiry": None
        })
    payload = {"sub": req.email, "exp": datetime.utcnow() + timedelta(seconds=JWT_EXPIRY_SECONDS)}
    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
    return {"access_token": token, "token_type": "bearer", "email": req.email}

@router.get("/me")
def me(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Auth required")
    parts = authorization.split()
    token = parts[1] if len(parts) > 1 else parts[0]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    sub = payload.get("sub")
    user = users.find_one({"email": sub})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "email": user.get("email"),
        "isSubscribed": bool(user.get("isSubscribed", False)),
        "subscription_expiry": user.get("subscription_expiry")
    }

# ---------------------------
#   /auth/me  → return user profile
# ---------------------------
from fastapi import Header
from database.mongo import users

def decode_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload.get("sub")
    except:
        return None


@router.get("/me")
def get_me(authorization: str = Header(None)):
    """
    Returns:
    {
      "email": "...",
      "isSubscribed": true/false,
      "subscription_expiry": "...",
      "plan": "weekly/monthly",
      "remaining_days": int
    }
    """

    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization required")

    parts = authorization.split()
    token = parts[1] if len(parts) > 1 else parts[0]
    email = decode_token(token)

    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = users.find_one({"email": email})

    if not user:
        # Auto-create user document if not exists (first login)
        users.insert_one({
            "email": email,
            "isSubscribed": False,
            "subscription_expiry": None,
            "plan": None
        })
        user = users.find_one({"email": email})

    expiry = user.get("subscription_expiry")
    is_sub = False
    remaining_days = 0

    if expiry:
        try:
            expiry_dt = datetime.fromisoformat(expiry)
            remaining = (expiry_dt - datetime.utcnow()).days
            if remaining > 0:
                remaining_days = remaining
                is_sub = True
        except:
            pass

    return {
        "email": email,
        "isSubscribed": is_sub,
        "subscription_expiry": expiry,
        "plan": user.get("plan"),
        "remaining_days": remaining_days
    }
# ---------------------------
#   /auth/me  → return user profile
# ---------------------------
from fastapi import Header
from database.mongo import users

def decode_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload.get("sub")
    except:
        return None


@router.get("/me")
def get_me(authorization: str = Header(None)):
    """
    Returns:
    {
      "email": "...",
      "isSubscribed": true/false,
      "subscription_expiry": "...",
      "plan": "weekly/monthly",
      "remaining_days": int
    }
    """

    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization required")

    parts = authorization.split()
    token = parts[1] if len(parts) > 1 else parts[0]
    email = decode_token(token)

    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = users.find_one({"email": email})

    if not user:
        # Auto-create user document if not exists (first login)
        users.insert_one({
            "email": email,
            "isSubscribed": False,
            "subscription_expiry": None,
            "plan": None
        })
        user = users.find_one({"email": email})

    expiry = user.get("subscription_expiry")
    is_sub = False
    remaining_days = 0

    if expiry:
        try:
            expiry_dt = datetime.fromisoformat(expiry)
            remaining = (expiry_dt - datetime.utcnow()).days
            if remaining > 0:
                remaining_days = remaining
                is_sub = True
        except:
            pass

    return {
        "email": email,
        "isSubscribed": is_sub,
        "subscription_expiry": expiry,
        "plan": user.get("plan"),
        "remaining_days": remaining_days
    }

