def detect(candles):
    if len(candles) < 6: return None
    highs = [c.high for c in candles[-6:]]
    lows = [c.low for c in candles[-6:]]
    if highs[0] > highs[-1] and lows[0] < lows[-1]:
        return {"pattern": "Symmetrical Triangle 🔺", "confidence": 83, "trend": "Neutral"}
    return None
