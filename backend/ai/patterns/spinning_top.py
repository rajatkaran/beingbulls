def detect(candles):
    c = candles[-1]
    body = abs(c.open - c.close)
    shadow = c.high - c.low
    if body < shadow * 0.3:
        return {"pattern": "Spinning Top 🌀", "confidence": 75, "trend": "Neutral"}
    return None
