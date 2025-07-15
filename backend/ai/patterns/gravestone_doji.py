def detect(candles):
    c = candles[-1]
    if abs(c.open - c.close) < 0.1 and (c.high - max(c.open, c.close)) > 2 * abs(c.open - c.close):
        return {"pattern": "Gravestone Doji 🪦", "confidence": 82, "trend": "Bearish"}
    return None
