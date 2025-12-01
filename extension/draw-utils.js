// extension/draw-utils.js — FINAL POLISHED VERSION (Stable + Optimized)
(function () {
  const NS = "beingbulls";
  const ZINDEX = 2147483000;

  function ensureLayer() {
    let layer = document.getElementById(`${NS}-overlay-layer`);
    if (layer) return layer;

    layer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    layer.id = `${NS}-overlay-layer`;
    layer.style.position = "fixed";
    layer.style.left = 0;
    layer.style.top = 0;
    layer.style.width = "100%";
    layer.style.height = "100%";
    layer.style.pointerEvents = "none";
    layer.style.zIndex = ZINDEX;

    document.body.appendChild(layer);
    return layer;
  }

  function makeGlassRect(x1, y1, x2, y2, id) {
    const ns = "http://www.w3.org/2000/svg";
    const g = document.createElementNS(ns, "g");
    g.classList.add(`${NS}-pattern`);
    g.dataset.id = id;

    const baseX = Math.min(x1, x2);
    const baseY = Math.min(y1, y2);
    const w = Math.abs(x2 - x1);
    const h = Math.abs(y2 - y1);

    const rect = document.createElementNS(ns, "rect");
    rect.setAttribute("x", baseX);
    rect.setAttribute("y", baseY);
    rect.setAttribute("width", w);
    rect.setAttribute("height", h);
    rect.setAttribute("rx", 10);
    rect.setAttribute("ry", 10);
    rect.setAttribute("fill", "rgba(255,255,255,0.06)");
    rect.setAttribute("stroke", "rgba(0,242,254,0.95)");
    rect.setAttribute("stroke-width", "2");
    rect.style.filter = "drop-shadow(0 0 10px rgba(0,255,255,0.35))";

    const glow = document.createElementNS(ns, "rect");
    glow.setAttribute("x", baseX);
    glow.setAttribute("y", baseY);
    glow.setAttribute("width", w);
    glow.setAttribute("height", h);
    glow.setAttribute("rx", 10);
    glow.setAttribute("ry", 10);
    glow.setAttribute("stroke", "rgba(0,242,254,0.18)");
    glow.setAttribute("stroke-width", "8");
    glow.setAttribute("fill", "none");
    glow.style.filter = "blur(10px)";
    glow.style.opacity = "0.8";

    const labelBg = document.createElementNS(ns, "rect");
    labelBg.setAttribute("rx", 8);
    labelBg.setAttribute("ry", 8);
    labelBg.setAttribute("fill", "rgba(10,10,10,0.85)");
    labelBg.setAttribute("stroke", "rgba(255,255,255,0.07)");
    labelBg.style.pointerEvents = "auto";

    const label = document.createElementNS(ns, "text");
    label.setAttribute("fill", "#00F2FE");
    label.setAttribute("font-size", "12");
    label.setAttribute("font-family", "Inter, Arial");
    label.setAttribute("font-weight", "600");

    g.appendChild(glow);
    g.appendChild(rect);
    g.appendChild(labelBg);
    g.appendChild(label);

    return { g, rect, label, labelBg, glow };
  }

  function placeLabel({ rect, label, labelBg }, x1, y1, text) {
    label.textContent = text;

    const left = Math.max(10, x1);
    const top = Math.max(10, y1 - 32);

    const width = Math.max(90, text.length * 7 + 20);

    labelBg.setAttribute("x", left);
    labelBg.setAttribute("y", top);
    labelBg.setAttribute("width", width);
    labelBg.setAttribute("height", 24);

    label.setAttribute("x", left + 8);
    label.setAttribute("y", top + 16);
  }

  const ACTIVE = new Map();

  function clearOldOverlays() {
    const layer = document.getElementById(`${NS}-overlay-layer`);
    if (!layer) return;

    layer.querySelectorAll(`.${NS}-pattern`).forEach((g) => g.remove());
    ACTIVE.clear();
  }

  function scheduleRemoval(id, ms) {
    if (!ms) return;

    setTimeout(() => {
      const st = ACTIVE.get(id);
      if (!st || st.pinned) return;

      try {
        st.node.remove();
      } catch (err) {}
      ACTIVE.delete(id);
    }, ms);
  }

  function drawDetectedPatterns(patterns = [], opts = {}) {
    if (!patterns.length) {
      setTimeout(clearOldOverlays, 400);
      return;
    }

    const layer = ensureLayer();

    patterns.forEach((p, idx) => {
      const id = p.id || `${(p.pattern || p.name || "pattern")}_${idx}_${Date.now()}`;
      const x1 = p.x1 ?? 0;
      const y1 = p.y1 ?? 0;
      const x2 = p.x2 ?? x1 + 200;
      const y2 = p.y2 ?? y1 + 120;

      const already = ACTIVE.get(id);
      if (already?.pinned) return;

      const elements = makeGlassRect(x1, y1, x2, y2, id);
      const { g, rect } = elements;
      placeLabel(elements, x1, y1, `📊 ${p.pattern} • ${Math.round(p.confidence)}%`);

      g.style.cursor = "pointer";
      g.style.pointerEvents = "auto";

      g.addEventListener("click", () => {
        const st = ACTIVE.get(id) || { pinned: false };
        st.pinned = !st.pinned;
        ACTIVE.set(id, st);

        rect.setAttribute(
          "stroke",
          st.pinned ? "rgba(0,242,254,1)" : "rgba(0,242,254,0.95)"
        );
      });

      g.addEventListener("dblclick", () => {
        g.remove();
        ACTIVE.delete(id);
      });

      layer.appendChild(g);

      ACTIVE.set(id, { node: g, pinned: false });
      scheduleRemoval(id, opts.timeout || 6000);
    });
  }

  window.drawDetectedPatterns = drawDetectedPatterns;
  window.clearBeingBullsOverlays = clearOldOverlays;
  window.__beingbulls_active = ACTIVE;
})();
