def detect(candles):
    if len(candles) < 2: return None
    prev, curr = candles[-2], candles[-1]
    if prev.open < prev.close and curr.open > curr.close:
        if curr.open < prev.close and curr.close > prev.open:
            return { "pattern": "Bearish Harami 🛑", "confidence": 83, "trend": "Bearish" }
    return None
