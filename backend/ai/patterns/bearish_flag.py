def detect(candles):
    if len(candles) < 7: return None
    recent = candles[-7:]
    downtrend = recent[0].close > recent[-1].close
    consolidation = all(abs(c.close - c.open) < 0.5 for c in recent[2:-1])
    if downtrend and consolidation:
        return {"pattern": "Bearish Flag 🚩", "confidence": 86, "trend": "Bearish"}
    return None
