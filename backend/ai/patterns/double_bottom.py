def detect(candles):
    if len(candles) < 10: return None
    lows = [c.low for c in candles[-10:]]
    min1 = min(lows[:5])
    min2 = min(lows[5:])
    if abs(min1 - min2) / min1 < 0.02:
        return {"pattern": "Double Bottom 🏔️", "confidence": 87, "trend": "Bullish"}
    return None
