def detect(candles):
    c = candles[-1]
    body = abs(c.open - c.close)
    upper = c.high - max(c.open, c.close)
    lower = min(c.open, c.close) - c.low
    if upper > 2 * body and lower < body:
        return { "pattern": "Inverted Hammer 🔨", "confidence": 80, "trend": "Bullish" }
    return None
