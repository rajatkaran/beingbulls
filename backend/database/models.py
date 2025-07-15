from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime


# ---------- USER MODEL ----------
class User(BaseModel):
    email: EmailStr
    otp: Optional[str] = None
    jwt_token: Optional[str] = None
    is_verified: bool = False
    subscription_active: bool = False
    subscription_type: Optional[str] = None  # "weekly" / "monthly"
    subscription_expiry: Optional[datetime] = None

    class Config:
        schema_extra = {
            "example": {
                "email": "user@example.com",
                "otp": "123456",
                "jwt_token": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
                "is_verified": True,
                "subscription_active": True,
                "subscription_type": "monthly",
                "subscription_expiry": "2025-07-31T23:59:59"
            }
        }


# ---------- SCAN HISTORY MODEL ----------
class ScanRecord(BaseModel):
    email: EmailStr
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    patterns_detected: List[str]
    ema_confirmed: bool
    confidence_scores: List[float]

    class Config:
        schema_extra = {
            "example": {
                "email": "user@example.com",
                "patterns_detected": ["Bullish Engulfing", "Morning Star"],
                "ema_confirmed": True,
                "confidence_scores": [0.82, 0.90],
            }
        }


# ---------- FEEDBACK MODEL ----------
class Feedback(BaseModel):
    email: EmailStr
    pattern_name: str
    was_accurate: bool
    confidence: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        schema_extra = {
            "example": {
                "email": "user@example.com",
                "pattern_name": "Bullish Engulfing",
                "was_accurate": True,
                "confidence": 0.82
            }
        }
