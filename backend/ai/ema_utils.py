def calculate_ema(data, period=5):
    """
    Calculates EMA (Exponential Moving Average) over 'period' days.
    Assumes 'data' is a list of closing prices.
    """
    if len(data) < period:
        return []

    ema = []
    multiplier = 2 / (period + 1)

    # First EMA = Simple Moving Average
    sma = sum(data[:period]) / period
    ema.append(sma)

    for price in data[period:]:
        prev = ema[-1]
        new_ema = (price - prev) * multiplier + prev
        ema.append(new_ema)

    return ema


def is_ema_uptrend(closing_prices, period=5):
    """
    Returns True if EMA-5 is in an uptrend (last value > previous)
    """
    ema = calculate_ema(closing_prices, period)
    if len(ema) < 2:
        return False
    return ema[-1] > ema[-2]
