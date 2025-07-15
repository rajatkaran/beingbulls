def detect(candles):
    if len(candles) < 7: return None
    recent = candles[-7:]
    uptrend = recent[0].close < recent[-1].close
    consolidation = all(abs(c.close - c.open) < 0.5 for c in recent[2:-1])
    if uptrend and consolidation:
        return {"pattern": "Bullish Flag 🚩", "confidence": 86, "trend": "Bullish"}
    return None
