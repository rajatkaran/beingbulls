def detect(candles):
    last = candles[-1]
    body = abs(last.open - last.close)
    lower_wick = min(last.open, last.close) - last.low
    upper_wick = last.high - max(last.open, last.close)

    if lower_wick > 2 * body and upper_wick < body:
        return {
            "pattern": "Hammer 🪓",
            "confidence": 92,
            "trend": "Bullish"
        }
    return None
