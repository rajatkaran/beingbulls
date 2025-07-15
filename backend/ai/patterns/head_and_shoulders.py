def detect(candles):
    if len(candles) < 7: return None
    h = [c.high for c in candles[-7:]]
    if h[1] < h[2] and h[2] > h[3] and h[3] < h[4] and h[0] < h[2] and h[5] < h[2]:
        return {"pattern": "Head & Shoulders 👤", "confidence": 88, "trend": "Bearish"}
    return None
