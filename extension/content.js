
// extension/content.js (production)
const BACKEND_URL = "https://beingbulls-backend.onrender.com"; // change if needed

// dynamically import draw-utils
(async () => {
  try {
    const mod = await import(chrome.runtime.getURL("draw-utils.js"));
    window.drawDetectedPatterns = mod.drawDetectedPatterns || mod.default || window.drawDetectedPatterns;
  } catch (e) {
    console.warn("draw-utils not loaded:", e);
  }
})();

chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  if (!msg || (msg.type !== "TRIGGER_SCAN" && msg.type !== "SCRAPE_CHART")) return;

  const token = msg.token;
  const feedback = msg.feedback || false;

  if (!token) {
    chrome.runtime.sendMessage({ type: "SCAN_RESULT", success: false, error: "No token. Please login." });
    return;
  }

  // Optional pre-check (best-effort)
  try {
    await fetch(`${BACKEND_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
    // ignore response; server will enforce subscription at /scan
  } catch (e) {
    // ignore
  }

  const candles = extractOHLCFromChart();
  if (!candles || !candles.length) {
    chrome.runtime.sendMessage({ type: "SCAN_RESULT", success: false, error: "Unable to extract chart data." });
    return;
  }

  try {
    const resp = await fetch(`${BACKEND_URL}/scan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ email: "", candles, feedback })
    });

    if (!resp.ok) {
      const txt = await resp.text().catch(()=>"");
      chrome.runtime.sendMessage({ type: "SCAN_RESULT", success: false, error: `Server ${resp.status} ${txt}` });
      return;
    }

    const result = await resp.json();
    const patterns = result?.patterns || [];

    const normalized = mapPatternsToPixels(patterns, candles);

    if (window.drawDetectedPatterns && typeof window.drawDetectedPatterns === "function") {
      try { window.drawDetectedPatterns(normalized); } catch (e) { console.error("draw error", e); }
    }

    chrome.runtime.sendMessage({ type: "SCAN_RESULT", success: true, data: normalized });

  } catch (err) {
    console.error("Scan failed:", err);
    chrome.runtime.sendMessage({ type: "SCAN_RESULT", success: false, error: "Network error" });
  }
});

/* ---------- OHLC extractors ---------- */
function extractOHLCFromChart() {
  try {
    if (location.hostname.includes("tradingview")) {
      const tv = Object.values(window).find(o => o && o.state && o.state.seriesesStore);
      if (tv) return extractFromTradingView(tv);
    }
  } catch(e){}

  return extractFromGenericDOM();
}

function extractFromTradingView(tvObj) {
  try {
    const series = tvObj.state.seriesesStore.serieses;
    const primary = Object.values(series || {})[0];
    if (!primary) return [];
    const bars = primary.bars?._value || primary.bars?._items || [];
    if (!bars || !bars.length) return [];
    const lastN = 120;
    return bars.slice(-lastN).map(bar => ({
      time: (bar.time || bar.t || 0) * (bar.time ? 1000 : 1),
      open: Number(bar.open ?? bar.o ?? bar[1]),
      high: Number(bar.high ?? bar.h ?? bar[2]),
      low: Number(bar.low ?? bar.l ?? bar[3]),
      close: Number(bar.close ?? bar.c ?? bar[4])
    })).filter(b => Number.isFinite(b.open) && Number.isFinite(b.close));
  } catch (e) {
    console.error("TV extract error", e);
    return [];
  }
}

function extractFromGenericDOM() {
  const r = { open: null, high: null, low: null, close: null };
  const nodes = Array.from(document.querySelectorAll("div, span, td"));
  for (const el of nodes) {
    const txt = (el.innerText || "").toLowerCase();
    if (!txt || txt.length > 200) continue;
    if (txt.includes("open") && r.open == null) r.open = extractNumber(txt);
    if (txt.includes("high") && r.high == null) r.high = extractNumber(txt);
    if (txt.includes("low") && r.low == null) r.low = extractNumber(txt);
    if (txt.includes("close") && r.close == null) r.close = extractNumber(txt);
  }
  if (r.open && r.high && r.low && r.close) return [{ time: Date.now(), ...r }];
  return [];
}
function extractNumber(t) {
  if (!t) return null;
  const m = t.replace(/,/g,"").match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
}

/* ---------- map start/end -> pixels ---------- */
function mapPatternsToPixels(patterns = [], candles = []) {
  if (!patterns || !patterns.length) return [];
  const canvas = document.querySelector("canvas") || document.querySelector('[class*="chart"]') || document.body;
  const rect = canvas.getBoundingClientRect();
  const n = candles.length || 1;

  return patterns.map(p => {
    if (p.x1 !== undefined && p.x2 !== undefined && p.y1 !== undefined && p.y2 !== undefined) {
      return p;
    }
    const start = Number.isFinite(p.start) ? p.start : (p.idx_start ?? 0);
    const end = Number.isFinite(p.end) ? p.end : (p.idx_end ?? start);
    const x1 = Math.round(rect.left + (start / n) * rect.width);
    const x2 = Math.round(rect.left + ((end+1) / n) * rect.width);
    const y1 = Math.round(rect.top);
    const y2 = Math.round(rect.top + rect.height);
    return { ...p, x1, y1, x2, y2 };
  });
}


