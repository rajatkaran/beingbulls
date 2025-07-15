def detect(candles):
    if len(candles) < 3: return None
    a, b, c = candles[-3], candles[-2], candles[-1]
    if all(x.close > x.open for x in [a,b,c]) and b.open > a.open and c.open > b.open:
        return {"pattern": "Three White Soldiers ⚔️", "confidence": 91, "trend": "Bullish"}
    return None
