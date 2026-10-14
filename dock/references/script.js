const items = Array.from(document.querySelectorAll("[data-letter]"));
const messages = Array.from(document.querySelectorAll("[data-message]"));
const reader = document.querySelector(".mail-reader");
const narrow = window.matchMedia("(max-width: 720px)");

function selectLetter(id, { focus = false, scroll = false } = {}) {
  items.forEach((item) => {
    const active = item.dataset.letter === id;
    item.classList.toggle("is-selected", active);
    item.setAttribute("aria-selected", String(active));
    item.tabIndex = active ? 0 : -1;
    if (active) {
      item.classList.remove("is-unread");
      if (focus) item.focus();
    }
  });

  messages.forEach((message) => {
    message.hidden = message.dataset.message !== id;
  });

  if (reader) reader.scrollTop = 0;

  if (scroll && narrow.matches) {
    document.getElementById(`letter-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

items.forEach((item, index) => {
  item.addEventListener("click", () => {
    selectLetter(item.dataset.letter, { scroll: true });
  });

  item.addEventListener("keydown", (event) => {
    let next = null;
    if (event.key === "ArrowDown") next = items[Math.min(index + 1, items.length - 1)];
    if (event.key === "ArrowUp") next = items[Math.max(index - 1, 0)];
    if (event.key === "Home") next = items[0];
    if (event.key === "End") next = items[items.length - 1];
    if (!next) return;
    event.preventDefault();
    selectLetter(next.dataset.letter, { focus: true });
  });
});

if (items.length) selectLetter(items[0].dataset.letter);
