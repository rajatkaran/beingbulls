def detect(candles):
    if len(candles) < 2: return None
    a, b = candles[-2], candles[-1]
    if a.close > a.open and b.open < a.close and b.close < b.open:
        return {"pattern": "Kicker Bearish 💣", "confidence": 87, "trend": "Bearish"}
    return None
