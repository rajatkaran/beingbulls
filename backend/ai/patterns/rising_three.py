def detect(candles):
    if len(candles) < 5: return None
    a,b,c,d,e = candles[-5:]
    if a.close > a.open and all(x.close < x.open for x in [b,c,d]) and e.close > e.open and e.close > a.close:
        return {"pattern": "Rising Three Methods 📈", "confidence": 89, "trend": "Bullish"}
    return None
