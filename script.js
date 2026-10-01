(() => {
"use strict";

const API = "https://it.wikipedia.org/w/api.php";
const REST = "https://it.wikipedia.org/api/rest_v1";
const SAVED_KEY = "cultora_leggi_dopo";
const RECENT_KEY = "cultora_recent_searches";

/* ---------- Icone (Lucide, inline SVG) ---------- */
const ICONS = {
  sparkles: '<path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.13-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.13a.5.5 0 0 1 .96 0L14.06 8.5A2 2 0 0 0 15.5 9.94l6.13 1.58a.5.5 0 0 1 0 .96L15.5 14.06a2 2 0 0 0-1.44 1.44l-1.58 6.13a.5.5 0 0 1-.96 0z"/>',
  atom: '<circle cx="12" cy="12" r="1"/><path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/><path d="M15.7 15.7c4.52-4.54 6.54-9.870 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/>',
  landmark: '<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/>',
  palette: '<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.55-2.5 5.55-5.55C21.97 6.01 17.46 2 12 2z"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
  orbit: '<circle cx="12" cy="12" r="3"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><path d="M10.4 21.9a10 10 0 0 0 9.94-15.42"/><path d="M13.5 2.1a10 10 0 0 0-9.84 15.42"/>',
  cpu: '<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/>',
  bulb: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>',
  book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>',
  volume: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>',
  mute: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/>',
  external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  arrowUpRight: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  loader: '<path d="M21 12a9 9 0 1 1-6.22-8.56"/>',
  rotate: '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>'
};
const icon = (name, cls = "") =>
  `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

/* ---------- Categorie ---------- */
const CATS = [
  { id: "tutto", label: "Tutto", icon: "sparkles", color: "#F5B83D" },
  { id: "scienza", label: "Scienza", icon: "atom", color: "#22D3EE",
    seeds: ["fisica", "chimica", "biologia", "matematica", "teorema", "genetica", "evoluzione", "particella", "esperimento scientifico", "cellula"],
    kw: /fisic|chimic|biolog|scienz|matematic|teorem|genetic|molecol|cellul|atom|medicin/gi,
    hooks: ["{t}, spiegato in 30 secondi", "{t}: la scienza che non ti aspetti", "{t}: cosa ci insegna"] },
  { id: "storia", label: "Storia", icon: "landmark", color: "#F59E0B",
    seeds: ["impero", "battaglia", "rivoluzione", "dinastia", "antica Roma", "medioevo", "faraone", "trattato di pace", "civiltà antica", "regno"],
    kw: /impero|battaglia|guerra|regno|dinastia|rivoluzion|secolo|medieval|imperator|trattato|sovran/gi,
    hooks: ["{t}: la storia che pochi conoscono", "{t}: un viaggio nel tempo", "{t}: quando la storia lascia il segno"] },
  { id: "arte", label: "Arte", icon: "palette", color: "#FB7185",
    seeds: ["pittore", "affresco", "scultura", "rinascimento", "barocco", "impressionismo", "cattedrale", "museo", "architetto", "dipinto"],
    kw: /pittor|dipint|affresc|scultur|architett|museo|chiesa|cattedrale|barocc|rinasciment/gi,
    hooks: ["{t}: un capolavoro da scoprire", "{t}: dietro le quinte dell'arte", "{t}: bellezza da guardare da vicino"] },
  { id: "natura", label: "Natura", icon: "leaf", color: "#34D399",
    seeds: ["oceano", "vulcano", "foresta pluviale", "mammiferi", "uccelli", "deserto", "ghiacciaio", "barriera corallina", "insetti", "parco nazionale"],
    kw: /specie|animal|piant|mammifer|uccell|ocean|mare|fiume|lago|vulcan|montagn|forest|desert|clima/gi,
    hooks: ["{t}: la natura sa sorprendere", "{t}: una meraviglia del pianeta", "{t}: un viaggio nella natura"] },
  { id: "scoperte", label: "Scoperte", icon: "compass", color: "#FDBA74",
    seeds: ["scoperta", "invenzione", "esploratore", "spedizione", "scavo archeologico", "brevetto", "reperto", "navigatore", "manoscritto", "tomba"],
    kw: /scopert|invenzion|inventat|esplorator|spedizion|archeolog|reperto|brevett/gi,
    hooks: ["{t}: una scoperta da raccontare", "{t}: un'avventura da conoscere", "{t}: il mistero svelato"] },
  { id: "spazio", label: "Spazio", icon: "orbit", color: "#818CF8",
    seeds: ["pianeta", "galassia", "nebulosa", "buco nero", "missione spaziale", "astronauta", "cometa", "stella", "satellite naturale", "telescopio"],
    kw: /pianet|stell|galassi|astronom|spazial|orbit|nebulos|comet|satellit|NASA/gi,
    hooks: ["{t}: lassù nel cosmo", "{t}, tra le stelle", "{t}: guardando in alto"] },
  { id: "tecnologia", label: "Tecnologia", icon: "cpu", color: "#60A5FA",
    seeds: ["computer", "algoritmo", "macchina a vapore", "ingegneria", "robot", "telecomunicazioni", "aeroplano", "internet", "transistor", "ferrovia"],
    kw: /tecnolog|computer|informatic|ingegner|software|macchina|motore|elettronic|aereo|ferrovi|internet/gi,
    hooks: ["{t}: come funziona davvero", "{t}: l'ingegno umano all'opera", "{t}: un'idea che ha cambiato le regole"] },
  { id: "filosofia", label: "Filosofia", icon: "bulb", color: "#C4B5FD",
    seeds: ["filosofo", "etica", "stoicismo", "illuminismo", "logica", "metafisica", "esistenzialismo", "scuola filosofica", "paradosso", "utopia"],
    kw: /filosof|etica|pensiero|logica|metafisic|teologi/gi,
    hooks: ["{t}: un'idea che fa pensare", "{t}: pensare in grande", "{t}: la domanda dietro tutto"] },
  { id: "letteratura", label: "Letteratura", icon: "book", color: "#FCD34D",
    seeds: ["romanzo", "poeta", "poema epico", "mitologia", "tragedia greca", "scrittore", "fiaba", "leggenda", "saga", "poesia"],
    kw: /romanz|poet|poesi|scrittor|letterar|libro|raccont|mitolog|leggend|tragedi/gi,
    hooks: ["{t}: una storia da leggere", "{t}: tra le pagine", "{t}: un fascino senza tempo"] },
  { id: "musica", label: "Musica", icon: "music", color: "#F472B6",
    seeds: ["compositore", "opera lirica", "sinfonia", "strumento musicale", "jazz", "musica barocca", "orchestra", "melodramma", "genere musicale", "violino"],
    kw: /music|compositor|opera lirica|sinfoni|album|cantant|orchestr|melodramm|strumento/gi,
    hooks: ["{t}: la colonna sonora della storia", "{t}: da ascoltare", "{t}: la storia in musica"] }
];
const DEFAULT_HOOKS = ["{t}: lo sapevi?", "{t}: il lato sorprendente", "{t}: cosa c'è da sapere", "{t}, in 30 secondi", "{t}: una curiosità al giorno"];
const SUGGESTIONS = ["oceani", "rinascimento", "buco nero", "antico Egitto", "vulcani", "Leonardo da Vinci", "dinosauri", "jazz", "samurai", "piramide", "mitologia", "Marte"];
const FALLBACKS = [
  "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?crop=entropy&cs=srgb&fm=jpg&q=80&w=1080",
  "https://images.unsplash.com/photo-1566410824233-a8011929225c?crop=entropy&cs=srgb&fm=jpg&q=80&w=1080",
  "https://images.unsplash.com/photo-1609083590460-7b8cc0ca65f8?crop=entropy&cs=srgb&fm=jpg&q=80&w=1080"
];
const getCat = (id) => CATS.find((c) => c.id === id) || CATS[0];

/* ---------- Utility ---------- */
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const fallback = (key = "") => FALLBACKS[hash(key) % FALLBACKS.length];
const truncate = (s, n) => (s.length <= n ? s : s.slice(0, s.lastIndexOf(" ", n - 1)).replace(/[,;:]$/, "") + "…");
const cleanText = (s) => s.replace(/\s*\([^()]*\)/g, "").replace(/\s*\[[^\]]*\]/g, "").replace(/\s+/g, " ").replace(/\s+([,.;:])/g, "$1").trim();
const sentences = (s) => s.split(/(?<=[.!?])\s+(?=[A-ZÀ-Ý«"])/).map((x) => x.trim()).filter((x) => x.length > 15);
const readJSON = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };

/* ---------- Wikipedia API ---------- */
async function wiki(params) {
  const url = new URL(API);
  Object.entries({ format: "json", origin: "*", ...params }).forEach(([k, v]) => url.searchParams.set(k, v));
  const r = await fetch(url);
  if (!r.ok) throw new Error("Wikipedia non raggiungibile");
  return r.json();
}

async function wikiSearch(search, limit, offset = 0, random = false) {
  const p = {
    action: "query", generator: "search", gsrsearch: search, gsrlimit: limit, gsrnamespace: 0, gsroffset: offset,
    prop: "extracts|pageimages|info", exintro: 1, explaintext: 1, exlimit: "max",
    piprop: "thumbnail", pithumbsize: 1080, inprop: "url"
  };
  if (random) p.gsrsort = "random";
  const j = await wiki(p);
  const pages = Object.values(j.query?.pages || {}).sort((a, b) => (a.index || 0) - (b.index || 0));
  return { pages, next: j.continue?.gsroffset ?? null };
}

const good = (p, min = 250) => {
  const ex = p.extract || "";
  return ex.length >= min && !ex.includes("può riferirsi a") && !/disambigua/i.test(p.title);
};

function guessCategory(text, fb) {
  let best = fb, score = 0;
  CATS.slice(1).forEach((c) => { const n = (text.match(c.kw) || []).length; if (n > score) { score = n; best = c.id; } });
  return best;
}

// Titolo accattivante senza AI: superlativi dal testo oppure template per categoria
function makeHook(title, extract, cat) {
  const t = title.replace(/\s*\([^)]*\)$/, "");
  const m = cleanText(extract).match(/\b(?:è|fu|era|sono|furono)\s+(?:stat[oaie]\s+)?((?:il|la|lo|l'|i|gli|le|uno dei|una delle|uno degli)\s*(?:primo|prima|primi|prime|più\s+\S+|unico|unica|maggiore|maggiori|massimo|ultimo|ultima|principale|celebre|famos[oa])[^,.;:]{3,60})/i);
  if (m) {
    let s = m[1].trim();
    if (s.length > 50) s = s.slice(0, s.lastIndexOf(" ", 50));
    const h = `${t}: ${s}`;
    if (h.length <= 90) return h;
  }
  const pool = [...(getCat(cat).hooks || []), ...DEFAULT_HOOKS];
  return pool[hash(title) % pool.length].replace("{t}", t);
}

function buildPill(p, kind, cat) {
  const extract = p.extract || "";
  const sents = sentences(cleanText(extract));
  const rest = sents.slice(2);
  const facts = [...rest.filter((s) => /\d/.test(s)), ...rest].filter((v, i, a) => a.indexOf(v) === i).slice(0, 3).map((s) => truncate(s, 120));
  return {
    key: `page-${p.pageid}`, pageid: p.pageid, wiki_title: p.title,
    hook: makeHook(p.title, extract, cat),
    pill: truncate(sents.slice(0, 2).join(" ") || cleanText(extract), 280),
    category: cat, facts, image: p.thumbnail?.source || null,
    url: p.fullurl || `https://it.wikipedia.org/?curid=${p.pageid}`, kind
  };
}

// Casualità: seed casuale + pagina di risultati casuale (veloce) oppure ordinamento random di Wikipedia (più lento)
async function randomSearch(q, fast) {
  if (!fast && Math.random() < 0.5) return wikiSearch(q, 20, 0, true);
  const r = await wikiSearch(q, 20, Math.floor(Math.random() * 8) * 20);
  return r.pages.length ? r : wikiSearch(q, 20, 0);
}

async function fetchDiscover(category, count, fast) {
  const cats = category === "tutto" ? shuffle(CATS.slice(1).map((c) => c.id)).slice(0, 4) : [category, category, category];
  const results = await Promise.all(cats.map((c) => {
    const s = pick(getCat(c).seeds);
    return randomSearch(Math.random() < 0.35 ? s : `intitle:"${s}"`, fast).catch(() => null);
  }));
  if (results.every((r) => r === null)) throw new Error("offline");
  const cand = [];
  results.forEach((r, i) => {
    if (!r) return;
    const ok = r.pages.filter((p) => good(p) && (p.length || 0) > 5000)
      .sort((a, b) => (!a.thumbnail - !b.thumbnail) || (b.length - a.length));
    cand.push(...ok.slice(0, 4).map((p) => [cats[i], p]));
  });
  const seen = new Set();
  let picked = shuffle(cand).filter(([, p]) => !seen.has(p.pageid) && seen.add(p.pageid));
  picked = shuffle(picked.sort((a, b) => !a[1].thumbnail - !b[1].thumbnail).slice(0, count));
  return { items: picked.map(([c, p]) => buildPill(p, "random", c)), next: null };
}

async function fetchSearch(q, offset) {
  let r = await wikiSearch(`intitle:${q}`, 10, offset);
  if (!r.pages.length && offset === 0) r = await wikiSearch(q, 10, 0);
  const items = r.pages.filter((p) => good(p, 120)).map((p) => buildPill(p, "search", guessCategory(p.extract || "", "scoperte")));
  return { items, next: r.next };
}

let otdEvents = null;
async function fetchOtd(offset) {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0"), dd = String(now.getDate()).padStart(2, "0");
  if (!otdEvents) {
    const r = await fetch(`${REST}/feed/onthisday/events/${mm}/${dd}`);
    if (!r.ok) throw new Error("onthisday");
    const j = await r.json();
    otdEvents = shuffle((j.events || []).filter((e) => e.pages?.length));
  }
  const dateLabel = now.toLocaleDateString("it-IT", { day: "numeric", month: "long" });
  const items = otdEvents.slice(offset, offset + 5).map((e, i) => {
    const page = e.pages.find((p) => p.thumbnail) || e.pages[0];
    const extract = page.extract || "";
    const years = now.getFullYear() - Number(e.year);
    const others = e.pages.filter((p) => p !== page).slice(0, 3).map((p) => p.titles?.normalized || p.title);
    const facts = [`Accaduto il ${dateLabel} ${e.year}`];
    if (years > 0) facts.push(`Sono passati ${years.toLocaleString("it-IT")} anni`);
    if (others.length) facts.push(`Voci collegate: ${others.join(", ")}`);
    return {
      key: `otd-${mm}${dd}-${offset + i}`, pageid: page.pageid,
      wiki_title: page.titles?.normalized || page.title,
      hook: truncate(e.text.replace(/\s+/g, " "), 95),
      pill: truncate(sentences(cleanText(extract)).slice(0, 2).join(" ") || e.text, 280),
      category: guessCategory(`${e.text} ${extract}`, "storia"), facts,
      image: (page.originalimage || page.thumbnail || {}).source || null,
      url: page.content_urls?.desktop?.page || "https://it.wikipedia.org",
      year: String(e.year), kind: "otd"
    };
  });
  return { items, next: offset + 5 < otdEvents.length ? offset + 5 : null };
}

const SKIP = new Set(["note", "bibliografia", "voci correlate", "collegamenti esterni", "altri progetti", "fonti", "riferimenti", "letture consigliate", "filmografia", "discografia"]);
async function fetchArticle(title) {
  const [j, rel] = await Promise.all([
    wiki({ action: "query", titles: title, redirects: 1, prop: "extracts|pageimages|info", explaintext: 1, piprop: "original", inprop: "url" }),
    wikiSearch(`morelike:${title}`, 4).catch(() => ({ pages: [] }))
  ]);
  const p = Object.values(j.query?.pages || {})[0];
  if (!p || "missing" in p) throw new Error("Voce non trovata");
  const parts = (p.extract || "").split(/\n(={2,})\s*(.+?)\s*\1\n/);
  const sections = [{ heading: null, level: 2, text: parts[0].trim() }];
  for (let i = 1; i < parts.length - 2; i += 3) {
    const heading = parts[i + 1], text = (parts[i + 2] || "").trim();
    if (!SKIP.has(heading.toLowerCase()) && text) sections.push({ heading, level: parts[i].length, text });
  }
  return {
    title: p.title, url: p.fullurl, image: p.original?.source || null,
    sections: sections.filter((s) => s.text).slice(0, 25),
    related: rel.pages.map((x) => ({ title: x.title, image: x.thumbnail?.source || null }))
  };
}

/* ---------- Stato ---------- */
const state = { tab: "feed", category: "tutto", query: "", editing: false, saved: readJSON(SAVED_KEY, []), speaking: null };
const itemsByKey = new Map();
const phone = $("#phone");
let sheet = null;

const isSaved = (key) => state.saved.some((s) => s.key === key);
function persistSaved() {
  localStorage.setItem(SAVED_KEY, JSON.stringify(state.saved));
  renderNav();
  if (state.tab === "saved") renderSaved();
}
function toggleSave(item) {
  const exists = isSaved(item.key);
  state.saved = exists ? state.saved.filter((s) => s.key !== item.key) : [{ ...item, saved_at: Date.now() }, ...state.saved];
  persistSaved();
  refreshSaveButtons(item.key);
  return !exists;
}
function refreshSaveButtons(key) {
  const on = isSaved(key);
  document.querySelectorAll(`[data-save-key="${key}"]`).forEach((b) => {
    b.classList.toggle("on", on);
    const l = b.querySelector(".rail-label");
    if (l) l.textContent = on ? "Salvato" : "Leggi dopo";
  });
}

let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ---------- Audio (Web Speech API) ---------- */
function speak(item) {
  const synth = window.speechSynthesis;
  if (!synth) return toast("Lettura vocale non supportata");
  synth.cancel();
  const prev = state.speaking;
  state.speaking = prev === item.key ? null : item.key;
  if (state.speaking) {
    const u = new SpeechSynthesisUtterance(`${item.hook}. ${item.pill}`);
    u.lang = "it-IT";
    u.rate = 1.02;
    u.onend = () => { if (state.speaking === item.key) { state.speaking = null; refreshSpeak(item.key); } };
    synth.speak(u);
  }
  if (prev) refreshSpeak(prev);
  refreshSpeak(item.key);
}
const speakInner = (on) => `<span class="rail-circle">${icon(on ? "mute" : "volume")}</span><span class="rail-label">${on ? "Stop" : "Ascolta"}</span>`;
function refreshSpeak(key) {
  document.querySelectorAll(`[data-speak-key="${key}"]`).forEach((b) => {
    const on = state.speaking === key;
    b.classList.toggle("on", on);
    b.innerHTML = speakInner(on);
  });
}

async function share(item) {
  try {
    if (navigator.share) await navigator.share({ title: item.hook, text: item.pill, url: item.url });
    else { await navigator.clipboard.writeText(`${item.hook} — ${item.url}`); toast("Link copiato negli appunti"); }
  } catch { /* condivisione annullata */ }
}

/* ---------- Template ---------- */
function cardHTML(item, i) {
  const c = getCat(item.category), img = item.image || fallback(item.key), saved = isSaved(item.key), k = esc(item.key);
  return `<article class="card" data-index="${i}" data-testid="feed-card-item">
    <img class="card-blur" src="${esc(img)}" alt="" aria-hidden="true">
    <img class="card-img" src="${esc(img)}" alt="${esc(item.wiki_title)}" loading="${i < 2 ? "eager" : "lazy"}" onerror="this.onerror=null;this.src='${fallback(item.key)}'">
    <div class="card-shade"></div><div class="card-top-shade"></div>
    <div class="rail">
      <button class="rail-btn ${saved ? "on" : ""}" data-action="save" data-key="${k}" data-save-key="${k}" data-testid="action-heart-button" aria-label="Leggi dopo">
        <span class="rail-circle">${icon("bookmark", "ic-fill")}</span><span class="rail-label">${saved ? "Salvato" : "Leggi dopo"}</span>
      </button>
      <button class="rail-btn" data-action="share" data-key="${k}" data-testid="action-share-button" aria-label="Condividi">
        <span class="rail-circle">${icon("share")}</span><span class="rail-label">Condividi</span>
      </button>
      <button class="rail-btn ${state.speaking === item.key ? "on" : ""}" data-action="speak" data-key="${k}" data-speak-key="${k}" data-testid="action-audio-button" aria-label="Ascolta">${speakInner(state.speaking === item.key)}</button>
      <a class="rail-btn" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer" data-testid="action-wikipedia-link" aria-label="Wikipedia">
        <span class="rail-circle">${icon("external")}</span><span class="rail-label">Wikipedia</span>
      </a>
    </div>
    <div class="card-content">
      <div class="badges">
        <span class="badge" data-testid="card-category-badge" style="color:${c.color};border-color:${c.color}55;background:${c.color}1a">${icon(c.icon, "ic-sm")} ${c.label}</span>
        ${item.year ? `<span class="badge badge-year" data-testid="card-year-badge">${icon("calendar", "ic-sm")} ${esc(item.year)}</span>` : ""}
      </div>
      <button class="card-title" data-action="open" data-key="${k}" data-testid="card-catchy-title">${esc(item.hook)}</button>
      <p class="card-pill" data-testid="card-summary-pill">${esc(item.pill)}</p>
      <div class="card-foot">
        <span class="card-source">Wikipedia · <span>${esc(item.wiki_title)}</span></span>
        <button class="btn-gold" data-action="open" data-key="${k}" data-testid="card-read-more-button">Approfondisci ${icon("arrowUpRight", "ic-md")}</button>
      </div>
    </div>
  </article>`;
}

const skeletonHTML = () => `<div class="skeleton" data-testid="feed-loading"><div class="shimmer"></div><div class="sk-lines">
  <div class="sk sk-badge"></div><div class="sk sk-t1"></div><div class="sk sk-t2"></div><div class="sk sk-l"></div><div class="sk sk-l2"></div>
  <div class="sk-label">${icon("loader", "ic-md spin")} Sto cercando pillole curiose…</div></div></div>`;

const errorHTML = (feedId) => `<div class="feed-status"><div class="inner">
  <p data-testid="feed-error">Impossibile caricare le pillole. Riprova.</p>
  <button class="btn-soft" data-action="retry" data-feed="${feedId}" data-testid="feed-retry-button">${icon("rotate", "ic-md")} Riprova</button></div></div>`;

const endHTML = (hasItems, text) => `<div class="feed-status" data-testid="feed-end"><div class="inner">
  ${icon("flag", "ic-lg")}<h3>${hasItems ? "Hai visto tutto!" : "Nessun risultato"}</h3><p>${esc(text)}</p></div></div>`;

/* ---------- Feed infinito ---------- */
function createFeed(id, el, fetchPage, { infinite = false, emptyText = () => "" } = {}) {
  const f = { el, items: [], keys: new Set(), offset: 0, loading: false, done: false, gen: 0, retries: 0, started: false };
  let obs;
  const observe = () => {
    obs = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setActive(+e.target.dataset.index)), { root: el, threshold: 0.6 });
  };
  observe();

  function setActive(i) {
    el.querySelectorAll(".card.active").forEach((c) => c.classList.remove("active"));
    el.querySelector(`.card[data-index="${i}"]`)?.classList.add("active");
    if (i >= f.items.length - 3) f.load();
  }

  f.load = async () => {
    if (f.loading || f.done) return;
    f.started = true;
    f.loading = true;
    const gen = f.gen;
    el.querySelectorAll(".feed-status").forEach((n) => n.remove());
    el.insertAdjacentHTML("beforeend", skeletonHTML());
    let fresh = [];
    try {
      const data = await fetchPage(f.offset, f.items.length === 0);
      if (gen !== f.gen) return;
      el.querySelector(".skeleton")?.remove();
      fresh = data.items.filter((it) => !f.keys.has(it.key));
      const start = f.items.length;
      fresh.forEach((it, n) => {
        f.keys.add(it.key);
        f.items.push(it);
        itemsByKey.set(it.key, it);
        el.insertAdjacentHTML("beforeend", cardHTML(it, start + n));
        obs.observe(el.lastElementChild);
      });
      if (!infinite) {
        if (data.next == null) f.done = true;
        else f.offset = data.next;
      }
      if (f.done) el.insertAdjacentHTML("beforeend", endHTML(f.items.length > 0, emptyText()));
      if (start === 0 && fresh.length) setActive(0);
    } catch {
      if (gen !== f.gen) return;
      el.querySelector(".skeleton")?.remove();
      el.insertAdjacentHTML("beforeend", errorHTML(id));
    } finally {
      if (gen === f.gen) {
        f.loading = false;
        if (!fresh.length && !f.done && !el.querySelector(".feed-status") && f.retries++ < 3) f.load();
        else if (fresh.length) f.retries = 0;
      }
    }
  };

  f.reset = () => {
    f.gen++;
    obs.disconnect();
    observe();
    Object.assign(f, { items: [], keys: new Set(), offset: 0, loading: false, done: false, retries: 0 });
    el.innerHTML = "";
    el.scrollTop = 0;
    f.load();
  };

  f.retry = () => { el.querySelectorAll(".feed-status").forEach((n) => n.remove()); f.load(); };
  return f;
}

const feeds = {
  discover: createFeed("discover", $("#feed-discover"), (_, first) => fetchDiscover(state.category, first ? 4 : 6, first), { infinite: true }),
  otd: createFeed("otd", $("#feed-otd"), (offset) => fetchOtd(offset), { emptyText: () => "Torna domani per nuovi anniversari." }),
  search: createFeed("search", $("#feed-search"), (offset) => fetchSearch(state.query, offset), { emptyText: () => `Prova un altro argomento oltre a “${state.query}”.` })
};

/* ---------- Pannelli ---------- */
function renderSearchPanel() {
  const recent = readJSON(RECENT_KEY, []);
  $("#search-panel").innerHTML = `<div class="glow"></div>
    <h1>Cosa vuoi <em>scoprire</em> oggi?</h1>
    <p class="sub">Scrivi un argomento: il feed ti proporrà solo voci di Wikipedia a tema.</p>
    <form class="search-form" id="search-form">
      ${icon("search")}
      <input id="search-input" data-testid="search-input-field" value="${esc(state.query)}" placeholder="es. oceani, impero romano…" autocomplete="off" />
      <button class="search-go" type="submit" data-testid="search-submit-button" aria-label="Cerca">${icon("arrowRight")}</button>
    </form>
    ${recent.length ? `<h2 class="section-label">Recenti</h2><div>${recent.map((r, i) =>
      `<button class="recent" data-action="suggest" data-q="${esc(r)}" data-testid="search-recent-${i}">${icon("history", "ic-md")} ${esc(r)}</button>`).join("")}</div>` : ""}
    <h2 class="section-label">Prova con</h2>
    <div class="suggest-wrap">${SUGGESTIONS.map((s, i) =>
      `<button class="suggest" data-action="suggest" data-q="${esc(s)}" data-testid="search-suggestion-${i}">${esc(s)}</button>`).join("")}</div>`;
  setTimeout(() => $("#search-input")?.focus(), 50);
}

function submitSearch(value) {
  const v = value.trim();
  if (v.length < 2) return;
  const recent = readJSON(RECENT_KEY, []);
  localStorage.setItem(RECENT_KEY, JSON.stringify([v, ...recent.filter((r) => r !== v)].slice(0, 6)));
  state.query = v;
  state.editing = false;
  feeds.search.reset();
  update();
}

function renderSaved() {
  const s = state.saved;
  s.forEach((it) => itemsByKey.set(it.key, it));
  const n = s.length;
  $("#saved-panel").innerHTML = `<h1>Leggi dopo</h1>
    <p class="sub">${n ? `${n} pillol${n === 1 ? "a" : "e"} salvat${n === 1 ? "a" : "e"} su questo dispositivo` : "Le pillole che salvi appariranno qui."}</p>
    ${n ? "" : `<div class="empty" data-testid="saved-empty-state">${icon("bookmark", "ic-lg")}<p>Tocca l'icona del segnalibro su una pillola per salvarla e leggerla con calma.</p></div>`}
    <ul class="saved-list">${s.map((it) => {
      const c = getCat(it.category);
      return `<li class="saved-item" data-testid="saved-item">
        <button class="saved-open" data-action="open" data-key="${esc(it.key)}" data-testid="saved-item-open">
          <img src="${esc(it.image || fallback(it.key))}" alt="">
          <div class="saved-text">
            <span class="saved-cat" style="color:${c.color}">${c.label}${it.year ? ` · ${esc(it.year)}` : ""}</span>
            <p class="saved-title">${esc(it.hook)}</p>
            <p class="saved-wiki">${esc(it.wiki_title)}</p>
          </div>
        </button>
        <button class="saved-remove" data-action="remove" data-key="${esc(it.key)}" data-testid="saved-item-remove" aria-label="Rimuovi">${icon("trash", "ic-md")}</button>
      </li>`;
    }).join("")}</ul>`;
}

/* ---------- Scheda di approfondimento ---------- */
function openSheet(item) {
  if (!item) return;
  sheet?.el.remove();
  const el = document.createElement("div");
  el.className = "sheet";
  el.setAttribute("data-testid", "article-detail-sheet");
  phone.appendChild(el);
  sheet = { el, item, title: item.wiki_title, data: null, error: false };
  loadSheetArticle();
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("open")));
}

function closeSheet() {
  if (!sheet) return;
  const el = sheet.el;
  sheet = null;
  el.classList.remove("open");
  setTimeout(() => el.remove(), 450);
}

async function loadSheetArticle() {
  const s = sheet, title = s.title;
  s.data = null;
  s.error = false;
  renderSheet();
  try {
    const d = await fetchArticle(title);
    if (sheet !== s || s.title !== title) return;
    s.data = d;
  } catch {
    if (sheet !== s || s.title !== title) return;
    s.error = true;
  }
  renderSheet();
}

function renderSheet() {
  const { item, title, data, error, el } = sheet;
  const orig = title === item.wiki_title, c = getCat(item.category);
  const hero = data?.image || (orig && item.image) || fallback(item.key);
  const saved = isSaved(item.key);
  el.innerHTML = `
    <div class="sheet-actions">
      ${orig ? `<button class="round-btn ${saved ? "on" : ""}" data-action="sheet-save" data-testid="article-save-button" aria-label="Leggi dopo">${icon("bookmark", "ic-md ic-fill")}</button>` : ""}
      <button class="round-btn" data-action="sheet-close" data-testid="article-detail-close" aria-label="Chiudi">${icon("x")}</button>
    </div>
    <div class="sheet-scroll no-scrollbar">
      <div class="sheet-hero"><img src="${esc(hero)}" alt="${esc(title)}"></div>
      <div class="sheet-body">
        ${orig ? `<span class="sheet-cat" style="color:${c.color}">${c.label}${item.year ? ` · ${esc(item.year)}` : ""}</span>` : ""}
        <h1 class="sheet-title" data-testid="article-title">${esc(orig ? item.hook : title)}</h1>
        ${orig ? `<p class="sheet-voice">Voce: ${esc(item.wiki_title)}</p>` : ""}
        ${orig && item.facts?.length ? `<div class="facts" data-testid="article-key-facts">
          <p class="facts-head">${icon("sparkles", "ic-md")} In pillole</p>
          <ul>${item.facts.map((f, i) => `<li><b>0${i + 1}</b> ${esc(f)}</li>`).join("")}</ul></div>` : ""}
        ${!data && !error ? `<div class="loading-line" data-testid="article-loading">${icon("loader", "ic-md spin")} Carico l'articolo da Wikipedia…</div>` : ""}
        ${error ? `<p class="err" data-testid="article-error">Impossibile caricare l'articolo.</p>` : ""}
        ${data ? `<div class="article" data-testid="article-body">
          ${data.sections.map((s, i) => `<section>
            ${s.heading ? (s.level > 2 ? `<h3>${esc(s.heading)}</h3>` : `<h2>${esc(s.heading)}</h2>`) : ""}
            ${s.text.split("\n").filter(Boolean).map((para, j) => `<p class="${i === 0 && j === 0 ? "drop" : ""}">${esc(para)}</p>`).join("")}
          </section>`).join("")}
          <a class="wiki-btn" href="${esc(data.url)}" target="_blank" rel="noopener noreferrer" data-testid="article-wikipedia-link">Leggi su Wikipedia ${icon("external", "ic-md")}</a>
          ${data.related.length ? `<h2 class="section-label">Potrebbe interessarti</h2><div class="related">
            ${data.related.map((r, i) => `<button class="rel" data-action="sheet-related" data-title="${esc(r.title)}" data-testid="article-related-${i}">
              <img src="${esc(r.image || fallback(r.title))}" alt=""><span><span>${esc(r.title)}</span>${icon("chevron", "ic-md")}</span></button>`).join("")}
          </div>` : ""}
          ${!orig ? `<button class="back-link" data-action="sheet-back" data-testid="article-back-original">← Torna a “${esc(item.wiki_title)}”</button>` : ""}
        </div>` : ""}
      </div>
    </div>`;
}

/* ---------- Top bar, navigazione, tab ---------- */
function renderChips() {
  $("#chips").innerHTML = CATS.map((c) => {
    const on = c.id === state.category;
    return `<button class="chip ${on ? "on" : ""}" data-action="category" data-cat="${c.id}" data-testid="category-chip-filter-${c.id}" ${on ? `style="background:${c.color}"` : ""}>${icon(c.icon, "ic-sm")} ${c.label}</button>`;
  }).join("");
}

const TABS = [
  { id: "feed", label: "Scopri", icon: "sparkles", testId: "nav-feed-tab" },
  { id: "otd", label: "Accadde oggi", icon: "calendar", testId: "nav-history-tab" },
  { id: "search", label: "Cerca", icon: "search", testId: "nav-search-tab" },
  { id: "saved", label: "Leggi dopo", icon: "bookmark", testId: "nav-saved-tab" }
];
function renderNav() {
  const n = state.saved.length;
  $("#nav").innerHTML = TABS.map((t) => `<button class="nav-btn ${t.id === state.tab ? "on" : ""}" data-action="tab" data-tab="${t.id}" data-testid="${t.testId}">
    <span class="nav-ico">${icon(t.icon)}${t.id === "saved" && n ? `<span class="count" data-testid="saved-count-badge">${n}</span>` : ""}</span>${t.label}</button>`).join("");
}

function update() {
  const { tab, query, editing } = state;
  const showSearchPanel = tab === "search" && (!query || editing);
  $("#feed-discover").classList.toggle("hidden", tab !== "feed");
  $("#feed-otd").classList.toggle("hidden", tab !== "otd");
  $("#feed-search").classList.toggle("hidden", !(tab === "search" && query && !editing));
  if (tab === "otd" && !feeds.otd.started) feeds.otd.load();

  $("#search-panel").classList.toggle("hidden", !showSearchPanel);
  if (showSearchPanel) renderSearchPanel();
  $("#saved-panel").classList.toggle("hidden", tab !== "saved");
  if (tab === "saved") renderSaved();

  $("#chips").classList.toggle("hidden", tab !== "feed");
  $("#otd-label").classList.toggle("hidden", tab !== "otd");
  $("#topic").classList.toggle("hidden", !(tab === "search" && query && !editing));
  $(".topic-edit").innerHTML = `${icon("search", "ic-sm")} ${esc(query)}`;
  renderNav();
}

function setTab(t) {
  state.tab = t;
  state.editing = false;
  update();
}

function visibleFeed() {
  return [...document.querySelectorAll(".feed")].find((f) => !f.classList.contains("hidden"));
}

/* ---------- Eventi ---------- */
phone.addEventListener("click", (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const key = el.dataset.key, item = key && itemsByKey.get(key);
  switch (el.dataset.action) {
    case "open": openSheet(item); break;
    case "save": {
      toast(toggleSave(item) ? "Aggiunto a Leggi dopo" : "Rimosso da Leggi dopo");
      el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop");
      break;
    }
    case "share": share(item); break;
    case "speak": speak(item); break;
    case "category":
      if (el.dataset.cat !== state.category) { state.category = el.dataset.cat; renderChips(); feeds.discover.reset(); }
      break;
    case "tab": setTab(el.dataset.tab); break;
    case "retry": feeds[el.dataset.feed].retry(); break;
    case "suggest": submitSearch(el.dataset.q); break;
    case "edit-query": state.editing = true; update(); break;
    case "clear-query": state.query = ""; update(); break;
    case "remove": state.saved = state.saved.filter((s) => s.key !== key); persistSaved(); refreshSaveButtons(key); break;
    case "sheet-close": closeSheet(); break;
    case "sheet-save": toggleSave(sheet.item); renderSheet(); break;
    case "sheet-related": sheet.title = el.dataset.title; loadSheetArticle(); break;
    case "sheet-back": sheet.title = sheet.item.wiki_title; loadSheetArticle(); break;
  }
});

phone.addEventListener("submit", (e) => {
  if (e.target.id !== "search-form") return;
  e.preventDefault();
  submitSearch($("#search-input").value);
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && sheet) return closeSheet();
  if (!["ArrowDown", "ArrowUp"].includes(e.key) || e.target.tagName === "INPUT" || sheet) return;
  const f = visibleFeed();
  if (!f) return;
  e.preventDefault();
  f.scrollBy({ top: (e.key === "ArrowDown" ? 1 : -1) * f.clientHeight, behavior: "smooth" });
});

/* ---------- Avvio ---------- */
$("#otd-label").textContent = `Accadde il ${new Date().toLocaleDateString("it-IT", { day: "numeric", month: "long" })}`;
$(".topic-clear").innerHTML = icon("x", "ic-sm");
renderChips();
update();
feeds.discover.load();
})();
