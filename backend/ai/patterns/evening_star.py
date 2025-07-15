def detect(candles):
    if len(candles) < 3: return None
    a, b, c = candles[-3], candles[-2], candles[-1]
    if a.close > a.open and b.body() < a.body()/2 and c.close < c.open:
        if c.close < a.open:
            return { "pattern": "Evening Star 🌇", "confidence": 85, "trend": "Bearish" }
    return None
