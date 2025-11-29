// ===============================
//   BEINGBULLS – Overlay Engine
// ===============================

// Export globally (content.js can call this)
window.drawDetectedPatterns = function (patterns) {
  createOrResizeOverlayCanvas();
  const canvas = document.getElementById("beingbulls-overlay-canvas");
  const ctx = canvas.getContext("2d");

  // clear canvas before drawing
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  patterns.forEach((p, i) => {
    // ------------------------------
    // p MUST contain: x1, y1, x2, y2
    // backend/content.js will fill these
    // ------------------------------

    const x = p.x1;
    const y = p.y1;
    const w = p.x2 - p.x1;
    const h = p.y2 - p.y1;

    const trendColor =
      p.trend && p.trend.toLowerCase().includes("bull")
        ? "#00ff9d"
        : "#ff4974";

    // FANCY BORDER
    ctx.save();
    ctx.strokeStyle = trendColor;
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 6]);
    ctx.shadowBlur = 12;
    ctx.shadowColor = trendColor;
    ctx.strokeRect(x, y, w, h);
    ctx.restore();

    // TRANSLUCENT FILL
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = trendColor;
    ctx.fillRect(x, y, w, h);
    ctx.restore();

    // LABEL (top-left)
    const label = `${p.pattern || p.name} • ${Math.round(
      p.confidence || 0
    )}%`;

    ctx.save();
    ctx.font = "14px Poppins, sans-serif";
    ctx.fillStyle =
