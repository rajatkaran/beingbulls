import os
import importlib
from pathlib import Path

def run_all_patterns(candles):
    patterns_dir = Path(__file__).parent / "patterns"
    matched_patterns = []

    for file in os.listdir(patterns_dir):
        if file.endswith(".py") and not file.startswith("__"):
            module_name = f"backend.ai.patterns.{file[:-3]}"
            try:
                module = importlib.import_module(module_name)
                if hasattr(module, "detect"):
                    result = module.detect(candles)
                    if result:
                        matched_patterns.append(result)
            except Exception as e:
                print(f"[❌] Error in {module_name}: {e}")
    
    # Sort by confidence score (high to low)
    matched_patterns.sort(key=lambda x: x.get("confidence", 0), reverse=True)
    return matched_patterns
# backend/ai/pattern_utils.py

def detect_all_patterns(candles):
    patterns = []

    # 🧠 Auto-imported detect() from all 53 pattern modules
    from .patterns.abandoned_baby import detect as abandoned_baby
    from .patterns.bearish_breakway import detect as bearish_breakway
    from .patterns.bearish_engulfing import detect as bearish_engulfing
    from .patterns.bearish_flag import detect as bearish_flag
    from .patterns.bearish_harami import detect as bearish_harami
    from .patterns.bearish_pennant import detect as bearish_pennant
    from .patterns.belt_hold import detect as belt_hold
    from .patterns.bullish_breakaway import detect as bullish_breakaway
    from .patterns.bullish_engulfing import detect as bullish_engulfing
    from .patterns.bullish_flag import detect as bullish_flag
    from .patterns.bullish_harami import detect as bullish_harami
    from .patterns.bullish_pennant import detect as bullish_pennant
    from .patterns.counterattack import detect as counterattack
    from .patterns.cup_and_handle import detect as cup_and_handle
    from .patterns.doji import detect as doji
    from .patterns.double_bottom import detect as double_bottom
    from .patterns.double_top import detect as double_top
    from .patterns.evening_star import detect as evening_star
    from .patterns.falling_three import detect as falling_three
    from .patterns.falling_wedge import detect as falling_wedge
    from .patterns.gravestone_doji import detect as gravestone_doji
    from .patterns.hammer import detect as hammer
    from .patterns.head_and_shoulders import detect as head_and_shoulders
    from .patterns.high_wave import detect as high_wave
    from .patterns.in_neck import detect as in_neck
    from .patterns.inverse_head_and_shoulders import detect as inverse_head_and_shoulders
    from .patterns.inverted_hammer import detect as inverted_hammer
    from .patterns.kicker_bearish import detect as kicker_bearish
    from .patterns.kicker_bullish import detect as kicker_bullish
    from .patterns.ladder_bottom import detect as ladder_bottom
    from .patterns.ladder_top import detect as ladder_top
    from .patterns.long_legged_doji import detect as long_legged_doji
    from .patterns.marubozu import detect as marubozu
    from .patterns.mat_hold import detect as mat_hold
    from .patterns.matching_high import detect as matching_high
    from .patterns.matching_low import detect as matching_low
    from .patterns.morning_star import detect as morning_star
    from .patterns.on_neck import detect as on_neck
    from .patterns.rectangle_bottom import detect as rectangle_bottom
    from .patterns.rectangle_top import detect as rectangle_top
    from .patterns.rising_three import detect as rising_three
    from .patterns.rising_wedge import detect as rising_wedge
    from .patterns.separating_lines import detect as separating_lines
    from .patterns.shooting_star import detect as shooting_star
    from .patterns.spinning_top import detect as spinning_top
    from .patterns.symmetrical_triangle import detect as symmetrical_triangle
    from .patterns.tasuki_gap_down import detect as tasuki_gap_down
    from .patterns.tasuki_gap_up import detect as tasuki_gap_up
    from .patterns.three_black_crows import detect as three_black_crows
    from .patterns.three_white_soldiers import detect as three_white_soldiers
    from .patterns.thrusting import detect as thrusting
    from .patterns.tri_star import detect as tri_star
    from .patterns.tweezer_bottom import detect as tweezer_bottom
    from .patterns.tweezer_top import detect as tweezer_top

    # 🧪 All functions in a list
    all_detectors = [
        abandoned_baby, bearish_breakway, bearish_engulfing, bearish_flag, bearish_harami,
        bearish_pennant, belt_hold, bullish_breakaway, bullish_engulfing, bullish_flag,
        bullish_harami, bullish_pennant, counterattack, cup_and_handle, doji,
        double_bottom, double_top, evening_star, falling_three, falling_wedge,
        gravestone_doji, hammer, head_and_shoulders, high_wave, in_neck,
        inverse_head_and_shoulders, inverted_hammer, kicker_bearish, kicker_bullish,
        ladder_bottom, ladder_top, long_legged_doji, marubozu, mat_hold,
        matching_high, matching_low, morning_star, on_neck, rectangle_bottom,
        rectangle_top, rising_three, rising_wedge, separating_lines, shooting_star,
        spinning_top, symmetrical_triangle, tasuki_gap_down, tasuki_gap_up,
        three_black_crows, three_white_soldiers, thrusting, tri_star,
        tweezer_bottom, tweezer_top
    ]

    # 🔄 Loop and run each pattern
    for fn in all_detectors:
        try:
            result = fn(candles)
            if result:
                patterns.append(result)
        except Exception as e:
            print(f"[❌] Error in {fn.__name__}: {str(e)}")

    return patterns
def calculate_ema(candles, period=5):
    prices = [c["close"] if isinstance(c, dict) else c.close for c in candles]
    k = 2 / (period + 1)
    ema = prices[0]
    for price in prices[1:]:
        ema = price * k + ema * (1 - k)
    return round(ema, 2)




#from .patterns import hammer, shooting_star, doji, bullish_engulfing
# Add all other pattern imports here

#def detect_all_patterns(candles):
 #   results = []

  #  for pattern_fn in [hammer.detect, shooting_star.detect, doji.detect, bullish_engulfing.detect]:
   #     result = pattern_fn(candles)
    #    if result:
     #       results.append(result)
##   if results:
  #      best = max(results, key=lambda x: x['confidence'])
   #     return best
    #return {"pattern": "Unknown", "confidence": 0, "trend": "Neutral"}

#def calculate_ema(candles, period=5):
 #   prices = [c["close"] if isinstance(c, dict) else c.close for c in candles]
  #  k = 2 / (period + 1)
   # ema = prices[0]
    #for price in prices[1:]:
     #   ema = price * k + ema * (1 - k)
   # return round(ema, 2)










