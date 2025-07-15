def detect(candles):
    if len(candles) < 10: return None
    highs = [c.high for c in candles[-10:]]
    max1 = max(highs[:5])
    max2 = max(highs[5:])
    if abs(max1 - max2) / max1 < 0.02:
        return {"pattern": "Double Top ⛰️", "confidence": 87, "trend": "Bearish"}
    return None
