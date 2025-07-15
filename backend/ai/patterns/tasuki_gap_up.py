def detect(candles):
    if len(candles) < 3: return None
    a,b,c = candles[-3:]
    if a.close > a.open and b.open > a.close and b.close > b.open and c.open > b.close and c.close < c.open:
        return {"pattern": "Tasuki Gap Up 🟩⬆️🟥", "confidence": 84, "trend": "Bullish"}
    return None
