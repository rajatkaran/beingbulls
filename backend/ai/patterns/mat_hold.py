def detect(candles):
    if len(candles) < 5: return None
    trend = candles[-5].close < candles[-1].close
    small_bodies = all(abs(c.open - c.close) < 0.3 for c in candles[-4:-1])
    if trend and small_bodies:
        return {"pattern": "Mat Hold 🪑", "confidence": 82, "trend": "Bullish"}
    return None
