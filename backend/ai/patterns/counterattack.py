def detect(candles):
    if len(candles) < 2: return None
    a, b = candles[-2], candles[-1]
    if a.close < a.open and b.close > b.open and b.close == a.close:
        return {"pattern": "Counterattack ⚔️", "confidence": 83, "trend": "Bullish"}
    return None
