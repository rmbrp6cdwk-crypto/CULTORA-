// Vercel: /api/beppa?parola=... → significato riassunto dal Vocabolario Treccani (riserva: Wikizionario)
const UA = { "User-Agent": "Mozilla/5.0 (compatible; Cultora/1.0)" };
const slug = (w) => w.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z]/g, "");
const strip = (h) => h.replace(/<sup>[\s\S]*?<\/sup>/g, "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
  .replace(/\s+/g, " ").replace(/\s+([,.;:)\]])/g, "$1").replace(/([(\[])\s+/g, "$1").trim();
const cut = (s, n) => (s.length <= n ? s : s.slice(0, s.lastIndexOf(" ", n - 1)) + "…");

async function treccani(w) {
  for (const s of [w, `${w}1`]) {
    const r = await fetch(`https://www.treccani.it/vocabolario/${s}/`, { headers: UA, redirect: "manual", signal: AbortSignal.timeout(8000) });
    if (r.status !== 200) continue;
    const m = (await r.text()).match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    const html = m && JSON.parse(m[1]).props?.pageProps?.data?.content;
    if (html) return riassumi(html, `https://www.treccani.it/vocabolario/${s}/`, w);
  }
  return null;
}

function riassumi(html, url, w) {
  const titolo = strip(html.match(/<span class="tc-title">([\s\S]*?)<\/span>/)?.[1] || w).replace(/\d+$/, "");
  html = html.replace(/<span class="tc-title">[\s\S]*?<\/span>/, "").replace(/<div class="thumb[\s\S]*?<\/div><\/div><\/div>/g, "").replace(/<a class="imglink"[\s\S]*?<\/a>/g, "");
  if (!html.includes("–")) return mappa(html, url, titolo);
  const i = html.indexOf("–");
  const head = i > 0 ? html.slice(0, i) : "", body = i > 0 ? html.slice(i + 1) : html;
  const parola = strip(head.match(/<b>([\s\S]*?)<\/b>/)?.[1] || "") || titolo;
  const categoria = strip(head.replace(/<b>[\s\S]*?<\/b>/, "")).replace(/\[[^\]]*\]/g, "").replace(/[\s.]+$/, ".").replace(/\s+/g, " ").trim();
  const definizioni = body.split(/<b>\s*(?:\d+\s*\.(?:\s*[a-z]\s*\.)?|[a-z]\s*\.)\s*<\/b>/)
    .map((s) => strip(s).split(/:\s/)[0].replace(/^[–\s]+|[;,\s]+$/g, ""))
    .filter((s) => s.length > 3).slice(0, 3).map((s) => cut(s, 180));
  const sup = /^[\d¹²³⁴⁵⁶⁷⁸⁹\s]+|[\d¹²³⁴⁵⁶⁷⁸⁹]+$/g;
  return definizioni.length ? { fonte: "Treccani", parola: parola.replace(sup, ""), categoria: cut(categoria.replace(sup, ""), 60), definizioni, url } : null;
}

// Alcune parole comuni su Treccani hanno solo la "mappa" del Thesaurus: "1. ANDARE significa…"
function mappa(html, url, w) {
  const definizioni = html.split(/<b>\s*\d+\.[^<]*<\/b>/).slice(1)
    .map((s) => strip(s).split(/[;(]|\.\s/)[0].trim().replace(/^./, (c) => c.toUpperCase()))
    .filter((s) => s.length > 3).slice(0, 3).map((s) => cut(s, 180));
  return definizioni.length ? { fonte: "Treccani", parola: w, categoria: "", definizioni, url } : null;
}

async function wikizionario(w) {
  const r = await fetch(`https://it.wiktionary.org/w/api.php?action=parse&format=json&prop=wikitext&redirects=1&page=${encodeURIComponent(w)}`, { headers: UA, signal: AbortSignal.timeout(8000) });
  const text = (await r.json()).parse?.wikitext?.["*"];
  const it = text?.split(/^== \{\{-it-\}\} ==$/m)[1]?.split(/^== \{\{-/m)[0];
  if (!it) return null;
  const pulisci = (s) => s.replace(/\{\{Term\|([^|}]+)[^}]*\}\}/g, "($1)").replace(/\{\{Est\}\}/g, "(per estensione)").replace(/\{\{Fig\}\}/g, "(figurato)")
    .replace(/\{\{[^}]*\}\}/g, "").replace(/\[\[(?:[^\]|]*\|)?([^\]]+)\]\]/g, "$1").replace(/'{2,}/g, "").replace(/\s+/g, " ").trim();
  const righe = it.split("\n").filter((l) => /^#(?![*:])/.test(l));
  const lemma = righe.map((l) => l.match(/ di \[\[([^\]|#]+)/)?.[1]).find(Boolean);
  const definizioni = righe.map((l) => pulisci(l.slice(1))).filter((s) => s.length > 2).slice(0, 3).map((s) => cut(s, 180));
  return { lemma, definizioni };
}

module.exports = async (req, res) => {
  const parola = String(req.query.parola || "").trim().slice(0, 40);
  const w = slug(parola);
  if (w.length < 2) return res.status(400).json({ errore: "Parola non valida" });
  try {
    let d = await treccani(w);
    let wz = null;
    if (!d) {
      wz = await wikizionario(parola.toLowerCase()).catch(() => null);
      if (wz?.lemma) d = await treccani(slug(wz.lemma));
    }
    if (!d && wz?.definizioni.length) {
      d = { fonte: "Wikizionario", parola: wz.lemma || parola.toLowerCase(), categoria: "", definizioni: wz.definizioni, url: `https://www.treccani.it/vocabolario/${slug(wz.lemma || parola)}/` };
    }
    res.setHeader("Cache-Control", "s-maxage=604800, stale-while-revalidate");
    if (!d) return res.status(404).json({ errore: "Parola non trovata", url: `https://www.treccani.it/vocabolario/${w}/` });
    res.status(200).json(d);
  } catch {
    res.status(502).json({ errore: "Vocabolario non raggiungibile" });
  }
};
