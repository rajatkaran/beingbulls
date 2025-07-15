def detect(candles):
    c = candles[-1]
    body = abs(c.open - c.close)
    if c.open == c.low and c.close > c.open:
        return {"pattern": "Bullish Belt Hold 🧷", "confidence": 84, "trend": "Bullish"}
    elif c.open == c.high and c.close < c.open:
        return {"pattern": "Bearish Belt Hold 🧷", "confidence": 84, "trend": "Bearish"}
    return None
