/* =========================================================
   EMBEDDED VIEWPORT FIT  (iframe only — standalone pages
   are left completely untouched)

   When the portfolio's window manager embeds a project page
   it grows the <iframe> element to the full height of the
   document and lets the OUTER container do the scrolling.
   That breaks every `vh` unit inside the frame: 1vh stops
   meaning "1% of what you can see" and starts meaning "1% of
   the whole page", which is a runaway loop — taller figures
   make a taller document, which makes a taller iframe, which
   makes taller figures. Images end up far larger than the
   visible frame, so you only ever see a slice of one.

   Fix: when embedded, resolve --fig-max-h / --hero-fig-max-h
   against the height of the element that actually scrolls in
   the parent (.window-content / .all-projects-viewer) and
   write them as px on <html>. Inline custom properties beat
   the stylesheet's vh values, including inside media queries,
   so no CSS has to change and the standalone page keeps its
   original vh-based sizing.
========================================================= */
(function () {
  var isEmbedded;
  try { isEmbedded = window.self !== window.top; } catch (e) { isEmbedded = true; }
  if (!isEmbedded) return;

  // Share of the visible frame a single figure may occupy.
  var FIG = 0.78;   // body figures, pairs, quads, carousels
  var HERO = 0.60;  // hero image — leaves room for the title beside it
  var MIN = 200;

  var root = document.documentElement;
  root.classList.add("is-embedded");

  function container() {
    try {
      var fe = window.frameElement;
      if (fe && fe.parentElement) return fe.parentElement;
    } catch (e) {}
    return null;
  }

  // The frame itself is stretched to content height, so window.innerHeight
  // is useless here. Measure the parent's scroll container instead.
  function visibleHeight() {
    var el = container();
    if (el && el.clientHeight > MIN) return el.clientHeight;
    try {
      if (window.parent && window.parent.innerHeight > MIN) return window.parent.innerHeight;
    } catch (e) {}
    var sh = (window.screen && window.screen.availHeight) || 800;
    return Math.min(window.innerHeight || sh, sh);
  }

  var lastH = 0;
  function apply() {
    var h = visibleHeight();
    if (!h || Math.abs(h - lastH) < 2) return;
    lastH = h;
    root.style.setProperty("--fig-max-h", Math.round(h * FIG) + "px");
    root.style.setProperty("--hero-fig-max-h", Math.round(h * HERO) + "px");
  }

  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; apply(); });
  }

  apply();

  // Watch the parent container so maximising / dragging / resizing the
  // window re-fits the images. Use the parent's ResizeObserver so the
  // observation stays within its own document.
  var el = container();
  try {
    var RO = (window.parent && window.parent.ResizeObserver) || window.ResizeObserver;
    if (el && RO) new RO(schedule).observe(el);
  } catch (e) {}
  try { window.parent.addEventListener("resize", schedule, { passive: true }); } catch (e) {}
  window.addEventListener("resize", schedule, { passive: true });
  window.addEventListener("load", schedule);
  [100, 300, 800, 1600].forEach(function (ms) { setTimeout(schedule, ms); });
})();

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

/* =========================================================
   LAZY VIDEO
   Sources stay in data-src until the video is close to the
   viewport, so a project page costs its images and nothing
   more until you actually scroll to the film.
========================================================= */
(function () {
  var videos = document.querySelectorAll("video[data-autoplay-in-view]");
  if (!videos.length) return;

  function load(video) {
    if (video.dataset.loaded === "1") return;
    video.dataset.loaded = "1";
    var sources = video.querySelectorAll('source[data-src]');
    for (var i = 0; i < sources.length; i++) {
      sources[i].src = sources[i].dataset.src;
    }
    video.load();
    var playing = video.play();
    if (playing && playing.catch) playing.catch(function () { /* user can hit play */ });
  }

  if (!("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(videos, load);
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      load(entry.target);
      io.unobserve(entry.target);
    });
  }, { rootMargin: "200px 0px" });

  Array.prototype.forEach.call(videos, function (v) { io.observe(v); });
})();
