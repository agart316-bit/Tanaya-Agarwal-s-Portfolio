const GROUPS = {
  motion: {
    title: "Digital Illustration & Motion",
    intro: "Men of Platinum, Digital Illustrations, The Upside Down",
    projects: [
      { id: "1", title: "Men of Platinum" },
      { id: "3", title: "Digital Illustrations" },
      { id: "15", title: "The Upside Down" }
    ]
  },
  print: {
    title: "Print & Editorial",
    intro: "ArtsyDesign. co, Dream Journals, Lost in Translation, Physics Textbook",
    projects: [
      { id: "4", title: "ArtsyDesign. co" },
      { id: "5", title: "Dream Journals" },
      { id: "6", title: "Lost in Translation" },
      { id: "7", title: "Physics Textbook" }
    ]
  },
  fineart: {
    title: "Fine Art",
    intro: "Paintings, Black N White, Pottery",
    projects: [
      { id: "8", title: "Paintings" },
      { id: "9", title: "Black N White" },
      { id: "10", title: "Pottery" }
    ]
  },
  spatial: {
    title: "Spatial / Installation",
    intro: "Installations",
    projects: [
      { id: "11", title: "Installations" }
    ]
  },
  web: {
    title: "Web Design",
    intro: "The Borges Stories, Ten Tab Open, Fashion History",
    projects: [
      { id: "12", title: "The Borges Stories" },
      { id: "13", title: "Ten Tab Open" },
      { id: "14", title: "Fashion History" }
    ]
  }
};

const titleEl = document.getElementById("mediaTitle");
const introEl = document.getElementById("mediaIntro");
const stackEl = document.getElementById("mediaStack");

function getGroupFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const key = (params.get("group") || "motion").toLowerCase();
  return GROUPS[key] ? key : "motion";
}

// ─── Inject a height-reporter + wheel-bridge into a same-origin iframe ───
// This runs inside the project iframe's context after it loads.
const INJECTED_SCRIPT = `
(function() {
  if (window.__mediaPageBridged) return;
  window.__mediaPageBridged = true;

  // Lock own scroll; wheel events go up to the media page instead
  document.documentElement.style.overflow = 'hidden';
  document.documentElement.style.overscrollBehavior = 'none';
  document.body.style.overflow = 'hidden';
  document.body.style.overscrollBehavior = 'none';

  function sendHeight() {
    // getBoundingClientRect on the root element accounts for CSS zoom correctly
    var h = document.documentElement.getBoundingClientRect().height;
    // Also check body
    var bh = document.body.getBoundingClientRect().height;
    var height = Math.ceil(Math.max(h, bh, 620));
    window.parent.postMessage({ type: 'project-height', height: height }, '*');
  }

  // Wheel → scroll the parent (media page) instead
  document.addEventListener('wheel', function(e) {
    e.preventDefault();
    window.parent.postMessage({ type: 'project-wheel', deltaX: e.deltaX, deltaY: e.deltaY }, '*');
  }, { passive: false });

  // Touch scroll → pass up too
  var touchStartY = 0;
  document.addEventListener('touchstart', function(e) {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchmove', function(e) {
    e.preventDefault();
    var dy = touchStartY - e.touches[0].clientY;
    touchStartY = e.touches[0].clientY;
    window.parent.postMessage({ type: 'project-wheel', deltaX: 0, deltaY: dy }, '*');
  }, { passive: false });

  // Report height now and whenever layout changes
  sendHeight();
  var ro = new ResizeObserver(sendHeight);
  ro.observe(document.documentElement);
  ro.observe(document.body);

  // Also re-report after images/videos load
  document.querySelectorAll('img, video').forEach(function(el) {
    el.addEventListener('load', sendHeight, { passive: true });
    el.addEventListener('loadedmetadata', sendHeight, { passive: true });
  });

  setTimeout(sendHeight, 200);
  setTimeout(sendHeight, 600);
  setTimeout(sendHeight, 1400);
})();
`;

function attachFrame(frame, item) {
  frame.addEventListener("load", () => {
    try {
      const frameDoc = frame.contentDocument;
      const frameWin = frame.contentWindow;
      if (!frameDoc || !frameWin) return;

      // Inject the bridge script into the project iframe
      const script = frameDoc.createElement("script");
      script.textContent = INJECTED_SCRIPT;
      frameDoc.head.appendChild(script);
    } catch (e) {
      // cross-origin fallback — shouldn't happen for local files
    }
  });
}

// Listen for height + wheel messages from project iframes
window.addEventListener("message", (e) => {
  if (!e.data || typeof e.data !== "object") return;

  if (e.data.type === "project-height") {
    // Find which iframe sent this
    const frames = stackEl ? stackEl.querySelectorAll(".media-frame") : [];
    frames.forEach((frame) => {
      if (frame.contentWindow === e.source) {
        const newHeight = Math.max(Number(e.data.height) || 620, 620);
        frame.style.height = newHeight + "px";
      }
    });
    return;
  }

  if (e.data.type === "project-wheel") {
    // Relay the wheel event up to the portfolio window so it can scroll
    // the .window-content div (the media iframe's own window can't scroll it).
    window.parent.postMessage({
      type: "media-wheel",
      deltaX: e.data.deltaX || 0,
      deltaY: e.data.deltaY || 0
    }, "*");
  }
});

// ── Intersection Observer for reveal transitions ──
function setupRevealObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.02, rootMargin: "0px 0px -20px 0px" }
  );
  return observer;
}

function createProjectItem(project, index, observer) {
  const item = document.createElement("article");
  item.className = "media-item";

  const frame = document.createElement("iframe");
  frame.className = "media-frame";
  frame.title = `${project.title} content`;
  frame.loading = index === 0 ? "eager" : "lazy";
  frame.src = `../../projects/${project.id}/index.html`;

  attachFrame(frame, item);
  item.append(frame);

  // Observe for the reveal transition
  observer.observe(item);

  return item;
}

function buildGroupView() {
  if (!stackEl || !titleEl || !introEl) return;

  const groupKey = getGroupFromQuery();
  const config = GROUPS[groupKey];
  titleEl.textContent = config.title;
  introEl.textContent = config.intro;
  stackEl.innerHTML = "";

  const observer = setupRevealObserver();

  config.projects.forEach((project, index) => {
    stackEl.appendChild(createProjectItem(project, index, observer));
  });
}

buildGroupView();

// ── Report this page's full scroll height to the portfolio window ──
// Since body is overflow:hidden, the browser won't measure scroll height
// correctly — we compute it from the stack element's layout instead.
function reportTotalHeight() {
  if (!stackEl) return;
  const headerH = document.querySelector(".media-header")?.getBoundingClientRect().height || 0;
  // Sum up each media-item's offsetHeight + gap
  const items = Array.from(stackEl.querySelectorAll(".media-item"));
  let stackH = 0;
  items.forEach(item => { stackH += item.getBoundingClientRect().height + 26; }); // 26 = gap
  const totalH = Math.ceil(headerH + stackH + 26 + 40); // header + stack + padding
  window.parent.postMessage({ type: "media-total-height", height: totalH }, "*");
}

// Report height whenever project iframes update their sizes
const _origMsgHandler = window.onmessage;
window.addEventListener("message", () => {
  // After any project-height update, re-report our total
  setTimeout(reportTotalHeight, 50);
});

// Also watch for layout changes via ResizeObserver
const _stackRO = new ResizeObserver(reportTotalHeight);
_stackRO.observe(document.documentElement);
if (stackEl) _stackRO.observe(stackEl);
[200, 600, 1200, 2500].forEach(ms => setTimeout(reportTotalHeight, ms));

// Forward wheel events on the media page itself up to the portfolio window
// so the .window-content div scrolls (the media iframe can't scroll itself).
window.addEventListener("wheel", (e) => {
  e.preventDefault();
  window.parent.postMessage({
    type: "media-wheel",
    deltaX: e.deltaX || 0,
    deltaY: e.deltaY || 0
  }, "*");
}, { passive: false });
