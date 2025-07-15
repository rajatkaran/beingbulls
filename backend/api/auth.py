from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from config import SMTP_SENDER, SMTP_PASSWORD, SMTP_HOST, SMTP_PORT, JWT_SECRET, JWT_EXPIRY_SECONDS
from jose import jwt
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText

router = APIRouter()
otp_store = {}

class OTPRequest(BaseModel):
    email: EmailStr

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str

def send_otp_email(receiver: str, otp: str):
    msg = MIMEText(f"Your OTP for BeingBulls login is: {otp}")
    msg['Subject'] = "BeingBulls OTP Login"
    msg['From'] = SMTP_SENDER
    msg['To'] = receiver

    try:
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(SMTP_SENDER, SMTP_PASSWORD)
        server.sendmail(SMTP_SENDER, receiver, msg.as_string())
        server.quit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email failed: {str(e)}")

@router.post("/send-otp")
def send_otp(req: OTPRequest):
    from random import randint
    otp = str(randint(100000, 999999))
    otp_store[req.email] = otp
    send_otp_email(req.email, otp)
    return {"message": "OTP sent successfully."}

@router.post("/verify-otp")
def verify_otp(req: OTPVerify):
    if otp_store.get(req.email) != req.otp:
        raise HTTPException(status_code=401, detail="Invalid OTP")

    payload = {
        "sub": req.email,
        "exp": datetime.utcnow() + timedelta(seconds=JWT_EXPIRY_SECONDS)
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
    return {"access_token": token, "token_type": "bearer"}

@router.get("/check")
def health():
    return {"status": "auth router running"}
