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
const windowBar     = document.getElementById("windowBar");
const projectFrame  = document.getElementById("projectFrame");
const windowBlank   = document.getElementById("windowBlank");
const windowContent = mainWindow?.querySelector(".window-content") || null;
const workTab       = document.getElementById("workTab");
const aboutTab      = document.getElementById("headerTabAbout");
const resumeTab     = document.getElementById("headerTabResume");
const contactTab    = document.getElementById("headerTabContact");
const recommendationsTab = document.getElementById("headerTabRecommendations");
const workPanel     = document.getElementById("workPanel");
const workGrid      = document.getElementById("workGrid");

const surface       = document.getElementById("desktopSurface");
const iconsCanvas   = document.getElementById("desktopIconsCanvas");
const desktopIcons  = document.querySelectorAll(".desktop-icon");

const dockItems     = document.querySelectorAll(".dock-item");
const dockTray      = document.getElementById("dockTray");
const dock          = document.querySelector(".dock");

const PROJECTS = Array.from(desktopIcons)
  .map((icon) => {
    const projectNum = icon.dataset.project ? String(icon.dataset.project) : "";
    if (!projectNum) return null;
    const title = icon.querySelector(".desktop-icon-label")?.textContent?.trim() || `Project ${projectNum}`;
    return {
      projectNum,
      title,
      url: icon.getAttribute("href") || `projects/${projectNum}/index.html`
    };
  })
  .filter(Boolean)
  .sort((a, b) => Number(a.projectNum) - Number(b.projectNum));

const PROJECTS_BY_NUMBER = new Map(PROJECTS.map((project) => [project.projectNum, project]));

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
    colors: ['#ef2475', '#ffa4db', '#ff72a1'],
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

  // Reflow icon positions after the desktop becomes visible so
  // centering uses the actual rendered surface dimensions.
  requestAnimationFrame(() => {
    refreshDesktopIconLayout();
  });

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
let windowOffsetX = 0;
let windowOffsetY = 0;
let savedWindowOffsetX = 0;
let savedWindowOffsetY = 0;
let isResponsiveWindowFullscreen = false;
let isWindowDragging = false;
let dragPointerId = null;
let winDragStartX = 0;
let winDragStartY = 0;
let winDragOriginX = 0;
let winDragOriginY = 0;

const WINDOW_FULLSCREEN_WIDTH = 1060;
const WINDOW_FULLSCREEN_HEIGHT = 760;

const WINDOW_HEADER_TABS = {
  about: { title: "About", src: "dock/about/index.html" },
  resume: { title: "Resume", src: "dock/resume/index.html" },
  contact: { title: "Contact", src: "dock/contacts/index.html" },
  recommendations: { title: "Recommendations", src: "dock/recommendations/index.html" }
};

function getHeaderTabKeyForSource(src = ""){
  const normalized = String(src).toLowerCase();
  if (normalized.includes("/about/") || normalized.includes("dock/about")) return "about";
  if (normalized.includes("/resume/") || normalized.includes("dock/resume")) return "resume";
  if (normalized.includes("/contacts/") || normalized.includes("dock/contacts")) return "contact";
  if (normalized.includes("/recommendations/") || normalized.includes("dock/recommendations")) return "recommendations";
  return null;
}

function setWindowHeaderTabActive(activeKey){
  const tabs = {
    work: workTab,
    about: aboutTab,
    resume: resumeTab,
    contact: contactTab,
    recommendations: recommendationsTab
  };
  Object.entries(tabs).forEach(([key, btn]) => {
    if(!btn) return;
    btn.classList.toggle("is-open", key === activeKey);
  });
}

function loadWindowContent(title, iframeSrc){
  if(windowTitle) windowTitle.textContent = title || "Window";
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
}

function clampWindowOffset(nextX, nextY){
  if(!mainWindow) return [nextX, nextY];
  if(isMaximised || isResponsiveWindowFullscreen) return [0, 0];

  const width = mainWindow.offsetWidth || Math.min(window.innerWidth * 0.88, 1060);
  const height = mainWindow.offsetHeight || Math.min(window.innerHeight * 0.86, 760);
  const baseLeft = (window.innerWidth - width) / 2;
  const baseTop = (window.innerHeight - height) / 2;

  const minX = -baseLeft + 14;
  const maxX = window.innerWidth - width - 14 - baseLeft;
  const minY = -baseTop + 10;
  const maxY = window.innerHeight - height - 10 - baseTop;

  const clampedX = Math.min(Math.max(nextX, minX), maxX);
  const clampedY = Math.min(Math.max(nextY, minY), maxY);
  return [clampedX, clampedY];
}

function applyWindowOffset(){
  if(!mainWindow) return;
  mainWindow.style.setProperty("--window-offset-x", `${windowOffsetX}px`);
  mainWindow.style.setProperty("--window-offset-y", `${windowOffsetY}px`);
}

function setWindowOffset(nextX, nextY){
  const [x, y] = clampWindowOffset(nextX, nextY);
  windowOffsetX = x;
  windowOffsetY = y;
  applyWindowOffset();
}

function resetWindowOffset(){
  windowOffsetX = 0;
  windowOffsetY = 0;
  applyWindowOffset();
}

function onWindowDragStart(event){
  if(!windowBar || !mainWindow || isMaximised || isResponsiveWindowFullscreen) return;
  if(event.button !== 0) return;
  if(event.target.closest("button, [data-action], .window-navTab")) return;

  isWindowDragging = true;
  dragPointerId = event.pointerId;
  winDragStartX = event.clientX;
  winDragStartY = event.clientY;
  winDragOriginX = windowOffsetX;
  winDragOriginY = windowOffsetY;

  mainWindow.classList.add("is-dragging");
  windowBar.setPointerCapture(dragPointerId);
  event.preventDefault();
}

function onWindowDragMove(event){
  if(!isWindowDragging || event.pointerId !== dragPointerId) return;
  const nextX = winDragOriginX + (event.clientX - winDragStartX);
  const nextY = winDragOriginY + (event.clientY - winDragStartY);
  setWindowOffset(nextX, nextY);
}

function endWindowDrag(event){
  if(!isWindowDragging) return;
  if(event && dragPointerId !== null && event.pointerId !== dragPointerId) return;

  isWindowDragging = false;
  mainWindow?.classList.remove("is-dragging");
  if(windowBar && dragPointerId !== null && windowBar.hasPointerCapture(dragPointerId)) {
    windowBar.releasePointerCapture(dragPointerId);
  }
  dragPointerId = null;
}

function openWindow(title, iframeSrc){
  windowLayer.classList.remove("is-hidden");
  isMaximised = false;
  savedWindowOffsetX = 0;
  savedWindowOffsetY = 0;
  resetWindowOffset();

  mainWindow.classList.remove("is-maximised", "is-closing", "is-dragging");
  syncResponsiveWindowMode();
  setWorkPanelOpen(false);
  setActiveWorkProject(null);
  setWindowHeaderTabActive(getHeaderTabKeyForSource(iframeSrc));
  loadWindowContent(title, iframeSrc);

  void mainWindow.offsetWidth;
  mainWindow.style.animation = "none";
  void mainWindow.offsetWidth;
  mainWindow.style.animation = "";
}

function closeWindow(){
  endWindowDrag();
  setWorkPanelOpen(false);
  setActiveWorkProject(null);
  setWindowHeaderTabActive(null);
  mainWindow.classList.add("is-closing");
  mainWindow.addEventListener("animationend", () => {
    windowLayer.classList.add("is-hidden");
    mainWindow.classList.remove("is-closing");
    isMaximised = false;

    if(projectFrame) projectFrame.src = "";
    if(windowBlank) windowBlank.style.display = "grid";
    savedWindowOffsetX = 0;
    savedWindowOffsetY = 0;
    resetWindowOffset();
  }, { once: true });
}

function maximiseWindow(){
  if(isResponsiveWindowFullscreen) return;
  if(isMaximised) return;
  endWindowDrag();
  savedWindowOffsetX = windowOffsetX;
  savedWindowOffsetY = windowOffsetY;
  resetWindowOffset();
  isMaximised = true;
  mainWindow.classList.add("is-maximised");
}

function restoreWindow(){
  if(!isMaximised) return;
  isMaximised = false;
  mainWindow.classList.remove("is-maximised");
  setWindowOffset(savedWindowOffsetX, savedWindowOffsetY);
}

function shouldUseResponsiveWindowFullscreen(){
  return (
    (window.innerWidth <= WINDOW_FULLSCREEN_WIDTH || window.innerHeight <= WINDOW_FULLSCREEN_HEIGHT)
  );
}

function syncResponsiveWindowMode(){
  if(!mainWindow) return;
  isResponsiveWindowFullscreen = shouldUseResponsiveWindowFullscreen();
  mainWindow.classList.toggle("is-responsive-fullscreen", isResponsiveWindowFullscreen);
  if(isResponsiveWindowFullscreen) {
    endWindowDrag();
    resetWindowOffset();
  }
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
  if(e.key !== "Escape" || windowLayer.classList.contains("is-hidden")) return;
  if(mainWindow.classList.contains("is-work-open")) {
    setWorkPanelOpen(false);
    return;
  }
  closeWindow();
});

window.addEventListener("resize", () => {
  syncResponsiveWindowMode();
  refreshDesktopIconLayout();
  if(windowLayer.classList.contains("is-hidden")) return;
  if(isMaximised || isResponsiveWindowFullscreen) {
    resetWindowOffset();
    return;
  }
  setWindowOffset(windowOffsetX, windowOffsetY);
});

windowBar?.addEventListener("pointerdown", onWindowDragStart);
windowBar?.addEventListener("pointermove", onWindowDragMove);
windowBar?.addEventListener("pointerup", endWindowDrag);
windowBar?.addEventListener("pointercancel", endWindowDrag);

/* =========================================================
   DESKTOP ICONS — open project windows
========================================================= */
function openProjectWindow(projectNum){
  const project = PROJECTS_BY_NUMBER.get(String(projectNum));
  const title = project?.title || `Project ${projectNum}`;
  const src = project?.url || `projects/${projectNum}/index.html`;
  openWindow(title, src);
  setActiveWorkProject(String(projectNum));
}

const ICON_IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "svg", "PNG", "JPG", "JPEG", "WEBP", "SVG"];

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

const WORK_PREVIEW_MANIFEST = {
  "1": ["projects/1/project-1-0.jpg", "projects/1/project-1-1.jpg", "assets/project-1.png"],
  "2": ["projects/2/project-2-1.jpg"],
  "3": ["projects/3/project-3-1.png", "assets/project-3.png"],
  "4": ["projects/4/project-4-1.jpg"],
  "5": ["projects/5/project-5-1.JPG", "assets/project-5.png"],
  "6": ["projects/6/project-6-1.jpg", "assets/project-6.png"],
  "7": ["projects/7/project-7-1.png", "assets/project-7.png"],
  "8": ["projects/8/portfolio-8-1.JPG", "assets/project-8.png"],
  "9": ["projects/9/project-9-1.jpg", "assets/project-9.png"],
  "10": ["projects/10/project-10-1.png", "assets/project-10.png"],
  "11": ["assets/desktop-bg.jpg"],
  "12": ["assets/lockscreen-bg.jpg"]
};

function setWorkPanelOpen(shouldOpen){
  if(!mainWindow || !workPanel || !workTab) return;
  mainWindow.classList.toggle("is-work-open", !!shouldOpen);
  workPanel.classList.toggle("is-open", !!shouldOpen);
  workTab.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
  if(shouldOpen){
    setWindowHeaderTabActive("work");
  } else {
    workTab.classList.remove("is-open");
  }
}

function openWindowHeaderTab(tabKey){
  const tab = WINDOW_HEADER_TABS[tabKey];
  if(!tab) return;
  setWorkPanelOpen(false);
  setActiveWorkProject(null);
  setWindowHeaderTabActive(tabKey);
  loadWindowContent(tab.title, tab.src);
}

function setActiveWorkProject(projectNum){
  if(!workGrid) return;
  const normalized = projectNum ? String(projectNum) : null;
  workGrid.querySelectorAll(".work-card").forEach((card) => {
    card.classList.toggle("is-current", card.dataset.project === normalized);
  });
}

function getProjectPreviewCandidates(projectNum){
  const base = `projects/${projectNum}/project-${projectNum}-1`;
  const manifest = WORK_PREVIEW_MANIFEST[projectNum] || [];
  const candidates = [
    ...manifest,
    `${base}.png`,
    `${base}.jpg`,
    `${base}.jpeg`,
    `${base}.JPG`,
    `${base}.JPEG`,
    `assets/project-${projectNum}.png`,
    "assets/desktop-bg.jpg"
  ];
  return Array.from(new Set(candidates));
}

async function resolveFirstImagePath(candidates = []){
  for (const path of candidates) {
    const existing = await resolveImagePath(path);
    if (existing) return existing;
  }
  return null;
}

async function hydrateWorkCardPreview(project, image){
  const previewSrc = await resolveFirstImagePath(getProjectPreviewCandidates(project.projectNum));
  if (previewSrc) {
    image.src = previewSrc;
    return;
  }

  const fallback = document.createElement("div");
  fallback.className = "work-card-fallback";
  fallback.textContent = "NO PREVIEW";
  image.replaceWith(fallback);
}

function createWorkCard(project, index){
  const card = document.createElement("button");
  card.className = "work-card";
  card.type = "button";
  card.dataset.project = project.projectNum;
  card.setAttribute("aria-label", `Open ${project.title}`);
  card.style.setProperty("--work-delay", `${index * 38}ms`);

  const preview = document.createElement("div");
  preview.className = "work-card-preview";

  const image = document.createElement("img");
  image.alt = `${project.title} preview`;
  image.loading = "lazy";
  image.decoding = "async";
  preview.appendChild(image);

  const meta = document.createElement("div");
  meta.className = "work-card-meta";

  const title = document.createElement("span");
  title.className = "work-card-title";
  title.textContent = project.title;

  const url = document.createElement("span");
  url.className = "work-card-url";
  url.textContent = project.url;

  meta.appendChild(title);
  meta.appendChild(url);
  card.append(preview, meta);

  card.addEventListener("click", () => {
    openProjectWindow(project.projectNum);
    setWorkPanelOpen(false);
  });

  void hydrateWorkCardPreview(project, image);
  return card;
}

function buildWorkPanel(){
  if(!workGrid) return;
  workGrid.innerHTML = "";
  PROJECTS.forEach((project, index) => {
    workGrid.appendChild(createWorkCard(project, index));
  });
}

function initWorkPanel(){
  if(workPanel && workTab) {
    workPanel.hidden = false;
    setWorkPanelOpen(false);
    buildWorkPanel();

    workTab.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      setWorkPanelOpen(!mainWindow.classList.contains("is-work-open"));
    });
  }

  aboutTab?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openWindowHeaderTab("about");
  });

  resumeTab?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openWindowHeaderTab("resume");
  });

  contactTab?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openWindowHeaderTab("contact");
  });

  recommendationsTab?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openWindowHeaderTab("recommendations");
  });

  windowContent?.addEventListener("click", (e) => {
    if (!mainWindow.classList.contains("is-work-open")) return;
    if (e.target.closest("#workPanel") || e.target.closest("#workTab")) return;
    setWorkPanelOpen(false);
  });
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

// Reference design dimensions used to derive default percentages.
const ICON_REF_W = 1440;
const ICON_REF_H = 820;

// Original pixel positions converted to percentage fractions.
const ICON_POSITIONS_PX = [
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

const ICON_POSITIONS = ICON_POSITIONS_PX.map(p => ({
  px: p.x / ICON_REF_W,
  py: p.y / ICON_REF_H,
}));

const ICON_FALLBACK_PCT = { px: 0.04, py: 0.07 };
const ICON_DEFAULT_WIDTH  = 82;
const ICON_DEFAULT_HEIGHT = 104;

// Per-icon stored percentage, overwritten on drag-drop.
const iconPositionPct = new Map();

/** Usable surface = full viewport minus dock strip at the bottom. */
function getSurfaceSize(){
  const dockH = Math.ceil(dock?.offsetHeight || 86);
  const w = Math.max(window.innerWidth,  320);
  const h = Math.max(window.innerHeight - dockH - 10, 200);
  return { w, h };
}

/** Percentage → clamped pixel position so icon stays fully on-screen. */
function pctToPx(px, py, surfW, surfH){
  const left = Math.min(Math.max(px * surfW, 0), surfW - ICON_DEFAULT_WIDTH);
  const top  = Math.min(Math.max(py * surfH, 0), surfH - ICON_DEFAULT_HEIGHT);
  return { left, top };
}

/** Pixel position → percentage for the current surface size. */
function pxToPct(left, top, surfW, surfH){
  return {
    px: left / surfW,
    py: top  / surfH,
  };
}

function syncSiteMinSizeFromIcons(){
  const root = document.documentElement;
  const dockWidth  = Math.ceil(dockTray?.scrollWidth || dockTray?.offsetWidth || 0);
  const dockHeight = Math.ceil(dockTray?.offsetHeight || dock?.offsetHeight || 0);
  // Icons scale freely — only the dock drives the minimum width.
  const minWidth  = Math.ceil(Math.max(dockWidth + 24, 320));
  const minHeight = Math.ceil(dockHeight + 120);
  root.style.setProperty("--site-min-width",  `${minWidth}px`);
  root.style.setProperty("--site-min-height", `${minHeight}px`);
  // Keep these vars for any CSS that reads them.
  root.style.setProperty("--icons-canvas-width",  "100%");
  root.style.setProperty("--icons-canvas-height", "100%");
}

function layoutIconsInitial(){
  const { w, h } = getSurfaceSize();
  desktopIcons.forEach((icon, i) => {
    const pct = iconPositionPct.get(icon) || ICON_POSITIONS[i] || ICON_FALLBACK_PCT;
    if (!iconPositionPct.has(icon)) iconPositionPct.set(icon, pct);
    const { left, top } = pctToPx(pct.px, pct.py, w, h);
    icon.style.left = `${left}px`;
    icon.style.top  = `${top}px`;
    icon.dataset.positioned = "1";
  });
}

function refreshDesktopIconLayout(){
  layoutIconsInitial();
  syncSiteMinSizeFromIcons();
}

initWorkPanel();

syncSiteMinSizeFromIcons();
window.addEventListener("load", refreshDesktopIconLayout);
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
  if (
    icon.tagName === "A" &&
    (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
  ) {
    return;
  }

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

  const { w, h } = getSurfaceSize();
  let newLeft = cx - dragOffX;
  let newTop  = cy - dragOffY;

  // Clamp to the full surface (viewport minus dock).
  newLeft = Math.max(0, Math.min(newLeft, w - ICON_DEFAULT_WIDTH));
  newTop  = Math.max(0, Math.min(newTop,  h - ICON_DEFAULT_HEIGHT));

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
  } else {
    // Save the dropped position as a percentage so resize keeps it in place.
    const { w, h } = getSurfaceSize();
    const left = parseFloat(dragIcon.style.left) || 0;
    const top  = parseFloat(dragIcon.style.top)  || 0;
    iconPositionPct.set(dragIcon, pxToPct(left, top, w, h));
    dragIcon.dataset.manualPosition = "1";
  }
  dragIcon = null;
}

desktopIcons.forEach(icon => {
  icon.addEventListener("mousedown", onIconPointerDown);
  icon.addEventListener("touchstart", onIconPointerDown, { passive: false });
  icon.addEventListener("click", (e) => {
    const hasModifier = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
    if (icon.tagName === "A" && !hasModifier) {
      // Keep default desktop behavior (open in in-app window), but preserve link
      // semantics for context-menu "Open Link in New Tab" and modifier-click.
      e.preventDefault();
      if (e.detail === 0) {
        const projectNum = icon.dataset.project;
        if (projectNum) openProjectWindow(projectNum);
      }
    }
  });
});

window.addEventListener("mousemove", onPointerMove);
window.addEventListener("touchmove", onPointerMove, { passive: false });
window.addEventListener("mouseup", onPointerUp);
window.addEventListener("touchend", onPointerUp);

surface?.addEventListener("mousedown", e => {
  if(e.target === surface || e.target === iconsCanvas) {
    desktopIcons.forEach(i => i.classList.remove("is-selected"));
  }
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
    if(app) {
      app.style.setProperty("--dock-scale", scale);
      app.style.setProperty("--dock-icon-scale", 1);
    }
    const extraEachSide = (DOCK_BASE * (scale - 1)) / 2;
    item.style.margin = `0 ${(BASE_MARGIN + extraEachSide).toFixed(1)}px`;
  });
}

function resetDockMag(){
  dockItems.forEach(item => {
    const app = item.querySelector(".dock-app");
    if(app) {
      app.style.setProperty("--dock-scale", 1);
      app.style.setProperty("--dock-icon-scale", 1);
    }
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
  "dock-about":           { title: "About",           src: "dock/about/index.html" },
  "dock-resume":          { title: "Resume",          src: "dock/resume/index.html" },
  "dock-recommendations": { title: "Recommendations", src: "dock/recommendations/index.html" },
  "dock-contacts":        { title: "Contacts",        src: "dock/contacts/index.html" },
  "dock-photos":          { title: "Photos",          src: "dock/photos/index.html" }
};

document.querySelectorAll(".dock-app[data-window]").forEach(btn => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.window;
    const cfg = DOCK_WINDOWS[key];
    if(!cfg) return;
    openWindow(cfg.title, cfg.src);
  });
});
