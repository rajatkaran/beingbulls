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

// ✅ extension/content.js (with smart universal OHLC + emoji overlays)

// Dynamically import draw utils
(async () => {
  const { drawDetectedPatterns } = await import(chrome.runtime.getURL("draw-utils.js"));
  window.drawDetectedPatterns = drawDetectedPatterns; // attach globally
})();

chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  if (msg.type === "SCRAPE_CHART" || msg.type === "TRIGGER_SCAN") {
    const token = msg.token;
    const feedback = msg.feedback;
    const candles = extractOHLCFromChart();

    if (!candles.length) {
      alert("⚠️ Unable to extract chart data.");
      return;
    }

    fetch("https://beingbulls-backend.onrender.com/scan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify({
        candles,
        feedback: feedback || false,
      }),
    })
      .then(res => res.json())
      .then(result => {
        console.log("📈 Pattern result:", result);
        if (result.patterns?.length) {
          window.drawDetectedPatterns(result.patterns);
        } else {
          alert("📭 No strong pattern found.");
        }
      })
      .catch(err => {
        console.error("Scan failed:", err);
        alert("❌ Failed to connect to scan endpoint.");
      });
  }
});

// 🔀 Combined extractor (TradingView or generic platforms)
function extractOHLCFromChart() {
  if (location.hostname.includes("tradingview")) {
    return extractFromTradingView();
  } else {
    return extractFromDOMGeneric();
  }
}

function extractFromTradingView() {
  try {
    const series = Object.values(window)
      .find(obj => obj?.state?.seriesesStore)
      ?.state?.seriesesStore?.serieses;

    const seriesArr = Object.values(series || {});
    if (!seriesArr.length) return [];

    const bars = seriesArr[0]?.bars?._value || [];

    const candles = bars.slice(-80).map(bar => ({
      time: bar.time * 1000,
      open: bar.open,
      high: bar.high,
      low: bar.low,
      close: bar.close,
    }));

    return candles;
  } catch (err) {
    console.error("⚠️ TradingView scrape failed:", err);
    return [];
  }
}

function extractFromDOMGeneric() {
  const ohlc = { open: null, high: null, low: null, close: null };
  const candidates = document.querySelectorAll("div, span");

  candidates.forEach((el) => {
    const text = el.innerText?.toLowerCase();
    if (!text || text.length > 50) return;

    if (text.includes("open") && /\d/.test(text)) ohlc.open = extractNumber(text);
    if (text.includes("high") && /\d/.test(text)) ohlc.high = extractNumber(text);
    if (text.includes("low") && /\d/.test(text)) ohlc.low = extractNumber(text);
    if (text.includes("close") && /\d/.test(text)) ohlc.close = extractNumber(text);
  });

  if (ohlc.open && ohlc.high && ohlc.low && ohlc.close) {
    return [
      {
        time: Date.now(),
        ...ohlc,
      },
    ];
  } else {
    return [];
  }
}

function extractNumber(text) {
  const match = text.match(/[0-9]+(\.[0-9]+)?/);
  return match ? parseFloat(match[0]) : null;
}
