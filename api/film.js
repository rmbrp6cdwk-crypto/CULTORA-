javascript
// Vercel: /api/film → film da TMDB (chiave nella variabile TMDB_API_KEY) + Oscar vinti da Wikidata
const T = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/";
const cache = new Map();

function tmdb(path, params = {}) {
  const key = process.env.TMDB_API_KEY || "";
  const bearer = key.startsWith("eyJ");
  const u = new URL(T + path);
  if (!bearer) u.searchParams.set("api_key", key);
  if (!params.language) u.searchParams.set("language", "it-IT");
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== "") u.searchParams.set(k, v);
  const id = u.toString();
  if (cache.has(id)) return cache.get(id);
  if (cache.size > 800) cache.clear();
  const p = fetch(u, { headers: bearer ? { Authorization: `Bearer ${key}` } : {}, signal: AbortSignal.timeout(8000) })
    .then((r) => { if (!r.ok) throw new Error(`TMDB ${r.status}`); return r.json(); });
  cache.set(id, p);
  p.catch(() => cache.delete(id));
  return p;
}

// Film premiati agli Oscar: id TMDB → numero di statuette (Wikidata, P166 + P4947)
let oscarP = null;
function oscars() {
  const q = "SELECT ?tmdb (COUNT(DISTINCT ?a) AS ?n) WHERE { ?f p:P166/ps:P166 ?a . ?a wdt:P31 wd:Q19020 . ?f wdt:P4947 ?tmdb . } GROUP BY ?tmdb";
  oscarP ||= fetch(`https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(q)}`, { headers: { "User-Agent": "Cultora/1.0 (cultora1.vercel.app)" }, signal: AbortSignal.timeout(9000) })
    .then((r) => r.json())
    .then((j) => new Map(j.results.bindings.map((b) => [+b.tmdb.value, +b.n.value])))
    .catch(() => { oscarP = null; return new Map(); });
  return oscarP;
}

const kwIds = new Map();
async function keywordId(name) {
  if (/^\d+$/.test(name)) return name;
  if (!kwIds.has(name)) {
    kwIds.set(name, tmdb("/search/keyword", { query: name, language: "en-US" }).then((j) => {
      const r = j.results || [];
      return (r.find((k) => k.name.toLowerCase() === name.toLowerCase()) || r[0])?.id || null;
    }).catch(() => { kwIds.delete(name); return null; }));
  }
  return kwIds.get(name);
}

const year = (d) => (d ? +d.slice(0, 4) : null);
const card = (m, osc) => ({
  id: m.id, title: m.title, year: year(m.release_date), rating: m.vote_count >= 20 ? Math.round(m.vote_average * 10) / 10 : null,
  img: m.poster_path ? `${IMG}w342${m.poster_path}` : null, genres: m.genre_ids || (m.genres || []).map((g) => g.id),
  oscar: osc.get(m.id) || 0, pop: m.popularity, votes: m.vote_count, date: m.release_date || ""
});

async function discover(q) {
  const page = Math.max(0, +q.page || 0);
  const today = new Date().toISOString().slice(0, 10);
  const sort = { vote: "vote_average.desc", new: "primary_release_date.desc" }[q.sort] || "popularity.desc";
  const kws = (await Promise.all(String(q.kw || "").split("|").filter(Boolean).map(keywordId))).filter(Boolean);
  const d = +q.decade;
  const rt = { short: [0, 100], medium: [100, 140], long: [140, 400] }[q.runtime];
  const base = {
    include_adult: "false", region: "IT",
    with_genres: q.genres, with_people: q.people, with_keywords: kws.join(","), with_origin_country: q.it ? "IT" : "",
    "primary_release_date.gte": d ? `${d}-01-01` : "", "primary_release_date.lte": d ? `${d + 9}-12-31` : today,
    "with_runtime.gte": rt?.[0] || "", "with_runtime.lte": rt?.[1] || "",
    "vote_average.gte": q.top ? 7.5 : "", "vote_count.gte": q.top || q.sort === "vote" ? 300 : q.sort === "new" ? 5 : 30
  };
  const osc = await oscars();
  let results, more;
  if (q.oscar) {
    const pages = await Promise.all([1, 2, 3, 4, 5].map((n) => tmdb("/discover/movie", { ...base, sort_by: "vote_count.desc", page: page * 5 + n }).catch(() => ({ results: [] }))));
    results = pages.flatMap((p) => p.results || []).filter((m) => osc.has(m.id));
    const by = { vote: (a, b) => b.vote_average - a.vote_average, new: (a, b) => (b.release_date || "").localeCompare(a.release_date || "") }[q.sort] || ((a, b) => b.popularity - a.popularity);
    results.sort(by);
    more = (pages[0].total_pages || 0) > page * 5 + 5;
  } else {
    const j = await tmdb("/discover/movie", { ...base, sort_by: sort, page: page + 1 });
    results = j.results || [];
    more = (j.total_pages || 0) > page + 1;
  }
  const items = results.map((m) => card(m, osc));
  const out = { items, more, total: items.length };
  if (page === 0) out.suggest = await suggest(results.slice(0, 6), q);
  return out;
}

// Filtri collegati: parole chiave, attori e registi più ricorrenti nei primi risultati
async function suggest(top, q) {
  const det = await Promise.all(top.map((m) => tmdb(`/movie/${m.id}`, { append_to_response: "keywords,credits" }).catch(() => null)));
  const kw = new Map(), ppl = new Map(), active = new Set(String(q.people || "").split(",").filter(Boolean).map(Number));
  const add = (map, k, v) => { const e = map.get(k) || { ...v, n: 0 }; e.n++; map.set(k, e); };
  for (const d of det.filter(Boolean)) {
    (d.keywords?.keywords || []).forEach((k) => add(kw, k.id, { id: k.id, name: k.name }));
    (d.credits?.crew || []).filter((c) => c.job === "Director").forEach((c) => add(ppl, c.id, { id: c.id, name: c.name, job: "regia" }));
    (d.credits?.cast || []).slice(0, 4).forEach((c) => add(ppl, c.id, { id: c.id, name: c.name, job: "attore" }));
  }
  return {
    keywords: [...kw.values()].sort((a, b) => b.n - a.n).slice(0, 40),
    people: [...ppl.values()].filter((p) => !active.has(p.id)).sort((a, b) => b.n - a.n || (a.job === "regia" ? -1 : 1)).slice(0, 6)
  };
}

async function movie(id) {
  const [m, osc] = await Promise.all([
    tmdb(`/movie/${id}`, { append_to_response: "credits,keywords,recommendations,similar,videos,watch/providers", include_video_language: "it,en" }),
    oscars()
  ]);
  let overview = m.overview;
  if (!overview) overview = (await tmdb(`/movie/${id}`, { language: "en-US" }).catch(() => ({}))).overview || "";
  const vids = m.videos?.results || [];
  const tr = vids.find((v) => v.site === "YouTube" && v.type === "Trailer" && v.iso_639_1 === "it") || vids.find((v) => v.site === "YouTube" && v.type === "Trailer") || vids.find((v) => v.site === "YouTube");
  const wp = m["watch/providers"]?.results?.IT || {};
  const prov = (list) => (list || []).slice(0, 6).map((p) => ({ name: p.provider_name, logo: `${IMG}w92${p.logo_path}` }));
  const rel = [...(m.recommendations?.results || []), ...(m.similar?.results || [])].filter((r, i, a) => a.findIndex((x) => x.id === r.id) === i).slice(0, 16);
  return {
    id: m.id, title: m.title, original: m.original_title !== m.title ? m.original_title : "", year: year(m.release_date), runtime: m.runtime,
    rating: m.vote_count >= 20 ? Math.round(m.vote_average * 10) / 10 : null, votes: m.vote_count, tagline: m.tagline, overview,
    overviewLang: m.overview ? "it" : "en", genres: m.genres || [], countries: (m.production_countries || []).map((c) => c.iso_3166_1),
    img: m.poster_path ? `${IMG}w500${m.poster_path}` : null, backdrop: m.backdrop_path ? `${IMG}w780${m.backdrop_path}` : null,
    directors: (m.credits?.crew || []).filter((c) => c.job === "Director").map((c) => ({ id: c.id, name: c.name })),
    writers: (m.credits?.crew || []).filter((c) => ["Screenplay", "Writer", "Novel"].includes(c.job)).slice(0, 3).map((c) => ({ id: c.id, name: c.name })),
    cast: (m.credits?.cast || []).slice(0, 12).map((c) => ({ id: c.id, name: c.name, role: c.character, img: c.profile_path ? `${IMG}w185${c.profile_path}` : null })),
    keywords: (m.keywords?.keywords || []).map((k) => ({ id: k.id, name: k.name })),
    trailer: tr ? `https://www.youtube.com/watch?v=${tr.key}` : null,
    providers: { flat: prov(wp.flatrate), rent: prov(wp.rent), buy: prov(wp.buy), link: wp.link || null },
    oscar: osc.get(m.id) || 0, imdb: m.imdb_id || null, related: rel.map((r) => card(r, osc))
  };
}

async function person(q) {
  const j = await tmdb("/search/person", { query: q, include_adult: "false" });
  return { items: (j.results || []).filter((p) => p.known_for_department === "Acting" || p.known_for_department === "Directing").slice(0, 8).map((p) => ({
    id: p.id, name: p.name, job: p.known_for_department === "Directing" ? "regia" : "attore",
    img: p.profile_path ? `${IMG}w185${p.profile_path}` : null, known: (p.known_for || []).map((k) => k.title || k.name).filter(Boolean).slice(0, 2)
  })) };
}

module.exports = async (req, res) => {
  const q = req.query || {};
  if (!process.env.TMDB_API_KEY) return res.status(503).json({ errore: "Manca la chiave TMDB_API_KEY su Vercel" });
  try {
    let out;
    if (q.op === "movie" && /^\d+$/.test(q.id || "")) out = await movie(q.id);
    else if (q.op === "person" && String(q.q || "").trim().length > 1) out = await person(String(q.q).trim().slice(0, 60));
    else if (q.op === "discover") out = await discover(q);
    else return res.status(400).json({ errore: "Richiesta non valida" });
    res.setHeader("Cache-Control", "s-maxage=21600, stale-while-revalidate=86400");
    res.status(200).json(out);
  } catch (e) {
    res.status(502).json({ errore: "TMDB non raggiungibile", dettaglio: String(e.message || e) });
  }
};
