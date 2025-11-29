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
// ✅ extension/content.js (FINAL PRODUCTION VERSION)
// =========================================================

// Dynamically import draw-utils.js
(async () => {
  try {
    const { drawDetectedPatterns } = await import(
      chrome.runtime.getURL("draw-utils.js")
    );
    window.drawDetectedPatterns = drawDetectedPatterns;
  } catch (err) {
    console.error("❌ Failed to load draw-utils.js:", err);
  }
})();

// Listen for scan trigger from panel.js or background.js
chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.type !== "TRIGGER_SCAN" && msg.type !== "SCRAPE_CHART") return;

  const token = msg.token;
  const feedback = msg.feedback || false;

  const candles = extractOHLCFromChart();

  if (!candles.length) {
    alert("⚠️ Unable to extract chart data from screen.");
    return;
  }

  // Call your LIVE backend
  fetch("https://beingbulls-backend.onrender.com/scan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: JSON.stringify({
      candles,
      feedback
    }),
  })
    .then(res => res.json())
    .then(result => {
      console.log("📊 Scan Result:", result);

      if (result?.patterns?.length > 0) {
        window.drawDetectedPatterns(result.patterns);
      } else {
        alert("📭 No strong pattern detected.");
      }
    })
    .catch(err => {
      console.error("❌ Scan request failed:", err);
      alert("🚫 Could not reach backend scan API.");
    });
});

// =========================================================
// 🔍 UNIVERSAL OHLC EXTRACTOR
// =========================================================

function extractOHLCFromChart() {
  if (location.hostname.includes("tradingview")) {
    return extractFromTradingView();
  }
  return extractFromGenericDOM();
}

// --- TradingView OHLC Scraper ---
function extractFromTradingView() {
  try {
    const tv = Object.values(window).find(obj => obj?.state?.seriesesStore);

    if (!tv) return [];

    const series = tv.state.seriesesStore.serieses;
    const primarySeries = Object.values(series || {})[0];

    if (!primarySeries) return [];

    const bars = primarySeries.bars?._value || [];
    if (!bars.length) return [];

    // last 80 candles
    return bars.slice(-80).map(bar => ({
      time: bar.time * 1000,
      open: bar.open,
      high: bar.high,
      low: bar.low,
      close: bar.close,
    }));
  } catch (err) {
    console.error("⚠️ TradingView extraction failed:", err);
    return [];
  }
}

// --- Fallback for generic charting websites ---
function extractFromGenericDOM() {
  const ohlc = { open: null, high: null, low: null, close: null };
  const nodes = document.querySelectorAll("div, span");

  nodes.forEach((el) => {
    const txt = el.innerText?.toLowerCase();
    if (!txt || txt.length > 50) return;

    if (txt.includes("open")) ohlc.open = extractNumber(txt);
    if (txt.includes("high")) ohlc.high = extractNumber(txt);
    if (txt.includes("low")) ohlc.low = extractNumber(txt);
    if (txt.includes("close")) ohlc.close = extractNumber(txt);
  });

  if (ohlc.open && ohlc.high && ohlc.low && ohlc.close) {
    return [
      {
        time: Date.now(),
        ...ohlc,
      },
    ];
  }

  return [];
}

function extractNumber(text) {
  const match = text.match(/[0-9]+(\.[0-9]+)?/);
  return match ? parseFloat(match[0]) : null;
}
