# backend/api/scan.py
from fastapi import APIRouter, HTTPException, Header, status
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any, Dict
from datetime import datetime

from jose import jwt, JWTError
from config import JWT_SECRET

from ai.pattern_utils import detect_all_patterns
from ai.ema_utils import is_ema_uptrend

from database.mongo import scans, users, feedbacks, get_db

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
    email: Optional[EmailStr] = None
    candles: List[Candle]


# --------------------
# Helper: token verify
# --------------------
def verify_token_value(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload.get("sub")
    except JWTError:
        return None


# --------------------
# sliding-window detector (cleaned + dedupe)
# --------------------
def sliding_window_detect(candles: List[Dict[str, Any]],
                          max_window: int = 60,
                          min_window: int = 3,
                          max_scan_back: int = 800) -> List[Dict[str, Any]]:
    n = len(candles)
    if n == 0:
        return []

    results: List[Dict[str, Any]] = []
    start_base = max(0, n - max_scan_back)

    # prefer larger windows first (helps multi-candle patterns)
    for start in range(start_base, n):
        # try window sizes from max_window down to min_window
        for wlen in range(min(max_window, n - start), min_window - 1, -1):
            end = start + wlen - 1
            window = candles[start:end + 1]
            try:
                detected = detect_all_patterns(window)
            except Exception as e:
                print(f"[scan] detector error window {start}-{end}: {e}")
                detected = None

            if not detected:
                continue

            normalized = []
            if isinstance(detected, dict):
                normalized = [detected]
            elif isinstance(detected, list):
                normalized = [d for d in detected if isinstance(d, dict)]
            else:
                continue

            for det in normalized:
                name = det.get("pattern") or det.get("name") or det.get("title") or "Unknown"
                confidence = float(det.get("confidence") or det.get("score") or 0)
                trend = det.get("trend") or det.get("direction")
                # detector may return relative indices inside window
                rel_start = int(det.get("start", det.get("idx_start", 0)))
                rel_end = int(det.get("end", det.get("idx_end", wlen - 1)))
                abs_start = max(start, start + rel_start)
                abs_end = min(start + wlen - 1, start + rel_end)

                entry = {
                    "pattern": name,
                    "confidence": confidence,
                    "trend": trend,
                    "start": abs_start,
                    "end": abs_end
                }

                # dedupe overlapping same-patterns (keep higher confidence)
                dup = False
                for r in results:
                    if r["pattern"] == entry["pattern"]:
                        ov_start = max(r["start"], entry["start"])
                        ov_end = min(r["end"], entry["end"])
                        ov = max(0, ov_end - ov_start + 1)
                        len_min = min(r["end"] - r["start"] + 1, entry["end"] - entry["start"] + 1)
                        if len_min > 0 and (ov / len_min) > 0.6:
                            dup = True
                            if entry["confidence"] > r.get("confidence", 0):
                                r.update(entry)
                            break
                if not dup:
                    results.append(entry)

            # continue scanning (we want different pattern types too)
    # sort results by start index then by confidence desc
    results.sort(key=lambda x: (x["start"], -x["confidence"]))
    return results


# --------------------
# main POST /scan (with subscription enforcement)
# --------------------
@router.post("/", status_code=200)
def scan_patterns(scan_data: ScanRequest, authorization: Optional[str] = Header(None)):
    candles_in = [c.dict() for c in scan_data.candles]
    if not candles_in or len(candles_in) < 3:
        raise HTTPException(status_code=400, detail="Need at least 3 candles to scan")

    # auth required (to enforce subscription) — allow admin-bypass-token
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization required")

    parts = authorization.split()
    token = parts[1] if len(parts) > 1 else parts[0]

    # admin bypass token explicit (dev/testing)
    if token == "admin-bypass-token":
        user_email = "admin-bypass"
        is_subscribed = True
        user_doc = {"email": user_email, "isSubscribed": True}
    else:
        user_email = verify_token_value(token)
        if not user_email:
            raise HTTPException(status_code=401, detail="Invalid token")
        user_doc = users.find_one({"email": user_email})
        if not user_doc:
            raise HTTPException(status_code=401, detail="User not found")

        # check subscription expiry flag
        is_subscribed = bool(user_doc.get("isSubscribed", False))
        expiry_val = user_doc.get("subscription_expiry")
        if expiry_val:
            try:
                if isinstance(expiry_val, str):
                    expiry_dt = datetime.fromisoformat(expiry_val)
                else:
                    expiry_dt = expiry_val
                if expiry_dt < datetime.utcnow():
                    is_subscribed = False
            except Exception:
                pass

    if not is_subscribed:
        raise HTTPException(status_code=403, detail="Active subscription required to perform scan")

    # run detection
    detections = sliding_window_detect(candles_in, max_window=60, min_window=3, max_scan_back=800)

    # ema confirmation (simple helper)
    try:
        close_prices = [float(c["close"]) for c in candles_in if "close" in c]
        ema_confirmed = bool(is_ema_uptrend(close_prices))
    except Exception:
        ema_confirmed = False

    # save history (best-effort)
    try:
        history_doc = {
            "email": user_email or (scan_data.email or "unknown"),
            "timestamp": datetime.utcnow(),
            "patterns_detected": [d["pattern"] for d in detections],
            "confidence_scores": [d.get("confidence") for d in detections],
            "ema_confirmed": bool(ema_confirmed),
            "candle_count": len(candles_in)
        }
        scans.insert_one(history_doc)
    except Exception as e:
        print("[scan] history save error:", e)

    return {"patterns": detections, "ema_confirmed": bool(ema_confirmed)}


# --------------------
# GET /history (user scan history)
# --------------------
@router.get("/history")
def get_scan_history(authorization: Optional[str] = Header(None)):
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

    try:
        cursor = scans.find({"email": user_email}).sort("timestamp", -1).limit(50)
        history_list = []
        for h in cursor:
            history_list.append({
                "patterns_detected": h.get("patterns_detected", []),
                "confidence_scores": h.get("confidence_scores", []),
                "ema_confirmed": h.get("ema_confirmed", False),
                "timestamp": h.get("timestamp").isoformat() if isinstance(h.get("timestamp"), datetime) else str(h.get("timestamp"))
            })
        return {"history": history_list}
    except Exception as e:
        print("[history] DB read error:", e)
        raise HTTPException(status_code=500, detail="Database error")
