// Cultora · Esplora: di cosa parla l'Italia oggi, immagine del giorno, tane del coniglio
(() => {
"use strict";
const C = window.Cultora;
if (!C) return;
const { icon, esc, toast } = C;
const $ = (s) => document.querySelector(s);
const phone = $("#phone");
const pad = (n) => String(n).padStart(2, "0");
const ymd = (d) => `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;

/* ---------- Stile ---------- */
const css = document.createElement("style");
css.textContent = `
.ex-back{order:1;display:inline-flex;align-items:center;gap:6px;margin-left:8px;padding:5px 12px 5px 8px;font-weight:600}
.topbar-row .fest-bell{order:2}
.ex-back .ic{color:var(--gold)}
.ex-grid{position:relative;margin-top:28px;display:grid;gap:12px}
.ex-tile{position:relative;overflow:hidden;min-height:170px;border-radius:20px;border:1px solid rgba(255,255,255,.1);background:#11131b;padding:16px;text-align:left;display:flex;flex-direction:column;justify-content:flex-end;gap:6px;transition:transform .2s,border-color .2s;animation:rise .45s ease both}
.ex-tile:active{transform:scale(.97)}
.ex-tile:hover{border-color:rgba(245,184,61,.45)}
.ex-tile img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.75}
.ex-tile::after{content:"";position:absolute;inset:0;background:linear-gradient(to top,rgba(9,10,15,.95),rgba(9,10,15,.2) 70%,transparent)}
.ex-tile>*:not(img){position:relative;z-index:1}
.ex-ico{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;margin-bottom:auto;background:rgba(245,184,61,.14);color:var(--gold)}
.ex-eyebrow{font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--gold)}
.ex-title{font-family:var(--display);font-size:20px;font-weight:600;line-height:1.15;color:#fff}
.ex-desc{font-size:12.5px;line-height:1.45;color:var(--muted)}
.tana{margin-bottom:10px;border-radius:16px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);padding:12px}
.tana-meta{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:600;letter-spacing:.06em;color:var(--dim)}
.tana-meta .ic{color:var(--gold)}
.tana-steps{margin-top:8px;display:flex;flex-wrap:wrap;align-items:center;gap:6px}
.tana-step{border-radius:999px;background:rgba(255,255,255,.07);padding:5px 11px;font-size:12.5px;color:#e2e8f0;transition:background-color .2s,color .2s}
.tana-step:hover{background:rgba(245,184,61,.2);color:var(--gold)}
.tana-sep,.trail-sep{color:var(--dim);font-size:12px}
.ex-empty{font-size:13px;line-height:1.55;color:var(--dim)}
.trail{margin-bottom:14px;border-radius:14px;border:1px solid rgba(245,184,61,.3);background:rgba(11,12,18,.85);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);padding:10px 12px}
.trail-head{display:flex;align-items:center;gap:6px;font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--gold)}
.trail-steps{margin-top:8px;display:flex;align-items:center;gap:6px;overflow-x:auto;white-space:nowrap}
.trail-step{flex-shrink:0;border-radius:999px;background:rgba(255,255,255,.08);padding:4px 10px;font-size:12px;color:#cbd5e1}
.trail-step.on{background:var(--gold);color:var(--gold-ink);font-weight:700}
.potd{position:absolute;inset:0;z-index:58;display:flex;flex-direction:column;background:#000;animation:rise .35s ease both}
.potd-img{flex:1;min-height:0;width:100%;object-fit:contain}
.potd-close{position:absolute;right:16px;top:16px;z-index:2}
.potd-info{max-height:48%;overflow-y:auto;padding:18px 20px 28px;background:linear-gradient(to top,var(--bg) 75%,rgba(9,10,15,.85))}
.potd-info small{font-size:10.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--gold)}
.potd-info h3{margin-top:6px;font-family:var(--display);font-size:22px;font-weight:600;line-height:1.2}
.potd-info p{margin-top:8px;font-size:14px;line-height:1.6;color:#cbd5e1}
.potd-info .potd-credit{font-size:12px;color:var(--dim)}
.potd-actions{margin-top:14px;display:flex;flex-wrap:wrap;gap:8px}`;
document.head.appendChild(css);

/* ---------- Elementi ---------- */
function mk(tag, cls, testid, id) {
  const el = document.createElement(tag);
  el.className = cls;
  el.setAttribute("data-testid", testid);
  el.id = id;
  phone.insertBefore(el, $(".topbar"));
  return el;
}
const panel = mk("div", "panel no-scrollbar hidden", "explore-panel", "explore-panel");
const feedEl = mk("div", "feed no-scrollbar hidden", "feed-scroll-explore", "feed-explore");
const back = document.createElement("button");
back.className = "topic ex-back hidden";
back.setAttribute("data-testid", "explore-back-button");
back.innerHTML = `${icon("arrowLeft", "ic-sm")} Di tendenza`;
$(".brand").after(back);
let trending = false;

/* ---------- Di cosa parla l'Italia oggi ---------- */
let featuredP = null;
function featured() {
  featuredP ??= (async () => {
    for (const ago of [0, 1]) {
      const d = new Date();
      d.setDate(d.getDate() - ago);
      const r = await fetch(`${C.REST}/feed/featured/${ymd(d)}`);
      if (!r.ok) continue;
      const j = await r.json();
      if (j.mostread?.articles?.length || ago) return j;
    }
    throw new Error("featured");
  })().catch((e) => { featuredP = null; throw e; });
  return featuredP;
}
const topArticles = (j) => (j.mostread?.articles || []).filter((a) => (a.namespace?.id ?? 0) === 0 && a.extract && !/^(Pagina_principale|Speciale:)/.test(a.title));
const views = (v) => (v >= 1000 ? `${Math.round(v / 1000)} mila` : String(v));
const TREND_HOOKS = ["perché tutti ne parlano", "il nome del giorno", "cosa c'è da sapere", "al centro dell'attenzione"];

async function fetchTrending(offset) {
  const arts = topArticles(await featured());
  const items = arts.slice(offset, offset + 6).map((a, i) => {
    const title = a.titles?.normalized || a.title.replace(/_/g, " ");
    const src = (a.originalimage || a.thumbnail || {}).source;
    const it = C.buildPill({ pageid: a.pageid, title, extract: a.extract, thumbnail: src ? { source: src } : undefined, fullurl: a.content_urls?.mobile?.page }, "trending", C.guessCategory(a.extract, "scoperte"));
    const n = offset + i + 1;
    it.key = `trend-${a.pageid}`;
    it.hook = a.description && a.description.length <= 70 ? `${title}: ${a.description}` : `${title}: ${TREND_HOOKS[C.hash(title) % TREND_HOOKS.length]}`;
    it.badge = `N. ${n} · ${views(a.views)} letture`;
    it.badgeIcon = "trending";
    it.facts = [`Ieri è stata la voce n. ${n} più letta su Wikipedia in italiano`, `${a.views.toLocaleString("it-IT")} letture in un solo giorno`, ...it.facts].slice(0, 3);
    return it;
  });
  return { items, next: offset + 6 < arts.length ? offset + 6 : null };
}

const feed = C.createFeed("explore", feedEl, (offset) => fetchTrending(offset), { emptyText: () => "Domani ci saranno nuove voci di tendenza." });
C.feeds.explore = feed;

/* ---------- Immagine del giorno ---------- */
const fileName = (t) => t.replace(/^File:/, "").replace(/\.[a-z0-9]+$/i, "").replace(/_/g, " ");

async function openPotd() {
  const j = await featured().catch(() => null);
  const img = j?.image;
  if (!img) return toast("Immagine del giorno non disponibile");
  const desc = (img.description?.text || "").replace(/\s+/g, " ").trim();
  const el = document.createElement("div");
  el.className = "potd";
  el.setAttribute("data-testid", "potd-viewer");
  el.innerHTML = `<img class="potd-img" src="${esc(img.thumbnail?.source || img.image?.source)}" alt="${esc(fileName(img.title))}">
    <button class="round-btn potd-close" data-ex="potd-close" data-testid="potd-close-button" aria-label="Chiudi">${icon("x")}</button>
    <div class="potd-info no-scrollbar">
      <small>Immagine del giorno · ${new Date().toLocaleDateString("it-IT", { day: "numeric", month: "long" })}</small>
      <h3 data-testid="potd-title">${esc(fileName(img.title))}</h3>
      ${desc ? `<p data-testid="potd-description">${esc(desc)}${img.description?.lang && img.description.lang !== "it" ? " <i style='color:var(--dim)'>(descrizione originale in inglese)</i>" : ""}</p>` : ""}
      <p class="potd-credit">${img.artist?.text ? `Autore: ${esc(img.artist.text)} · ` : ""}${esc(img.license?.type || "")}</p>
      <div class="potd-actions">
        <span class="potd-more"></span>
        <a class="btn-soft" href="${esc(img.file_page)}" target="_blank" rel="noopener noreferrer" data-testid="potd-commons-link">Wikimedia ${icon("external", "ic-md")}</a>
      </div>
    </div>`;
  phone.appendChild(el);
  const link = new DOMParser().parseFromString(img.description?.html || "", "text/html").querySelector("a")?.textContent?.trim();
  if (!link) return;
  const r = await C.wiki({ action: "query", titles: link, redirects: 1 }).catch(() => null);
  const page = Object.values(r?.query?.pages || {})[0];
  if (!page || "missing" in page || !el.isConnected) return;
  el.querySelector(".potd-more").outerHTML = `<button class="btn-gold" data-ex="potd-article" data-t="${esc(page.title)}" data-testid="potd-article-button">Approfondisci: ${esc(page.title)}</button>`;
}

/* ---------- Pannello Esplora ---------- */
async function renderHub() {
  const tane = C.readJSON(C.TANE_KEY, []);
  panel.innerHTML = `<div class="glow"></div>
    <h1>Esplora il mondo, <em>oggi</em>.</h1>
    <p class="sub">Le notizie del giorno, una foto spettacolare e i tuoi percorsi tra le voci.</p>
    <div class="ex-grid">
      <button class="ex-tile" data-ex="trending" data-testid="explore-trending-tile" style="animation-delay:.05s">
        <span class="ex-ico">${icon("trending")}</span><span class="ex-eyebrow">Di tendenza</span>
        <span class="ex-title">Di cosa parla l'Italia oggi</span>
        <span class="ex-desc" id="ex-trend-preview">Le voci più lette ieri su Wikipedia, spiegate in pillole</span>
      </button>
      <button class="ex-tile" data-ex="potd" data-testid="explore-potd-tile" style="animation-delay:.1s">
        <span class="ex-ico">${icon("image")}</span><span class="ex-eyebrow">Immagine del giorno</span>
        <span class="ex-title" id="ex-potd-title">Una foto spettacolare, ogni giorno</span>
      </button>
    </div>
    <h2 class="section-label">Le tue tane del coniglio</h2>
    ${tane.length ? tane.map((t, i) => `<div class="tana" data-testid="rabbit-hole-${i}">
      <p class="tana-meta">${icon("rabbit", "ic-sm")} ${t.path.length} passi · ${new Date(t.at).toLocaleDateString("it-IT", { day: "numeric", month: "short" })}</p>
      <div class="tana-steps">${t.path.map((p) => `<button class="tana-step" data-ex="open-title" data-t="${esc(p)}">${esc(p)}</button>`).join('<span class="tana-sep">›</span>')}</div>
    </div>`).join("") : `<p class="ex-empty" data-testid="rabbit-hole-empty">Apri una pillola e tocca le voci di "Potrebbe interessarti": dopo 3 passi il tuo percorso viene salvato qui.</p>`}`;
  const j = await featured().catch(() => null);
  if (!j) return;
  const top = topArticles(j).slice(0, 3);
  const prev = $("#ex-trend-preview");
  if (prev && top.length) prev.textContent = `In cima: ${top.map((a) => a.titles?.normalized || a.title.replace(/_/g, " ")).join(", ")}`;
  const tile = panel.querySelector("[data-ex='potd']");
  if (j.image && tile && !tile.querySelector("img")) {
    tile.insertAdjacentHTML("afterbegin", `<img src="${esc(j.image.thumbnail?.source)}" alt="" data-testid="explore-potd-thumb">`);
    $("#ex-potd-title").textContent = fileName(j.image.title);
  }
}

C.onUpdate.push((state) => {
  const on = state.tab === "explore";
  if (!on) trending = false;
  panel.classList.toggle("hidden", !(on && !trending));
  feedEl.classList.toggle("hidden", !(on && trending));
  back.classList.toggle("hidden", !(on && trending));
  if (on && !trending) renderHub();
});

/* ---------- Eventi ---------- */
phone.addEventListener("click", (e) => {
  if (e.target.closest("[data-tab='explore']") && C.state.tab === "explore") trending = false;
}, true);

back.addEventListener("click", () => { trending = false; C.update(); });

phone.addEventListener("click", (e) => {
  const el = e.target.closest("[data-ex]");
  if (!el) return;
  switch (el.dataset.ex) {
    case "trending": trending = true; C.update(); feed.reset(); break;
    case "potd": openPotd(); break;
    case "potd-close": el.closest(".potd").remove(); break;
    case "potd-article": el.closest(".potd").remove(); C.openTitle(el.dataset.t, { category: "arte" }); break;
    case "open-title": C.openTitle(el.dataset.t); break;
  }
});
})();
