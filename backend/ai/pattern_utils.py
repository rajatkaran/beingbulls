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










