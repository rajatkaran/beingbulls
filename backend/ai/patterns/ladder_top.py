def detect(candles):
    if len(candles) < 5: return None
    a,b,c,d,e = candles[-5:]
    if all(x.close > x.open for x in [a,b,c]) and d.close < d.open and e.close < e.open:
        return {"pattern": "Ladder Top 🪜", "confidence": 85, "trend": "Bearish"}
    return None
