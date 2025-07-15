def detect(candles):
    if len(candles) < 2: return None
    prev, curr = candles[-2], candles[-1]
    if prev.close < prev.open and curr.open == prev.open and curr.close > curr.open:
        return {"pattern": "Separating Lines ↔️", "confidence": 83, "trend": "Bullish"}
    return None
