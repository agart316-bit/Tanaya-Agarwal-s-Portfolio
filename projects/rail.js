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

  // Parallax intentionally disabled: shifting the image inside a clipped frame
  // shaved slivers off the top/bottom. Every image now shows in full.

  [].slice.call(document.querySelectorAll("[data-carousel]")).forEach(function (car) {
    var track = car.querySelector(".car-track");
    var slides = track ? track.children.length : 0;
    if (!slides) return;
    var dots = car.querySelector(".car-dots");
    var i = 0, btns = [];
    function go(n) {
      i = (n + slides) % slides;
      track.style.transform = "translateX(" + (-i * 100) + "%)";
      btns.forEach(function (b, k) { b.setAttribute("aria-current", k === i ? "true" : "false"); });
    }
    for (var k = 0; k < slides; k++) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Plate " + (k + 1));
      (function (n) { b.addEventListener("click", function () { go(n); }); })(k);
      dots.appendChild(b);
      btns.push(b);
    }
    car.querySelector(".car-prev").addEventListener("click", function () { go(i - 1); });
    car.querySelector(".car-next").addEventListener("click", function () { go(i + 1); });
    go(0);
  });
})();
