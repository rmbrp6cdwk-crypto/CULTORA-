// Cultora · Menu laterale + Scaffale con filtri a pila: Libri (Open Library), Podcast (Apple Podcasts). Il Cinema è in cinema.js
(() => {
"use strict";
const C = window.Cultora;
if (!C) return;
const { icon, esc, toast } = C;
const $ = (s) => document.querySelector(s);
const phone = $("#phone");
const LEVEL_KEY = "cultora_livello";
const TROPHY = '<svg class="ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>';
const PLAY = '<svg class="ic-sm" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>';
const PAUSE = '<svg class="ic-sm" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="4" width="4" height="16" rx="1"/><rect x="15" y="4" width="4" height="16" rx="1"/></svg>';

/* ---------- Stile ---------- */
const css = document.createElement("style");
css.textContent = `
.menu-btn{display:grid;place-items:center;width:34px;height:34px;margin-right:10px;border-radius:50%;border:1px solid rgba(255,255,255,.15);background:rgba(0,0,0,.4);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px)}
.drawer-bg{position:absolute;inset:0;z-index:70;background:rgba(0,0,0,.55);opacity:0;transition:opacity .3s}
.drawer{position:absolute;left:0;top:0;bottom:0;z-index:71;width:min(300px,82%);overflow-y:auto;background:#0b0c12;border-right:1px solid rgba(255,255,255,.1);padding:22px 14px 30px;transform:translateX(-100%);transition:transform .35s cubic-bezier(.22,1,.36,1)}
.drawer-open .drawer{transform:none}.drawer-open .drawer-bg{opacity:1}
.drawer .brand{display:block;margin:0 8px 18px;font-size:24px}
.dr-group{margin:18px 8px 6px;font-size:10.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--dim)}
.dr-item{display:flex;width:100%;align-items:center;gap:12px;border-radius:14px;padding:11px 12px;font-size:15px;font-weight:600;color:#e2e8f0;text-align:left;transition:background-color .2s,color .2s}
.dr-item:hover{background:rgba(255,255,255,.06)}
.dr-item.on{background:rgba(245,184,61,.14);color:var(--gold)}
.dr-item .count{position:static;margin-left:auto}
.lv{position:relative;margin-top:22px;display:flex;gap:6px;border-radius:16px;background:rgba(255,255,255,.05);padding:5px}
.lv button{flex:1;border-radius:12px;padding:9px 4px;font-size:12.5px;font-weight:700;color:var(--muted);transition:background-color .2s,color .2s}
.lv button.on{background:var(--gold);color:var(--gold-ink)}
.lv-hint{margin-top:8px;font-size:12px;color:var(--dim)}
.sf-sec{margin-top:18px}
.sf-label{display:flex;align-items:center;gap:6px;margin-bottom:8px;font-size:10.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--dim)}
.sf-row{display:flex;gap:8px;overflow-x:auto;margin:0 -20px;padding:0 20px 2px}
.sf-wrap{display:flex;flex-wrap:wrap;gap:8px}
.sf-chip{flex-shrink:0;display:inline-flex;align-items:center;gap:6px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);padding:7px 13px;font-size:13px;color:#e2e8f0;white-space:nowrap;transition:background-color .2s,color .2s,border-color .2s,transform .2s}
.sf-chip:active{transform:scale(.95)}
.sf-chip.on{border-color:transparent;background:var(--gold);color:var(--gold-ink);font-weight:700}
.sf-chip.sug{border-color:rgba(245,184,61,.45);background:rgba(245,184,61,.06);color:var(--gold);animation:rise .35s ease both}
.sf-chip .ic-sm{width:14px;height:14px}
.sf-active{margin-top:20px;border-radius:18px;border:1px solid rgba(245,184,61,.25);background:rgba(245,184,61,.07);padding:12px 12px 14px;animation:rise .3s ease both}
.sf-ahead{display:flex;align-items:center;justify-content:space-between}
.sf-ahead .sf-label{margin:0;color:var(--gold)}
.sf-clear{font-size:12px;font-weight:600;color:var(--muted);text-decoration:underline;text-underline-offset:3px}
.sf-active .sf-wrap{margin-top:10px}
.sf-find{margin-top:20px;display:flex;align-items:center;gap:10px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);padding:0 16px}
.sf-find input{flex:1;min-width:0;background:none;border:0;outline:0;padding:12px 0;font-size:16px;color:#fff}
.sf-find .ic-md{color:var(--gold)}
.sf-found{margin-top:4px}
.sf-found>.sf-label{margin-top:14px}
.sf-found .sh-relrow{margin:0 -20px;padding:0 20px 4px}
.sf-found:empty{display:none}
.sf-none{font-size:13px;color:var(--dim)}
.sf-sort{margin-top:22px;display:flex;gap:6px;border-radius:14px;background:rgba(255,255,255,.05);padding:4px}
.sf-sort button{flex:1;border-radius:10px;padding:8px 4px;font-size:12.5px;font-weight:700;color:var(--muted);transition:background-color .2s,color .2s}
.sf-sort button.on{background:rgba(255,255,255,.12);color:#fff}
.sf-toggle{margin-top:16px;display:flex;align-items:center;gap:6px;max-width:100%;font-size:13px;font-weight:600;color:var(--gold)}
.sf-toggle span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sf-toggle .ic-sm{flex-shrink:0;transform:rotate(90deg);transition:transform .25s}
.sf-toggle.open .ic-sm{transform:rotate(-90deg)}
.sf-count{margin-top:18px;font-family:var(--mono);font-size:11px;color:var(--dim)}
.sf-count:empty{display:none}
.sh-grid{margin-top:14px;display:grid;grid-template-columns:1fr 1fr;gap:14px}
.sh-card{text-align:left;animation:rise .4s ease both}
.sh-cover{position:relative;aspect-ratio:2/3;overflow:hidden;border-radius:14px;background:#161822;border:1px solid rgba(255,255,255,.08)}
.sh-cover.sq{aspect-ratio:1}
.sh-cover img{width:100%;height:100%;object-fit:cover;transition:transform .4s}
.sh-card:hover .sh-cover img{transform:scale(1.05)}
.sh-cover .ph{position:absolute;inset:0;display:grid;place-items:center;padding:12px;text-align:center;font-family:var(--display);font-size:15px;color:var(--muted)}
.sh-badge{position:absolute;left:8px;top:8px;display:inline-flex;align-items:center;gap:4px;max-width:calc(100% - 16px);border-radius:999px;background:rgba(0,0,0,.72);padding:3px 8px;font-size:10.5px;font-weight:700;color:var(--gold);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
.sh-badge .ic-sm{width:11px;height:11px;flex-shrink:0}
.sh-t{margin-top:8px;font-family:var(--display);font-size:15px;font-weight:600;line-height:1.25;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.sh-a{margin-top:2px;font-size:12px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sh-m{margin-top:3px;font-family:var(--mono);font-size:10.5px;color:var(--gold)}
.sh-foot .sh-more{margin:22px auto 0;display:flex}
.sh-detail{position:absolute;inset:0;z-index:58;overflow-y:auto;background:var(--sheet);padding:70px 22px 60px;animation:rise .35s ease both}
.sh-bar{position:sticky;top:-70px;z-index:5;display:flex;align-items:center;justify-content:space-between;height:64px;margin:-70px -22px 6px;padding:0 16px;pointer-events:none;background:linear-gradient(to bottom,rgba(11,12,18,.85),rgba(11,12,18,0))}
.sh-bar button{pointer-events:auto}
.sh-back{display:inline-flex;align-items:center;gap:6px;height:40px;padding:0 16px 0 12px;border-radius:999px;border:1px solid rgba(255,255,255,.15);background:rgba(0,0,0,.55);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);color:#fff;font-size:14px;font-weight:600;transition:background-color .2s,transform .2s}
.sh-back:active{transform:scale(.95)}
.sh-backdrop{position:relative;margin:-70px -22px 0;height:210px;overflow:hidden}
.sh-backdrop img{width:100%;height:100%;object-fit:cover;opacity:.75}
.sh-backdrop::after{content:"";position:absolute;inset:0;background:linear-gradient(to bottom,rgba(11,12,18,.1),var(--sheet))}
.sh-backdrop+.sh-dhead{margin-top:-90px;position:relative}
.sh-dhead{display:flex;gap:16px;align-items:flex-end}
.sh-dhead .sh-cover{width:120px;flex-shrink:0}
.sh-dhead h2{font-family:var(--display);font-size:24px;font-weight:600;line-height:1.15}
.sh-orig{margin-top:2px;font-size:12px;font-style:italic;color:var(--dim)}
.sh-award{margin-top:16px;display:inline-flex;align-items:center;gap:6px;border-radius:999px;background:rgba(245,184,61,.14);padding:5px 12px;font-size:12.5px;font-weight:700;color:var(--gold)}
.sh-tagline{margin-top:14px;font-family:var(--display);font-style:italic;font-size:16px;color:#e2e8f0}
.sh-sec{margin-top:20px}
.sh-tags{display:flex;flex-wrap:wrap;gap:6px}
.sh-tags span,.sh-tags button{border-radius:999px;background:rgba(255,255,255,.07);padding:5px 11px;font-size:12.5px;color:#cbd5e1;transition:background-color .2s,color .2s}
.sh-tags button{border:1px solid rgba(255,255,255,.1)}
.sh-tags button:hover{background:rgba(245,184,61,.15);color:var(--gold)}
.sh-tags button::before{content:"+ ";color:var(--gold)}
.sh-desc{margin-top:16px;font-size:14.5px;line-height:1.7;color:#cbd5e1}
.sh-actions{margin-top:20px;display:flex;flex-wrap:wrap;gap:8px}
.spotify{display:inline-flex;align-items:center;gap:6px;border-radius:999px;background:#1DB954;color:#04140a;padding:9px 16px;font-size:13px;font-weight:700}
.sh-rel h3{margin-top:28px;font-family:var(--display);font-size:19px;font-weight:600}
.sh-relrow{display:flex;gap:12px;overflow-x:auto;margin:12px -22px 0;padding:0 22px 4px}
.sh-relrow .sh-card{width:116px;flex-shrink:0}
.sh-people{display:flex;gap:14px;overflow-x:auto;margin:0 -22px;padding:0 22px 4px}
.sh-person{width:76px;flex-shrink:0;text-align:center}
.sh-person .av{width:64px;height:64px;margin:0 auto;border-radius:50%;overflow:hidden;background:#1c1f2b;display:grid;place-items:center;font-family:var(--display);font-size:22px;color:var(--muted);border:2px solid transparent;transition:border-color .2s}
.sh-person:hover .av{border-color:var(--gold)}
.sh-person .av img{width:100%;height:100%;object-fit:cover}
.sh-person b{display:block;margin-top:6px;font-size:11.5px;line-height:1.25;font-weight:600}
.sh-person small{display:block;font-size:10.5px;color:var(--dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sh-prov{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
.sh-prov img{width:38px;height:38px;border-radius:10px}
.sh-prov small{width:100%;font-size:11px;color:var(--dim)}
.sh-ep{display:flex;gap:12px;align-items:flex-start;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.06)}
.sh-ep .play{flex-shrink:0;display:grid;place-items:center;width:36px;height:36px;border-radius:50%;background:var(--gold);color:var(--gold-ink);transition:transform .2s}
.sh-ep .play:active{transform:scale(.9)}
.sh-ep b{display:block;font-size:13.5px;line-height:1.35}
.sh-ep small{display:block;margin-top:3px;font-family:var(--mono);font-size:10.5px;color:var(--dim)}
.sh-ep p{margin-top:4px;font-size:12.5px;line-height:1.5;color:var(--muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}`;
document.head.appendChild(css);

/* ---------- Menu laterale (solo Scaffale e Leggi dopo: il resto è nella barra in basso) ---------- */
const menuBtn = document.createElement("button");
menuBtn.className = "menu-btn";
menuBtn.setAttribute("data-testid", "side-menu-button");
menuBtn.setAttribute("aria-label", "Menu");
menuBtn.innerHTML = icon("menu", "ic-md");
$(".topbar-row").prepend(menuBtn);

const MENU = [
  ["Scaffale", [["books", "Libri", "book"], ["podcast", "Podcast", "headphones"], ["cinema", "Cinema", "film"]]],
  ["Il tuo spazio", [["saved", "Leggi dopo", "bookmark"]]]
];
function openMenu() {
  const n = C.state.saved.length;
  const wrap = document.createElement("div");
  wrap.className = "drawer-wrap";
  wrap.innerHTML = `<div class="drawer-bg" data-dr="close"></div>
    <nav class="drawer no-scrollbar" data-testid="side-menu">
      <span class="brand">Cultora<span>.</span></span>
      ${MENU.map(([g, items]) => `<p class="dr-group">${g}</p>${items.map(([id, label, ic]) => `<button class="dr-item ${C.state.tab === id ? "on" : ""}" data-dr="${id}" data-testid="side-menu-${id}">
        ${icon(ic)} ${label}${id === "saved" && n ? `<span class="count" data-testid="saved-count-badge">${n}</span>` : ""}</button>`).join("")}`).join("")}
    </nav>`;
  phone.appendChild(wrap);
  requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.add("drawer-open")));
  wrap.addEventListener("click", (e) => {
    const b = e.target.closest("[data-dr]");
    if (!b) return;
    wrap.classList.remove("drawer-open");
    setTimeout(() => wrap.remove(), 350);
    if (b.dataset.dr !== "close") C.setTab(b.dataset.dr);
  });
}
menuBtn.addEventListener("click", openMenu);

/* ---------- Motore dei filtri a pila (condiviso con cinema.js) ---------- */
const LEVELS = [["curioso", "🌱 Curioso", "Titoli famosi e facili da iniziare"], ["appassionato", "📖 Appassionato", "Titoli apprezzati e un po' meno noti"], ["esperto", "🎓 Esperto", "Classici, opere d'autore e di nicchia"]];
const sections = {};
const fk = (x) => `${x.f}:${x.id}`;
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const loading = (t) => `<div class="loading-line" data-testid="shelf-loading">${icon("loader", "ic-md spin")} ${t}</div>`;
const panel = document.createElement("div");
panel.className = "panel no-scrollbar hidden";
panel.id = "shelf-panel";
panel.setAttribute("data-testid", "shelf-panel");
phone.insertBefore(panel, $(".topbar"));
let gen = 0;

function register(cfg) {
  cfg.v = { filters: (cfg.start || []).map((x) => ({ ...x })), page: 0, items: [], level: localStorage.getItem(LEVEL_KEY) || "curioso", sort: cfg.sorts?.[0][0] };
  sections[cfg.id] = cfg;
}

const chip = (x, on, area) => `<button class="sf-chip ${on ? "on" : ""} ${area === "sug" ? "sug" : ""}" data-sf="toggle" data-area="${area}" data-f="${esc(x.f)}" data-id="${esc(String(x.id))}" data-label="${esc(x.label)}" data-testid="sf-${area}-${esc(x.f)}-${slug(x.id)}">${area === "sug" ? "+ " : ""}${esc(x.label)}${area === "active" ? icon("x", "ic-sm") : ""}</button>`;

const row = (fa) => `<div class="sf-sec"><p class="sf-label">${fa.label}</p><div class="sf-row no-scrollbar" data-testid="sf-row-${fa.f}">${fa.options.map(([id, label]) => chip({ f: fa.f, id, label }, false, "row")).join("")}</div></div>`;
function shell(cfg) {
  panel.innerHTML = `<div class="glow"></div><h1>${cfg.h1}</h1><p class="sub">${cfg.sub}</p>
    ${cfg.levels ? `<div class="lv" data-testid="shelf-level">${LEVELS.map(([id, l]) => `<button data-sf="level" data-v="${id}" data-testid="shelf-level-${id}">${l}</button>`).join("")}</div><p class="lv-hint"></p>` : ""}
    ${cfg.find ? `<form class="sf-find" data-testid="sf-find-form">${icon("search", "ic-md")}<input type="search" enterkeyhint="search" placeholder="${cfg.find.ph}" autocomplete="off" data-testid="sf-find-input"></form><div class="sf-found" data-testid="sf-found"></div>` : ""}
    <div class="sf-active hidden" data-testid="sf-active"></div>
    <div class="sf-sec sf-sug hidden" data-testid="sf-suggest"><p class="sf-label">${icon("sparkles", "ic-sm")} Affina la ricerca</p><div class="sf-row no-scrollbar"></div></div>
    ${cfg.facets.slice(0, 1).map(row).join("")}
    <button class="sf-toggle ${cfg.v.open ? "open" : ""}" data-sf="facets" data-testid="sf-more-filters">${icon("chevron", "ic-sm")} <span>Altri filtri: ${cfg.facets.slice(1).map((fa) => fa.label).join(", ")}</span></button>
    <div class="sf-extra ${cfg.v.open ? "" : "hidden"}" data-testid="sf-extra">${cfg.facets.slice(1).map(row).join("")}</div>
    ${cfg.sorts ? `<div class="sf-sort" data-testid="sf-sort">${cfg.sorts.map(([id, l]) => `<button data-sf="sort" data-v="${id}" data-testid="sf-sort-${id}">${l}</button>`).join("")}</div>` : ""}
    <p class="sf-count" data-testid="sf-count"></p>
    <div class="sh-grid" data-testid="shelf-grid"></div><div class="sh-foot"></div>`;
  refresh(cfg);
}

function refresh(cfg) {
  const v = cfg.v, on = new Set(v.filters.map(fk));
  panel.querySelectorAll('[data-area="row"]').forEach((b) => b.classList.toggle("on", on.has(`${b.dataset.f}:${b.dataset.id}`)));
  panel.querySelectorAll('[data-sf="level"]').forEach((b) => b.classList.toggle("on", b.dataset.v === v.level));
  panel.querySelectorAll('[data-sf="sort"]').forEach((b) => b.classList.toggle("on", b.dataset.v === v.sort));
  const hint = panel.querySelector(".lv-hint");
  if (hint) hint.textContent = LEVELS.find((l) => l[0] === v.level)[2];
  const act = panel.querySelector(".sf-active");
  act.classList.toggle("hidden", !v.filters.length);
  act.innerHTML = `<div class="sf-ahead"><p class="sf-label">I tuoi filtri · ${v.filters.length}</p><button class="sf-clear" data-sf="clear" data-testid="sf-clear">Azzera</button></div>
    <div class="sf-wrap">${v.filters.map((x) => chip(x, true, "active")).join("")}</div>`;
  load(cfg);
}

function toggle(cfg, x, onlyAdd = false) {
  const v = cfg.v, i = v.filters.findIndex((y) => fk(y) === fk(x));
  if (i >= 0) { if (!onlyAdd) v.filters.splice(i, 1); }
  else {
    if (cfg.facets.find((fa) => fa.f === x.f)?.single) v.filters = v.filters.filter((y) => y.f !== x.f);
    v.filters.push(x);
  }
  refresh(cfg);
}

function showSuggest(cfg, list) {
  const on = new Set(cfg.v.filters.map(fk)), seen = new Set();
  const out = list.filter((x) => !on.has(fk(x)) && !seen.has(fk(x)) && seen.add(fk(x))).slice(0, 12);
  const box = panel.querySelector(".sf-sug");
  box.classList.toggle("hidden", !out.length);
  box.querySelector(".sf-row").innerHTML = out.map((x) => chip(x, false, "sug")).join("");
}

async function load(cfg, more = false) {
  const v = cfg.v, my = ++gen;
  const grid = panel.querySelector(".sh-grid"), foot = panel.querySelector(".sh-foot"), count = panel.querySelector(".sf-count");
  if (!more) { v.page = 0; v.items = []; grid.innerHTML = ""; count.textContent = ""; }
  foot.innerHTML = loading(cfg.loading);
  try {
    const r = await cfg.fetch(v);
    if (my !== gen) return;
    const start = v.items.length;
    v.items.push(...r.items.filter((f) => !v.items.some((x) => x.key === f.key)));
    grid.insertAdjacentHTML("beforeend", v.items.slice(start).map((it, n) => cardHTML(cfg, it, start + n)).join(""));
    if (!more) showSuggest(cfg, r.suggest || []);
    count.textContent = v.items.length ? `${v.items.length}${r.more ? "+" : ""} risultati` : "";
    foot.innerHTML = r.more ? `<button class="btn-soft sh-more" data-sf="more" data-testid="shelf-more-button">Mostrami altri</button>`
      : v.items.length ? "" : `<p class="ex-empty" style="margin-top:20px" data-testid="shelf-empty">Nessun risultato con questi filtri: prova a toglierne uno.</p>`;
  } catch (e) {
    if (my !== gen) return;
    foot.innerHTML = `<p class="err" data-testid="shelf-error">${esc(e.userMsg || "Impossibile caricare. Controlla la connessione e riprova.")}</p>`;
  }
}

const cover = (cfg, it) => `<div class="sh-cover ${cfg.square ? "sq" : ""}">${it.img ? `<img src="${esc(it.img)}" alt="" loading="lazy">` : `<span class="ph">${esc(it.title)}</span>`}${it.badge ? `<span class="sh-badge">${TROPHY}${esc(it.badge)}</span>` : ""}</div>`;
const cardHTML = (cfg, it, i, mode) => `<button class="sh-card" data-sf="${mode || "detail"}" data-i="${i}" data-testid="${mode ? `shelf-${mode}-card` : "shelf-card"}-${i}" style="animation-delay:${(i % 20) * 0.03}s">
  ${cover(cfg, it)}<p class="sh-t">${esc(it.title)}</p><p class="sh-a">${esc(it.author || "")}</p><p class="sh-m">${esc(cfg.meta(it))}</p></button>`;

/* ---------- Scheda dettaglio (con filtri cliccabili e titoli correlati) ---------- */
const tagBtn = (x) => `<button data-sd="filter" data-f="${esc(x.f)}" data-id="${esc(String(x.id))}" data-label="${esc(x.label)}" data-testid="sd-tag-${esc(x.f)}-${slug(x.id)}">${esc(x.text || x.label)}</button>`;
const tags = (title, list) => list.length ? `<div class="sh-sec"><p class="sf-label">${title}</p><div class="sh-tags">${list.map(tagBtn).join("")}</div></div>` : "";
const person = (x, img, role) => `<button class="sh-person" data-sd="filter" data-f="${esc(x.f)}" data-id="${esc(String(x.id))}" data-label="${esc(x.label)}" data-testid="sd-person-${slug(x.id)}">
  <span class="av">${img ? `<img src="${esc(img)}" alt="" loading="lazy">` : esc((x.text || x.label).slice(0, 1))}</span><b>${esc(x.text || x.label)}</b>${role ? `<small>${esc(role)}</small>` : ""}</button>`;

function addRow(el, cfg, title, items, testid) {
  if (!items.length || !el.isConnected) return;
  const start = el._rel.length;
  el._rel.push(...items);
  el.querySelector(".sh-relbox").insertAdjacentHTML("beforeend", `<section class="sh-rel" data-testid="${testid}"><h3>${esc(title)}</h3>
    <div class="sh-relrow no-scrollbar">${items.map((it, n) => cardHTML(cfg, it, start + n, "rel")).join("")}</div></section>`);
}

function openDetail(cfg, it) {
  const el = document.createElement("div");
  el.className = "sh-detail no-scrollbar";
  el.setAttribute("data-testid", "shelf-detail");
  el._rel = [];
  el.innerHTML = `<div class="sh-bar"><button class="sh-back" data-sd="back" data-testid="shelf-detail-back">${icon("arrowLeft", "ic-md")} Indietro</button>
    <button class="round-btn" data-sd="close" data-testid="shelf-detail-close" aria-label="Chiudi tutto">${icon("x")}</button></div>
    <div class="sh-dbody"><div class="sh-dhead">${cover(cfg, { ...it, badge: "" })}
      <div><h2 data-testid="shelf-detail-title">${esc(it.title)}</h2><p class="sh-a" style="white-space:normal;font-size:14px">${esc(it.author || "")}</p><p class="sh-m" style="font-size:12px">${esc(cfg.meta(it))}</p></div></div>
    <div class="sh-dmore"></div><div class="sh-relbox"></div></div>`;
  phone.appendChild(el);
  el.addEventListener("click", (e) => {
    const b = e.target.closest("[data-sd],[data-sf]");
    if (!b) return;
    e.stopPropagation();
    const a = b.dataset.sd || b.dataset.sf;
    if (a === "back") { el.remove(); stopAudio(); }
    if (a === "close") { document.querySelectorAll(".sh-detail").forEach((d) => d.remove()); stopAudio(); }
    if (a === "rel") openDetail(cfg, el._rel[+b.dataset.i]);
    if (a === "filter") {
      document.querySelectorAll(".sh-detail").forEach((d) => d.remove());
      stopAudio();
      if (C.state.tab !== cfg.id) C.setTab(cfg.id);
      toggle(cfg, { f: b.dataset.f, id: b.dataset.id, label: b.dataset.label }, true);
      panel.scrollTo({ top: 0, behavior: "smooth" });
      toast(`Filtro aggiunto: ${b.dataset.label}`);
    }
    if (a === "save") {
      const on = C.toggleSave(cfg.saveObj(it));
      b.innerHTML = `${icon("bookmark", "ic-md")} ${on ? "Salvato" : "Leggi dopo"}`;
      toast(on ? "Aggiunto a Leggi dopo" : "Rimosso da Leggi dopo");
    }
    if (a === "wiki") openWiki(cfg, it, el);
    if (a === "play") playEp(b);
  });
  cfg.detail(it, el);
}

async function findWiki(cfg, it) {
  if (it.wiki === undefined) {
    const r = await C.wikiSearch(cfg.wikiQuery(it), 4).catch(() => ({ pages: [] }));
    it.wiki = r.pages.find((p) => !cfg.wikiOk || cfg.wikiOk(p)) || null;
  }
  return it.wiki;
}
async function openWiki(cfg, it, el) {
  const p = await findWiki(cfg, it);
  if (!p) return toast("Non l'ho trovato su Wikipedia");
  el.remove();
  stopAudio();
  C.openTitle(p.title, { image: it.img, category: cfg.category });
}
const saveBtn = (it) => `<button class="btn-soft" data-sd="save" data-testid="shelf-save-button">${icon("bookmark", "ic-md")} ${C.isSaved(it.key) ? "Salvato" : "Leggi dopo"}</button>`;
const saveObj = (category) => (it) => ({ key: it.key, wiki_title: it.wiki?.title || it.title, hook: it.title, pill: [it.author, it.year].filter(Boolean).join(" · "), category, facts: [], image: it.img, url: it.url });

/* ---------- Audio degli episodi ---------- */
const audio = new Audio();
let playing = null;
function stopAudio() { audio.pause(); if (playing) playing.innerHTML = PLAY; playing = null; }
function playEp(b) {
  if (playing === b) return stopAudio();
  stopAudio();
  audio.src = b.dataset.url;
  audio.play().then(() => { playing = b; b.innerHTML = PAUSE; }).catch(() => toast("Episodio non disponibile"));
}
audio.addEventListener("ended", stopAudio);

/* ---------- Eventi del pannello ---------- */
C.onUpdate.push((state) => {
  const cfg = sections[state.tab];
  panel.classList.toggle("hidden", !cfg);
  document.querySelector(".fest-banner")?.classList.toggle("hidden", !!cfg || state.tab === "saved");
  if (cfg && panel.dataset.tab !== state.tab) { panel.dataset.tab = state.tab; gen++; shell(cfg); }
  if (!cfg) panel.dataset.tab = "";
});

panel.addEventListener("click", (e) => {
  const b = e.target.closest("[data-sf]");
  const cfg = b && sections[panel.dataset.tab];
  if (!cfg) return;
  const v = cfg.v;
  switch (b.dataset.sf) {
    case "toggle":
      if (b.dataset.area === "found") { panel.querySelector(".sf-found").innerHTML = ""; panel.querySelector(".sf-find input").value = ""; }
      toggle(cfg, { f: b.dataset.f, id: b.dataset.id, label: b.dataset.label }, b.dataset.area === "found");
      break;
    case "facets": v.open = !v.open; panel.querySelector(".sf-extra").classList.toggle("hidden", !v.open); b.classList.toggle("open", v.open); break;
    case "clear": v.filters = []; refresh(cfg); break;
    case "level": v.level = b.dataset.v; localStorage.setItem(LEVEL_KEY, v.level); refresh(cfg); break;
    case "sort": v.sort = b.dataset.v; refresh(cfg); break;
    case "more": v.page++; load(cfg, true); break;
    case "detail": openDetail(cfg, v.items[+b.dataset.i]); break;
    case "found": openDetail(cfg, panel._found[+b.dataset.i]); break;
  }
});

panel.addEventListener("submit", async (e) => {
  e.preventDefault();
  const cfg = sections[panel.dataset.tab], input = e.target.querySelector("input"), box = panel.querySelector(".sf-found");
  const q = input.value.trim();
  if (!cfg?.find || q.length < 2) return;
  input.blur();
  box.innerHTML = `<span class="sf-none">Cerco…</span>`;
  const [titles, people] = await Promise.all([cfg.find.titles(q).catch(() => []), cfg.find.run ? cfg.find.run(q).catch(() => []) : []]);
  panel._found = titles;
  box.innerHTML = titles.length || people.length
    ? `${titles.length ? `<p class="sf-label">Titoli</p><div class="sh-relrow no-scrollbar" data-testid="sf-found-titles">${titles.map((it, i) => cardHTML(cfg, it, i, "found")).join("")}</div>` : ""}
      ${people.length ? `<p class="sf-label">${cfg.find.who}</p><div class="sf-row no-scrollbar" data-testid="sf-found-people">${people.map((x) => chip(x, false, "found")).join("")}</div>` : ""}`
    : `<span class="sf-none" data-testid="sf-found-empty">Nessun risultato per “${esc(q)}”</span>`;
});
panel.addEventListener("input", (e) => {
  if (e.target.matches(".sf-find input") && !e.target.value) panel.querySelector(".sf-found").innerHTML = "";
});

window.Scaffale = { register, tags, person, addRow, saveBtn, saveObj, loading, findWiki, TROPHY, PLAY };

/* ================= LIBRI · Open Library ================= */
const BOOK_THEMES = [["fiction", "Romanzi"], ["mystery", "Gialli"], ["fantasy", "Fantasy"], ["science fiction", "Fantascienza"], ["history", "Storia"], ["biography", "Biografie"], ["historical fiction", "Romanzo storico"], ["philosophy", "Filosofia"], ["science", "Scienza"], ["poetry", "Poesia"], ["horror", "Horror"], ["romance", "Amore"], ["juvenile fiction", "Ragazzi"], ["world war, 1939-1945", "Seconda guerra mondiale"], ["middle ages", "Medioevo"], ["rome", "Antica Roma"], ["italy", "Italia"], ["dystopias", "Distopie"], ["psychology", "Psicologia"], ["mythology", "Mitologia"], ["voyages and travels", "Viaggi"]];
const SUBJ = Object.fromEntries([...BOOK_THEMES, ["detective and mystery stories", "Gialli"], ["love", "Amore"], ["love stories", "Storie d'amore"], ["horror tales", "Horror"], ["world war, 1914-1918", "Prima guerra mondiale"], ["art", "Arte"], ["music", "Musica"], ["travel", "Viaggi"], ["adventure and adventurers", "Avventura"], ["adventure stories", "Avventura"], ["families", "Famiglia"], ["family", "Famiglia"], ["friendship", "Amicizia"], ["humor", "Umorismo"], ["mafia", "Mafia"], ["crime", "Crimine"], ["murder", "Omicidi"], ["politics", "Politica"], ["economics", "Economia"], ["religion", "Religione"], ["classical mythology", "Mitologia classica"], ["war", "Guerra"], ["women", "Donne"], ["childhood", "Infanzia"], ["magic", "Magia"], ["astronomy", "Astronomia"], ["physics", "Fisica"], ["mathematics", "Matematica"], ["nature", "Natura"], ["animals", "Animali"], ["cooking", "Cucina"], ["sicily", "Sicilia"], ["naples (italy)", "Napoli"], ["paris (france)", "Parigi"], ["short stories", "Racconti"], ["thriller", "Thriller"], ["suspense", "Suspense"], ["spies", "Spie"], ["time travel", "Viaggi nel tempo"], ["robots", "Robot"], ["dragons", "Draghi"], ["vampires", "Vampiri"], ["ghosts", "Fantasmi"], ["death", "Morte"], ["memory", "Memoria"], ["holocaust, jewish (1939-1945)", "Olocausto"], ["jews", "Ebrei"], ["communism", "Comunismo"], ["fascism", "Fascismo"], ["revolutions", "Rivoluzioni"], ["greece", "Grecia"], ["egypt", "Egitto"], ["japan", "Giappone"], ["russia", "Russia"], ["china", "Cina"], ["sea stories", "Storie di mare"], ["sports", "Sport"], ["comic books, strips", "Fumetti"], ["graphic novels", "Graphic novel"], ["essays", "Saggi"], ["drama", "Teatro"], ["ethics", "Etica"], ["space", "Spazio"], ["artificial intelligence", "Intelligenza artificiale"], ["social life and customs", "Usi e costumi"], ["italian literature", "Letteratura italiana"], ["english literature", "Letteratura inglese"], ["american literature", "Letteratura americana"], ["french literature", "Letteratura francese"], ["russian literature", "Letteratura russa"], ["classic literature", "Classici"], ["fairy tales", "Fiabe"], ["witches", "Streghe"], ["pirates", "Pirati"], ["knights and knighthood", "Cavalieri"], ["kings and rulers", "Re e regine"], ["popes", "Papi"], ["renaissance", "Rinascimento"], ["evolution", "Evoluzione"], ["biology", "Biologia"], ["medicine", "Medicina"], ["dinosaurs", "Dinosauri"]]);
const BOOK_REL = { fiction: ["historical fiction", "love", "families", "friendship"], history: ["world war, 1939-1945", "middle ages", "rome", "biography"], mystery: ["thriller", "murder", "spies"], fantasy: ["magic", "dragons", "mythology"], "science fiction": ["dystopias", "time travel", "robots", "space"], science: ["physics", "astronomy", "mathematics", "evolution"], philosophy: ["ethics", "religion", "psychology"], biography: ["history", "politics", "art"], "juvenile fiction": ["fantasy", "adventure stories", "friendship"], "historical fiction": ["middle ages", "rome", "world war, 1939-1945", "renaissance"] };
const GENERIC = new Set(["fiction", "history", "juvenile fiction", "romance", "love", "biography", "science", "short stories", "families", "family"]);
const EPOCHS = [["0-1899", "Prima del 1900"], ["1900-1949", "1900 – 1949"], ["1950-1999", "1950 – 1999"], ["2000-2100", "Dal 2000"]];
const AWARDS = [["Q731542", "Premio Strega"], ["Q2108706", "Premio Campiello"], ["Q1526935", "Premio Viareggio"], ["Q160082", "Booker Prize"], ["Q255032", "Premio Hugo"], ["Q266012", "Premio Nebula"]];
const OL_FIELDS = "key,title,author_name,author_key,first_publish_year,cover_i,number_of_pages_median,ratings_average,subject,editions,editions.title,editions.cover_i";

const awardCache = {};
function awardWorks(q) {
  const sparql = `SELECT DISTINCT ?ol WHERE { ?w wdt:P166 wd:${q} ; wdt:P648 ?ol . }`;
  return awardCache[q] ||= fetch(`https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(sparql)}`)
    .then((r) => r.json()).then((j) => j.results.bindings.map((b) => b.ol.value).filter((x) => /^OL\d+W$/.test(x)))
    .catch((e) => { delete awardCache[q]; throw e; });
}

function bookItem(d) {
  const ed = d.editions?.docs?.[0] || {};
  const c = ed.cover_i || d.cover_i;
  const subjects = [...new Set((d.subject || []).map((s) => s.toLowerCase()))];
  return {
    kind: "book", key: `book-${d.key.split("/").pop()}`, title: ed.title || d.title, author: (d.author_name || []).slice(0, 2).join(", "),
    authorName: d.author_name?.[0] || "", authorKey: d.author_key?.[0] || "", year: d.first_publish_year, pages: d.number_of_pages_median, rating: d.ratings_average,
    img: c ? `https://covers.openlibrary.org/b/id/${c}-L.jpg` : null, url: `https://openlibrary.org${d.key}`, work: d.key, subjects
  };
}
async function olSearch(q, { limit = 20, offset = 0, ita = true, sort = "rating" } = {}) {
  const u = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}${ita ? "&language=ita" : ""}&lang=it${sort ? `&sort=${sort}` : ""}&limit=${limit}&offset=${offset}&fields=${OL_FIELDS}`;
  const j = await (await fetch(u)).json();
  return (j.docs || []).map(bookItem);
}

async function fetchBooks(v) {
  const by = (f) => v.filters.filter((x) => x.f === f);
  const parts = by("theme").map((x) => `subject:"${x.id}"`);
  by("author").forEach((x) => parts.push(`author_key:${x.id}`));
  const ep = by("epoch")[0], aw = by("award")[0];
  if (ep) { const [a, b] = ep.id.split("-"); parts.push(`first_publish_year:[${a} TO ${b}]`); }
  else if (v.level === "esperto") parts.push("first_publish_year:[* TO 1960]");
  if (aw) parts.push(`key:(${(await awardWorks(aw.id)).map((i) => `/works/${i}`).join(" OR ")})`);
  if (!parts.length) parts.push('subject:"fiction"');
  const narrow = v.filters.length > 1 || aw;
  const offset = (v.level === "appassionato" && !narrow ? 40 : 0) + v.page * 20;
  const q = parts.join(" AND ");
  let raw = await olSearch(q, { offset });
  if (!raw.length && !v.page) raw = await olSearch(q, { offset, ita: false });
  const items = raw.filter((d) => v.level !== "curioso" || narrow || !d.pages || d.pages <= 450).map((d) => ({ ...d, badge: aw ? aw.label : "" }));
  return { items, more: raw.length >= 18, suggest: v.page ? [] : bookSuggest(v, raw) };
}

function bookSuggest(v, items) {
  const cnt = new Map(), auth = new Map();
  items.forEach((it) => {
    it.subjects.forEach((s) => SUBJ[s] && cnt.set(s, (cnt.get(s) || 0) + 1));
    if (it.authorKey) auth.set(it.authorKey, { name: it.authorName, n: (auth.get(it.authorKey)?.n || 0) + 1 });
  });
  const dyn = [...cnt].sort((a, b) => b[1] - a[1]).map(([s]) => ({ f: "theme", id: s, label: SUBJ[s] }));
  const stat = v.filters.filter((x) => x.f === "theme").flatMap((x) => BOOK_REL[x.id] || []).map((s) => ({ f: "theme", id: s, label: SUBJ[s] }));
  const authors = [...auth].filter(([, a]) => a.n >= 2).slice(0, 3).map(([id, a]) => ({ f: "author", id, label: a.name }));
  const usedLabels = new Set(v.filters.map((x) => x.label));
  return [...stat.slice(0, 3), ...dyn, ...authors].filter((x) => !usedLabels.has(x.label));
}

async function bookDetail(it, el) {
  const more = el.querySelector(".sh-dmore");
  const themes = it.subjects.filter((s) => SUBJ[s]).sort((a, b) => GENERIC.has(a) - GENERIC.has(b)).slice(0, 10).map((s) => ({ f: "theme", id: s, label: SUBJ[s] }))
    .filter((x, i, a) => a.findIndex((y) => y.label === x.label) === i);
  more.innerHTML = `${it.authorKey ? tags("Autore", [{ f: "author", id: it.authorKey, label: it.authorName }]) : ""}
    ${tags("Temi", themes)}
    <p class="sh-desc" data-testid="shelf-detail-desc">…</p>
    <div class="sh-actions">
      <button class="btn-gold" data-sd="wiki" data-testid="shelf-wiki-button">Approfondisci ${icon("arrowUpRight", "ic-md")}</button>
      <a class="btn-soft" href="${esc(it.url)}" target="_blank" rel="noopener noreferrer" data-testid="shelf-openlibrary-link">Open Library</a>
      ${saveBtn(it)}
    </div>`;
  const box = more.querySelector(".sh-desc");
  const related = async () => {
    const [byAuthor, byTheme] = await Promise.all([
      it.authorKey ? olSearch(`author_key:${it.authorKey}`, { limit: 14, ita: false }).catch(() => []) : [],
      themes.length ? olSearch(themes.slice(0, 2).map((t) => `subject:"${t.id}"`).join(" AND "), { limit: 16 }).catch(() => []) : []
    ]);
    const mine = byAuthor.filter((b) => b.work !== it.work && b.authorKey === it.authorKey);
    addRow(el, books, `Altri libri di ${it.authorName}`, mine.slice(0, 12), "shelf-rel-author");
    addRow(el, books, "Sullo stesso tema", byTheme.filter((b) => b.work !== it.work && !mine.some((m) => m.work === b.work) && b.authorKey !== it.authorKey).slice(0, 12), "shelf-rel-theme");
  };
  related();
  const p = await findWiki(books, it);
  if (p?.extract?.length > 120) { box.textContent = C.truncate(C.cleanText(p.extract), 600); return; }
  const d = await fetch(`https://openlibrary.org${it.work}.json`).then((r) => r.json()).catch(() => null);
  const txt = typeof d?.description === "string" ? d.description : d?.description?.value;
  box.textContent = txt ? `${txt.split(/\n\n|-{3,}|\(\[source/)[0].trim().slice(0, 600)} (descrizione in inglese)` : "Tocca Approfondisci per leggerne la storia su Wikipedia.";
}

const books = {
  id: "books", h1: "Cosa <em>leggo</em> adesso?", sub: "Scegli un interesse e affina passo dopo passo: ogni filtro si aggiunge agli altri.",
  loading: "Cerco tra gli scaffali…", levels: true, start: [{ f: "theme", id: "fiction", label: "Romanzi" }], category: "letteratura",
  facets: [{ f: "theme", label: "Temi", options: BOOK_THEMES }, { f: "award", label: "Premi letterari", single: true, options: AWARDS }, { f: "epoch", label: "Epoca", single: true, options: EPOCHS }],
  find: { ph: "Cerca un libro o un autore", who: "Autori",
    titles: async (q) => { const r = await olSearch(q, { limit: 15, sort: "" }); return r.length ? r : olSearch(q, { limit: 15, sort: "", ita: false }); },
    run: async (q) => (await (await fetch(`https://openlibrary.org/search/authors.json?q=${encodeURIComponent(q)}&limit=8`)).json()).docs.filter((a) => a.work_count > 0).map((a) => ({ f: "author", id: a.key, label: a.name })) },
  meta: (it) => [it.year, it.pages && `${it.pages} pag.`, it.rating && `★ ${it.rating.toFixed(1)}`].filter(Boolean).join(" · "),
  fetch: fetchBooks, detail: bookDetail, wikiQuery: (it) => `${it.title} ${it.authorName}`,
  wikiOk: (p) => !/\((film|serie)/i.test(p.title) && !/^[^.]*\s(è|was) un (film|serie)/i.test(p.extract || ""), saveObj: saveObj("letteratura")
};
register(books);

/* ================= PODCAST · Apple Podcasts ================= */
const POD = [
  ["storia", "Storia", ["storia", "storia podcast", "lezioni di storia"]],
  ["scienza", "Scienza", ["scienza", "divulgazione scientifica", "fisica"]],
  ["crime", "True crime", ["true crime", "cronaca nera", "casi irrisolti"]],
  ["cultura", "Cultura", ["cultura", "letteratura", "filosofia"]],
  ["ridere", "Voglio ridere", ["comedy", "comici", "satira"]],
  ["attualita", "Attualità", ["notizie", "attualità", "geopolitica"]],
  ["tech", "Tecnologia", ["tecnologia", "intelligenza artificiale", "informatica"]],
  ["arte", "Arte e musica", ["arte", "musica", "storia della musica"]],
  ["mente", "Mente e benessere", ["psicologia", "benessere", "meditazione"]],
  ["libri", "Libri", ["libri", "audiolibri", "recensioni libri"]],
  ["medioevo", "Medioevo", ["medioevo"]], ["roma", "Antica Roma", ["antica roma", "impero romano"]], ["guerre", "Guerre mondiali", ["guerra mondiale"]],
  ["mafia", "Mafia", ["mafia"]], ["misteri", "Misteri", ["misteri"]], ["spazio", "Spazio", ["astronomia", "spazio"]], ["miti", "Mitologia", ["mitologia"]],
  ["economia", "Economia", ["economia", "finanza"]], ["cinema", "Cinema e serie", ["cinema", "serie tv"]], ["sport", "Sport", ["sport", "calcio"]],
  ["viaggi", "Viaggi", ["viaggi"]], ["cucina", "Cucina", ["cucina"]]
];
const POD_REL = { storia: ["medioevo", "roma", "guerre", "miti"], scienza: ["spazio", "tech", "mente"], crime: ["mafia", "misteri"], cultura: ["libri", "arte", "miti", "cinema"], attualita: ["economia", "tech", "guerre"], tech: ["scienza", "economia"], arte: ["cinema", "cultura"], mente: ["scienza", "cultura"], libri: ["cultura", "storia"], medioevo: ["storia", "misteri"], roma: ["storia", "miti"], guerre: ["storia", "attualita"], mafia: ["crime", "storia"], misteri: ["crime", "storia"] };
const POD_GENRES = [["1487", "Storia"], ["1533", "Scienze"], ["1488", "True crime"], ["1324", "Cultura e società"], ["1304", "Istruzione"], ["1303", "Commedia"], ["1489", "Notizie"], ["1318", "Tecnologia"], ["1301", "Arte"], ["1512", "Salute e benessere"], ["1310", "Musica"], ["1309", "TV e cinema"], ["1321", "Economia"], ["1545", "Sport"], ["1483", "Fiction"], ["1305", "Bambini e famiglia"]];
const POD_SIZE = [["small", "Meno di 20 episodi"], ["mid", "20 – 100 episodi"], ["big", "Oltre 100 episodi"]];
const POD_FRESH = [["month", "Nuovi episodi questo mese"], ["year", "Attivi nell'ultimo anno"]];
const podCache = {};
const podItem = (r) => ({
  kind: "podcast", key: `pod-${r.collectionId}`, id: r.collectionId, title: r.collectionName, author: r.artistName, genre: r.primaryGenreName,
  genres: (r.genreIds || []).map((id, i) => [id, r.genres?.[i]]).filter(([id, l]) => id !== "26" && l), episodes: r.trackCount,
  img: (r.artworkUrl600 || r.artworkUrl100 || "").replace("http:", "https:"), url: r.collectionViewUrl, date: r.releaseDate || "",
  year: r.releaseDate ? new Date(r.releaseDate).getFullYear() : null
});
function podSearch(term, author = false) {
  const k = `${author}|${term}`;
  return podCache[k] ||= fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=podcast&entity=podcast${author ? "&attribute=authorTerm" : ""}&country=IT&lang=it_it&limit=${author ? 30 : 200}`)
    .then((r) => r.json()).then((j) => (j.results || []).map(podItem)).catch((e) => { delete podCache[k]; throw e; });
}

async function fetchPodcasts(v) {
  const by = (f) => v.filters.filter((x) => x.f === f);
  const themes = by("theme").map((x) => POD.find((p) => p[0] === x.id)).filter(Boolean);
  const lvl = { curioso: 0, appassionato: 1, esperto: 2 }[v.level];
  const term = themes.length === 1 ? themes[0][2][Math.min(lvl, themes[0][2].length - 1)] : themes.map((t) => t[2][0]).join(" ") || by("genre").map((g) => g.label).join(" ") || "podcast italiani";
  const genres = by("genre").map((g) => g.id), size = by("size")[0]?.id, fresh = by("fresh")[0]?.id;
  const now = Date.now(), DAY = 864e5;
  let found = await podSearch(term);
  if (themes.length > 1) {
    // Più temi: prima i podcast che li uniscono tutti, poi quelli dell'ultimo tema scelto
    const singles = await Promise.all(themes.map((t) => podSearch(t[2][0]).catch(() => [])));
    const hits = new Map();
    singles.forEach((l) => l.forEach((p) => hits.set(p.id, (hits.get(p.id) || 0) + 1)));
    const last = singles.at(-1);
    found = [...found, ...last.filter((p) => hits.get(p.id) > 1), ...last].filter((p, i, a) => a.findIndex((x) => x.id === p.id) === i);
  }
  const all = found.filter((p) => genres.every((g) => p.genres.some(([id]) => id === g))
    && (!size || (size === "small" ? p.episodes < 20 : size === "mid" ? p.episodes >= 20 && p.episodes <= 100 : p.episodes > 100))
    && (!fresh || (p.date && now - new Date(p.date) < (fresh === "month" ? 31 : 365) * DAY)));
  const items = all.slice(v.page * 20, v.page * 20 + 20);
  let suggest = [];
  if (!v.page) {
    const cnt = new Map();
    all.forEach((p) => p.genres.forEach(([id, l]) => cnt.set(id, { l, n: (cnt.get(id)?.n || 0) + 1 })));
    const rel = themes.flatMap((t) => POD_REL[t[0]] || []).map((id) => POD.find((p) => p[0] === id)).map((p) => ({ f: "theme", id: p[0], label: p[1] }));
    suggest = [...rel, ...[...cnt].sort((a, b) => b[1].n - a[1].n).slice(0, 5).map(([id, g]) => ({ f: "genre", id, label: g.l }))];
  }
  return { items, more: all.length > v.page * 20 + 20, suggest };
}

const fmtDur = (ms) => (ms ? (ms >= 36e5 ? `${Math.floor(ms / 36e5)} h ${Math.round((ms % 36e5) / 6e4)} min` : `${Math.round(ms / 6e4)} min`) : "");
async function podDetail(it, el) {
  const more = el.querySelector(".sh-dmore");
  more.innerHTML = `${tags("Categorie", it.genres.map(([id, l]) => ({ f: "genre", id, label: l })))}
    <p class="sh-desc" data-testid="shelf-detail-desc">Un podcast di <b>${esc(it.author)}</b>${it.episodes ? ` con ${it.episodes} episodi` : ""}. Ascolta qui gli ultimi episodi o aprilo nella tua app.</p>
    <div class="sh-actions">
      <a class="spotify" href="https://open.spotify.com/search/${encodeURIComponent(it.title)}/podcasts" target="_blank" rel="noopener noreferrer" data-testid="shelf-spotify-link">${icon("headphones", "ic-md")} Ascolta su Spotify</a>
      <a class="btn-soft" href="${esc(it.url)}" target="_blank" rel="noopener noreferrer" data-testid="shelf-apple-link">Apple Podcasts</a>
      ${saveBtn(it)}
    </div>
    <div class="sh-sec sh-eps" data-testid="shelf-episodes">${loading("Carico gli ultimi episodi…")}</div>`;
  const eps = more.querySelector(".sh-eps");
  fetch(`https://itunes.apple.com/lookup?id=${it.id}&entity=podcastEpisode&limit=6&country=IT`).then((r) => r.json()).then((j) => {
    const list = (j.results || []).filter((e) => e.wrapperType === "podcastEpisode" && e.episodeUrl);
    eps.innerHTML = list.length ? `<p class="sf-label">Ultimi episodi</p>${list.map((e, i) => `<div class="sh-ep">
      <button class="play" data-sd="play" data-url="${esc(e.episodeUrl)}" data-testid="shelf-episode-play-${i}" aria-label="Ascolta">${PLAY}</button>
      <div><b>${esc(e.trackName)}</b><small>${[e.releaseDate && new Date(e.releaseDate).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" }), fmtDur(e.trackTimeMillis)].filter(Boolean).join(" · ")}</small>
      ${e.description ? `<p>${esc(e.description)}</p>` : ""}</div></div>`).join("")}` : "";
  }).catch(() => { eps.innerHTML = ""; });
  const term = podcasts.v.filters.filter((x) => x.f === "theme").map((x) => POD.find((p) => p[0] === x.id)?.[2][0]).filter(Boolean).join(" ") || it.genres[0]?.[1] || it.genre;
  const [byAuthor, similar] = await Promise.all([podSearch(it.author, true).catch(() => []), podSearch(term).catch(() => [])]);
  const mine = byAuthor.filter((p) => p.id !== it.id && p.author === it.author);
  const g = it.genres[0]?.[0];
  addRow(el, podcasts, `Altri di ${it.author}`, mine.slice(0, 10), "shelf-rel-author");
  addRow(el, podcasts, "Podcast simili", similar.filter((p) => p.id !== it.id && p.author !== it.author && (!g || p.genres.some(([id]) => id === g))).slice(0, 12), "shelf-rel-similar");
}

const podcasts = {
  id: "podcast", h1: "Cosa <em>ascolto</em> oggi?", sub: "Podcast italiani per ogni curiosità. Aggiungi filtri per una ricerca sempre più mirata.",
  loading: "Cerco tra i podcast…", levels: true, square: true, start: [{ f: "theme", id: "storia", label: "Storia" }], category: "musica",
  find: { ph: "Cerca un podcast per nome", titles: async (q) => (await podSearch(q)).slice(0, 15) },
  facets: [{ f: "theme", label: "Temi", options: POD.map(([id, l]) => [id, l]) }, { f: "genre", label: "Categorie", options: POD_GENRES }, { f: "size", label: "Episodi", single: true, options: POD_SIZE }, { f: "fresh", label: "Aggiornati", single: true, options: POD_FRESH }],
  meta: (it) => [it.genre, it.episodes && `${it.episodes} episodi`].filter(Boolean).join(" · "),
  fetch: fetchPodcasts, detail: podDetail, wikiQuery: (it) => it.title, saveObj: saveObj("musica")
};
register(podcasts);
})();
