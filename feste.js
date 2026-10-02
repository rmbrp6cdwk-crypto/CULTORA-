// Cultora · Ricorrenze del giorno + notifiche push (si appoggia all'interfaccia di script.js)
(() => {
"use strict";

const VAPID_PUBLIC_KEY = "BBVAr8DK6_j_x6CUOXjjTA7QzXnQxbR8tGHjfbRpQpidwtecpvHt-x1elx3VXUDGvVbHpEyzpHyaowCe1FE0E0E";
const DISMISS_KEY = "cultora_feste_chiuse";
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------- Stile ---------- */
const css = document.createElement("style");
css.textContent = `
.fest-bell{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.15);background:rgba(0,0,0,.4);color:#fff;backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);margin-left:auto;margin-right:8px;transition:background-color .2s}
.fest-bell.on{color:#F5B83D;border-color:rgba(245,184,61,.5)}
.fest-banner{position:absolute;left:12px;right:12px;top:108px;z-index:45;display:flex;align-items:center;gap:10px;padding:10px 10px 10px 14px;border-radius:16px;border:1px solid rgba(245,184,61,.45);background:rgba(20,16,6,.88);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);box-shadow:0 10px 30px rgba(0,0,0,.45);animation:festIn .5s cubic-bezier(.22,1,.36,1) both}
@keyframes festIn{from{opacity:0;transform:translateY(-12px)}}
.fest-banner .txt{flex:1;min-width:0;text-align:left}
.fest-banner small{display:block;font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#F5B83D}
.fest-banner b{display:block;font-family:"Fraunces",Georgia,serif;font-size:16px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fest-go{flex-shrink:0;border-radius:999px;background:#F5B83D;color:#1a1204;padding:8px 12px;font-size:12px;font-weight:700}
.fest-x{flex-shrink:0;width:28px;height:28px;border-radius:50%;color:#94A3B8;font-size:18px;line-height:1}
.fest-modal{position:absolute;inset:0;z-index:60;display:grid;place-items:center;padding:20px;background:rgba(0,0,0,.7)}
.fest-card{width:100%;max-width:380px;border-radius:20px;border:1px solid rgba(255,255,255,.12);background:#11131b;padding:20px;color:#e2e8f0;font-size:14px;line-height:1.55}
.fest-card h3{font-family:"Fraunces",Georgia,serif;font-size:22px;color:#fff;margin-bottom:8px}
.fest-card textarea{width:100%;height:110px;margin:12px 0;border-radius:12px;border:1px solid rgba(255,255,255,.15);background:#0b0c12;color:#cbd5e1;font:12px "JetBrains Mono",monospace;padding:10px;resize:none}
.fest-row{display:flex;gap:8px;justify-content:flex-end;margin-top:8px}
.fest-btn{border-radius:999px;padding:10px 16px;font-weight:700;font-size:13px;background:rgba(255,255,255,.1);color:#fff}
.fest-btn.gold{background:#F5B83D;color:#1a1204}
.brand.fest{display:inline-flex;align-items:center;gap:6px;cursor:pointer;background:linear-gradient(100deg,#F5B83D 0%,#F5B83D 35%,#FFF1C7 50%,#F5B83D 65%,#E8952B 100%);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:festShine 4.5s ease-in-out infinite;-webkit-tap-highlight-color:transparent}
.brand.fest>span:not(.fest-doodle){display:none}
@keyframes festShine{0%,100%{background-position:100% 0}50%{background-position:0 0}}
.fest-doodle{position:relative;display:grid;place-items:center;width:24px;height:24px;border-radius:50%;color:#F5B83D;background:rgba(245,184,61,.14);box-shadow:0 0 14px rgba(245,184,61,.45);animation:festBob 2.6s ease-in-out infinite}
.fest-doodle svg{width:14px;height:14px}
.fest-doodle::after{content:"";position:absolute;inset:-3px;border-radius:50%;border:1px solid rgba(245,184,61,.5);animation:festRing 2.6s ease-out infinite}
@keyframes festBob{0%,100%{transform:translateY(0) rotate(-6deg)}50%{transform:translateY(-3px) rotate(6deg)}}
@keyframes festRing{0%{opacity:.8;transform:scale(.9)}100%{opacity:0;transform:scale(1.6)}}
.fest-pop{position:absolute;left:12px;top:60px;z-index:55;width:min(300px,calc(100% - 24px));padding:14px;border-radius:18px;border:1px solid rgba(245,184,61,.45);background:rgba(20,16,6,.94);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);box-shadow:0 14px 40px rgba(0,0,0,.55);text-align:left;animation:festIn .4s cubic-bezier(.22,1,.36,1) both}
.fest-pop small{display:block;font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#F5B83D}
.fest-pop b{display:block;margin-top:4px;font-family:"Fraunces",Georgia,serif;font-size:20px;font-weight:600;line-height:1.2;color:#fff}
.fest-pop p{margin-top:6px;font-size:13px;line-height:1.45;color:#94A3B8}
.fest-pop .fest-go{margin-top:12px}
@media(prefers-reduced-motion:reduce){.brand.fest,.fest-doodle,.fest-doodle::after{animation:none}}`;
document.head.appendChild(css);

/* ---------- Calcolo ricorrenze ---------- */
const pad = (n) => String(n).padStart(2, "0");
function pasqua(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(y, month - 1, day));
}
function regolaData(rule, y) {
  const p = rule.match(/^pasqua([+-]\d+)$/);
  if (p) { const d = pasqua(y); d.setUTCDate(d.getUTCDate() + Number(p[1])); return d; }
  const n = rule.match(/^nth:(\d+):(\d):(\d):(-?\d+)$/);
  if (n) {
    const d = new Date(Date.UTC(y, n[1] - 1, 1));
    d.setUTCDate(1 + ((n[2] - d.getUTCDay() + 7) % 7) + (n[3] - 1) * 7 + Number(n[4]));
    return d;
  }
  const l = rule.match(/^last:(\d+):(\d)$/);
  if (l) { const d = new Date(Date.UTC(y, l[1], 0)); d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() - l[2] + 7) % 7)); return d; }
  return null;
}
function ricorrenzeDi(data, y, m, d) {
  const key = `${pad(m)}-${pad(d)}`;
  const out = [...(data.fisse[key] || [])];
  Object.entries(data.mobili).forEach(([rule, names]) => {
    const r = regolaData(rule, y);
    if (r && r.getUTCMonth() + 1 === m && r.getUTCDate() === d) out.push(...names);
  });
  return out.map((s) => { const [nome, q] = s.split("|"); return { nome, q: q || nome }; });
}

/* ---------- Apertura ricerca (come scrivere in "Cerca") ---------- */
function apriRicerca(q) {
  if (!q) return;
  $("[data-action='sheet-close']")?.click();
  $("[data-testid='nav-search-tab']")?.click();
  const edit = $("[data-action='edit-query']");
  if (!$("#search-form") && edit) edit.click();
  const input = $("#search-input"), form = $("#search-form");
  if (!input || !form) return;
  input.value = q;
  form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
}

/* ---------- Banner "Oggi" ---------- */
function mostraBanner(feste) {
  const today = new Date().toDateString();
  if (!feste.length || localStorage.getItem(DISMISS_KEY) === today) return;
  const f = feste[0], altre = feste.slice(1).map((x) => x.nome).join(", ");
  const el = document.createElement("div");
  el.className = "fest-banner";
  el.setAttribute("data-testid", "festivity-banner");
  el.innerHTML = `<div class="txt"><small>Oggi si celebra</small><b>${esc(f.nome)}</b>${altre ? `<small style="color:#94A3B8;letter-spacing:0;text-transform:none;font-weight:500">Anche: ${esc(altre)}</small>` : ""}</div>
    <button class="fest-go" data-testid="festivity-banner-open">Scopri</button>
    <button class="fest-x" data-testid="festivity-banner-close" aria-label="Chiudi">×</button>`;
  el.querySelector(".fest-go").onclick = () => { el.remove(); apriRicerca(f.q); };
  el.querySelector(".fest-x").onclick = () => { localStorage.setItem(DISMISS_KEY, today); el.remove(); };
  $("#phone").appendChild(el);
  setTimeout(() => el.remove(), 15000);
}

/* ---------- Logo festivo (tutto il giorno) ---------- */
const DOODLE = {
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  drop: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
  egg: '<path d="M12 22c6.23-.05 7.870-5.57 7.5-10-.36-4.34-3.95-9.96-7.5-10-3.55.04-7.14 5.66-7.5 10-.37 4.43 1.27 9.95 7.5 10z"/>',
  paw: '<circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/>',
  coffee: '<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/>',
  rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.910-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  flower: '<circle cx="12" cy="12" r="3"/><path d="M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5"/>',
  pi: '<text x="12" y="18" text-anchor="middle" font-size="19" font-family="Georgia,serif" fill="currentColor" stroke="none">π</text>',
  sparkle: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>'
};
const TEMI = [
  [/pi day/, "pi"],
  [/valentino|mamma|papà|nonni|amicizia|gentilezza/, "heart"],
  [/donna|donne/, "flower"],
  [/natale|vigilia|epifania|immacolata|lucia|perseidi|lorenzo|candelora/, "star"],
  [/halloween|luna|ognissanti|defunti/, "moon"],
  [/pasqua|pasquetta|palme/, "egg"],
  [/terra|ambiente|foreste|alberi|biodiversità|suolo|zone umide|montagna|ozono|solstizio|equinozio/, "leaf"],
  [/acqua|oceani|meteorologica/, "drop"],
  [/musica|jazz|radio|danza/, "music"],
  [/libro|poesia|alfabetizzazione|lingua|traduzione|insegnanti|musei|arte/, "book"],
  [/repubblica|liberazione|unità|europa|lavoratori|forze armate|memoria|ricordo/, "flag"],
  [/gatto|cane|animali|api|tigre|elefante|francesco/, "paw"],
  [/caffè/, "coffee"],
  [/spazio|asteroidi|volo/, "rocket"]
];
const temaDi = (nome) => (TEMI.find(([re]) => re.test(nome.toLowerCase())) || [0, "sparkle"])[1];
let festeOggi = [], giornoOggi = "";

function chiudiPop() { $(".fest-pop")?.remove(); }
function apriPop() {
  if ($(".fest-pop")) return chiudiPop();
  const [f, ...altre] = festeOggi;
  const el = document.createElement("div");
  el.className = "fest-pop";
  el.setAttribute("data-testid", "festive-logo-popover");
  el.innerHTML = `<small>Oggi si celebra</small><b data-testid="festive-logo-popover-title">${esc(f.nome)}</b>${altre.length ? `<p>Anche: ${esc(altre.map((x) => x.nome).join(", "))}</p>` : ""}
    <button class="fest-go" data-testid="festive-logo-popover-open">Scopri</button>`;
  el.querySelector(".fest-go").onclick = () => { chiudiPop(); apriRicerca(f.q); };
  $("#phone").appendChild(el);
}

function logoFestivo() {
  const brand = $(".brand");
  brand.querySelector(".fest-doodle")?.remove();
  brand.classList.toggle("fest", festeOggi.length > 0);
  if (!festeOggi.length) { brand.removeAttribute("role"); brand.removeAttribute("data-testid"); return chiudiPop(); }
  brand.setAttribute("role", "button");
  brand.setAttribute("data-testid", "festive-logo");
  brand.setAttribute("aria-label", `Oggi: ${festeOggi[0].nome}`);
  const d = document.createElement("span");
  d.className = "fest-doodle";
  d.setAttribute("data-testid", "festive-logo-icon");
  d.dataset.tema = temaDi(festeOggi[0].nome);
  d.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${DOODLE[d.dataset.tema]}</svg>`;
  brand.appendChild(d);
}

function aggiornaOggi(data) {
  const now = new Date();
  giornoOggi = now.toDateString();
  festeOggi = ricorrenzeDi(data, now.getFullYear(), now.getMonth() + 1, now.getDate());
  logoFestivo();
  return festeOggi;
}

/* ---------- Notifiche push ---------- */
const keyToBytes = (b64) => {
  const s = atob((b64 + "=".repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...s].map((c) => c.charCodeAt(0)));
};

function modal(html) {
  const m = document.createElement("div");
  m.className = "fest-modal";
  m.setAttribute("data-testid", "notifications-modal");
  m.innerHTML = `<div class="fest-card">${html}</div>`;
  m.addEventListener("click", (e) => { if (e.target === m || e.target.dataset.close !== undefined) m.remove(); });
  $("#phone").appendChild(m);
  return m;
}

async function attivaNotifiche(reg) {
  const ios = /iphone|ipad/i.test(navigator.userAgent);
  const standalone = window.navigator.standalone || matchMedia("(display-mode: standalone)").matches;
  if (!("PushManager" in window) || !reg) {
    return modal(`<h3>Notifiche non disponibili</h3><p>${ios && !standalone
      ? "Su iPhone le notifiche funzionano solo aprendo Cultora <b>dall'icona sulla schermata Home</b> (iOS 16.4 o successivo)."
      : "Questo browser non supporta le notifiche push."}</p><div class="fest-row"><button class="fest-btn gold" data-close>Ok</button></div>`);
  }
  const perm = await Notification.requestPermission();
  if (perm !== "granted") {
    return modal(`<h3>Permesso negato</h3><p>Per attivarle vai in <b>Impostazioni → Notifiche → Cultora</b> e consenti le notifiche.</p><div class="fest-row"><button class="fest-btn gold" data-close>Ok</button></div>`);
  }
  const sub = (await reg.pushManager.getSubscription()) || (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyToBytes(VAPID_PUBLIC_KEY) }));
  const json = JSON.stringify(sub);
  $(".fest-bell")?.classList.add("on");
  const m = modal(`<h3>Notifiche attivate</h3>
    <p>Ultimo passaggio: copia questo codice e incollalo su GitHub come secret <b>PUSH_SUBSCRIPTION</b>.</p>
    <textarea readonly data-testid="push-subscription-code">${esc(json)}</textarea>
    <div class="fest-row"><button class="fest-btn" data-close>Chiudi</button><button class="fest-btn gold" data-testid="copy-subscription-button">Copia codice</button></div>`);
  m.querySelector(".gold").onclick = async (e) => {
    try { await navigator.clipboard.writeText(json); } catch { const t = m.querySelector("textarea"); t.select(); document.execCommand("copy"); }
    e.target.textContent = "Copiato!";
  };
}

async function init() {
  const reg = "serviceWorker" in navigator ? await navigator.serviceWorker.register("sw.js").catch(() => null) : null;

  const bell = document.createElement("button");
  bell.className = "fest-bell";
  bell.setAttribute("data-testid", "notifications-bell-button");
  bell.setAttribute("aria-label", "Notifiche ricorrenze");
  bell.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`;
  bell.onclick = () => attivaNotifiche(reg);
  const row = $(".topbar-row");
  row.insertBefore(bell, row.children[1]);
  if (reg && "PushManager" in window && (await reg.pushManager.getSubscription().catch(() => null))) bell.classList.add("on");

  navigator.serviceWorker?.addEventListener("message", (e) => { if (e.data?.type === "cultora-search") apriRicerca(e.data.q); });

  const params = new URLSearchParams(location.search);
  const q = params.get("q");
  if (q) { history.replaceState(null, "", location.pathname); apriRicerca(q); }

  try {
    const data = await (await fetch("feste.json", { cache: "no-cache" })).json();
    const feste = aggiornaOggi(data);
    if (!q) mostraBanner(feste);
    $(".brand").addEventListener("click", () => { if (festeOggi.length) apriPop(); });
    document.addEventListener("click", (e) => { if (!e.target.closest(".fest-pop, .brand")) chiudiPop(); });
    document.addEventListener("visibilitychange", () => { if (!document.hidden && new Date().toDateString() !== giornoOggi) aggiornaOggi(data); });
  } catch { /* niente banner né logo festivo se feste.json non è raggiungibile */ }
}

init();
})();
