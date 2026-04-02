const scenes = Array.from(document.querySelectorAll("[data-scene]"));
const BASE_COPY_SIZE = 7.1;
const BASE_WIDTH = 312;
const TARGET_RATIO = 0.65;
const MIN_ZOOM = 0.8;
const MAX_ZOOM = 2.5;
const PROJECT_MAX_WIDTH = 1400;
const APP_WINDOW_WIDTH_RATIO = 0.84;
const APP_WINDOW_MAX_WIDTH = 1000;

function getHostMainWindow() {
  if (window.self === window.top) return null;

  try {
    return window.top.document.getElementById("mainWindow");
  } catch {
    return null;
  }
}

function getNormalWindowWidth() {
  try {
    const topWidth = window.top.innerWidth;
    return Math.min(topWidth * APP_WINDOW_WIDTH_RATIO, APP_WINDOW_MAX_WIDTH);
  } catch {
    return window.innerWidth;
  }
}

function getLayoutWidth() {
  const hostWindow = getHostMainWindow();
  if (!hostWindow || !hostWindow.classList.contains("is-maximised")) {
    return window.innerWidth;
  }

  return getNormalWindowWidth();
}

function syncLayoutWidth() {
  document.documentElement.style.setProperty(
    "--contact-layout-width",
    `${getLayoutWidth()}px`
  );
}

function syncProjectCopySize() {
  const effectiveWidth = Math.min(getLayoutWidth(), PROJECT_MAX_WIDTH);
  const zoom = (effectiveWidth * TARGET_RATIO) / BASE_WIDTH;
  const clampedZoom = Math.max(MIN_ZOOM, Math.min(zoom, MAX_ZOOM));
  const scaledCopySize = BASE_COPY_SIZE * clampedZoom;

  document.documentElement.style.setProperty(
    "--project-copy-size",
    `${scaledCopySize}px`
  );
}

function syncContactSizing() {
  syncLayoutWidth();
  syncProjectCopySize();
}

function setSceneState(scene, open) {
  const trigger = scene.querySelector("[data-scene-trigger]");
  scene.classList.toggle("is-open", open);
  trigger?.setAttribute("aria-pressed", String(open));
}

function toggleScene(scene) {
  setSceneState(scene, !scene.classList.contains("is-open"));
}

scenes.forEach((scene) => {
  const trigger = scene.querySelector("[data-scene-trigger]");
  setSceneState(scene, false);

  trigger?.addEventListener("click", () => {
    toggleScene(scene);
  });

  trigger?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    toggleScene(scene);
  });
});

window.addEventListener("resize", syncContactSizing);
window.addEventListener("load", syncContactSizing);

const hostWindow = getHostMainWindow();
if (hostWindow) {
  const hostWindowObserver = new MutationObserver(syncContactSizing);
  hostWindowObserver.observe(hostWindow, {
    attributes: true,
    attributeFilter: ["class"]
  });
}

syncContactSizing();
