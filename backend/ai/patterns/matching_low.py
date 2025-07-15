def detect(candles):
    if len(candles) < 2: return None
    a, b = candles[-2], candles[-1]
    if a.close < a.open and b.close < b.open and abs(a.close - b.close) < 0.1:
        return {"pattern": "Matching Low ⬇️⬇️", "confidence": 80, "trend": "Bullish"}
    return None
