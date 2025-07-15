def detect(candles):
    if len(candles) < 2: return None
    prev = candles[-2]
    curr = candles[-1]
    if curr.close < curr.open and prev.close > prev.open:
        if curr.open > prev.close and curr.close < prev.open:
            return { "pattern": "Bearish Engulfing 🔴", "confidence": 88, "trend": "Bearish" }
    return None
