def detect(candles):
    if len(candles) < 6: return None
    h = [c.high for c in candles[-6:]]
    if max(h) - min(h) < 1:
        return {"pattern": "Rectangle Top 🧱", "confidence": 78, "trend": "Neutral"}
    return None
