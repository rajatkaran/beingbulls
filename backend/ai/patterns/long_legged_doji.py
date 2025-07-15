def detect(candles):
    c = candles[-1]
    if abs(c.open - c.close) < 0.1 and (c.high - c.low) > 2 * abs(c.open - c.close):
        return {"pattern": "Long Legged Doji 🦵", "confidence": 78, "trend": "Neutral"}
    return None
