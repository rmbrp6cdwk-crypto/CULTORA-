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
.fest-btn.gold{background:#F5B83D;color:#1a1204}`;
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
    const now = new Date();
    if (!q) mostraBanner(ricorrenzeDi(data, now.getFullYear(), now.getMonth() + 1, now.getDate()));
  } catch { /* nessun banner se feste.json non è raggiungibile */ }
}

init();
})();
