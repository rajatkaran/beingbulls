def detect(candles):
    if len(candles) < 2: return None
    c = candles[-1]
    body = abs(c.open - c.close)
    upper = c.high - max(c.open, c.close)
    lower = min(c.open, c.close) - c.low
    if upper > 2 * body and lower < body:
        return { "pattern": "Shooting Star 🌠", "confidence": 90, "trend": "Bearish" }
    return None
