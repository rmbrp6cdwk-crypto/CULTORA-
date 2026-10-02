// Cultora · Geolo, l'esploratore: seleziona il nome di un luogo e lui te lo mostra sulla mappa
(() => {
"use strict";
const $ = (s) => document.querySelector(s);
const phone = $("#phone");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const cache = new Map();
const cut = (s, n) => (s.length <= n ? s : s.slice(0, s.lastIndexOf(" ", n - 1)) + "…");

const FACE = `<svg class="beppa-face" viewBox="0 0 64 64" aria-hidden="true">
  <circle cx="32" cy="67" r="22" fill="#0f766e"/>
  <path d="M27 47h10v8H27z" fill="#d9a77f"/>
  <circle cx="32" cy="36" r="15" fill="#e8b48f"/>
  <path d="M12 28c0-11.5 9-19 20-19s20 7.5 20 19z" fill="#d8c48e"/>
  <path d="M13.5 24h37" stroke="#22D3EE" stroke-width="3.2"/>
  <ellipse cx="32" cy="28.5" rx="24" ry="3.6" fill="#b89d5e"/>
  <g class="beppa-eyes"><circle cx="26" cy="36" r="1.8" fill="#1f2937"/><circle cx="38" cy="36" r="1.8" fill="#1f2937"/></g>
  <path d="M23 32.3l5-1M41 32.3l-5-1" stroke="#7c4a2d" stroke-width="1.4" stroke-linecap="round"/>
  <g fill="#c07a55" opacity=".7"><circle cx="22.5" cy="40" r=".9"/><circle cx="25" cy="41.5" r=".9"/><circle cx="41.5" cy="40" r=".9"/><circle cx="39" cy="41.5" r=".9"/></g>
  <path d="M26.5 43q5.5 5 11 0" fill="none" stroke="#7c2d12" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M24 51q8 4 16 0" fill="none" stroke="#1f2937" stroke-width="1.2"/>
  <g fill="#1f2937" stroke="#22D3EE" stroke-width="1.2"><rect x="23.5" y="52" width="7" height="8" rx="2"/><rect x="33.5" y="52" width="7" height="8" rx="2"/></g>
  <path d="M30.5 55.5h3" stroke="#22D3EE" stroke-width="1.6"/>
</svg>`;
const avatar = () => `<span class="beppa-avatar geolo-avatar">${FACE}</span>`;

const css = document.createElement("style");
css.textContent = `
.geolo-avatar{border-color:#22D3EE!important;background:#0b2226!important}
.geolo-card{position:absolute;left:10px;right:10px;bottom:14px;z-index:59;max-height:72%;overflow-y:auto;border-radius:22px;border:1px solid rgba(34,211,238,.45);background:#071518;padding:16px;box-shadow:0 -10px 40px rgba(0,0,0,.6);animation:beppaIn .45s cubic-bezier(.34,1.56,.64,1) both}
.geolo-card .beppa-head small{color:#22D3EE}
.geolo-desc{font-size:12.5px;font-style:italic;color:#94A3B8}
.geolo-map{position:relative;margin-top:12px;height:200px;border-radius:16px;overflow:hidden;border:1px solid rgba(34,211,238,.3);background:#0b2226}
.geolo-map iframe{width:100%;height:100%;border:0}
.geolo-coords{position:absolute;left:8px;bottom:8px;border-radius:999px;background:rgba(7,21,24,.85);padding:3px 9px;font-family:var(--mono);font-size:10.5px;color:#a5f3fc}
.geolo-btn{display:inline-flex;align-items:center;gap:6px;border-radius:999px;background:#22D3EE;color:#062a30;padding:8px 14px;font-size:12px;font-weight:700}
.geolo-actions{display:flex;width:100%;justify-content:flex-end;gap:8px}`;
document.head.appendChild(css);

const wiki = (params) => {
  const u = new URL("https://it.wikipedia.org/w/api.php");
  Object.entries({ format: "json", origin: "*", ...params }).forEach(([k, v]) => u.searchParams.set(k, v));
  return fetch(u).then((r) => r.json());
};
const PROPS = { prop: "coordinates|pageterms|extracts|info", coprop: "type|dim", wbptterms: "description", exintro: 1, explaintext: 1, exsentences: 2, inprop: "url", redirects: 1 };
const withCoords = (j) => Object.values(j.query?.pages || {}).sort((a, b) => (a.index || 0) - (b.index || 0)).find((p) => p.coordinates?.length);

async function locate(text) {
  return withCoords(await wiki({ action: "query", titles: text, ...PROPS }))
    || withCoords(await wiki({ action: "query", generator: "search", gsrsearch: text, gsrlimit: 5, ...PROPS }));
}

// Zoom della mappa in base alla grandezza del luogo (dim in metri)
const DIMS = { country: 900000, adm1st: 250000, adm2nd: 60000, city: 15000, island: 40000, mountain: 8000, landmark: 1500 };
function mapURL(c) {
  const dim = Number(c.dim) || DIMS[c.type] || 12000;
  const d = Math.min(Math.max(dim / 111000, 0.01), 18), dl = d / Math.max(Math.cos((c.lat * Math.PI) / 180), 0.2);
  return `https://www.openstreetmap.org/export/embed.html?bbox=${c.lon - dl},${c.lat - d},${c.lon + dl},${c.lat + d}&layer=mapnik&marker=${c.lat},${c.lon}`;
}

function card(inner) {
  document.querySelectorAll(".beppa-card, .geolo-card, .beppa-hi").forEach((n) => n.remove());
  const el = document.createElement("div");
  el.className = "geolo-card no-scrollbar";
  el.setAttribute("data-testid", "geolo-card");
  el.innerHTML = inner;
  el.addEventListener("click", (e) => { if (e.target.closest(".beppa-x")) el.remove(); });
  phone.appendChild(el);
  return el;
}
const head = (title, desc = "") => `<button class="beppa-x" data-testid="geolo-card-close" aria-label="Chiudi">×</button>
  <div class="beppa-head">${avatar()}<div><small>Geolo dice</small><p class="beppa-word" data-testid="geolo-place">${esc(title)}</p>${desc ? `<p class="geolo-desc">${esc(desc)}</p>` : ""}</div></div>`;

async function ask(text) {
  const el = card(`${head(text)}<p class="beppa-say" data-testid="geolo-loading">Prendo il binocolo e cerco sulla mappa<span class="beppa-dots"><span>.</span><span>.</span><span>.</span></span></p>`);
  const key = text.toLowerCase();
  let p = cache.get(key);
  if (p === undefined) {
    try { p = (await locate(text)) || null; cache.set(key, p); } catch { p = false; }
  }
  if (!el.isConnected) return;
  if (!p) {
    el.innerHTML = `${head(text)}<p class="beppa-say" data-testid="geolo-error">${p === null
      ? "Ho guardato dappertutto ma questo posto non riesco a trovarlo sulla mappa! Sei sicuro che sia un luogo?"
      : "Il mio binocolo non vede niente: controlla la connessione e riprova!"}</p>`;
    return;
  }
  const c = p.coordinates[0];
  const desc = p.terms?.description?.[0] || "";
  el.innerHTML = `${head(p.title, desc)}
    <div class="geolo-map" data-testid="geolo-map"><iframe src="${esc(mapURL(c))}" title="Mappa di ${esc(p.title)}" loading="lazy"></iframe>
      <span class="geolo-coords">${c.lat.toFixed(3)}, ${c.lon.toFixed(3)}</span></div>
    ${p.extract ? `<p class="beppa-say">${esc(cut(p.extract.replace(/\s*\([^()]*\)/g, "").replace(/\s+/g, " ").trim(), 220))}</p>` : ""}
    <div class="beppa-foot">
      <div class="geolo-actions">
        <a class="btn-soft" href="${esc(p.fullurl)}" target="_blank" rel="noopener noreferrer" data-testid="geolo-wiki-link">Wikipedia</a>
        <a class="geolo-btn" href="https://maps.apple.com/?ll=${c.lat},${c.lon}&q=${encodeURIComponent(p.title)}" target="_blank" rel="noopener noreferrer" data-testid="geolo-maps-link">Apri in Mappe ↗</a>
      </div></div>`;
}

window.Geolo = { avatar, ask };
})();
