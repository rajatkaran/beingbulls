// =========================================================
// ⭐ draw-utils.js — FINAL PRODUCTION VERSION
// Builds neon glowing overlays on top of TradingView charts
// =========================================================

export function drawDetectedPatterns(patterns = []) {
  clearOldOverlays();

  if (!patterns || !patterns.length) return;

  patterns.forEach((p, idx) => {
    try {
      drawBoxOverlay(p, idx);
    } catch (err) {
      console.error("Overlay error:", err, p);
    }
  });
}

// =========================================================
// REMOVE OLD BOXES
// =========================================================
function clearOldOverlays() {
  document.querySelectorAll(".beingbulls-overlay-box").forEach(el => el.remove());
}


// =========================================================
// MAIN DRAWING FUNCTION
// =========================================================
function drawBoxOverlay(pattern, index) {
  const { x1, y1, x2, y2 } = pattern;
  if (
    !Number.isFinite(x1) ||
    !Number.isFinite(y1) ||
    !Number.isFinite(x2) ||
    !Number.isFinite(y2)
  ) {
    console.warn("Invalid coords", pattern);
    return;
  }

  // Box container
  const box = document.createElement("div");
  box.className = "beingbulls-overlay-box";

  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);

  box.style.position = "fixed";
  box.style.left = x1 + "px";
  box.style.top = y1 + "px";
  box.style.width = width + "px";
  box.style.height = height + "px";
  box.style.zIndex = "999999999";
  box.style.pointerEvents = "none"; // very important
  box.style.border = "2px solid #00f2fe";
  box.style.borderRadius = "6px";

  // glow
  box.style.boxShadow = "0 0 10px #00f2fe, 0 0 20px #00f2fe";

  // fade-in animation
  box.style.opacity = "0";
  box.style.transition = "opacity 0.4s ease-out";
  setTimeout(() => (box.style.opacity = "1"), 50);

  // Pattern Label
  const label = document.createElement("div");
  label.innerText = `${pattern.pattern || "Pattern"} (${Math.round(pattern.confidence || 0)}%)`;
  label.style.position = "absolute";
  label.style.top = "-26px";
  label.style.left = "0";
  label.style.background = "rgba(0,0,0,0.9)";
  label.style.color = "#00f2fe";
  label.style.padding = "2px 6px";
  label.style.fontSize = "11px";
  label.style.borderRadius = "4px";
  label.style.border = "1px solid #00f2fe";
  label.style.whiteSpace = "nowrap";
  box.appendChild(label);

  document.body.appendChild(box);

  // Auto-remove after 6 seconds
  setTimeout(() => box.remove(), 6000);
}
