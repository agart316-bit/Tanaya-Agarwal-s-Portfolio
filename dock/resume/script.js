const experienceList = document.getElementById("experienceList");
const experienceItems = Array.from(document.querySelectorAll("[data-experience]"));
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const BASE_COPY_SIZE = 7.1;
const BASE_WIDTH = 312;
const TARGET_RATIO = 0.65;
const MIN_ZOOM = 0.8;
const MAX_ZOOM = 2.5;
const PREVIEW_OFFSET_X = 14;
const PREVIEW_OFFSET_Y = 18;
const PROJECT_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "JPG", "JPEG", "PNG", "webp", "WEBP"];
const PROJECT_IMAGE_INDEXES = [1, 0];

/* ─── Floating layer (Cappen's work__list__layer) ─────────────────
   One single <div> that slides between rows on hover.
   Capped at one per list — Cappen creates/destroys them dynamically
   but for simplicity we keep one and animate it.
─────────────────────────────────────────────────────────────────── */
let layer = null;
let layerOutRequest = null;
let lastHoveredIndex = -1;
let previewCursor = null;
let previewCursorImage = null;
let previewMoveRaf = null;
let previewPosX = -9999;
let previewPosY = -9999;
let hoveredPreviewItem = null;
const previewSrcByProject = new Map();

function syncProjectCopySize() {
  const effectiveWidth = Math.min(window.innerWidth, 1400);
  const zoom = (effectiveWidth * TARGET_RATIO) / BASE_WIDTH;
  const clampedZoom = Math.max(MIN_ZOOM, Math.min(zoom, MAX_ZOOM));
  document.documentElement.style.setProperty(
    "--project-copy-size",
    `${(BASE_COPY_SIZE * clampedZoom).toFixed(2)}px`
  );
}

function createLayer() {
  if (layer) return;
  layer = document.createElement("div");
  layer.className = "experience-list__layer";
  experienceList.appendChild(layer);
}

function createPreviewCursor() {
  if (previewCursor) return;

  previewCursor = document.createElement("div");
  previewCursor.className = "experience-cursor-preview";

  previewCursorImage = document.createElement("img");
  previewCursorImage.alt = "";
  previewCursorImage.draggable = false;
  previewCursor.appendChild(previewCursorImage);

  document.body.appendChild(previewCursor);
}

function updatePreviewCursorPosition() {
  previewMoveRaf = null;
  if (!previewCursor) return;
  previewCursor.style.setProperty("--cursor-x", `${previewPosX}px`);
  previewCursor.style.setProperty("--cursor-y", `${previewPosY}px`);
}

function queuePreviewCursorPosition(clientX, clientY) {
  previewPosX = clientX + PREVIEW_OFFSET_X;
  previewPosY = clientY + PREVIEW_OFFSET_Y;
  if (previewMoveRaf) return;
  previewMoveRaf = requestAnimationFrame(updatePreviewCursorPosition);
}

function hidePreviewCursor() {
  if (!previewCursor) return;
  previewCursor.classList.remove("is-visible");
  hoveredPreviewItem = null;
}

function showPreviewCursorForItem(item) {
  if (!previewCursor || !previewCursorImage) return;
  if (!item || item.classList.contains("is-active")) {
    hidePreviewCursor();
    return;
  }

  const previewKey = item.dataset.preview
    ? `local:${item.dataset.preview}`
    : item.dataset.project
      ? `project:${item.dataset.project}`
      : null;
  if (!previewKey) {
    hidePreviewCursor();
    return;
  }

  const src = previewSrcByProject.get(previewKey);
  if (!src) {
    hidePreviewCursor();
    return;
  }

  if (previewCursorImage.src !== src) {
    previewCursorImage.src = src;
  }

  hoveredPreviewItem = item;
  previewCursor.classList.add("is-visible");
}

function resolveImagePath(src) {
  return new Promise((resolve) => {
    const probe = new Image();
    probe.onload = () => resolve(src);
    probe.onerror = () => resolve(null);
    probe.src = src;
  });
}

async function resolveFirstProjectImage(projectNum) {
  for (const imageIndex of PROJECT_IMAGE_INDEXES) {
    for (const ext of PROJECT_IMAGE_EXTENSIONS) {
      const candidate = `../../projects/${projectNum}/project-${projectNum}-${imageIndex}.${ext}`;
      const resolved = await resolveImagePath(candidate);
      if (resolved) return resolved;
    }
  }
  return null;
}

async function resolveLocalPreviewImage(baseName) {
  if (!baseName) return null;
  for (const ext of PROJECT_IMAGE_EXTENSIONS) {
    const candidate = `./${baseName}.${ext}`;
    const resolved = await resolveImagePath(candidate);
    if (resolved) return resolved;
  }
  return null;
}

async function primeExperiencePreviewSources() {
  const previewKeys = Array.from(
    new Set(
      experienceItems
        .map((item) => {
          if (item.dataset.preview) return `local:${item.dataset.preview}`;
          if (item.dataset.project) return `project:${item.dataset.project}`;
          return null;
        })
        .filter(Boolean)
    )
  );

  const previews = await Promise.all(
    previewKeys.map(async (key) => {
      const [kind, value] = key.split(":");
      if (kind === "local") {
        const src = await resolveLocalPreviewImage(value);
        return [key, src];
      }
      const src = await resolveFirstProjectImage(value);
      return [key, src];
    })
  );

  previews.forEach(([key, src]) => {
    if (!src) return;
    previewSrcByProject.set(key, src);
  });
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
    hidePreviewCursor();
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
  showPreviewCursorForItem(item);
}

function onListLeave() {
  // Short delay before hiding layer (matches Cappen's ~200ms outRequest)
  layerOutRequest = setTimeout(() => {
    hideLayer();
    hidePreviewCursor();
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
  createPreviewCursor();
  updateLayerHeight();

  experienceItems.forEach((item, index) => {
    const trigger = item.querySelector(".experience-trigger");
    if (!trigger) return;

    // Click: hide hover layer, then toggle accordion
    trigger.addEventListener("click", () => {
      hideLayer();
      hidePreviewCursor();
      experienceList.classList.remove("is-hovering");
      experienceItems.forEach((el) => el.classList.remove("is-hovered"));
      lastHoveredIndex = -1;
      setActiveItem(item);
    });

    // Hover: move floating layer
    item.addEventListener("mouseenter", (event) => {
      queuePreviewCursorPosition(event.clientX, event.clientY);
      onItemEnter(item, index);
    });
  });

  experienceList.addEventListener("mousemove", (event) => {
    queuePreviewCursorPosition(event.clientX, event.clientY);

    const item = event.target.closest("[data-experience]");
    if (!item) {
      hidePreviewCursor();
      return;
    }
    if (item.classList.contains("is-active")) {
      hidePreviewCursor();
      return;
    }
    if (item === hoveredPreviewItem) return;
    showPreviewCursorForItem(item);
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
  syncProjectCopySize();
  updateLayerHeight();

  const activeItem = experienceItems.find((item) => item.classList.contains("is-active"));
  if (!activeItem) return;
  const detail = activeItem.querySelector(".experience-detail");
  if (detail) detail.style.height = "auto";
});

window.addEventListener("load", async () => {
  syncProjectCopySize();
  await primeExperiencePreviewSources();
  setupInteraction();
  setupReveal();
});

syncProjectCopySize();
