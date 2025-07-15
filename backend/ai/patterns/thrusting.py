def detect(candles):
    if len(candles) < 2: return None
    prev, curr = candles[-2], candles[-1]
    if prev.open > prev.close and curr.open < curr.close:
        if curr.close < (prev.open + prev.close)/2:
            return {"pattern": "Thrusting ⬇️⬆️", "confidence": 82, "trend": "Bearish"}
    return None
