def detect(candles):
    if len(candles) < 2: return None
    a, b = candles[-2], candles[-1]
    if abs(a.high - b.high) < 0.2:
        return {"pattern": "Tweezer Top ✂️", "confidence": 78, "trend": "Bearish"}
    return None
