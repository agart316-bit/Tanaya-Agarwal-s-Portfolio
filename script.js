/* =========================================================
   Mac Desktop Portfolio — script.js
   - Lock screen auto-type dots + blinking caret
   - Smooth float-up unlock
   - Liquid Ether WebGL background (initialised on unlock)
   - Draggable icons
   - Dock magnification
   - Window open / close / maximise / restore
   - 14 desktop icons -> projects/<n>/index.html
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
const welcomeBanner = document.getElementById("welcomeBanner");
const welcomeBannerClose = document.getElementById("welcomeBannerClose");

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
const referencesTab = document.getElementById("headerTabReferences");
const workPanel     = document.getElementById("workPanel");
const workGrid      = document.getElementById("workGrid");

const surface       = document.getElementById("desktopSurface");
const iconsCanvas   = document.getElementById("desktopIconsCanvas");
const desktopIcons  = document.querySelectorAll(".desktop-icon");
const desktopContextMenu = document.getElementById("desktopContextMenu");

const dockItems     = document.querySelectorAll(".dock-item");
const dockTray      = document.getElementById("dockTray");
const dock          = document.querySelector(".dock");

const PROJECTS = [
  { projectNum: "1",  title: "Men of Platinum",    url: "projects/1/index.html" },
  { projectNum: "2",  title: "Now or Never",       url: "projects/2/index.html" },
  { projectNum: "3",  title: "Digital Illustrations", url: "projects/3/index.html" },
  { projectNum: "4",  title: "ArtsyDesign. co",    url: "projects/4/index.html" },
  { projectNum: "5",  title: "Dream Journals",     url: "projects/5/index.html" },
  { projectNum: "6",  title: "Lost in Translation", url: "projects/6/index.html" },
  { projectNum: "7",  title: "Physics Textbook",   url: "projects/7/index.html" },
  { projectNum: "8",  title: "Paintings",          url: "projects/8/index.html" },
  { projectNum: "9",  title: "Black N White",      url: "projects/9/index.html" },
  { projectNum: "10", title: "Pottery",            url: "projects/10/index.html" },
  { projectNum: "11", title: "Installations",      url: "projects/11/index.html" },
  { projectNum: "12", title: "The Borges Stories", url: "projects/12/index.html" },
  { projectNum: "13", title: "Ten Tab Open",       url: "projects/13/index.html" },
  { projectNum: "14", title: "Fashion History",    url: "projects/14/index.html" }
];

const DESKTOP_GROUP_WINDOWS = {
  motion:  { title: "Digital Illustration & Motion", src: "dock/media/index.html?group=motion" },
  print:   { title: "Print & Editorial", src: "dock/media/index.html?group=print" },
  fineart: { title: "Fine Art", src: "dock/media/index.html?group=fineart" },
  spatial: { title: "Spatial / Installation", src: "dock/media/index.html?group=spatial" },
  web:     { title: "Web Design", src: "dock/media/index.html?group=web" }
};

const DESKTOP_GROUP_PROJECTS = {
  motion: ["1", "2", "3"],
  print: ["4", "5", "6", "7"],
  fineart: ["8", "9", "10"],
  spatial: ["11"],
  web: ["12", "13", "14"]
};

const PROJECTS_BY_NUMBER = new Map(PROJECTS.map((project) => [project.projectNum, project]));

function renderDesktopProjectBadges(){
  desktopIcons.forEach((icon) => {
    const groupKey = String(icon.dataset.group || "").toLowerCase();
    if(!groupKey) return;
    const count = (DESKTOP_GROUP_PROJECTS[groupKey] || []).length;
    if(!count) return;

    let badge = icon.querySelector(".desktop-icon-badge");
    if(!badge){
      badge = document.createElement("span");
      badge.className = "desktop-icon-badge";
      badge.setAttribute("aria-hidden", "true");
      icon.appendChild(badge);
    }
    badge.dataset.target = String(count);
    badge.dataset.animated = "0";
    badge.textContent = "0";
    badge.classList.remove("is-visible");
  });
}

function animateDesktopBadgeCounter(icon){
  const badge = icon?.querySelector(".desktop-icon-badge");
  const target = Number.parseInt(badge?.dataset.target || "0", 10);

  return new Promise((resolve) => {
    if(!badge || !Number.isFinite(target) || target < 1){
      resolve();
      return;
    }
    if(badge.dataset.animated === "1"){
      resolve();
      return;
    }

    badge.dataset.animated = "1";
    badge.classList.add("is-visible");

    const stepMs = 220;
    let value = 0;

    const tick = () => {
      value += 1;
      badge.textContent = String(value);
      if(value >= target){
        resolve();
        return;
      }
      window.setTimeout(tick, stepMs);
    };

    window.setTimeout(tick, 140);
  });
}

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
let welcomeBannerShown = false;
let desktopLaunchAnimationPlayed = false;

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

function showWelcomeBanner(){
  if(!welcomeBanner || welcomeBannerShown) return;
  welcomeBannerShown = true;
  welcomeBanner.hidden = false;
  welcomeBanner.classList.remove("is-visible");
  void welcomeBanner.offsetWidth;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      welcomeBanner.classList.add("is-visible");
    });
  });
}

function hideWelcomeBanner(){
  if(!welcomeBanner) return;
  welcomeBanner.classList.remove("is-visible");
  welcomeBanner.addEventListener("transitionend", () => {
    if(!welcomeBanner.classList.contains("is-visible")) {
      welcomeBanner.hidden = true;
    }
  }, { once: true });
}

welcomeBannerClose?.addEventListener("click", hideWelcomeBanner);

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

window.addEventListener("keydown", (e) => {
  if (!typingDone) return;
  if (lockscreen.style.display === "none" || lockscreen.classList.contains("is-unlocking")) return;
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    unlock();
  }
});

function unlock(){
  if(lockscreen.classList.contains("is-unlocking")) return;
  desktop.classList.remove("is-hidden");
  let launchPromise = Promise.resolve();

  // Reflow icon positions after the desktop becomes visible so
  // centering uses the actual rendered surface dimensions.
  requestAnimationFrame(() => {
    refreshDesktopIconLayout();
    if(!desktopLaunchAnimationPlayed){
      desktopLaunchAnimationPlayed = true;
      launchPromise = animateDesktopIconLaunch();
    }
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
    launchPromise.finally(() => {
      showWelcomeBanner();
    });
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
const WINDOW_BAR_SCROLL_RANGE = 40;
let frameScrollDetach = null;

const WINDOW_HEADER_TABS = {
  about: { title: "About", src: "dock/about/index.html" },
  resume: { title: "Resume", src: "dock/resume/index.html" },
  contact: { title: "Contact", src: "dock/contacts/index.html" },
  references: { title: "References", src: "dock/references/index.html" }
};

function getHeaderTabKeyForSource(src = ""){
  const normalized = String(src).toLowerCase();
  if (normalized.includes("/about/") || normalized.includes("dock/about")) return "about";
  if (normalized.includes("/resume/") || normalized.includes("dock/resume")) return "resume";
  if (normalized.includes("/contacts/") || normalized.includes("dock/contacts")) return "contact";
  if (normalized.includes("/references/") || normalized.includes("dock/references")) return "references";
  return null;
}

function setWindowHeaderTabActive(activeKey){
  const tabs = {
    work: workTab,
    about: aboutTab,
    resume: resumeTab,
    contact: contactTab,
    references: referencesTab
  };
  Object.entries(tabs).forEach(([key, btn]) => {
    if(!btn) return;
    btn.classList.toggle("is-open", key === activeKey);
  });
}

function setWindowScrollProgress(scrollTop = 0){
  if(!mainWindow) return;
  const progress = Math.min(Math.max(Number(scrollTop) / WINDOW_BAR_SCROLL_RANGE, 0), 1);
  mainWindow.style.setProperty("--window-scroll-progress", progress.toFixed(3));
}

function getFrameScrollTop(){
  if(!projectFrame) return 0;
  try {
    const frameWin = projectFrame.contentWindow;
    const frameDoc = frameWin?.document;
    const scrollEl = frameDoc?.scrollingElement || frameDoc?.documentElement || frameDoc?.body;
    const scrollTop = scrollEl?.scrollTop ?? frameWin?.scrollY ?? 0;
    return Number.isFinite(scrollTop) ? scrollTop : 0;
  } catch {
    return 0;
  }
}

function clearFrameScrollTracking(){
  if(typeof frameScrollDetach === "function") {
    frameScrollDetach();
  }
  frameScrollDetach = null;
}

function syncWindowBarFromFrameScroll(){
  // Prefer windowContent scrollTop (now the primary scroll container)
  const ct = windowContent ? windowContent.scrollTop : 0;
  setWindowScrollProgress(ct || getFrameScrollTop());
}

function trackFrameScrollProgress(){
  clearFrameScrollTracking();
  if(!projectFrame) {
    setWindowScrollProgress(0);
    return;
  }

  let frameWin = null;
  let frameDoc = null;
  try {
    frameWin = projectFrame.contentWindow;
    frameDoc = frameWin?.document;
  } catch {
    setWindowScrollProgress(0);
    return;
  }

  if(!frameWin || !frameDoc) {
    setWindowScrollProgress(0);
    return;
  }

  let rafId = null;
  const requestSync = () => {
    if(rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      syncWindowBarFromFrameScroll();
    });
  };

  // Track both the windowContent scroll and inner frame scroll
  windowContent?.addEventListener("scroll", requestSync, { passive: true });
  frameWin.addEventListener("scroll", requestSync, { passive: true });
  frameDoc.addEventListener("scroll", requestSync, { passive: true, capture: true });
  frameWin.addEventListener("resize", requestSync, { passive: true });
  requestSync();

  frameScrollDetach = () => {
    if(rafId !== null) cancelAnimationFrame(rafId);
    windowContent?.removeEventListener("scroll", requestSync);
    frameWin.removeEventListener("scroll", requestSync);
    frameDoc.removeEventListener("scroll", requestSync, true);
    frameWin.removeEventListener("resize", requestSync);
  };
}

/* =========================================================
   FRAME AUTO-HEIGHT — resizes projectFrame to its content
   so window-content (overflow-y: auto) can scroll it.
========================================================= */
let frameHeightRafId = null;
let frameHeightObservers = [];
let frameHeightFromRelay = false; // true when media-total-height relay is managing the height

function clearFrameHeightTracking() {
  frameHeightObservers.forEach(ob => { try { ob.disconnect(); } catch(e){} });
  frameHeightObservers = [];
  if (frameHeightRafId !== null) {
    cancelAnimationFrame(frameHeightRafId);
    frameHeightRafId = null;
  }
  frameHeightFromRelay = false;
  if (projectFrame) projectFrame.style.height = "100%";
  if (windowContent) windowContent.scrollTop = 0;
}

function scheduleFrameHeightSync() {
  if (frameHeightRafId !== null) return;
  frameHeightRafId = requestAnimationFrame(() => {
    frameHeightRafId = null;
    syncFrameHeight();
  });
}

function syncFrameHeight() {
  if (!projectFrame) return;
  // If the media-relay is managing height via postMessage, don't overwrite it.
  if (frameHeightFromRelay) return;
  try {
    const fd = projectFrame.contentDocument;
    if (!fd) return;
    // getBoundingClientRect accounts for CSS zoom correctly
    const h = Math.ceil(Math.max(
      fd.documentElement.getBoundingClientRect().height,
      fd.body ? fd.body.getBoundingClientRect().height : 0,
      620
    ));
    projectFrame.style.height = h + "px";
  } catch(e) {
    // cross-origin — leave as-is
  }
}

function trackFrameHeight() {
  clearFrameHeightTracking();
  if (!projectFrame) return;
  try {
    const fd = projectFrame.contentDocument;
    const fw = projectFrame.contentWindow;
    if (!fd || !fw) return;

    syncFrameHeight();

    // Watch for any layout changes inside the iframe
    const ro = new ResizeObserver(scheduleFrameHeightSync);
    ro.observe(fd.documentElement);
    if (fd.body) ro.observe(fd.body);
    frameHeightObservers.push(ro);

    const mo = new MutationObserver(scheduleFrameHeightSync);
    mo.observe(fd.documentElement, { childList: true, subtree: true, attributes: true });
    frameHeightObservers.push(mo);

    fd.querySelectorAll("img, video, iframe").forEach(el => {
      el.addEventListener("load", scheduleFrameHeightSync, { passive: true });
      el.addEventListener("loadedmetadata", scheduleFrameHeightSync, { passive: true });
    });

    // Retry a few times for late-rendering content
    [200, 500, 1000, 2000].forEach(ms => setTimeout(scheduleFrameHeightSync, ms));

  } catch(e) { /* cross-origin */ }
}

function loadWindowContent(title, iframeSrc){
  if(windowTitle) windowTitle.textContent = title || "Window";
  if(windowBlank) windowBlank.style.display = "grid";
  clearFrameScrollTracking();
  clearFrameHeightTracking();
  setWindowScrollProgress(0);

  if(projectFrame){
    projectFrame.src = iframeSrc || "";
    projectFrame.onload = () => {
      if(windowBlank) windowBlank.style.display = "none";
      syncWindowStateFromFrame();
      trackFrameScrollProgress();
      trackFrameHeight();
    };
    projectFrame.onerror = () => {
      if(windowBlank) windowBlank.style.display = "grid";
      setWindowScrollProgress(0);
    };
  }
}

function extractProjectNumberFromPath(input = ""){
  const text = String(input || "");
  const match = text.match(/projects\/(\d+)\/index\.html/i) || text.match(/projects\/(\d+)\b/i);
  return match ? String(match[1]) : null;
}

function syncWindowStateFromFrame(){
  if(!projectFrame) return;

  let framePath = "";
  try {
    framePath = projectFrame.contentWindow?.location?.pathname || "";
  } catch {
    framePath = "";
  }

  const fallbackSrc = projectFrame.getAttribute("src") || "";
  const combinedPath = `${framePath} ${fallbackSrc}`.trim();
  const projectNum = extractProjectNumberFromPath(combinedPath);

  if(projectNum){
    const project = PROJECTS_BY_NUMBER.get(projectNum);
    if(project?.title && windowTitle) windowTitle.textContent = project.title;
    setActiveWorkProject(projectNum);
    setWindowHeaderTabActive(null);
    return;
  }

  const tabKey = getHeaderTabKeyForSource(combinedPath);
  if(tabKey){
    const tab = WINDOW_HEADER_TABS[tabKey];
    if(tab?.title && windowTitle) windowTitle.textContent = tab.title;
    setWindowHeaderTabActive(tabKey);
    setActiveWorkProject(null);
    return;
  }

  setActiveWorkProject(null);
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
  setWindowScrollProgress(0);
  if(windowContent) windowContent.scrollTop = 0;
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
    clearFrameScrollTracking();
    clearFrameHeightTracking();
    if(windowContent) windowContent.scrollTop = 0;
    setWindowScrollProgress(0);
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
  closeDesktopContextMenu();
  const project = PROJECTS_BY_NUMBER.get(String(projectNum));
  const title = project?.title || `Project ${projectNum}`;
  const src = project?.url || `projects/${projectNum}/index.html`;
  openWindow(title, src);
  setActiveWorkProject(String(projectNum));
}

function openDesktopGroupWindow(groupKey){
  const group = DESKTOP_GROUP_WINDOWS[String(groupKey || "").toLowerCase()];
  if(!group) return;
  openWindow(group.title, group.src);
}

function openDesktopIcon(icon){
  if(!icon) return;
  closeDesktopContextMenu();
  const projectNum = icon.dataset.project;
  if(projectNum) {
    openProjectWindow(projectNum);
    return;
  }
  const groupKey = icon.dataset.group;
  if(groupKey) {
    openDesktopGroupWindow(groupKey);
    return;
  }
  const href = icon.getAttribute("href");
  if(href) {
    const title = icon.querySelector(".desktop-icon-label")?.textContent?.trim() || "Project";
    openWindow(title, href);
  }
}

function getGroupProjects(groupKey){
  const keys = DESKTOP_GROUP_PROJECTS[String(groupKey || "").toLowerCase()] || [];
  return keys
    .map((num) => PROJECTS_BY_NUMBER.get(num))
    .filter(Boolean);
}

function closeDesktopContextMenu(){
  if(!desktopContextMenu || desktopContextMenu.hidden) return;
  desktopContextMenu.classList.remove("open");
  desktopContextMenu.addEventListener("transitionend", () => {
    if(desktopContextMenu.classList.contains("open")) return;
    desktopContextMenu.hidden = true;
    desktopContextMenu.innerHTML = "";
  }, { once: true });
}

function positionDesktopContextMenu(anchorIcon){
  if(!desktopContextMenu || !anchorIcon) return;

  const anchorRect = anchorIcon.getBoundingClientRect();
  const menuRect = desktopContextMenu.getBoundingClientRect();
  const margin = 10;

  let left = anchorRect.right + 12;
  let top = anchorRect.top + 2;

  if (left + menuRect.width > window.innerWidth - margin) {
    left = anchorRect.left - menuRect.width - 12;
  }
  if (left < margin) left = margin;
  if (top + menuRect.height > window.innerHeight - margin) {
    top = window.innerHeight - menuRect.height - margin;
  }
  if (top < margin) top = margin;

  desktopContextMenu.style.left = `${left}px`;
  desktopContextMenu.style.top = `${top}px`;
}

function openDesktopContextMenu(icon){
  if(!desktopContextMenu || !icon) return;
  const groupKey = icon.dataset.group;
  const group = DESKTOP_GROUP_WINDOWS[groupKey];
  const projects = getGroupProjects(groupKey);
  if(!group || !projects.length) return;

  desktopContextMenu.innerHTML = "";

  const heading = document.createElement("p");
  heading.className = "desktop-context-menu-header";
  heading.textContent = group.title;

  const list = document.createElement("ul");
  list.className = "desktop-context-menu-list";

  projects.forEach((project) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "desktop-context-menu-item";
    button.setAttribute("role", "menuitem");
    button.textContent = project.title;
    button.addEventListener("click", () => {
      closeDesktopContextMenu();
      openProjectWindow(project.projectNum);
    });
    item.appendChild(button);
    list.appendChild(item);
  });

  desktopContextMenu.append(heading, list);
  desktopContextMenu.hidden = false;
  desktopContextMenu.classList.remove("open");
  desktopContextMenu.style.left = "0px";
  desktopContextMenu.style.top = "0px";

  requestAnimationFrame(() => {
    positionDesktopContextMenu(icon);
    desktopContextMenu.classList.add("open");
  });
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

const STACKED_PROJECT_IMAGE_MANIFEST = {
  "3": [
    "projects/3/project-3-1.jpg",
    "projects/3/project-3-2.jpg",
    "projects/3/project-3-3.jpg",
    "projects/3/project-3-4.jpg",
    "projects/3/project-3-5.jpg"
  ],
  "8": [
    "projects/8/project-8-1.jpg",
    "projects/8/project-8-2.jpg",
    "projects/8/project-8-3.jpg",
    "projects/8/project-8-4.jpg",
    "projects/8/project-8-5.jpg",
    "projects/8/project-8-6.jpg"
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
  "1": ["projects/1/project-1-1.png", "assets/project-1.png"],
  "2": ["projects/2/project-2-1.png", "assets/project-2.png"],
  "3": ["projects/3/project-3-1.jpg"],
  "4": ["projects/4/project-4-1.jpg", "assets/project-4.png"],
  "5": ["projects/5/project-5-3.jpg", "assets/project-5.png"],
  "6": ["projects/6/project-6-1.png"],
  "7": ["projects/7/project-7-1.png"],
  "8": ["projects/8/project-8-1.jpg"],
  "9": ["projects/9/project-9-1.jpg", "assets/project-9.png"],
  "10": ["projects/10/project-10-1.jpg", "assets/project-10.png"],
  "11": ["projects/11/project-11-1.jpg", "assets/project-11.png"],
  "12": ["projects/12/project-12-1.png", "assets/project-12.png"],
  "13": ["assets/work.jpg"],
  "14": ["assets/work.jpg"]
};

const DESKTOP_ICON_MANIFEST = {
  "1": "assets/project-1.png",
  "2": "assets/project-2.png",
  "3": "projects/3/project-3-1.jpg",
  "4": "assets/project-4.png",
  "5": "assets/project-5.png",
  "6": "projects/6/project-6-1.png",
  "7": "projects/7/project-7-1.png",
  "8": "projects/8/project-8-1.jpg",
  "9": "assets/project-9.png",
  "10": "assets/project-10.png",
  "11": "assets/project-11.png",
  "12": "assets/project-12.png",
  "13": "assets/work.jpg",
  "14": "assets/work.jpg"
};

function setWorkPanelOpen(shouldOpen){
  if(!mainWindow || !workPanel || !workTab) return;
  mainWindow.classList.toggle("is-work-open", !!shouldOpen);
  workPanel.classList.toggle("is-open", !!shouldOpen);
  workTab.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
  if(shouldOpen){
    setWindowHeaderTabActive("work");
    setWindowScrollProgress(workGrid?.scrollTop || 0);
  } else {
    workTab.classList.remove("is-open");
    syncWindowBarFromFrameScroll();
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

  meta.appendChild(title);
  card.append(preview, meta);

  card.addEventListener("click", () => {
    openProjectWindow(project.projectNum);
    setWorkPanelOpen(false);
  });

  void hydrateWorkCardPreview(project, image);
  return card;
}

// Category grouping definition — order and labels for the Work panel
const WORK_CATEGORIES = [
  {
    key: "motion",
    label: "Digital Illustration & Motion",
    projects: ["1", "2", "3"]
  },
  {
    key: "print",
    label: "Print & Editorial",
    projects: ["4", "5", "6", "7"]
  },
  {
    key: "fineart",
    label: "Fine Art",
    projects: ["8", "9", "10"]
  },
  {
    key: "spatial",
    label: "Spatial & Installation",
    projects: ["11"]
  },
  {
    key: "web",
    label: "Web Design",
    projects: ["12", "13", "14"]
  }
];

function buildWorkPanel(){
  if(!workGrid) return;
  workGrid.innerHTML = "";

  let cardIndex = 0;

  WORK_CATEGORIES.forEach(cat => {
    // Category header
    const header = document.createElement("div");
    header.className = `work-cat-header work-cat-header--${cat.key}`;
    header.textContent = cat.label;
    workGrid.appendChild(header);

    // Cards for this category in a sub-grid
    const catGrid = document.createElement("div");
    catGrid.className = "work-cat-grid";
    workGrid.appendChild(catGrid);

    cat.projects.forEach(num => {
      const project = PROJECTS_BY_NUMBER.get(num);
      if (!project) return;
      catGrid.appendChild(createWorkCard(project, cardIndex++));
    });
  });
}

function initWorkPanel(){
  if(workPanel && workTab) {
    workPanel.hidden = false;
    setWorkPanelOpen(false);
    buildWorkPanel();

    workGrid?.addEventListener("scroll", () => {
      if(!mainWindow.classList.contains("is-work-open")) return;
      setWindowScrollProgress(workGrid.scrollTop || 0);
    }, { passive: true });

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

  referencesTab?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openWindowHeaderTab("references");
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
    const stackImages = await resolveManifestStackImages(manifestPaths || []);

    if (stackImages.length) {
      setupStackedProjectIcon(icon, thumb, stackImages);
      return;
    }

    let iconSrc = await resolveImagePath(DESKTOP_ICON_MANIFEST[projectNum]);
    if (!iconSrc) {
      iconSrc = await resolveIconImage(`assets/project-${projectNum}`);
    }
    if (!iconSrc) {
      iconSrc = await resolveImagePath("assets/work.jpg");
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

const DESKTOP_ARTWORK_SIZE = { width: 1046, height: 1288 };
const DESKTOP_ARTWORK_LAPTOP_SOURCE = { x: 0.73, y: 0.86 };
const DESKTOP_ARTWORK_GROUP_TARGETS = {
  motion:  { x: 0.32, y: 0.20 }, // top-center
  print:   { x: 0.07, y: 0.43 }, // left-mid
  fineart: { x: 0.76, y: 0.32 }, // upper-right
  spatial: { x: 0.84, y: 0.58 }, // right-mid
  web:     { x: 0.05, y: 0.72 }  // lower-left
};

const FALLBACK_ICON_PCTS = [
  { px: 120 / 1440, py: 130 / 820 },
  { px: 410 / 1440, py: 220 / 820 },
  { px: 760 / 1440, py: 130 / 820 },
  { px: 620 / 1440, py: 500 / 820 },
  { px: 1070 / 1440, py: 220 / 820 }
];
const ICON_FALLBACK_PCT = { px: 0.04, py: 0.07 };
const ICON_DEFAULT_WIDTH  = 126;
const ICON_DEFAULT_HEIGHT = 132;
const ICON_IMAGE_CENTER_OFFSET_X = 63;
const ICON_IMAGE_CENTER_OFFSET_Y = 47;

// Per-icon stored percentage, overwritten on drag-drop.
const iconPositionPct = new Map();

/** Usable surface = full viewport minus dock strip at the bottom. */
function getSurfaceSize(){
  const dockH = Math.ceil(dock?.offsetHeight || 86);
  const w = Math.max(window.innerWidth,  320);
  const h = Math.max(window.innerHeight - dockH - 10, 200);
  return { w, h };
}

function getArtworkPlacement(surfW, surfH){
  const artW = DESKTOP_ARTWORK_SIZE.width;
  const artH = DESKTOP_ARTWORK_SIZE.height;
  const scale = Math.min(surfW / artW, surfH / artH);
  const width = artW * scale;
  const height = artH * scale;
  const left = (surfW - width) / 2;
  const top = surfH - height; // background-position: center bottom
  return { left, top, width, height };
}

function artworkPointToSurfacePx(point, surfW, surfH){
  const placement = getArtworkPlacement(surfW, surfH);
  return {
    x: placement.left + (point.x * placement.width),
    y: placement.top + (point.y * placement.height)
  };
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
    let left = 0;
    let top = 0;

    if(icon.dataset.manualPosition === "1"){
      const pct = iconPositionPct.get(icon) || FALLBACK_ICON_PCTS[i] || ICON_FALLBACK_PCT;
      ({ left, top } = pctToPx(pct.px, pct.py, w, h));
    } else {
      const groupKey = String(icon.dataset.group || "").toLowerCase();
      const artworkTarget = DESKTOP_ARTWORK_GROUP_TARGETS[groupKey];
      if(artworkTarget){
        const target = artworkPointToSurfacePx(artworkTarget, w, h);
        left = Math.min(Math.max(target.x - ICON_IMAGE_CENTER_OFFSET_X, 0), w - ICON_DEFAULT_WIDTH);
        top = Math.min(Math.max(target.y - ICON_IMAGE_CENTER_OFFSET_Y, 0), h - ICON_DEFAULT_HEIGHT);
      } else {
        const pct = iconPositionPct.get(icon) || FALLBACK_ICON_PCTS[i] || ICON_FALLBACK_PCT;
        if (!iconPositionPct.has(icon)) iconPositionPct.set(icon, pct);
        ({ left, top } = pctToPx(pct.px, pct.py, w, h));
      }
    }

    icon.style.left = `${left}px`;
    icon.style.top  = `${top}px`;
    icon.dataset.positioned = "1";
  });
}

function getIconImageCenter(icon){
  const thumb = icon?.querySelector(".desktop-icon-img");
  const canvasRect = iconsCanvas?.getBoundingClientRect();
  const thumbRect = thumb?.getBoundingClientRect();
  if(canvasRect && thumbRect && thumbRect.width > 0 && thumbRect.height > 0){
    return {
      x: (thumbRect.left - canvasRect.left) + (thumbRect.width / 2),
      y: (thumbRect.top - canvasRect.top) + (thumbRect.height / 2)
    };
  }

  const left = parseFloat(icon.style.left) || 0;
  const top = parseFloat(icon.style.top) || 0;
  return {
    x: left + ICON_IMAGE_CENTER_OFFSET_X,
    y: top + ICON_IMAGE_CENTER_OFFSET_Y
  };
}

function animateDesktopIconLaunch(){
  if(!iconsCanvas || !desktopIcons.length) return Promise.resolve();
  if(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches){
    Array.from(desktopIcons).forEach((icon) => {
      icon.classList.add("is-landed");
      animateDesktopBadgeCounter(icon);
    });
    return Promise.resolve();
  }

  const { w, h } = getSurfaceSize();
  const source = artworkPointToSurfacePx(DESKTOP_ARTWORK_LAPTOP_SOURCE, w, h);
  const icons = Array.from(desktopIcons);
  const launchOrder = new Map([
    ["spatial", 0],
    ["fineart", 1],
    ["motion", 2],
    ["print", 3],
    ["web", 4]
  ]);

  iconsCanvas.classList.add("is-launching");
  icons.forEach((icon) => icon.classList.remove("is-landed"));

  const flights = icons.map((icon, index) => {
    return new Promise((resolve) => {
      const thumb = icon.querySelector(".desktop-icon-img");
      const labelText = icon.querySelector(".desktop-icon-label")?.textContent?.trim() || "";
      const sourceSrc = thumb?.currentSrc || thumb?.src;
      const target = getIconImageCenter(icon);
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const sideBend = (index - ((icons.length - 1) / 2)) * 24;
      const arcLift = -Math.min(170, 72 + Math.abs(dx) * 0.24 + Math.abs(dy) * 0.12);
      const groupKey = String(icon.dataset.group || "").toLowerCase();
      const launchDelayIndex = launchOrder.has(groupKey)
        ? launchOrder.get(groupKey)
        : (launchOrder.size + index);

      if(!sourceSrc){
        icon.classList.add("is-landed");
        animateDesktopBadgeCounter(icon);
        resolve();
        return;
      }

      const ghost = document.createElement("span");
      ghost.className = "desktop-icon-launch-ghost";
      ghost.style.left = `${source.x}px`;
      ghost.style.top = `${source.y}px`;
      const thumbRect = thumb?.getBoundingClientRect();
      if(thumbRect && thumbRect.width > 0 && thumbRect.height > 0){
        ghost.style.width = `${thumbRect.width}px`;
        ghost.style.height = `${thumbRect.height}px`;
      }

      const img = document.createElement("img");
      img.src = sourceSrc;
      img.alt = "";
      img.draggable = false;
      ghost.appendChild(img);

      if(labelText){
        const ghostLabel = document.createElement("span");
        ghostLabel.className = "desktop-icon-launch-ghost-label";
        ghostLabel.textContent = labelText;
        ghost.appendChild(ghostLabel);
      }

      iconsCanvas.appendChild(ghost);

      const animation = ghost.animate(
        [
          {
            offset: 0,
            opacity: 0,
            transform: "translate(-50%, -50%) translate3d(0px, 0px, 0) scale(0.02)"
          },
          {
            offset: 0.28,
            opacity: 1,
            transform: `translate(-50%, -50%) translate3d(${(dx * 0.26) + sideBend}px, ${(dy * 0.18) + arcLift}px, 0) scale(0.28)`
          },
          {
            offset: 0.62,
            opacity: 1,
            transform: `translate(-50%, -50%) translate3d(${(dx * 0.72) + (sideBend * 0.36)}px, ${(dy * 0.74) + (arcLift * 0.26)}px, 0) scale(0.72)`
          },
          {
            offset: 0.86,
            opacity: 1,
            transform: `translate(-50%, -50%) translate3d(${dx * 0.95}px, ${dy * 0.96}px, 0) scale(0.95)`
          },
          {
            offset: 0.96,
            opacity: 1,
            transform: `translate(-50%, -50%) translate3d(${dx * 1.02}px, ${dy * 1.01}px, 0) scale(1.04)`
          },
          {
            offset: 1,
            opacity: 1,
            transform: `translate(-50%, -50%) translate3d(${dx}px, ${dy}px, 0) scale(1)`
          }
        ],
        {
          duration: 2380,
          delay: launchDelayIndex * 230,
          easing: "cubic-bezier(0.16, 0.84, 0.24, 1)",
          fill: "forwards"
        }
      );

      animation.addEventListener("finish", () => {
        ghost.remove();
        icon.classList.add("is-landed");
        animateDesktopBadgeCounter(icon);
        resolve();
      }, { once: true });
    });
  });

  return Promise.all(flights).finally(() => {
    iconsCanvas.classList.remove("is-launching");
  });
}

function refreshDesktopIconLayout(){
  layoutIconsInitial();
  syncSiteMinSizeFromIcons();
}

initWorkPanel();
renderDesktopProjectBadges();

syncSiteMinSizeFromIcons();
window.addEventListener("load", refreshDesktopIconLayout);
window.addEventListener("load", setDesktopIconImages);

/* Drag + click logic */
let dragIcon = null, dragOffX = 0, dragOffY = 0;
let dragMoved = false, dragStartX = 0, dragStartY = 0;
let longPressTimer = null;
let longPressTriggered = false;
const LONG_PRESS_MS = 420;
const LONG_PRESS_MOVE_THRESHOLD = 8;

function getClientXY(e){
  if(e.touches && e.touches.length) return [e.touches[0].clientX, e.touches[0].clientY];
  return [e.clientX, e.clientY];
}

function clearLongPressTimer(){
  if(longPressTimer !== null){
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
}

function scheduleLongPress(icon){
  clearLongPressTimer();
  longPressTriggered = false;
  longPressTimer = window.setTimeout(() => {
    longPressTimer = null;
    if(!dragIcon || dragIcon !== icon || dragMoved) return;
    longPressTriggered = true;
    icon.classList.remove("is-dragging");
    openDesktopContextMenu(icon);
  }, LONG_PRESS_MS);
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
  closeDesktopContextMenu();

  const rect = icon.getBoundingClientRect();
  const [cx, cy] = getClientXY(e);

  dragIcon   = icon;
  dragOffX   = cx - rect.left;
  dragOffY   = cy - rect.top;
  dragMoved  = false;
  dragStartX = cx;
  dragStartY = cy;
  scheduleLongPress(icon);

  icon.classList.add("is-dragging");
  e.preventDefault();
}

function onPointerMove(e){
  if(!dragIcon) return;
  const [cx, cy] = getClientXY(e);

  const movedPastPressThreshold =
    Math.abs(cx - dragStartX) > LONG_PRESS_MOVE_THRESHOLD ||
    Math.abs(cy - dragStartY) > LONG_PRESS_MOVE_THRESHOLD;
  if(movedPastPressThreshold){
    dragMoved = true;
    clearLongPressTimer();
  }

  if(longPressTriggered) return;

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
  clearLongPressTimer();
  dragIcon.classList.remove("is-dragging");

  if(longPressTriggered){
    longPressTriggered = false;
    dragIcon = null;
    return;
  }

  if(!dragMoved){
    openDesktopIcon(dragIcon);
  } else {
    // Save the dropped position as a percentage so resize keeps it in place.
    const { w, h } = getSurfaceSize();
    const left = parseFloat(dragIcon.style.left) || 0;
    const top  = parseFloat(dragIcon.style.top)  || 0;
    iconPositionPct.set(dragIcon, pxToPct(left, top, w, h));
    dragIcon.dataset.manualPosition = "1";
  }
  dragIcon = null;
  longPressTriggered = false;
}

desktopIcons.forEach(icon => {
  icon.addEventListener("mousedown", onIconPointerDown);
  icon.addEventListener("touchstart", onIconPointerDown, { passive: false });
  icon.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    desktopIcons.forEach(i => i.classList.remove("is-selected"));
    icon.classList.add("is-selected");
    openDesktopContextMenu(icon);
  });
  icon.addEventListener("click", (e) => {
    const hasModifier = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
    if (icon.tagName === "A" && !hasModifier) {
      // Keep default desktop behavior (open in in-app window), but preserve link
      // semantics for context-menu "Open Link in New Tab" and modifier-click.
      e.preventDefault();
      if (e.detail === 0) {
        openDesktopIcon(icon);
      }
    }
  });
});

window.addEventListener("mousemove", onPointerMove);
window.addEventListener("touchmove", onPointerMove, { passive: false });
window.addEventListener("mouseup", onPointerUp);
window.addEventListener("touchend", onPointerUp);
window.addEventListener("touchcancel", onPointerUp);
window.addEventListener("resize", () => {
  if(!desktopContextMenu || desktopContextMenu.hidden) return;
  closeDesktopContextMenu();
});
document.addEventListener("keydown", (e) => {
  if(e.key === "Escape") closeDesktopContextMenu();
});
document.addEventListener("pointerdown", (e) => {
  if(!desktopContextMenu || desktopContextMenu.hidden) return;
  if(e.target.closest("#desktopContextMenu")) return;
  if(e.target.closest(".desktop-icon")) return;
  closeDesktopContextMenu();
});

surface?.addEventListener("mousedown", e => {
  if(e.target === surface || e.target === iconsCanvas) {
    desktopIcons.forEach(i => i.classList.remove("is-selected"));
    closeDesktopContextMenu();
  }
});

/* =========================================================
   DOCK MAGNIFICATION
========================================================= */
const MAG_SCALES = [1.5, 1.3, 1.1, 1];
const DOCK_BASE = (() => {
  const parsed = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--dock-size"));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 50;
})();
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
  "dock-references": { title: "References", src: "dock/references/index.html" },
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

/* =========================================================
   IFRAME SCROLL RELAY
   The media page (dock/media) can't scroll .window-content
   directly — it relays wheel events up via postMessage.
   We catch them here and scroll the actual container.
   We also receive the media page's true total height so we
   can size projectFrame correctly for windowContent to scroll.
========================================================= */
window.addEventListener("message", (e) => {
  if (!e.data || typeof e.data !== "object") return;

  // Wheel relay: project iframes → media page → here → windowContent
  if (e.data.type === "media-wheel") {
    if (!windowContent) return;
    windowContent.scrollBy({
      left: Number(e.data.deltaX) || 0,
      top:  Number(e.data.deltaY) || 0,
      behavior: "auto"
    });
    return;
  }

  // Height relay: media page reports its true stacked content height
  // so we can size projectFrame so windowContent has something to scroll.
  if (e.data.type === "media-total-height") {
    const h = Number(e.data.height);
    if (projectFrame && Number.isFinite(h) && h > 0) {
      frameHeightFromRelay = true;
      projectFrame.style.height = Math.ceil(h) + "px";
    }
  }
});
