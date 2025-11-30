# backend/api/scan.py
from fastapi import APIRouter, HTTPException, Header, status
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any, Dict
from datetime import datetime

from jose import jwt, JWTError
from config import JWT_SECRET

# your ai utilities (assumed available)
from ai.pattern_utils import detect_all_patterns, calculate_ema
from ai.ema_utils import is_ema_uptrend

# mongo collections imported from your db module (you had these)
from database.mongo import scans, users, feedbacks

router = APIRouter()


# --------------------
# Request models
# --------------------
class Candle(BaseModel):
    open: float
    high: float
    low: float
    close: float
    time: Optional[int] = None


class ScanRequest(BaseModel):
    email: EmailStr
    candles: List[Candle]


# --------------------
# Helper: token verify (simple)
# --------------------
def verify_token_value(token: str) -> Optional[str]:
    """
    Decode JWT and return subject (usually user email or id).
    Raise HTTPException if invalid.
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload.get("sub")
    except JWTError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


# --------------------
# Helper: sliding-window detection wrapper
# --------------------
def sliding_window_detect(candles: List[Dict[str, Any]], max_window: int = 60, max_scan_back: int = 500):
    """
    Scans the candles list with sliding windows and runs detect_all_patterns on each window.
    Returns a list of detections with start/end indices, confidence, trend, pattern name.
    - max_window: maximum window length to consider
    - max_scan_back: how many recent candles to consider scanning (to limit compute)
    """
    n = len(candles)
    if n == 0:
        return []

    results = []
    # limit scanning to last max_scan_back candles for performance
    start_base = max(0, n - max_scan_back)

    for start in range(start_base, n):
        # end range: at least start+2 (3-candle patterns), up to start+max_window or n
        end_limit = min(n, start + max_window)
        for end in range(start + 2, end_limit):
            window = candles[start:end + 1]
            try:
                detected = detect_all_patterns(window)  # assumed to return None, dict, or list
            except Exception as e:
                # don't fail entire scan if one pattern raises
                print(f"[scan] detector error on window {start}-{end}: {e}")
                detected = None

            if not detected:
                continue

            # normalize detected into list of dicts
            normalized = []
            if isinstance(detected, dict):
                normalized = [detected]
            elif isinstance(detected, list):
                normalized = detected
            else:
                # unknown truthy type: skip
                continue

            for det in normalized:
                # det expected to contain at least 'pattern' or 'name'
                name = det.get("pattern") or det.get("name") or det.get("title") or "Unknown"
                confidence = det.get("confidence") or det.get("score") or 0
                trend = det.get("trend") or det.get("direction") or None

                # Avoid duplicates: if same pattern already detected overlapping this region, skip
                dup = False
                for r in results:
                    if r["pattern"] == name and not (end < r["start"] or start > r["end"]):
                        dup = True
                        break
                if dup:
                    continue

                results.append({
                    "pattern": name,
                    "confidence": float(confidence),
                    "trend": trend,
                    "start": start,
                    "end": end
                })

            # optional: break early for this start if you want only first detection per start
            # break

    return results


# --------------------
# Main route
# --------------------
@router.post("/", status_code=200)
def scan_patterns(scan_data: ScanRequest, authorization: Optional[str] = Header(None)):
    """
    Accepts:
      POST /scan with JSON: { "email": "...", "candles": [ {open,high,low,close,time}, ... ] }
    Authorization header optional: "Bearer <token>"
    Returns:
      { "patterns": [ {pattern, confidence, trend, start, end} ], "ema_confirmed": bool }
    """

    # Validate candles
    candles_in = [c.dict() for c in scan_data.candles]
    if not candles_in or len(candles_in) < 3:
        raise HTTPException(status_code=400, detail="Need at least 3 candles to scan")

    # If Authorization provided, try verify (but don't fail if token invalid: optional)
    user_sub = None
    if authorization:
        try:
            # header like "Bearer <token>"
            parts = authorization.split()
            token = parts[1] if len(parts) > 1 else parts[0]
            user_sub = verify_token_value(token)
        except Exception as e:
            # token invalid — we will still allow scan but will not attach user to history
            print("[scan] invalid token in header:", str(e))
            user_sub = None

    # Run sliding-window detection
    detections = sliding_window_detect(candles_in, max_window=60, max_scan_back=800)

    # EMA confirmation (simple)
    try:
        close_prices = [float(c["close"]) for c in candles_in if "close" in c]
        ema_confirmed = is_ema_uptrend(close_prices)
    except Exception:
        ema_confirmed = False

    # Save history (best-effort) — prefer user_sub or provided email
    try:
        history_doc = {
            "email": scan_data.email,
            "timestamp": datetime.utcnow(),
            "patterns_detected": [d["pattern"] for d in detections],
            "confidence_scores": [d.get("confidence") for d in detections],
            "ema_confirmed": bool(ema_confirmed),
            "candle_count": len(candles_in)
        }
        # if we have user id from token, store it too
        if user_sub:
            history_doc["user_sub"] = user_sub

        # insert into scans collection (you imported scans earlier)
        try:
            scans.insert_one(history_doc)
        except Exception as e:
            print("[scan] DB insert failed:", e)
    except Exception as e:
        print("[scan] history save error:", e)

    # Response
    return {
        "patterns": detections,
        "ema_confirmed": bool(ema_confirmed)
    }
# ============================================================
#  GET /scan/history  → return scan history for logged user
# ============================================================
@router.get("/history")
def get_scan_history(authorization: Optional[str] = Header(None)):
    """
    Returns latest 50 scan entries for the logged-in user.
    Frontend/Extension calls this with:
        Authorization: Bearer <token>
    """

    # -----------------------
    # STEP 1: Extract JWT
    # -----------------------
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization token missing")

    try:
        parts = authorization.split()
        token = parts[1] if len(parts) > 1 else parts[0]
        user_email = verify_token_value(token)
    except Exception as e:
        print("[history] invalid token", e)
        raise HTTPException(status_code=401, detail="Invalid token")

    if not user_email:
        raise HTTPException(status_code=401, detail="User not authenticated")

    # -----------------------
    # STEP 2: Fetch history from DB
    # -----------------------
    try:
        cursor = scans.find(
            {"email": user_email}
        ).sort("timestamp", -1).limit(50)

        history_list = []
        for h in cursor:
            history_list.append({
                "pattern": h.get("patterns_detected", ["-"])[0] if h.get("patterns_detected") else "-",
                "confidence": h.get("confidence_scores", [None])[0],
                "emaConfirmed": h.get("ema_confirmed", False),
                "timestamp": h.get("timestamp").isoformat()
            })

        return {"history": history_list}

    except Exception as e:
        print("[history] DB read error:", e)
        raise HTTPException(status_code=500, detail="Database error")

