const experienceList = document.getElementById("experienceList");
const experienceItems = Array.from(document.querySelectorAll("[data-experience]"));
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ─── Floating layer (Cappen's work__list__layer) ─────────────────
   One single <div> that slides between rows on hover.
   Capped at one per list — Cappen creates/destroys them dynamically
   but for simplicity we keep one and animate it.
─────────────────────────────────────────────────────────────────── */
let layer = null;
let layerOutRequest = null;
let lastHoveredIndex = -1;

function createLayer() {
  if (layer) return;
  layer = document.createElement("div");
  layer.className = "experience-list__layer";
  experienceList.appendChild(layer);
}

function updateLayerHeight() {
  // Layer height = height of one trigger row (not expanded)
  const firstTrigger = experienceItems[0]?.querySelector(".experience-trigger");
  if (firstTrigger && layer) {
    const h = firstTrigger.getBoundingClientRect().height;
    experienceList.style.setProperty("--layer-height", `${h}px`);
  }
}

function moveLayerTo(item, index, animate) {
  if (!layer || prefersReducedMotion) return;

  const listRect = experienceList.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  const y = itemRect.top - listRect.top;

  if (!animate) {
    // Instant reposition (first hover after leaving)
    layer.style.transition = "none";
    layer.style.setProperty("--y", `${y}px`);
    layer.style.setProperty("--scale", "0");
    // Force reflow so next transition fires
    layer.offsetHeight;
    layer.style.transition = "";
  }

  // Small delay before scaling in (matches Cappen's 10ms setTimeout)
  requestAnimationFrame(() => {
    layer.style.setProperty("--y", `${y}px`);
    layer.style.setProperty("--scale", "1");
  });

  lastHoveredIndex = index;
}

function hideLayer() {
  if (!layer || prefersReducedMotion) return;
  layer.style.setProperty("--scale", "0");
}

/* ─── Hover handling ──────────────────────────────────────────── */

function onItemEnter(item, index) {
  if (layerOutRequest) {
    clearTimeout(layerOutRequest);
    layerOutRequest = null;
  }

  // Hovering the open row: hide layer, no hover state
  if (item.classList.contains("is-active")) {
    hideLayer();
    experienceList.classList.remove("is-hovering");
    experienceItems.forEach((el) => el.classList.remove("is-hovered"));
    lastHoveredIndex = index;
    return;
  }

  experienceList.classList.add("is-hovering");
  experienceItems.forEach((el) => el.classList.remove("is-hovered"));
  item.classList.add("is-hovered");

  // Slide if already hovering another row; snap+scale if entering fresh
  const shouldAnimate = layer && lastHoveredIndex !== -1;
  moveLayerTo(item, index, shouldAnimate);
}

function onListLeave() {
  // Short delay before hiding layer (matches Cappen's ~200ms outRequest)
  layerOutRequest = setTimeout(() => {
    hideLayer();
    experienceList.classList.remove("is-hovering");
    experienceItems.forEach((el) => el.classList.remove("is-hovered"));
    lastHoveredIndex = -1;
    layerOutRequest = null;
  }, 200);
}

/* ─── Open / close accordion ─────────────────────────────────── */

function openItem(item) {
  const detail = item.querySelector(".experience-detail");
  const trigger = item.querySelector(".experience-trigger");
  if (!detail || !trigger) return;

  item.classList.add("is-active");
  trigger.setAttribute("aria-expanded", "true");

  if (prefersReducedMotion) {
    detail.style.height = "auto";
    return;
  }

  detail.style.height = "0px";
  requestAnimationFrame(() => {
    detail.style.height = `${detail.scrollHeight}px`;
  });

  const onEnd = () => {
    if (item.classList.contains("is-active")) {
      detail.style.height = "auto";
    }
    detail.removeEventListener("transitionend", onEnd);
  };
  detail.addEventListener("transitionend", onEnd);
}

function closeItem(item) {
  const detail = item.querySelector(".experience-detail");
  const trigger = item.querySelector(".experience-trigger");
  if (!detail || !trigger) return;

  item.classList.remove("is-active");
  trigger.setAttribute("aria-expanded", "false");

  if (prefersReducedMotion) {
    detail.style.height = "0px";
    return;
  }

  detail.style.height = `${detail.scrollHeight}px`;
  requestAnimationFrame(() => {
    detail.style.height = "0px";
  });
}

function syncActiveState() {
  const hasActive = experienceItems.some((item) => item.classList.contains("is-active"));
  experienceList?.classList.toggle("has-active", hasActive);
}

function setActiveItem(nextItem) {
  experienceItems.forEach((item) => {
    if (item === nextItem) return;
    closeItem(item);
  });

  if (!nextItem) {
    syncActiveState();
    return;
  }

  const isAlreadyActive = nextItem.classList.contains("is-active");
  if (isAlreadyActive) {
    closeItem(nextItem);
  } else {
    openItem(nextItem);
  }

  syncActiveState();
}

/* ─── Setup ───────────────────────────────────────────────────── */

function setupInteraction() {
  createLayer();
  updateLayerHeight();

  experienceItems.forEach((item, index) => {
    const trigger = item.querySelector(".experience-trigger");
    if (!trigger) return;

    // Click: hide hover layer, then toggle accordion
    trigger.addEventListener("click", () => {
      hideLayer();
      experienceList.classList.remove("is-hovering");
      experienceItems.forEach((el) => el.classList.remove("is-hovered"));
      lastHoveredIndex = -1;
      setActiveItem(item);
    });

    // Hover: move floating layer
    item.addEventListener("mouseenter", () => onItemEnter(item, index));
  });

  // When mouse leaves the whole list, retract the layer
  experienceList.addEventListener("mouseleave", onListLeave);
}

function setupReveal() {
  experienceItems.forEach((item, index) => {
    item.style.setProperty("--reveal-delay", `${index * 85}ms`);
  });

  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    experienceItems.forEach((item) => item.classList.add("is-revealed"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -10% 0px" }
  );

  experienceItems.forEach((item) => observer.observe(item));
}

window.addEventListener("resize", () => {
  updateLayerHeight();

  const activeItem = experienceItems.find((item) => item.classList.contains("is-active"));
  if (!activeItem) return;
  const detail = activeItem.querySelector(".experience-detail");
  if (detail) detail.style.height = "auto";
});

window.addEventListener("load", () => {
  setupInteraction();
  setupReveal();
});
