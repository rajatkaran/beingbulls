def detect(candles):
    if len(candles) < 2: return None
    a, b = candles[-2], candles[-1]
    if abs(a.low - b.low) < 0.2:
        return {"pattern": "Tweezer Bottom ✂️", "confidence": 78, "trend": "Bullish"}
    return None
