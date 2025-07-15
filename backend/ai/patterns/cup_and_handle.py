# backend/ai/patterns/cup_and_handle.py

def detect(candles):
    """
    Detects the Cup and Handle pattern from a list of OHLC candles.
    Returns a dictionary if detected, else None.
    """

    if len(candles) < 30:
        return None  # Need at least 30 candles to reliably detect

    closes = [c['close'] for c in candles]
    highs = [c['high'] for c in candles]
    lows = [c['low'] for c in candles]

    # 1. Find local minimum (bottom of the cup)
    min_index = closes.index(min(closes))
    if min_index < 5 or min_index > len(closes) - 10:
        return None  # Cup bottom should be central

    # 2. Left and Right rim should be approx equal
    left = closes[:min_index]
    right = closes[min_index+1:]

    if not left or not right:
        return None

    left_peak = max(left)
    right_peak = max(right)
    peak_diff = abs(left_peak - right_peak)

    if peak_diff / left_peak > 0.07:  # more than 7% asymmetry
        return None

    # 3. Cup depth should be significant
    depth = left_peak - closes[min_index]
    if depth / left_peak < 0.10:  # less than 10% dip is too shallow
        return None

    # 4. Handle formation (right side consolidation)
    handle_zone = closes[min_index+1:]
    if len(handle_zone) < 5:
        return None

    handle_high = max(handle_zone)
    handle_low = min(handle_zone)

    if (handle_high - handle_low) / handle_high > 0.08:  # too volatile
        return None

    # 5. Confirm breakout: recent price near right rim or above
    if closes[-1] < right_peak:
        return None

    return {
        "pattern": "Cup and Handle",
        "confidence": 0.87,
        "trend": "Bullish"
    }
