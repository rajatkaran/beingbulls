def detect(candles):
    c = candles[-1]
    body = abs(c.open - c.close)
    if body < 0.2 * (c.high - c.low):
        return {"pattern": "High Wave 🌊", "confidence": 77, "trend": "Neutral"}
    return None
