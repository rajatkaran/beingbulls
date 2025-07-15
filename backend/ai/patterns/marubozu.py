def detect(candles):
    c = candles[-1]
    if c.open == c.low and c.close == c.high:
        return {"pattern": "Bullish Marubozu 🟩", "confidence": 90, "trend": "Bullish"}
    elif c.open == c.high and c.close == c.low:
        return {"pattern": "Bearish Marubozu 🟥", "confidence": 90, "trend": "Bearish"}
    return None
