# backend/ai/pattern_utils.py
import importlib
import pkgutil
from pathlib import Path
from typing import List, Dict, Any

# Primary package where detectors live
PATTERNS_PKG = "backend.ai.patterns"

def _discover_pattern_modules():
    try:
        pkg = importlib.import_module(PATTERNS_PKG)
        pkg_path = Path(pkg.__file__).parent
    except Exception:
        # fallback to common alt path
        try:
            pkg = importlib.import_module("ai.patterns")
            pkg_path = Path(pkg.__file__).parent
        except Exception as e:
            print("[pattern_utils] cannot find patterns package:", e)
            return

    for finder, name, ispkg in pkgutil.iter_modules([str(pkg_path)]):
        if name.startswith("__"):
            continue
        yield f"{pkg.__name__}.{name}"

def detect_all_patterns(candles: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Run all pattern detectors' detect() on `candles` window.
    Return a list of normalized dicts:
      { pattern, confidence, trend, start?, end?, idx_start?, idx_end?, notes?, ... }
    """
    matches: List[Dict[str, Any]] = []
    if not candles:
        return matches

    for mod_path in _discover_pattern_modules():
        try:
            mod = importlib.import_module(mod_path)
        except Exception as e:
            print(f"[pattern_utils] import failed {mod_path}: {e}")
            continue

        if not hasattr(mod, "detect"):
            continue

        try:
            res = mod.detect(candles)
        except Exception as e:
            print(f"[pattern_utils] error in {mod_path}.detect: {e}")
            res = None

        if not res:
            continue

        normalized = []
        if isinstance(res, dict):
            normalized = [res]
        elif isinstance(res, list):
            normalized = [r for r in res if isinstance(r, dict)]
        else:
            continue

        for det in normalized:
            name = det.get("pattern") or det.get("name") or det.get("title") or "Unknown"
            confidence = det.get("confidence")
            if confidence is None:
                confidence = det.get("score") or 0
            trend = det.get("trend") or det.get("direction") or None

            entry = {
                "pattern": name,
                "confidence": float(confidence),
                "trend": trend
            }

            # carry forward useful keys if present
            for key in ("start", "end", "idx_start", "idx_end", "min_length", "notes", "bbox"):
                if key in det:
                    entry[key] = det[key]

            matches.append(entry)

    return matches

def calculate_ema(prices: List[float], period: int = 5):
    if not prices or len(prices) < period:
        return None
    k = 2 / (period + 1)
    ema = prices[0]
    for p in prices[1:]:
        ema = p * k + ema * (1 - k)
    return ema
