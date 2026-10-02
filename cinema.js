// Cultora · Cinema: film da TMDB (tramite la funzione Vercel api/film.js) con filtri a pila e film correlati
(() => {
"use strict";
const S = window.Scaffale, C = window.Cultora;
if (!S || !C) return;
const { esc, icon } = C;

const GENRES = [["18", "Dramma"], ["35", "Commedia"], ["36", "Storia"], ["10752", "Guerra"], ["53", "Thriller"], ["80", "Crime"], ["9648", "Mistero"], ["878", "Fantascienza"], ["14", "Fantasy"], ["12", "Avventura"], ["28", "Azione"], ["27", "Horror"], ["10749", "Romance"], ["16", "Animazione"], ["10751", "Famiglia"], ["99", "Documentario"], ["10402", "Musica"], ["37", "Western"]];
const THEMES = [["based on true story", "Storia vera"], ["biography", "Biografia"], ["based on novel or book", "Tratto da un libro"], ["world war ii", "Seconda guerra mondiale"], ["world war i", "Prima guerra mondiale"], ["cold war", "Guerra fredda"], ["mafia", "Mafia"], ["serial killer", "Serial killer"], ["heist", "Colpi grossi"], ["spy", "Spie"], ["prison", "Prigione"], ["courtroom", "Processi"], ["politics", "Politica"], ["journalism", "Giornalismo"], ["space", "Spazio"], ["time travel", "Viaggi nel tempo"], ["artificial intelligence (a.i.)", "Intelligenza artificiale"], ["dystopia", "Distopia"], ["superhero", "Supereroi"], ["ancient rome", "Antica Roma"], ["coming of age", "Crescere"], ["friendship", "Amicizia"], ["sports", "Sport"], ["survival", "Sopravvivenza"], ["road trip", "Viaggio on the road"], ["dinosaur", "Dinosauri"], ["zombie", "Zombie"], ["musical", "Musical"], ["christmas", "Natale"]];
const QUALITY = [["oscar", "Premiati agli Oscar"], ["top", "Voto alto (7,5+)"], ["it", "Cinema italiano"]];
const DECADES = [2020, 2010, 2000, 1990, 1980, 1970, 1960, 1950, 1940].map((d) => [String(d), `Anni '${String(d).slice(2)}`]);
const RUNTIME = [["short", "Meno di 1h40"], ["medium", "1h40 – 2h20"], ["long", "Più di 2h20"]];
const SORTS = [["pop", "Popolari"], ["vote", "Più votati"], ["new", "Più recenti"]];
const GNAME = Object.fromEntries(GENRES);
// Parole chiave di TMDB (in inglese) tradotte: solo queste diventano filtri suggeriti
const KW_IT = Object.fromEntries([...THEMES, ["holocaust (shoah)", "Olocausto"], ["nazi", "Nazismo"], ["vietnam war", "Guerra del Vietnam"], ["d-day", "Sbarco in Normandia"], ["resistance", "Resistenza"], ["soldier", "Soldati"], ["army", "Esercito"], ["war", "Guerra"],
  ["gangster", "Gangster"], ["murder", "Omicidio"], ["revenge", "Vendetta"], ["investigation", "Indagini"], ["detective", "Detective"], ["police", "Polizia"], ["corruption", "Corruzione"], ["conspiracy", "Complotti"], ["kidnapping", "Rapimenti"], ["terrorism", "Terrorismo"], ["drugs", "Droga"], ["drug trafficking", "Narcotraffico"], ["undercover", "Sotto copertura"], ["lawyer", "Avvocati"],
  ["alien", "Alieni"], ["outer space", "Spazio"], ["astronaut", "Astronauti"], ["black hole", "Buchi neri"], ["robot", "Robot"], ["post-apocalyptic future", "Post-apocalittico"], ["dream", "Sogni"], ["virtual reality", "Realtà virtuale"], ["hacker", "Hacker"], ["based on comic", "Tratto da un fumetto"], ["magic", "Magia"], ["dragon", "Draghi"], ["vampire", "Vampiri"], ["ghost", "Fantasmi"], ["haunted house", "Case infestate"], ["monster", "Mostri"],
  ["ancient greece", "Antica Grecia"], ["middle ages", "Medioevo"], ["gladiator", "Gladiatori"], ["historical figure", "Personaggi storici"], ["period drama", "Film in costume"], ["epic", "Epico"], ["king", "Re e regine"], ["queen", "Re e regine"], ["slavery", "Schiavitù"], ["racism", "Razzismo"], ["civil rights", "Diritti civili"], ["feminism", "Femminismo"], ["immigration", "Immigrazione"], ["poverty", "Povertà"], ["class differences", "Differenze sociali"], ["dictatorship", "Dittatura"], ["revolution", "Rivoluzione"], ["atomic bomb", "Bomba atomica"],
  ["family", "Famiglia"], ["father son relationship", "Padri e figli"], ["mother daughter relationship", "Madri e figlie"], ["love", "Amore"], ["romance", "Storia d'amore"], ["high school", "Scuola"], ["teenager", "Adolescenti"], ["loneliness", "Solitudine"], ["mental illness", "Malattia mentale"], ["schizophrenia", "Schizofrenia"], ["illness", "Malattia"], ["dementia", "Demenza"], ["grief", "Lutto"],
  ["mathematics", "Matematica"], ["scientist", "Scienziati"], ["physics", "Fisica"], ["doctor", "Medici"], ["writer", "Scrittori"], ["painter", "Pittori"], ["artist", "Artisti"], ["musician", "Musicisti"], ["music", "Musica"], ["jazz", "Jazz"], ["dance", "Danza"], ["filmmaking", "Fare cinema"], ["cinema", "Cinema"], ["hollywood", "Hollywood"], ["cooking", "Cucina"], ["chef", "Chef"], ["chess", "Scacchi"], ["boxing", "Boxe"], ["football (soccer)", "Calcio"], ["olympic games", "Olimpiadi"], ["martial arts", "Arti marziali"], ["samurai", "Samurai"], ["pirate", "Pirati"], ["cowboy", "Cowboy"],
  ["island", "Isole"], ["shipwreck", "Naufragi"], ["ocean", "Oceano"], ["mountain", "Montagna"], ["wilderness", "Natura selvaggia"], ["dog", "Cani"], ["shark", "Squali"], ["sicily", "Sicilia"], ["rome, italy", "Roma"], ["italy", "Italia"], ["naples, italy", "Napoli"], ["venice, italy", "Venezia"], ["paris, france", "Parigi"], ["new york city", "New York"], ["london, england", "Londra"], ["japan", "Giappone"],
  ["dark comedy", "Commedia nera"], ["satire", "Satira"], ["parody", "Parodia"], ["remake", "Remake"], ["stock market", "Borsa e finanza"], ["nostalgia", "Nostalgia"], ["religion", "Religione"], ["philosophy", "Filosofia"], ["secret", "Segreti"], ["dinner", "Cene"], ["subconscious", "Inconscio"], ["titanic", "Titanic"], ["normandy", "Normandia"]
]);

async function api(params) {
  const p = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v !== undefined));
  const r = await fetch(`/api/film?${new URLSearchParams(p)}`);
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    const e = new Error(j.errore);
    e.userMsg = r.status === 503 ? "Il Cinema si accende appena aggiungi la chiave TMDB su Vercel (vedi CONTEXT.md)." : "Il catalogo dei film non risponde. Riprova tra poco.";
    throw e;
  }
  return j;
}

const filmItem = (m) => ({
  kind: "film", key: `film-${m.id}`, id: m.id, title: m.title, year: m.year, rating: m.rating, img: m.img,
  author: (m.genres || []).map((g) => GNAME[g]).filter(Boolean).slice(0, 2).join(", "), badge: m.oscar ? "Oscar" : "",
  url: `https://www.themoviedb.org/movie/${m.id}`, genreIds: (m.genres || []).map(String)
});
const personF = (p) => ({ f: "person", id: String(p.id), label: p.job === "regia" ? `Regia di ${p.name}` : `Con ${p.name}`, text: p.name });

async function fetchFilms(v) {
  const by = (f) => v.filters.filter((x) => x.f === f).map((x) => x.id);
  const p = { op: "discover", page: v.page, sort: v.sort, genres: by("genre").join(","), kw: by("kw").join("|"), people: by("person").join(","), decade: by("decade")[0], runtime: by("runtime")[0] };
  by("q").forEach((x) => { p[x] = 1; });
  const r = await api(p);
  const items = r.items.map(filmItem);
  const suggest = [];
  if (r.suggest) {
    const usedLabels = new Set(v.filters.map((x) => x.label));
    r.suggest.keywords.filter((k) => KW_IT[k.name]).slice(0, 8).forEach((k) => suggest.push({ f: "kw", id: k.name, label: KW_IT[k.name] }));
    r.suggest.people.slice(0, 4).forEach((x) => suggest.push(personF(x)));
    const cnt = new Map();
    items.forEach((it) => it.genreIds.forEach((g) => GNAME[g] && cnt.set(g, (cnt.get(g) || 0) + 1)));
    [...cnt].sort((a, b) => b[1] - a[1]).slice(0, 3).forEach(([g]) => suggest.push({ f: "genre", id: g, label: GNAME[g] }));
    if (items.filter((it) => it.badge).length >= 3) suggest.push({ f: "q", id: "oscar", label: "Premiati agli Oscar" });
    return { items, more: r.more, suggest: suggest.filter((x) => !usedLabels.has(x.label)) };
  }
  return { items, more: r.more };
}

const hm = (m) => (m ? `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}min` : "");
async function filmDetail(it, el) {
  const more = el.querySelector(".sh-dmore");
  more.innerHTML = S.loading("Preparo la scheda del film…");
  let m;
  try { m = await api({ op: "movie", id: it.id }); }
  catch (e) { more.innerHTML = `<p class="err" data-testid="shelf-error">${esc(e.userMsg)}</p>`; return; }
  if (!el.isConnected) return;
  it.runtime = m.runtime;
  if (m.backdrop) el.querySelector(".sh-dhead").insertAdjacentHTML("beforebegin", `<div class="sh-backdrop"><img src="${esc(m.backdrop)}" alt=""></div>`);
  el.querySelector(".sh-dhead .sh-m").textContent = [m.year, hm(m.runtime), m.rating && `★ ${m.rating}`].filter(Boolean).join(" · ");
  el.querySelector(".sh-dhead .sh-a").textContent = m.genres.map((g) => g.name).slice(0, 3).join(", ");
  if (m.original) el.querySelector(".sh-dhead h2").insertAdjacentHTML("afterend", `<p class="sh-orig">${esc(m.original)}</p>`);
  const prov = (title, list) => list.length ? `<small>${title}</small>${list.map((p) => `<img src="${esc(p.logo)}" alt="${esc(p.name)}" title="${esc(p.name)}" loading="lazy">`).join("")}` : "";
  const themes = m.keywords.filter((k) => KW_IT[k.name]).map((k) => ({ f: "kw", id: k.name, label: KW_IT[k.name] })).filter((x, i, a) => a.findIndex((y) => y.label === x.label) === i);
  const dec = m.year && m.year >= 1940 ? String(Math.floor(m.year / 10) * 10) : null;
  more.innerHTML = `${m.oscar ? `<p class="sh-award" data-testid="film-oscar">${S.TROPHY} Premiato agli Oscar</p>` : ""}
    ${m.tagline ? `<p class="sh-tagline">“${esc(m.tagline)}”</p>` : ""}
    <p class="sh-desc" data-testid="shelf-detail-desc">${esc(m.overview || "Trama non ancora disponibile.")}${m.overviewLang === "en" && m.overview ? " (trama in inglese)" : ""}</p>
    <div class="sh-actions">
      ${m.trailer ? `<a class="btn-gold" href="${esc(m.trailer)}" target="_blank" rel="noopener noreferrer" data-testid="film-trailer-link">${S.PLAY} Trailer</a>` : ""}
      ${S.saveBtn(it)}
      <button class="btn-soft" data-sd="wiki" data-testid="shelf-wiki-button">Wikipedia ${icon("arrowUpRight", "ic-md")}</button>
    </div>
    ${S.tags("Genere", m.genres.map((g) => ({ f: "genre", id: String(g.id), label: g.name })))}
    ${S.tags("Regia", m.directors.map((d) => personF({ ...d, job: "regia" })))}
    ${m.cast.length ? `<div class="sh-sec"><p class="sf-label">Cast · tocca per vedere i suoi film</p><div class="sh-people no-scrollbar" data-testid="film-cast">${m.cast.map((c) => S.person(personF({ ...c, job: "attore" }), c.img, c.role)).join("")}</div></div>` : ""}
    ${S.tags("Temi", themes)}
    ${S.tags("Epoca e durata", [dec && { f: "decade", id: dec, label: `Anni '${dec.slice(2)}` }, m.runtime && { f: "runtime", id: m.runtime < 100 ? "short" : m.runtime <= 140 ? "medium" : "long", label: RUNTIME.find((r) => r[0] === (m.runtime < 100 ? "short" : m.runtime <= 140 ? "medium" : "long"))[1] }].filter(Boolean))}
    ${m.providers.flat.length || m.providers.rent.length || m.providers.buy.length ? `<div class="sh-sec" data-testid="film-providers"><p class="sf-label">Dove guardarlo in Italia</p><div class="sh-prov">${prov("In abbonamento", m.providers.flat)}${prov("Noleggio", m.providers.rent)}${!m.providers.rent.length ? prov("Acquisto", m.providers.buy) : ""}</div></div>` : ""}`;
  S.addRow(el, cinema, "Ti potrebbe piacere anche", m.related.map(filmItem), "shelf-rel-similar");
}

const cinema = {
  id: "cinema", h1: "Cosa <em>guardo</em> stasera?", sub: "Parti da un'idea e affina: genere, temi, premi, attori. Ogni filtro si somma agli altri.",
  loading: "Cerco tra le pellicole…", category: "cinema", start: [], sorts: SORTS,
  facets: [{ f: "kw", label: "Temi", options: THEMES }, { f: "genre", label: "Generi", options: GENRES }, { f: "q", label: "Premi e qualità", options: QUALITY }, { f: "decade", label: "Decennio", single: true, options: DECADES }, { f: "runtime", label: "Durata", single: true, options: RUNTIME }],
  find: { ph: "Cerca un film, un attore o un regista", who: "Attori e registi",
    titles: async (q) => (await api({ op: "search", q })).items.map(filmItem),
    run: async (q) => (await api({ op: "person", q })).items.map(personF) },
  meta: (it) => [it.year, it.rating && `★ ${it.rating}`].filter(Boolean).join(" · "),
  fetch: fetchFilms, detail: filmDetail, wikiQuery: (it) => `${it.title} film ${it.year || ""}`, wikiOk: (p) => /film/i.test(p.title) || /\bfilm\b/i.test((p.extract || "").slice(0, 200)), saveObj: S.saveObj("cinema")
};
S.register(cinema);
})();
