const { ipcRenderer } = require("electron");

/**
 * Detects a vertical swipe gesture that starts near the top or bottom edge
 * of the viewport and sends the result to the main process.
 */
(() => {
  const edgeSwipeMargin = 60;
  const edgeSwipeThreshold = 80;
  let start = null;

  const getTouch = (e) => e.touches[0] || e.changedTouches[0];

  window.addEventListener(
    "touchstart",
    (e) => {
      const touch = getTouch(e);
      if (!touch) {
        return;
      }
      if (touch.clientY <= edgeSwipeMargin) {
        start = { edge: "top", x: touch.clientX, y: touch.clientY };
      } else if (touch.clientY >= window.innerHeight - edgeSwipeMargin) {
        start = { edge: "bottom", x: touch.clientX, y: touch.clientY };
      } else {
        start = null;
      }
    },
    { passive: true, capture: true },
  );

  window.addEventListener(
    "touchmove",
    (e) => {
      if (!start) {
        return;
      }
      const touch = getTouch(e);
      if (!touch) {
        return;
      }
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      if (start.edge === "top" && dy > edgeSwipeThreshold && dy > Math.abs(dx)) {
        ipcRenderer.send("view-swipe", { edge: "top" });
        start = null;
      } else if (start.edge === "bottom" && -dy > edgeSwipeThreshold && -dy > Math.abs(dx)) {
        ipcRenderer.send("view-swipe", { edge: "bottom" });
        start = null;
      }
    },
    { passive: true, capture: true },
  );

  window.addEventListener(
    "touchend",
    () => {
      start = null;
    },
    { passive: true, capture: true },
  );
})();
