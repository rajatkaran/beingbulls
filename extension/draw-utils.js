// extension/draw-utils.js  — POLISHED READY-TO-PASTE
(function () {
  // single global namespace
  const NS = "beingbulls";
  const ZINDEX = 2147483000;

  function ensureLayer() {
    let layer = document.getElementById(`${NS}-overlay-layer`);
    if (layer) return layer;
    layer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    layer.setAttribute("id", `${NS}-overlay-layer`);
    layer.setAttribute("width", "100%");
    layer.setAttribute("height", "100%");
    layer.style.position = "fixed";
    layer.style.left = "0";
    layer.style.top = "0";
    layer.style.pointerEvents = "none";
    layer.style.zIndex = ZINDEX;
    document.body.appendChild(layer);
    return layer;
  }

  function makeGlassRect(x1, y1, x2, y2, id) {
    const ns = "http://www.w3.org/2000/svg";
    const g = document.createElementNS(ns, "g");
    g.setAttribute("class", `${NS}-pattern`);
    g.setAttribute("data-id", id || "");
    // translucent rounded rect
    const rect = document.createElementNS(ns, "rect");
    rect.setAttribute("x", Math.min(x1, x2));
    rect.setAttribute("y", Math.min(y1, y2));
    rect.setAttribute("width", Math.abs(x2 - x1));
    rect.setAttribute("height", Math.abs(y2 - y1));
    rect.setAttribute("rx", 10);
    rect.setAttribute("ry", 10);
    rect.setAttribute("fill", "rgba(255,255,255,0.03)");
    rect.setAttribute("stroke", "rgba(0,242,254,0.95)");
    rect.setAttribute("stroke-width", "2");
    rect.style.filter = "drop-shadow(0 6px 18px rgba(0,0,0,0.35))";
    rect.style.transition = "transform 240ms cubic-bezier(.2,.9,.3,1), opacity 320ms";

    // subtle animated glow (using another rect with stroke-dasharray)
    const glow = document.createElementNS(ns, "rect");
    glow.setAttribute("x", rect.getAttribute("x"));
    glow.setAttribute("y", rect.getAttribute("y"));
    glow.setAttribute("width", rect.getAttribute("width"));
    glow.setAttribute("height", rect.getAttribute("height"));
    glow.setAttribute("rx", 10);
    glow.setAttribute("ry", 10);
    glow.setAttribute("fill", "none");
    glow.setAttribute("stroke", "rgba(0,242,254,0.18)");
    glow.setAttribute("stroke-width", "8");
    glow.style.filter = "blur(8px)";
    glow.style.opacity = "0.85";

    // label background (small rounded rect)
    const labelBg = document.createElementNS(ns, "rect");
    labelBg.setAttribute("rx", 8);
    labelBg.setAttribute("ry", 8);
    labelBg.setAttribute("fill", "rgba(10,10,10,0.85)");
    labelBg.setAttribute("stroke", "rgba(255,255,255,0.06)");
    labelBg.style.pointerEvents = "auto";

    // label text
    const label = document.createElementNS(ns, "text");
    label.setAttribute("fill", "#00F2FE");
    label.setAttribute("font-size", "12");
    label.setAttribute("font-family", "Inter, Roboto, Arial");
    label.setAttribute("font-weight", "600");
    label.style.pointerEvents = "auto";

    g.appendChild(glow);
    g.appendChild(rect);
    g.appendChild(labelBg);
    g.appendChild(label);
    return { g, rect, label, labelBg, glow };
  }

  // helper: place label and animate
  function placeLabel(elements, x1, y1, text) {
    const { g, rect, label, labelBg, glow } = elements;
    const left = Math.min(x1, x1 + 8);
    const top = Math.max(y1 - 36, 8);
    label.textContent = text;
    // estimate label width roughly (chars * 7)
    const w = Math.max(80, text.length * 7 + 18);
    labelBg.setAttribute("x", left);
    labelBg.setAttribute("y", top);
    labelBg.setAttribute("width", w);
    labelBg.setAttribute("height", 24);
    label.setAttribute("x", left + 8);
    label.setAttribute("y", top + 16);
    // position glow same as rect
    glow.setAttribute("x", rect.getAttribute("x"));
    glow.setAttribute("y", rect.getAttribute("y"));
    glow.setAttribute("width", rect.getAttribute("width"));
    glow.setAttribute("height", rect.getAttribute("height"));
  }

  // store current overlays with pinned state
  const ACTIVE = new Map();

  function clearOldOverlays() {
    const layer = document.getElementById(`${NS}-overlay-layer`);
    if (!layer) return;
    const nodes = Array.from(layer.querySelectorAll(`.${NS}-pattern`));
    nodes.forEach(n => n.remove());
    ACTIVE.clear();
  }

  // main exposed function
  function drawDetectedPatterns(patterns = [], opts = {}) {
    if (!patterns || !patterns.length) {
      // quick fade-out
      setTimeout(clearOldOverlays, 300);
      return;
    }

    const layer = ensureLayer();

    // throttle: if too many draws in short time, avoid heavy redraw
    if (drawDetectedPatterns._locked) {
      // just update timestamp of existing
      drawDetectedPatterns._queued = { patterns, opts };
      return;
    }
    drawDetectedPatterns._locked = true;
    setTimeout(() => {
      drawDetectedPatterns._locked = false;
      if (drawDetectedPatterns._queued) {
        const q = drawDetectedPatterns._queued;
        drawDetectedPatterns._queued = null;
        drawDetectedPatterns(q.patterns, q.opts);
      }
    }, 180);

    // Remove old non-pinned overlays
    const prev = Array.from(layer.querySelectorAll(`.${NS}-pattern`));
    prev.forEach(n => {
      const id = n.getAttribute("data-id");
      if (!id || !ACTIVE.get(id)?.pinned) n.remove();
    });

    patterns.forEach((p, idx) => {
      // ensure coords exist (x1,y1,x2,y2) else skip
      const x1 = Number(p.x1 || p.left || 0);
      const y1 = Number(p.y1 || p.top || 0);
      const x2 = Number(p.x2 || (p.right || (x1 + (p.width || 200))));
      const y2 = Number(p.y2 || (p.bottom || (y1 + (p.height || 120))));
      const id = p.id || `${p.pattern || p.name || "pat"}_${idx}_${Math.round(Date.now()/1000)}`;

      // if already exists and pinned -> skip creating a duplicate
      if (ACTIVE.has(id) && ACTIVE.get(id).pinned) return;

      const elements = makeGlassRect(x1, y1, x2, y2, id);
      const { g, rect, label } = elements;
      g.setAttribute("data-id", id);
      rect.setAttribute("x", Math.min(x1, x2));
      rect.setAttribute("y", Math.min(y1, y2));
      rect.setAttribute("width", Math.abs(x2 - x1));
      rect.setAttribute("height", Math.abs(y2 - y1));

      const labelText = `📊 ${p.pattern || p.name || "Pattern"} • ${Math.round((p.confidence||0))}% ${p.trend ? "• " + p.trend : ""}`;
      placeLabel(elements, Math.min(x1, x2), Math.min(y1, y2), labelText);

      // make interactive (pin on click)
      g.style.cursor = "pointer";
      g.style.pointerEvents = "auto";
      g.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const st = ACTIVE.get(id) || { pinned: false };
        st.pinned = !st.pinned;
        ACTIVE.set(id, st);
        if (st.pinned) {
          // make label brighter and stop auto-remove
          rect.setAttribute("stroke", "rgba(0,242,254,1)");
          rect.style.transform = "scale(1.01)";
        } else {
          rect.setAttribute("stroke", "rgba(0,242,254,0.95)");
          rect.style.transform = "";
          // schedule remove
          scheduleRemoval(id, 7000);
        }
      });

      // double click to remove
      g.addEventListener("dblclick", (ev) => {
        ev.stopPropagation();
        g.remove();
        ACTIVE.delete(id);
      });

      // append and animate
      layer.appendChild(g);
      // tiny entrance animation
      requestAnimationFrame(() => {
        rect.style.opacity = "1";
        rect.style.transform = "scale(1)";
      });

      // store with timeout
      ACTIVE.set(id, { node: g, pinned: false });
      scheduleRemoval(id, opts?.timeout || 6000);
    });
  }

  function scheduleRemoval(id, ms) {
    if (!ms) return;
    setTimeout(() => {
      const st = ACTIVE.get(id);
      if (!st) return;
      if (st.pinned) return; // don't remove pinned
      try {
        st.node.remove();
      } catch (e) {}
      ACTIVE.delete(id);
    }, ms);
  }

  // expose to window
  window.drawDetectedPatterns = drawDetectedPatterns;
  window.clearBeingBullsOverlays = clearOldOverlays;

  // small helper for debugging
  window.__beingbulls_active = ACTIVE;
})();
