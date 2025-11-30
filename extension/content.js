//chrome.runtime.onMessage.addListener(async (msg) => {
  //if (msg.type === "SCRAPE_CHART") {
    //const ohlc = await getVisibleOHLCFromDOM();
   // if (!ohlc || ohlc.length === 0) {
      //alert("❌ Unable to detect live chart. Try on a different page.");
     // return;
    //}

   // const res = await fetch("https://your-backend-url.com/scan", {
      //method: "POST",
      //headers: { "Content-Type": "application/json" },
      //body: JSON.stringify({
        //candles: ohlc,
       // feedback: msg.feedback
     // })
    //});

    //const data = await res.json();

    //chrome.runtime.sendMessage({
      //type: "SCAN_RESULT",
      //pattern: data.pattern,
      //confidence: data.confidence,
      //trend: data.trend,
     // ema5: data.ema
    //});

    //drawPatternOverlay(data.pattern, data.confidence, data.trend);
  //}
//});

// ✨ Modular DOM-based OHLC extractor (works on any readable chart)
//async function getVisibleOHLCFromDOM() {
  //const rows = document.querySelectorAll("table tr");
  //const candles = [];

  //for (const row of rows) {
    //const cols = row.querySelectorAll("td");
    //if (cols.length >= 4) {
      //const o = parseFloat(cols[0].innerText.replace(/,/g, ""));
      //const h = parseFloat(cols[1].innerText.replace(/,/g, ""));
      //const l = parseFloat(cols[2].innerText.replace(/,/g, ""));
      //const c = parseFloat(cols[3].innerText.replace(/,/g, ""));
      //if (!isNaN(o) && !isNaN(h) && !isNaN(l) && !isNaN(c)) {
    //    candles.push({ open: o, high: h, low: l, close: c });
  //    }
//    }
//  }

//  return candles.slice(-30); // last 30 candles
// }

// =========================================================
// ✅ extension/content.js (Fixed & Robust)
// =========================================================

// Dynamically import draw-utils.js and expose global function
(async () => {
  try {
    const module = await import(chrome.runtime.getURL("draw-utils.js"));
    // support both named export and window-exported functions
    window.drawDetectedPatterns = module.drawDetectedPatterns || module.default || window.drawDetectedPatterns;
  } catch (err) {
    console.error("❌ Failed to load draw-utils.js:", err);
  }
})();

// Listen for scan trigger from panel.js or background.js
chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  if (!msg || (msg.type !== "TRIGGER_SCAN" && msg.type !== "SCRAPE_CHART")) return;

  const token = msg.token;
  const feedback = msg.feedback || false;

  const candles = extractOHLCFromChart();

  if (!candles || !candles.length) {
    // Inform panel about failure
    chrome.runtime.sendMessage({ type: "SCAN_RESULT", success: false, error: "Unable to extract chart data" });
    return;
  }

  // Send to backend
  try {
    const resp = await fetch("https://beingbulls-backend.onrender.com/scan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify({
        candles,
        feedback
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      console.error("Scan API returned error:", resp.status, txt);
      chrome.runtime.sendMessage({ type: "SCAN_RESULT", success: false, error: `Server ${resp.status}` });
      return;
    }

    const result = await resp.json();
    console.log("📊 Scan Result:", result);

    // Normalize patterns array
    const patterns = (result?.patterns) || [];

    // If patterns have start/end but no pixel coords, map them to screen
    const normalized = mapPatternsToPixels(patterns, candles);

    // Draw overlays (if draw-utils available)
    try {
      if (window.drawDetectedPatterns && typeof window.drawDetectedPatterns === "function") {
        window.drawDetectedPatterns(normalized);
      } else {
        console.warn("drawDetectedPatterns not available");
      }
    } catch (err) {
      console.error("Error while drawing overlays:", err);
    }

    // Send results back to panel UI
    chrome.runtime.sendMessage({ type: "SCAN_RESULT", success: true, data: normalized });
  } catch (err) {
    console.error("❌ Scan request failed:", err);
    chrome.runtime.sendMessage({ type: "SCAN_RESULT", success: false, error: "Network/Fetch failed" });
  }
});

// =========================================================
//  OHLC extraction helpers
// =========================================================

function extractOHLCFromChart() {
  try {
    if (location.hostname.includes("tradingview")) {
      const tv = findTradingView();
      if (tv) {
        const out = extractFromTradingView(tv);
        if (out && out.length) return out;
      }
    }
  } catch (err) {
    console.warn("TradingView extraction threw:", err);
  }

  // Generic fallback
  try {
    const generic = extractFromGenericDOM();
    if (generic && generic.length) return generic;
  } catch (err) {
    console.warn("Generic extraction threw:", err);
  }

  return [];
}

// --- TradingView OHLC Scraper ---
function findTradingView() {
  // robust search for TradingView internals
  try {
    // Many TradingView builds expose an object containing 'seriesesStore' in window
    return Object.values(window).find(obj => obj && obj.state && obj.state.seriesesStore);
  } catch (e) {
    return null;
  }
}

function extractFromTradingView(tvObj) {
  try {
    const series = tvObj.state.seriesesStore.serieses;
    const primarySeries = Object.values(series || {})[0];
    if (!primarySeries) return [];

    // bars might live in different places depending on TV version
    const bars = primarySeries.bars?._value || primarySeries.bars?._items || [];
    if (!bars || !bars.length) return [];

    // defend: bars may contain big objects; normalize last N
    const lastN = 80;
    const slice = bars.slice(-lastN);
    return slice.map(bar => ({
      time: (bar.time || bar.t || 0) * (bar.time ? 1000 : 1),
      open: Number(bar.open ?? bar.o ?? bar[1]),
      high: Number(bar.high ?? bar.h ?? bar[2]),
      low: Number(bar.low ?? bar.l ?? bar[3]),
      close: Number(bar.close ?? bar.c ?? bar[4]),
    })).filter(b => Number.isFinite(b.open) && Number.isFinite(b.close));
  } catch (err) {
    console.error("TradingView extraction failed:", err);
    return [];
  }
}

// --- Fallback for generic charting websites (very simple) ---
function extractFromGenericDOM() {
  // Try to pick up OHLC labels displayed on the page
  const ohlc = { open: null, high: null, low: null, close: null };
  const nodes = Array.from(document.querySelectorAll("div, span, td"));

  for (const el of nodes) {
    const txt = (el.innerText || "").toLowerCase().trim();
    if (!txt || txt.length > 100) continue;

    if (txt.includes("open") && !ohlc.open) ohlc.open = extractNumber(txt);
    if (txt.includes("high") && !ohlc.high) ohlc.high = extractNumber(txt);
    if (txt.includes("low") && !ohlc.low) ohlc.low = extractNumber(txt);
    if (txt.includes("close") && !ohlc.close) ohlc.close = extractNumber(txt);
  }

  if (ohlc.open && ohlc.high && ohlc.low && ohlc.close) {
    return [{ time: Date.now(), ...ohlc }];
  }
  return [];
}

function extractNumber(text) {
  if (!text || typeof text !== "string") return null;
  const m = text.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
}

// =========================================================
// Map pattern start/end (indices) -> screen pixel coordinates
// If backend already returns x1,y1,x2,y2, keep as is.
// =========================================================
function mapPatternsToPixels(patterns = [], candles = []) {
  if (!patterns || !patterns.length) return [];

  // find chart drawing area (best-effort). Prefer canvas or main chart container
  const canvas = document.querySelector("canvas");
  let chartRect;
  if (canvas) {
    chartRect = canvas.getBoundingClientRect();
  } else {
    // fallback: find a likely chart div
    const possible = document.querySelector('[class*="chart"]') || document.body;
    chartRect = possible.getBoundingClientRect();
  }

  const n = candles.length || 1;
  const xPerCandle = chartRect.width / n;

  const mapped = patterns.map(p => {
    // if backend already returned pixel bbox, use it
    if (p.x1 !== undefined && p.y1 !== undefined && p.x2 !== undefined && p.y2 !== undefined) {
      return p;
    }

    // if backend returned start/end indices, map them
    const start = Number.isFinite(p.start) ? p.start : (p.idx_start ?? 0);
    const end = Number.isFinite(p.end) ? p.end : (p.idx_end ?? start);

    const x1 = Math.round(chartRect.left + (start / n) * chartRect.width);
    const x2 = Math.round(chartRect.left + ((end + 1) / n) * chartRect.width);
    const y1 = Math.round(chartRect.top);
    const y2 = Math.round(chartRect.top + chartRect.height);

    return {
      ...p,
      x1, y1, x2, y2
    };
  });

  return mapped;
}
