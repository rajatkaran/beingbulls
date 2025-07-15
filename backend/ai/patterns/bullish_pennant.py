def detect(candles):
    if len(candles) < 7: return None
    if candles[-7].close < candles[-1].close:
        consolidation = all(abs(c.open - c.close) < 0.5 for c in candles[-5:])
        if consolidation:
            return {"pattern": "Bullish Pennant 🏁", "confidence": 82, "trend": "Bullish"}
    return None
