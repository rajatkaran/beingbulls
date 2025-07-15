from fastapi import APIRouter, Depends, HTTPException
from jose import jwt, JWTError
from config import JWT_SECRET
from ai.pattern_utils import detect_all_patterns
from ai.ema_utils import is_ema_uptrend
from database.mongo import get_db
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List

router = APIRouter()

class Candle(BaseModel):
    open: float
    high: float
    low: float
    close: float

class ScanRequest(BaseModel):
    email: EmailStr
    candles: List[Candle]

def verify_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/")
def scan_patterns(scan_data: ScanRequest, token: str = Depends(verify_token)):
    candles = [c.dict() for c in scan_data.candles]
    results = detect_all_patterns(candles)
    close_prices = [c['close'] for c in candles]
    ema_trend = is_ema_uptrend(close_prices)

    db = get_db()
    db.scan_history.insert_one({
        "email": scan_data.email,
        "timestamp": datetime.utcnow(),
        "patterns_detected": [r['pattern'] for r in results],
        "confidence_scores": [r['confidence'] for r in results],
        "ema_confirmed": ema_trend
    })

    return {
        "patterns": results,
        "ema_confirmed": ema_trend
    }
