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

window.addEventListener("resize", syncProjectCopySize);
window.addEventListener("load", syncProjectCopySize);

const hostWindow = getHostMainWindow();
if (hostWindow) {
  const hostWindowObserver = new MutationObserver(syncProjectCopySize);
  hostWindowObserver.observe(hostWindow, {
    attributes: true,
    attributeFilter: ["class"]
  });
}

syncProjectCopySize();
