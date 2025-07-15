def detect(candles):
    if len(candles) < 3: return None
    a, b, c = candles[-3:]
    if abs(b.open - b.close) < 0.1 and abs(a.close - b.open) > 1 and abs(c.open - b.open) > 1:
        return {"pattern": "Abandoned Baby 👶", "confidence": 90, "trend": "Reversal"}
    return None
