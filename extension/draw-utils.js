
export function drawDetectedPatterns(patterns) {
  clearOldOverlays();

  patterns.forEach((p, index) => {
    const overlay = document.createElement("div");
    overlay.innerText = `📊 ${p.name} (${p.confidence}%) - ${p.trend || "N/A"}`;
    overlay.style.position = "fixed";
    overlay.style.top = `${20 + index * 60}px`;
    overlay.style.right = "20px";
    overlay.style.zIndex = "999999";
    overlay.style.padding = "10px 15px";
    overlay.style.background = "#111";
    overlay.style.color = "#00f2fe";
    overlay.style.fontWeight = "bold";
    overlay.style.borderRadius = "8px";
    overlay.style.boxShadow = "0 0 8px #00f2fe";
    overlay.className = "beingbulls-pattern-overlay";

    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 6000);
  });
}

function clearOldOverlays() {
  const old = document.querySelectorAll(".beingbulls-pattern-overlay");
  old.forEach(el => el.remove());
}
