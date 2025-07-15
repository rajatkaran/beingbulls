def detect(candles):
    if len(candles) < 2: return None
    prev, curr = candles[-2], candles[-1]
    if prev.open > prev.close and curr.open < curr.close:
        if abs(curr.close - prev.close) < 0.1:
            return {"pattern": "In Neck 🧣", "confidence": 80, "trend": "Bearish"}
    return None
