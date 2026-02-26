/* =========================================================
   Mac Desktop Portfolio — script.js
   - Lock screen auto-type dots + blinking caret
   - Smooth float-up unlock
   - Liquid Ether WebGL background (initialised on unlock)
   - Draggable icons
   - Dock magnification
   - Window open / close / maximise / restore
   - 12 desktop icons -> projects/<n>/index.html
   - 4 dock icons -> dock/<name>/index.html
========================================================= */

/* =========================================================
   ELEMENT REFS
========================================================= */
const lockscreen    = document.getElementById("lockscreen");
const desktop       = document.getElementById("desktop");
const lockClock     = document.getElementById("lockClock");
const lockDate      = document.getElementById("lockDate");
const unlockForm    = document.getElementById("unlockForm");
const passwordInput = document.getElementById("passwordInput");
const passwordCaret = document.getElementById("passwordCaret");

const windowLayer   = document.getElementById("windowLayer");
const windowTitle   = document.getElementById("windowTitle");
const mainWindow    = document.getElementById("mainWindow");
const projectFrame  = document.getElementById("projectFrame");
const windowBlank   = document.getElementById("windowBlank");

const surface       = document.getElementById("desktopSurface");
const desktopIcons  = document.querySelectorAll(".desktop-icon");

const dockItems     = document.querySelectorAll(".dock-item");
const dockTray      = document.getElementById("dockTray");

/* =========================================================
   CLOCKS
========================================================= */
function pad2(n){ return String(n).padStart(2,"0"); }

function tickClocks(){
  const d = new Date();
  let h = d.getHours(), m = pad2(d.getMinutes());
  h = h % 12 || 12;
  if(lockClock) lockClock.textContent = `${h}:${m}`;
  if(lockDate){
    const days   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const months = ["January","February","March","April","May","June",
                    "July","August","September","October","November","December"];
    lockDate.textContent = `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
  }
}
tickClocks();
setInterval(tickClocks, 15000);

/* =========================================================
   PASSWORD AUTO-TYPE + CARET
========================================================= */
const DOTS_COUNT = 6;
const DOT_CHAR   = "•";
let typingDone = false;

function showCaret(){ passwordCaret.classList.add("is-visible"); }
function hideCaret(){ passwordCaret.classList.remove("is-visible"); }

function autoTypeDots(){
  passwordInput.value = "";
  typingDone = false;
  let i = 0;
  showCaret();

  const iv = setInterval(() => {
    i++;
    passwordInput.value = DOT_CHAR.repeat(i);
    if(i >= DOTS_COUNT){
      clearInterval(iv);
      typingDone = true;
    }
  }, 95);
}

window.addEventListener("load", () => {
  setTimeout(autoTypeDots, 650);
  setTimeout(() => passwordInput.focus(), 650);
});

passwordInput.addEventListener("keydown", e => {
  if(e.key !== "Enter") e.preventDefault();
});
passwordInput.addEventListener("input", () => {
  passwordInput.value = DOT_CHAR.repeat(DOTS_COUNT);
});

/* =========================================================
   LIQUID ETHER — initialise once on first unlock
========================================================= */
let liquidEther = null;

function initLiquidEther() {
  if (liquidEther) return; // already running
  const bg = document.getElementById("liquidEtherBg");
  if (!bg || typeof LiquidEther === "undefined") return;

  liquidEther = new LiquidEther(bg, {
    colors: ['#860136', '#ff89b4', '#ec419f'],
    mouseForce: 20,
    cursorSize: 85,
    resolution: 0.5,
    dt: 0.014,
    BFECC: true,
    autoDemo: true,
    autoSpeed: 0.5,
    autoIntensity: 2.2,
    takeoverDuration: 0.25,
    autoResumeDelay: 3000,
    autoRampDuration: 0.6,
  });
  liquidEther.start();
}

/* =========================================================
   UNLOCK
========================================================= */
unlockForm.addEventListener("submit", e => {
  e.preventDefault();
  unlock();
});

lockscreen.addEventListener("click", e => {
  if(e.target.closest("button,input,form")) return;
  if(typingDone) unlock();
});

function unlock(){
  desktop.classList.remove("is-hidden");

  // Kick off the WebGL background as soon as desktop is visible
  // Use rAF so the element has been painted and has a real size
  requestAnimationFrame(() => {
    requestAnimationFrame(initLiquidEther);
  });

  lockscreen.classList.add("is-unlocking");
  hideCaret();
  lockscreen.addEventListener("transitionend", () => {
    lockscreen.style.display = "none";
  }, { once: true });
}

/* =========================================================
   WINDOW — open / close / maximise / restore
========================================================= */
let isMaximised = false;

function openWindow(title, iframeSrc){
  windowTitle.textContent = title;
  windowLayer.classList.remove("is-hidden");
  isMaximised = false;

  mainWindow.classList.remove("is-maximised", "is-closing");

  if(windowBlank) windowBlank.style.display = "grid";

  if(projectFrame){
    projectFrame.src = iframeSrc || "";
    projectFrame.onload = () => {
      if(windowBlank) windowBlank.style.display = "none";
    };
    projectFrame.onerror = () => {
      if(windowBlank) windowBlank.style.display = "grid";
    };
  }

  void mainWindow.offsetWidth;
  mainWindow.style.animation = "none";
  void mainWindow.offsetWidth;
  mainWindow.style.animation = "";
}

function closeWindow(){
  mainWindow.classList.add("is-closing");
  mainWindow.addEventListener("animationend", () => {
    windowLayer.classList.add("is-hidden");
    mainWindow.classList.remove("is-closing");
    isMaximised = false;

    if(projectFrame) projectFrame.src = "";
    if(windowBlank) windowBlank.style.display = "grid";
  }, { once: true });
}

function maximiseWindow(){
  if(isMaximised) return;
  isMaximised = true;
  mainWindow.classList.add("is-maximised");
}

function restoreWindow(){
  if(!isMaximised) return;
  isMaximised = false;
  mainWindow.classList.remove("is-maximised");
}

windowLayer.addEventListener("click", e => {
  const el = e.target.closest("[data-action]");
  if(!el) return;
  const action = el.getAttribute("data-action");
  if(action === "close") closeWindow();
  if(action === "max")   maximiseWindow();
  if(action === "min")   restoreWindow();
});

document.addEventListener("keydown", e => {
  if(e.key === "Escape" && !windowLayer.classList.contains("is-hidden")) closeWindow();
});

/* =========================================================
   DESKTOP ICONS — open project windows
========================================================= */
function openProjectWindow(projectNum){
  openWindow(`Project ${projectNum}`, `projects/${projectNum}/index.html`);
}

const ICON_IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "svg"];

function resolveIconImage(basePath){
  return new Promise((resolve) => {
    let idx = 0;

    const tryNext = () => {
      if (idx >= ICON_IMAGE_EXTENSIONS.length) {
        resolve(null);
        return;
      }

      const src = `${basePath}.${ICON_IMAGE_EXTENSIONS[idx++]}`;
      const probe = new Image();
      probe.onload = () => resolve(src);
      probe.onerror = tryNext;
      probe.src = src;
    };

    tryNext();
  });
}

async function resolveProjectStackImages(projectNum, maxCount = 5){
  const stackImages = [];

  for (let idx = 1; idx <= maxCount; idx++) {
    const imageSrc = await resolveIconImage(`projects/${projectNum}/project-${projectNum}-${idx}`);
    if (!imageSrc) break;
    stackImages.push(imageSrc);
  }

  return stackImages;
}

const STACKED_PROJECT_IMAGE_MANIFEST = {
  "4": [
    "projects/4/project-4-1.jpg",
    "projects/4/project-4-2.jpg",
    "projects/4/project-4-3.1.jpg",
    "projects/4/project-4-3.2.jpg",
    "projects/4/project-4-3.3.jpg",
    "projects/4/project-4-4.jpg"
  ]
};

function resolveImagePath(src){
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }

    const probe = new Image();
    probe.onload = () => resolve(src);
    probe.onerror = () => resolve(null);
    probe.src = src;
  });
}

async function resolveManifestStackImages(paths = []){
  const resolved = await Promise.all(paths.map((src) => resolveImagePath(src)));
  return resolved.filter(Boolean);
}

function setupStackedProjectIcon(icon, thumb, stackImages){
  if (!icon || !thumb || !stackImages.length) return;

  const label = icon.querySelector(".desktop-icon-label");
  let stack = icon.querySelector(".desktop-icon-stack");

  if (!stack) {
    stack = document.createElement("div");
    stack.className = "desktop-icon-stack";
    icon.insertBefore(stack, label || thumb.nextSibling);
  } else {
    stack.innerHTML = "";
  }

  thumb.src = stackImages[0];
  thumb.style.display = "";
  stack.appendChild(thumb);

  stackImages.slice(1).forEach((src, index) => {
    const layer = document.createElement("span");
    const image = document.createElement("img");
    const depth = Math.min(index + 1, 4);
    const direction = index % 2 === 0 ? -1 : 1;

    layer.className = "desktop-icon-stack-layer";
    layer.style.zIndex = String(10 - depth);
    layer.style.setProperty("--stack-x", `${(direction * (2 + depth * 1.4)).toFixed(1)}px`);
    layer.style.setProperty("--stack-y", `${(1 + depth * 1.6).toFixed(1)}px`);
    layer.style.setProperty("--stack-r", `${(direction * (2 + depth * 1.3)).toFixed(2)}deg`);
    layer.style.setProperty("--stack-s", `${(1 - Math.min(depth * 0.03, 0.14)).toFixed(3)}`);
    layer.style.setProperty("--stack-o", `${Math.max(0.2, 0.56 - depth * 0.09).toFixed(2)}`);

    image.src = src;
    image.alt = "";
    image.draggable = false;
    layer.appendChild(image);
    stack.appendChild(layer);
  });

  icon.classList.add("desktop-icon--stacked");
}

async function setDesktopIconImages(){
  const work = Array.from(desktopIcons).map(async (icon) => {
    const projectNum = icon.dataset.project;
    const thumb = icon.querySelector(".desktop-icon-img");
    if (!projectNum || !thumb) return;

    const manifestPaths = STACKED_PROJECT_IMAGE_MANIFEST[projectNum];
    const stackImages = projectNum === "2"
      ? await resolveProjectStackImages(projectNum)
      : await resolveManifestStackImages(manifestPaths || []);

    if (stackImages.length) {
      setupStackedProjectIcon(icon, thumb, stackImages);
      return;
    }

    let iconSrc = null;
    if (projectNum === "8") {
      iconSrc = await resolveImagePath("assets/project-8-clean.png");
    }
    if (!iconSrc) {
      iconSrc = await resolveIconImage(`assets/project-${projectNum}`);
    }
    if (!iconSrc) return;

    thumb.src = iconSrc;

    const hoverSrc = await resolveIconImage(`assets/project-${projectNum}-hover`);
    if (!hoverSrc || icon.dataset.hoverBound === "1") return;

    icon.addEventListener("mouseenter", () => {
      if (icon.classList.contains("is-dragging")) return;
      thumb.src = hoverSrc;
    });
    icon.addEventListener("mouseleave", () => {
      thumb.src = iconSrc;
    });
    icon.addEventListener("mousedown", () => {
      thumb.src = iconSrc;
    });
    icon.dataset.hoverBound = "1";
  });

  await Promise.all(work);
}

/* Initial layout (12 icons) */
const ICON_POSITIONS = [
  { x: 420, y: 95  },
  { x: 780, y: 140 },
  { x: 640, y: 300 },
  { x: 900, y: 420 },
  { x: 480, y: 480 },
  { x: 520, y: 150 },
  { x: 860, y: 220 },
  { x: 700, y: 460 },
  { x: 980, y: 120 },
  { x: 560, y: 360 },
  { x: 760, y: 560 },
  { x: 980, y: 520 },
];

function layoutIconsInitial(){
  desktopIcons.forEach((icon, i) => {
    if (icon.dataset.positioned === "1") return;

    const pos = ICON_POSITIONS[i] || { x: 60, y: 60 };
    icon.style.left = pos.x + "px";
    icon.style.top  = pos.y + "px";
    icon.dataset.positioned = "1";
  });
}

window.addEventListener("load", layoutIconsInitial);
window.addEventListener("load", setDesktopIconImages);

/* Drag + click logic */
let dragIcon = null, dragOffX = 0, dragOffY = 0;
let dragMoved = false, dragStartX = 0, dragStartY = 0;

function getClientXY(e){
  if(e.touches && e.touches.length) return [e.touches[0].clientX, e.touches[0].clientY];
  return [e.clientX, e.clientY];
}

function onIconPointerDown(e){
  if(e.button !== undefined && e.button !== 0) return;

  const icon = e.currentTarget;
  desktopIcons.forEach(i => i.classList.remove("is-selected"));
  icon.classList.add("is-selected");

  const rect = icon.getBoundingClientRect();
  const [cx, cy] = getClientXY(e);

  dragIcon   = icon;
  dragOffX   = cx - rect.left;
  dragOffY   = cy - rect.top;
  dragMoved  = false;
  dragStartX = cx;
  dragStartY = cy;

  icon.classList.add("is-dragging");
  e.preventDefault();
}

function onPointerMove(e){
  if(!dragIcon) return;
  const [cx, cy] = getClientXY(e);

  if(Math.abs(cx - dragStartX) > 4 || Math.abs(cy - dragStartY) > 4) dragMoved = true;

  const surfRect = surface.getBoundingClientRect();
  let newLeft = cx - surfRect.left - dragOffX;
  let newTop  = cy - surfRect.top  - dragOffY;

  newLeft = Math.max(0, Math.min(newLeft, surfRect.width  - dragIcon.offsetWidth));
  newTop  = Math.max(0, Math.min(newTop,  surfRect.height - dragIcon.offsetHeight));

  dragIcon.style.left = newLeft + "px";
  dragIcon.style.top  = newTop  + "px";
  dragIcon.dataset.positioned = "1";
}

function onPointerUp(){
  if(!dragIcon) return;
  dragIcon.classList.remove("is-dragging");

  if(!dragMoved){
    const projectNum = dragIcon.dataset.project;
    if(projectNum) openProjectWindow(projectNum);
  }
  dragIcon = null;
}

desktopIcons.forEach(icon => {
  icon.addEventListener("mousedown", onIconPointerDown);
  icon.addEventListener("touchstart", onIconPointerDown, { passive: false });
});

window.addEventListener("mousemove", onPointerMove);
window.addEventListener("touchmove", onPointerMove, { passive: false });
window.addEventListener("mouseup", onPointerUp);
window.addEventListener("touchend", onPointerUp);

surface?.addEventListener("mousedown", e => {
  if(e.target === surface) desktopIcons.forEach(i => i.classList.remove("is-selected"));
});

/* =========================================================
   DOCK MAGNIFICATION
========================================================= */
const MAG_SCALES = [1.5, 1.3, 1.1, 1];
const DOCK_BASE = 50;
const BASE_MARGIN = 7;

function setDockMag(hoveredIndex){
  dockItems.forEach((item, i) => {
    const dist  = Math.abs(i - hoveredIndex);
    const scale = MAG_SCALES[Math.min(dist, MAG_SCALES.length - 1)];
    const app   = item.querySelector(".dock-app");
    if(app) app.style.setProperty("--dock-scale", scale);
    const extraEachSide = (DOCK_BASE * (scale - 1)) / 2;
    item.style.margin = `0 ${(BASE_MARGIN + extraEachSide).toFixed(1)}px`;
  });
}

function resetDockMag(){
  dockItems.forEach(item => {
    const app = item.querySelector(".dock-app");
    if(app) app.style.setProperty("--dock-scale", 1);
    item.style.margin = `0 ${BASE_MARGIN}px`;
  });
}

dockItems.forEach((item, idx) => {
  item.addEventListener("mouseenter", () => setDockMag(idx));
});
dockTray?.addEventListener("mouseleave", resetDockMag);

/* =========================================================
   DOCK ICONS — open dock windows
========================================================= */
const DOCK_WINDOWS = {
  "dock-about":   { title: "About",   src: "dock/about/index.html" },
  "dock-contact": { title: "Contact", src: "dock/contact/index.html" },
  "dock-resume":  { title: "Resume",  src: "dock/resume/index.html" },
  "dock-index":   { title: "Index",   src: "dock/index/index.html" }
};

document.querySelectorAll(".dock-app[data-window]").forEach(btn => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.window;
    const cfg = DOCK_WINDOWS[key];
    if(!cfg) return;
    openWindow(cfg.title, cfg.src);
  });
});
