def detect(candles):
    if len(candles) < 7: return None
    l = [c.low for c in candles[-7:]]
    if l[1] > l[2] and l[2] < l[3] and l[3] > l[4] and l[0] > l[2] and l[5] > l[2]:
        return {"pattern": "Inverse H&S 👤", "confidence": 88, "trend": "Bullish"}
    return None
