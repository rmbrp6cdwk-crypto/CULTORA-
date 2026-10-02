// Cultora · Beppa, la bibliotecaria: seleziona una parola nell'articolo e lei ti spiega il significato (Treccani)
(() => {
"use strict";
const $ = (s) => document.querySelector(s);
const phone = $("#phone");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const cache = new Map();

const FACE = `<svg class="beppa-face" viewBox="0 0 64 64" aria-hidden="true">
  <circle cx="32" cy="66" r="22" fill="#FB7185"/>
  <path d="M27 47h10v8H27z" fill="#efc3a2"/>
  <ellipse cx="32" cy="31" rx="20" ry="21" fill="#4a3426"/>
  <circle cx="32" cy="9.5" r="8" fill="#4a3426"/>
  <line x1="21" y1="4" x2="43" y2="14" stroke="#F5B83D" stroke-width="2.6" stroke-linecap="round"/>
  <circle cx="32" cy="34" r="15.5" fill="#f6d2b5"/>
  <path d="M16.5 31c1.5-9.5 8.5-15 15.5-15s14 5.5 15.5 15c-4.5-4.5-9.5-6.5-15.5-6.5S21 26.5 16.5 31z" fill="#4a3426"/>
  <g class="beppa-eyes"><circle cx="25.5" cy="34.6" r="1.6" fill="#2b1d14"/><circle cx="38.5" cy="34.6" r="1.6" fill="#2b1d14"/></g>
  <circle cx="25.5" cy="34.2" r="5.7" fill="rgba(255,255,255,.16)" stroke="#F5B83D" stroke-width="1.8"/>
  <circle cx="38.5" cy="34.2" r="5.7" fill="rgba(255,255,255,.16)" stroke="#F5B83D" stroke-width="1.8"/>
  <path d="M31.2 34h1.6" stroke="#F5B83D" stroke-width="1.8"/>
  <circle cx="21" cy="41.5" r="2.3" fill="#FB7185" opacity=".45"/><circle cx="43" cy="41.5" r="2.3" fill="#FB7185" opacity=".45"/>
  <path d="M28 43.3q4 3.4 8 0" fill="none" stroke="#a8434c" stroke-width="1.7" stroke-linecap="round"/>
</svg>`;

/* ---------- Stile ---------- */
const css = document.createElement("style");
css.textContent = `
.beppa-face{display:block;width:100%;height:100%}
.beppa-eyes{transform-origin:32px 34.6px;animation:beppaBlink 4s infinite}
@keyframes beppaBlink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}
.beppa-avatar{flex-shrink:0;width:58px;height:58px;border-radius:50%;background:#1d1a14;border:2px solid #F5B83D;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.45)}
.beppa-hi{position:absolute;left:12px;right:12px;bottom:22px;z-index:57;display:flex;align-items:flex-end;gap:10px;animation:beppaIn .55s cubic-bezier(.34,1.56,.64,1) both;transition:opacity .4s,transform .4s}
.beppa-hi.out{opacity:0;transform:translateY(16px)}
@keyframes beppaIn{from{opacity:0;transform:translateY(30px) scale(.9)}}
.beppa-bubble{position:relative;flex:1;border-radius:18px 18px 18px 4px;border:1px solid rgba(245,184,61,.45);background:rgba(20,16,6,.95);padding:12px 34px 12px 14px;font-size:13.5px;line-height:1.45;color:#f1e7cf;box-shadow:0 10px 30px rgba(0,0,0,.5)}
.beppa-bubble b{color:#F5B83D}
.beppa-x{position:absolute;right:6px;top:6px;width:24px;height:24px;border-radius:50%;color:#94A3B8;font-size:16px;line-height:1}
.beppa-ask{position:fixed;z-index:200;display:inline-flex;align-items:center;gap:8px;border-radius:999px;background:#F5B83D;color:#1a1204;padding:5px 14px 5px 5px;font-size:13px;font-weight:700;box-shadow:0 8px 24px rgba(0,0,0,.5);animation:beppaIn .3s ease both;-webkit-user-select:none;user-select:none}
.beppa-ask .beppa-avatar{width:28px;height:28px;border-width:1.5px;box-shadow:none}
.beppa-card{position:absolute;left:10px;right:10px;bottom:14px;z-index:59;max-height:62%;overflow-y:auto;border-radius:22px;border:1px solid rgba(245,184,61,.45);background:#14110b;padding:16px;box-shadow:0 -10px 40px rgba(0,0,0,.6);animation:beppaIn .45s cubic-bezier(.34,1.56,.64,1) both}
.beppa-head{display:flex;align-items:center;gap:12px;padding-right:28px}
.beppa-head small{display:block;font-size:10.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#F5B83D}
.beppa-word{font-family:var(--display);font-size:24px;font-weight:600;line-height:1.15;color:#fff}
.beppa-cat{font-size:12px;font-style:italic;color:#94A3B8}
.beppa-defs{margin-top:12px;display:flex;flex-direction:column;gap:8px}
.beppa-defs li{display:flex;gap:10px;font-size:14px;line-height:1.55;color:#e2e8f0}
.beppa-defs li b{font-family:var(--mono);font-weight:400;color:#F5B83D}
.beppa-say{margin-top:12px;font-size:14px;line-height:1.55;color:#e2e8f0}
.beppa-foot{margin-top:14px;display:flex;align-items:center;justify-content:space-between;gap:10px}
.beppa-src{font-size:11.5px;color:#64748B}
.beppa-dots span{display:inline-block;animation:beppaDot 1.2s infinite}
.beppa-dots span:nth-child(2){animation-delay:.2s}.beppa-dots span:nth-child(3){animation-delay:.4s}
@keyframes beppaDot{0%,60%,100%{opacity:.2}30%{opacity:1}}
@media(prefers-reduced-motion:reduce){.beppa-eyes,.beppa-hi,.beppa-card,.beppa-ask{animation:none}}`;
document.head.appendChild(css);

const avatar = (cls = "") => `<span class="beppa-avatar ${cls}">${FACE}</span>`;
const removeAll = (sel) => document.querySelectorAll(sel).forEach((n) => n.remove());

/* ---------- Saluto quando si apre "Approfondisci" ---------- */
let hiTimer;
function sayHi() {
  removeAll(".beppa-hi");
  clearTimeout(hiTimer);
  const el = document.createElement("div");
  el.className = "beppa-hi";
  el.setAttribute("data-testid", "beppa-greeting");
  el.innerHTML = `${avatar()}<div class="beppa-bubble">Ehi ciao! Se non conosci il significato di una parola, <b>selezionala e chiedi a me</b>, stupido analfabeta!
    <button class="beppa-x" data-testid="beppa-greeting-close" aria-label="Chiudi">×</button></div>`;
  const hide = () => { el.classList.add("out"); setTimeout(() => el.remove(), 400); };
  el.querySelector(".beppa-x").onclick = hide;
  phone.appendChild(el);
  hiTimer = setTimeout(hide, 7000);
}

new MutationObserver((muts) => {
  muts.forEach((m) => {
    if ([...m.addedNodes].some((n) => n.classList?.contains("sheet"))) sayHi();
    if ([...m.removedNodes].some((n) => n.classList?.contains("sheet")) && !$(".sheet")) removeAll(".beppa-hi, .beppa-card, .beppa-ask");
  });
}).observe(phone, { childList: true });

/* ---------- Selezione di una parola → "Chiedi a Beppa" ---------- */
function selectedWord() {
  const sel = getSelection();
  if (!sel || sel.isCollapsed || !sel.rangeCount) return null;
  const node = sel.anchorNode?.nodeType === 1 ? sel.anchorNode : sel.anchorNode?.parentElement;
  if (!node?.closest(".sheet")) return null;
  const w = sel.toString().trim().replace(/^[^A-Za-zÀ-ÿ]+|[^A-Za-zÀ-ÿ]+$/g, "").split(/['’]/).pop();
  return /^[A-Za-zÀ-ÿ-]{2,30}$/.test(w) ? { w, rect: sel.getRangeAt(0).getBoundingClientRect() } : null;
}

let selTimer;
document.addEventListener("selectionchange", () => {
  clearTimeout(selTimer);
  if (!$(".sheet") && !$(".beppa-ask")) return;
  selTimer = setTimeout(() => {
    removeAll(".beppa-ask");
    const s = selectedWord();
    if (!s) return;
    const b = document.createElement("button");
    b.className = "beppa-ask";
    b.setAttribute("data-testid", "beppa-ask-button");
    b.innerHTML = `${avatar()} Chiedi a Beppa`;
    const below = s.rect.bottom + 58 < innerHeight;
    b.style.top = `${below ? s.rect.bottom + 12 : s.rect.top - 50}px`;
    b.style.left = `${Math.min(Math.max(8, s.rect.left + s.rect.width / 2 - 75), innerWidth - 158)}px`;
    b.addEventListener("pointerdown", (e) => e.preventDefault());
    b.addEventListener("mousedown", (e) => e.preventDefault());
    b.onclick = () => { b.remove(); getSelection().removeAllRanges(); ask(s.w); };
    document.body.appendChild(b);
  }, 250);
});

/* ---------- Finestrella con il significato ---------- */
function card(inner) {
  removeAll(".beppa-card, .beppa-hi");
  const el = document.createElement("div");
  el.className = "beppa-card no-scrollbar";
  el.setAttribute("data-testid", "beppa-definition-card");
  el.innerHTML = `<button class="beppa-x" data-testid="beppa-card-close" aria-label="Chiudi">×</button>${inner}`;
  el.querySelector(".beppa-x").onclick = () => el.remove();
  phone.appendChild(el);
  return el;
}
const more = (url) => `<a class="btn-gold" href="${esc(url)}" target="_blank" rel="noopener noreferrer" data-testid="beppa-more-link">More ↗</a>`;

async function ask(word) {
  const el = card(`<div class="beppa-head">${avatar()}<div><small>Beppa dice</small><p class="beppa-word">${esc(word)}</p></div></div>
    <p class="beppa-say" data-testid="beppa-loading">Aspetta che sfoglio il vocabolario<span class="beppa-dots"><span>.</span><span>.</span><span>.</span></span></p>`);
  const key = word.toLowerCase();
  let r = cache.get(key);
  if (!r) {
    try {
      const res = await fetch(`/api/beppa?parola=${encodeURIComponent(word)}`);
      r = { ok: res.ok, status: res.status, d: await res.json() };
      if (res.ok || res.status === 404) cache.set(key, r);
    } catch { r = { ok: false, status: 0, d: {} }; }
  }
  if (!el.isConnected) return;
  const { d } = r;
  el.innerHTML = r.ok
    ? `<button class="beppa-x" data-testid="beppa-card-close" aria-label="Chiudi">×</button>
      <div class="beppa-head">${avatar()}<div><small>Beppa dice</small><p class="beppa-word" data-testid="beppa-word">${esc(d.parola)}</p>${d.categoria ? `<p class="beppa-cat">${esc(d.categoria)}</p>` : ""}</div></div>
      <ol class="beppa-defs" data-testid="beppa-definitions">${d.definizioni.map((t, i) => `<li><b>${i + 1}</b><span>${esc(t)}</span></li>`).join("")}</ol>
      <div class="beppa-foot"><span class="beppa-src">Fonte: ${esc(d.fonte)}</span>${more(d.url)}</div>`
    : `<button class="beppa-x" data-testid="beppa-card-close" aria-label="Chiudi">×</button>
      <div class="beppa-head">${avatar()}<div><small>Beppa dice</small><p class="beppa-word">${esc(word)}</p></div></div>
      <p class="beppa-say" data-testid="beppa-error">${r.status === 404 ? "Mmm… questa parola non la trovo nemmeno io! Prova a cercarla direttamente su Treccani." : "Non riesco a raggiungere il vocabolario. Riprova tra poco!"}</p>
      <div class="beppa-foot"><span class="beppa-src">Treccani</span>${more(d.url || `https://www.treccani.it/vocabolario/ricerca/${encodeURIComponent(word)}/`)}</div>`;
  el.querySelector(".beppa-x").onclick = () => el.remove();
}
})();
