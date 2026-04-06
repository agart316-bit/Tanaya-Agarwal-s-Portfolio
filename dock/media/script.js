const GROUPS = {
  motion: {
    title: "Digital Illustration & Motion",
    intro: "Men of Platinum, Now or Never, Digital Illustrations",
    projects: [
      { id: "1", title: "Men of Platinum" },
      { id: "2", title: "Now or Never" },
      { id: "3", title: "Digital Illustrations" }
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

function getFrameDocumentHeight(frame) {
  try {
    const frameDoc = frame.contentDocument;
    if (!frameDoc) return 0;
    const body = frameDoc.body;
    const html = frameDoc.documentElement;
    const bodyRect = body ? body.getBoundingClientRect().height : 0;
    const htmlRect = html ? html.getBoundingClientRect().height : 0;
    return Math.ceil(Math.max(
      body ? body.scrollHeight : 0,
      body ? body.offsetHeight : 0,
      body ? body.clientHeight : 0,
      html ? html.scrollHeight : 0,
      html ? html.offsetHeight : 0,
      html ? html.clientHeight : 0,
      bodyRect,
      htmlRect
    ));
  } catch {
    return 0;
  }
}

function attachAutoHeight(frame) {
  let frameWinRef = null;
  let resizeObserver = null;
  let mutationObserver = null;
  let rafId = null;

  const requestSync = () => {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      const height = getFrameDocumentHeight(frame);
      if (!height) return;
      frame.style.height = `${Math.max(height, 620)}px`;
    });
  };

  const lockInnerScrollAndBridge = (frameDoc, frameWin) => {
    if (!frameDoc || !frameWin) return;
    if (frameDoc.documentElement) {
      frameDoc.documentElement.style.overflow = "hidden";
      frameDoc.documentElement.style.overscrollBehavior = "none";
    }
    if (frameDoc.body) {
      frameDoc.body.style.overflow = "hidden";
      frameDoc.body.style.overscrollBehavior = "none";
    }

    // Keep one continuous scroll: wheel over inner project panels scrolls this parent page.
    frameDoc.addEventListener("wheel", (event) => {
      event.preventDefault();
      window.scrollBy({
        left: event.deltaX || 0,
        top: event.deltaY || 0,
        behavior: "auto"
      });
    }, { passive: false });
  };

  frame.addEventListener("load", () => {
    if (rafId !== null) cancelAnimationFrame(rafId);
    if (resizeObserver) resizeObserver.disconnect();
    if (mutationObserver) mutationObserver.disconnect();
    if (frameWinRef) frameWinRef.removeEventListener("resize", requestSync);

    requestSync();

    try {
      const frameDoc = frame.contentDocument;
      const frameWin = frame.contentWindow;
      if (!frameDoc || !frameWin) return;
      frameWinRef = frameWin;
      lockInnerScrollAndBridge(frameDoc, frameWin);

      frameWin.addEventListener("resize", requestSync, { passive: true });
      frameDoc.addEventListener("scroll", requestSync, { passive: true, capture: true });

      resizeObserver = new ResizeObserver(requestSync);
      if (frameDoc.documentElement) resizeObserver.observe(frameDoc.documentElement);
      if (frameDoc.body) resizeObserver.observe(frameDoc.body);

      mutationObserver = new MutationObserver(requestSync);
      mutationObserver.observe(frameDoc.documentElement || frameDoc, {
        childList: true,
        subtree: true,
        attributes: true
      });

      frameDoc.querySelectorAll("img, video, iframe").forEach((mediaEl) => {
        mediaEl.addEventListener("load", requestSync, { passive: true });
        mediaEl.addEventListener("loadedmetadata", requestSync, { passive: true });
      });

      // Late assets / in-page script layout updates.
      setTimeout(requestSync, 120);
      setTimeout(requestSync, 420);
      setTimeout(requestSync, 900);
    } catch {
      // ignore
    }
  });
}

function createProjectItem(project, index) {
  const item = document.createElement("article");
  item.className = "media-item";

  const head = document.createElement("header");
  head.className = "media-item-head";

  const title = document.createElement("h2");
  title.className = "media-item-title";
  title.textContent = project.title;

  const meta = document.createElement("span");
  meta.className = "media-item-meta";
  meta.textContent = `Project ${project.id}`;

  const frame = document.createElement("iframe");
  frame.className = "media-frame";
  frame.title = `${project.title} content`;
  frame.loading = index === 0 ? "eager" : "lazy";
  frame.src = `../../projects/${project.id}/index.html`;

  attachAutoHeight(frame);
  head.append(title, meta);
  item.append(head, frame);
  return item;
}

function buildGroupView() {
  if (!stackEl || !titleEl || !introEl) return;

  const groupKey = getGroupFromQuery();
  const config = GROUPS[groupKey];
  titleEl.textContent = config.title;
  introEl.textContent = config.intro;
  stackEl.innerHTML = "";

  config.projects.forEach((project, index) => {
    stackEl.appendChild(createProjectItem(project, index));
  });
}

buildGroupView();
