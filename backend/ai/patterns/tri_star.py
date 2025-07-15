def detect(candles):
    if len(candles) < 3: return None
    a, b, c = candles[-3:]
    if all(abs(x.open - x.close) < 0.1 for x in [a,b,c]):
        return {"pattern": "Tri-Star ⭐", "confidence": 80, "trend": "Reversal"}
    return None
