def detect(candles):
    if len(candles) < 5: return None
    a, b, c, d, e = candles[-5:]
    if a.open > a.close and b.close < b.open < a.close and c.close < c.open < b.close and d.close < d.open < c.close and e.close > a.open:
        return {"pattern": "Bullish Breakaway 🔓", "confidence": 88, "trend": "Bullish"}
    return None
