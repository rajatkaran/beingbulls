def detect(candles):
    c = candles[-1]
    if abs(c.open - c.close) <= 0.05 * (c.high - c.low):
        return { "pattern": "Doji ⚖️", "confidence": 80, "trend": "Neutral" }
    return None
