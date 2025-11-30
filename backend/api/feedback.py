# backend/api/feedback.py
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from jose import jwt, JWTError

from config import JWT_SECRET
from database.mongo import feedbacks, users, get_db

router = APIRouter()

class FeedbackIn(BaseModel):
    scan_id: Optional[str] = None
    rating: Optional[int] = None  # 1-5
    comment: Optional[str] = None

def verify_token_value(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload.get("sub")
    except JWTError:
        return None

@router.post("/", status_code=201)
def submit_feedback(payload: FeedbackIn, authorization: Optional[str] = Header(None)):
    """
    Submit feedback. Authorization optional but preferred.
    If token provided and valid, attach user's email.
    """
    user_email = None
    if authorization:
        try:
            parts = authorization.split()
            tk = parts[1] if len(parts) > 1 else parts[0]
            user_email = verify_token_value(tk)
        except Exception:
            user_email = None

    doc = {
        "email": user_email,
        "scan_id": payload.scan_id,
        "rating": int(payload.rating) if payload.rating is not None else None,
        "comment": payload.comment,
        "timestamp": datetime.utcnow()
    }
    try:
        feedbacks.insert_one(doc)
    except Exception as e:
        print("[feedback] insert error:", e)
        raise HTTPException(status_code=500, detail="DB write failed")
    return {"status": "ok"}

@router.get("/mine", response_model=List[dict])
def get_my_feedback(authorization: Optional[str] = Header(None), limit: int = 50):
    """
    Get feedback submitted by the logged-in user.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Auth required")
    parts = authorization.split()
    tk = parts[1] if len(parts) > 1 else parts[0]
    user_email = verify_token_value(tk)
    if not user_email:
        raise HTTPException(status_code=401, detail="Invalid token")
    try:
        cursor = feedbacks.find({"email": user_email}).sort("timestamp", -1).limit(limit)
        out = []
        for f in cursor:
            out.append({
                "scan_id": f.get("scan_id"),
                "rating": f.get("rating"),
                "comment": f.get("comment"),
                "timestamp": f.get("timestamp").isoformat() if f.get("timestamp") else None
            })
        return out
    except Exception as e:
        print("[feedback] read error:", e)
        raise HTTPException(status_code=500, detail="DB read failed")

@router.get("/recent", response_model=List[dict])
def get_recent_feedback(limit: int = 50, admin_token: Optional[str] = Header(None)):
    """
    Admin-only-ish endpoint to fetch recent feedback. For now protected by admin-bypass-token or valid JWT.
    """
    email = None
    if admin_token:
        # allow admin bypass token literal
        if admin_token == "admin-bypass-token":
            email = "admin"
        else:
            email = verify_token_value(admin_token.split()[1] if len(admin_token.split())>1 else admin_token)
    if not email:
        raise HTTPException(status_code=401, detail="Admin auth required")
    try:
        cursor = feedbacks.find({}).sort("timestamp", -1).limit(limit)
        out = []
        for f in cursor:
            out.append({
                "email": f.get("email"),
                "scan_id": f.get("scan_id"),
                "rating": f.get("rating"),
                "comment": f.get("comment"),
                "timestamp": f.get("timestamp").isoformat() if f.get("timestamp") else None
            })
        return out
    except Exception as e:
        print("[feedback] recent read error:", e)
        raise HTTPException(status_code=500, detail="DB read failed")
