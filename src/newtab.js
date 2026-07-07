// First Line — new tab opening sentences.
// Data model: a baseline list ships inside the package, and a live list is
// fetched from the repo (via jsDelivr) and cached in localStorage, so new lines
// can be added by committing to the repo — no store release needed. No
// permissions, no tracking, no network request on the render path.

const REMOTE_URL =
  "https://cdn.jsdelivr.net/gh/freegyes/FirstLine@master/src/firstLines.json";
const CACHE_KEY = "firstline:data";
const FETCH_TS_KEY = "firstline:lastFetch";
const LAST_KEY = "firstline:last";
const REFRESH_MS = 24 * 60 * 60 * 1000; // refresh the live list at most once a day

async function loadBundled() {
  const res = await fetch(chrome.runtime.getURL("firstLines.json"));
  return res.json();
}

function loadCached() {
  try {
    const data = JSON.parse(localStorage.getItem(CACHE_KEY));
    return Array.isArray(data) && data.length ? data : null;
  } catch {
    return null;
  }
}

async function refreshRemote() {
  const last = Number(localStorage.getItem(FETCH_TS_KEY)) || 0;
  if (Date.now() - last < REFRESH_MS) return;
  try {
    const res = await fetch(REMOTE_URL, { cache: "no-cache" });
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data) && data.length) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(FETCH_TS_KEY, String(Date.now()));
    }
  } catch {
    // Offline or blocked — keep whatever we already have.
  }
}

function pickIndex(count) {
  // Avoid repeating the previous tab's line.
  const last = Number(localStorage.getItem(LAST_KEY));
  let i = Math.floor(Math.random() * count);
  if (count > 1 && i === last) {
    i = (i + 1 + Math.floor(Math.random() * (count - 1))) % count;
  }
  localStorage.setItem(LAST_KEY, String(i));
  return i;
}

// Render text that may contain <br /> line breaks (e.g. Madeline) without
// treating the source as HTML: split on the tag, insert text nodes and real
// <br> elements. Nothing from the data is ever parsed as markup.
function setLine(el, text) {
  el.replaceChildren();
  String(text)
    .split(/<br\s*\/?>/i)
    .forEach((part, i) => {
      if (i > 0) el.appendChild(document.createElement("br"));
      el.appendChild(document.createTextNode(part));
    });
}

function render(entry) {
  setLine(document.getElementById("firstLine"), entry.firstline);

  document.getElementById("book").textContent = entry.book;
  document.getElementById("author").textContent = "— " + entry.author;

  // Title + author together are the link.
  const query = new URLSearchParams({ q: entry.book + " " + entry.author });
  document.getElementById("ref").href =
    "https://openlibrary.org/search?" + query;
}

// The title + author are a spoiler: blurred by default, clearing as the cursor
// approaches the signature. Stumble upon it, or ignore it and just read.
function initSpoiler() {
  const spoiler = document.getElementById("spoiler");
  const book = document.getElementById("book");
  const author = document.getElementById("author");
  const MAX_BLUR = 4; // px — default obscured state
  const NEAR = 45; // px from centre — fully clear inside this
  const FAR = 250; // px from centre — fully blurred beyond this

  // Centre on the actual title + author text, not the full-width footer box.
  function textCentre() {
    const b = book.getBoundingClientRect();
    const a = author.getBoundingClientRect();
    const left = Math.min(b.left, a.left);
    const right = Math.max(b.right, a.right);
    const top = Math.min(b.top, a.top);
    const bottom = Math.max(b.bottom, a.bottom);
    return { x: (left + right) / 2, y: (top + bottom) / 2 };
  }

  window.addEventListener(
    "mousemove",
    (e) => {
      const c = textCentre();
      const dist = Math.hypot(e.clientX - c.x, e.clientY - c.y);
      const t = Math.min(1, Math.max(0, (dist - NEAR) / (FAR - NEAR)));
      spoiler.style.setProperty("--blur", (t * MAX_BLUR).toFixed(2) + "px");
    },
    { passive: true },
  );
}

async function main() {
  const data = loadCached() || (await loadBundled());
  render(data[pickIndex(data.length)]);
  initSpoiler();
  refreshRemote(); // background; the next tab picks up any new lines
}

main();
