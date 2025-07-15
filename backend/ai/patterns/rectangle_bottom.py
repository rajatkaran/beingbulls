def detect(candles):
    if len(candles) < 6: return None
    l = [c.low for c in candles[-6:]]
    if max(l) - min(l) < 1:
        return {"pattern": "Rectangle Bottom 🧱", "confidence": 78, "trend": "Neutral"}
    return None
