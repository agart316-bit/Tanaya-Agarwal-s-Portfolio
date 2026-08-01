/* rail.js — scroll reveal + light parallax for project pages */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var nodes = [].slice.call(document.querySelectorAll(".rv"));
  function force(n) { n.style.transition = "none"; n.classList.add("in"); }
  var revealAll = function () { nodes.forEach(force); };

  if (reduce || !("IntersectionObserver" in window) || !nodes.length) { revealAll(); return; }

  document.documentElement.classList.add("rv-armed");

  // Rect-based check: works even where IntersectionObserver reports nothing
  // intersecting (e.g. the page embedded in the portfolio's window manager).
  function sweep() {
    var h = window.innerHeight || document.documentElement.clientHeight;
    var pending = false;
    nodes.forEach(function (n) {
      if (n.classList.contains("in")) return;
      var r = n.getBoundingClientRect();
      // Already in view on load, or the animation timeline is frozen
      // (backgrounded tab / offscreen iframe): paint the end state directly.
      if (r.top < h * 0.94 && r.bottom > 0) {
        if (document.visibilityState === "hidden") force(n); else n.classList.add("in");
      } else pending = true;
    });
    return pending;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  nodes.forEach(function (n) { io.observe(n); });

  sweep();
  var raf1 = null;
  function onScrollSweep() {
    if (raf1) return;
    raf1 = requestAnimationFrame(function () { raf1 = null; if (!sweep()) window.removeEventListener("scroll", onScrollSweep); });
  }
  window.addEventListener("scroll", onScrollSweep, { passive: true });
  window.addEventListener("resize", onScrollSweep, { passive: true });
  window.addEventListener("load", sweep);
  // Last-resort safety net: never leave content invisible.
  setTimeout(revealAll, 4000);
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") revealAll(); });

  var px = [].slice.call(document.querySelectorAll("[data-px] img, [data-px] video"));
  if (!px.length) return;
  var raf = null;
  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = null;
      var mid = window.innerHeight / 2;
      px.forEach(function (img) {
        var r = img.parentNode.getBoundingClientRect();
        if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
        var d = (r.top + r.height / 2 - mid) / window.innerHeight;
        img.style.transform = "translateY(" + (d * -18).toFixed(2) + "px)";
      });
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
