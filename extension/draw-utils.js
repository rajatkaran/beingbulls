// extension/draw-utils.js
export function drawDetectedPatterns(patterns = []) {
  clearOldOverlays();
  if (!patterns || !patterns.length) return;

  patterns.forEach((p, idx) => {
    try { drawBoxOverlay(p, idx); } catch (e) { console.error(e); }
  });
}

function clearOldOverlays() {
  document.querySelectorAll(".beingbulls-overlay-box").forEach(el => el.remove());
}

function drawBoxOverlay(pattern, index) {
  const { x1, y1, x2, y2 } = pattern;
  if (![x1,y1,x2,y2].every(n=>Number.isFinite(n))) return;

  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);
  const left = Math.min(x1,x2);
  const top = Math.min(y1,y2);

  const wrapper = document.createElement("div");
  wrapper.className = "beingbulls-overlay-box";
  wrapper.style.position = "fixed";
  wrapper.style.left = left + "px";
  wrapper.style.top = top + "px";
  wrapper.style.width = width + "px";
  wrapper.style.height = height + "px";
  wrapper.style.pointerEvents = "none";
  wrapper.style.zIndex = "2147483647";

  const box = document.createElement("div");
  box.style.position = "absolute";
  box.style.left = "0";
  box.style.top = "0";
  box.style.width = "100%";
  box.style.height = "100%";
  box.style.borderRadius = "8px";
  box.style.border = "2px solid rgba(0,242,254,0.95)";
  box.style.boxShadow = "0 0 12px rgba(0,242,254,0.45), 0 0 24px rgba(0,242,254,0.2)";
  box.style.opacity = "0";
  box.style.transition = "opacity 0.25s ease, transform 0.25s ease";
  wrapper.appendChild(box);

  const label = document.createElement("div");
  label.innerText = `${pattern.pattern || "Pattern"} ${pattern.confidence ? `(${Math.round(pattern.confidence)}%)` : ""}`;
  label.style.position = "absolute";
  label.style.left = "6px";
  label.style.top = "-28px";
  label.style.padding = "4px 8px";
  label.style.fontSize = "12px";
  label.style.fontWeight = "700";
  label.style.borderRadius = "6px";
  label.style.background = "rgba(12,14,20,0.95)";
  label.style.color = "#00f2fe";
  label.style.border = "1px solid rgba(0,242,254,0.6)";
  label.style.pointerEvents = "none";
  wrapper.appendChild(label);

  if (pattern.trend) {
    const pill = document.createElement("div");
    pill.innerText = pattern.trend;
    pill.style.position = "absolute";
    pill.style.right = "6px";
    pill.style.top = "-28px";
    pill.style.padding = "4px 6px";
    pill.style.fontSize = "11px";
    pill.style.borderRadius = "6px";
    pill.style.background = pattern.trend.toLowerCase().includes("bull") ? "rgba(0,200,120,0.95)" : "rgba(220,50,50,0.95)";
    pill.style.color = "#fff";
    wrapper.appendChild(pill);
  }

  document.body.appendChild(wrapper);
  requestAnimationFrame(()=>{ box.style.opacity = "1"; box.style.transform = "scale(1)"; });

  const pulse = wrapper.animate([
    { boxShadow: "0 0 12px rgba(0,242,254,0.45)" },
    { boxShadow: "0 0 20px rgba(0,242,254,0.6)" },
    { boxShadow: "0 0 12px rgba(0,242,254,0.45)" }
  ], { duration: 1600, iterations: 2, easing: "ease-in-out" });

  setTimeout(()=>{
    wrapper.style.transition = "opacity 0.35s ease";
    wrapper.style.opacity = "0";
    setTimeout(()=>wrapper.remove(), 400);
    try{ pulse.cancel(); }catch(e){}
  }, 7000);
}
