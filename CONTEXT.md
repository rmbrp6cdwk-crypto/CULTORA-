# CULTORA · Memoria del progetto (per l'assistente AI)

> Se sei un assistente AI e stai leggendo questo file: è il riassunto completo del progetto.
> Leggi anche `index.html`, `style.css`, `script.js` e `feste.js` in questo stesso repository prima di proporre modifiche.

## Chi sono e come lavoro
- Sono un principiante e uso soprattutto l'iPhone (Safari + GitHub da browser).
- Modifico i file direttamente su GitHub dal telefono: **dammi sempre il file COMPLETO da sostituire** (Seleziona tutto → Incolla), non pezzi da inserire a metà.
- Spiegami i passaggi uno alla volta, in italiano, in modo semplice.

## Il progetto
- **Nome:** Cultora · Pillole di cultura
- **Cos'è:** feed verticale a schermo intero (stile TikTok/Instagram) con "pillole" di cultura, scienza, storia e scoperte prese da Wikipedia in italiano.
- **Sito online:** https://cultora1.vercel.app
- **Repository GitHub:** https://github.com/rmbrp6cdwk-crypto/CULTORA- (branch `main`)
- **Hosting:** Vercel, piano Hobby gratuito, Framework Preset "Other". Ogni commit su `main` viene ripubblicato in automatico.
- Installata sull'iPhone come icona nella schermata Home, a schermo intero (meta tag `apple-mobile-web-app-capable`).

## Tecnologia
- Sito statico: **solo HTML + CSS + JavaScript puro**. Niente backend, niente build, niente AI. Unica eccezione: GitHub Actions per le notifiche.
- File nella radice del repository:
  - `index.html`: struttura, meta tag, font Google (Fraunces, Outfit, JetBrains Mono)
  - `style.css`: tutto lo stile (dark mode)
  - `script.js`: tutta la logica, dentro un'unica funzione `(() => { ... })();`
  - `feste.js`, `feste.json`, `sw.js`, `manifest.json`: ricorrenze e notifiche
  - `scripts/notifica.mjs` e `.github/workflows/notifiche.yml`: invio automatico delle notifiche
- API usate, chiamate direttamente dal browser (`origin=*` per CORS):
  - `https://it.wikipedia.org/w/api.php`: ricerca (`generator=search`, `gsrsort=random`, `intitle:`, `morelike:`), estratti, immagini, articolo completo
  - `https://it.wikipedia.org/api/rest_v1/feed/onthisday/events/MM/DD`: "Accadde oggi"

## Funzioni attuali
1. **Scopri:** feed infinito e casuale con scroll snap verticale. Filtro per categoria (Tutto, Scienza, Storia, Arte, Natura, Scoperte, Spazio, Tecnologia, Filosofia, Letteratura, Musica).
2. **Accadde oggi:** eventi storici del giorno, con badge dell'anno.
3. **Cerca:** si scrive un argomento (es. "oceani") e il feed mostra solo voci con quel termine nel titolo. Ci sono suggerimenti e ricerche recenti.
4. **Leggi dopo:** pillole salvate in `localStorage` (chiave `cultora_leggi_dopo`), con badge contatore nella barra in basso.
5. **Scheda di approfondimento** (si apre toccando il titolo o "Approfondisci"): immagine grande, box "In pillole" con 3 fatti, articolo completo diviso in sezioni, link a Wikipedia, "Potrebbe interessarti" (voci correlate cliccabili).
6. Pulsanti laterali su ogni pillola: Leggi dopo, Condividi, Ascolta (sintesi vocale it-IT), Wikipedia.
7. Tasti ↑ ↓ per scorrere e Esc per chiudere la scheda (da computer).
8. **Ricorrenze del giorno + notifiche push:** banner "Oggi si celebra" con pulsante Scopri, campanella 🔔 in alto per attivare le notifiche, notifica ogni giorno alle 12:00 se c'è una ricorrenza. Toccando la notifica si apre la ricerca su quella festa (`?q=` nell'URL). Funziona ed è stata provata sull'iPhone.

## Notifiche ricorrenze (come funzionano)
- `feste.js`: banner, campanella, iscrizione push, apertura ricerca da `?q=`. Usa l'interfaccia di `script.js` (clicca i pulsanti esistenti).
- `feste.json`: ricorrenze `fisse` ("MM-GG": ["Nome|termine di ricerca"]) e `mobili` (`pasqua±N`, `nth:mese:giornoSett:n:offset`, `last:mese:giornoSett`).
- `sw.js`: service worker che mostra la notifica e apre l'app. `manifest.json`: manifest PWA.
- Invio: GitHub Actions `.github/workflows/notifiche.yml` + `scripts/notifica.mjs` (libreria web-push). Cron 10:00 e 11:00 UTC, ne parte solo quello che corrisponde alle 12:00 italiane. Avvio manuale con "Run workflow" (spunta test).
- Secret GitHub: `VAPID_PRIVATE_KEY` e `PUSH_SUBSCRIPTION` (codice copiato dalla campanella nell'app). Chiave pubblica VAPID scritta in `feste.js` e `scripts/notifica.mjs`.
- Se cambio iPhone o reinstallo l'icona: tocco di nuovo la campanella e aggiorno il secret `PUSH_SUBSCRIPTION`.

## Come funziona `script.js` (mappa veloce)
- `ICONS` + `icon()`: icone SVG Lucide incorporate nel codice
- `CATS`: categorie con colore, icona, `seeds` (parole di ricerca), `kw` (regex per indovinare la categoria), `hooks` (modelli di titolo)
- `makeHook()`: titolo accattivante **senza AI**. Usa un superlativo trovato nel testo ("il più grande…"), altrimenti un modello per categoria, es. "{t}: la storia che pochi conoscono".
- `buildPill()`: pillola = prime 2 frasi dell'estratto; fatti = frasi successive (preferisce quelle con numeri)
- `fetchDiscover()`: 4 ricerche in parallelo su categorie casuali. Per partire veloce usa una pagina di risultati a caso, altrimenti l'ordinamento casuale di Wikipedia. Filtra le voci troppo corte o di disambiguazione.
- `fetchSearch()`, `fetchOtd()`, `fetchArticle()`: ricerca, "Accadde oggi", articolo completo
- `createFeed()`: feed infinito con IntersectionObserver; carica altre pillole quando mancano 3 card alla fine
- `state`: tab corrente, categoria, ricerca, salvati, audio in riproduzione
- Eventi: un unico listener click su `#phone` che usa gli attributi `data-action`

## Stile
- Sfondo `#090A0F`, accento oro `#F5B83D`, rosa `#FB7185`
- Titoli: font Fraunces (serif); testo: Outfit
- Su desktop l'app è mostrata dentro una cornice a forma di telefono, con un testo introduttivo a sinistra

## Storia del progetto
1. Prima versione: React + FastAPI + MongoDB con riassunti AI (Claude) su Emergent.
2. Poi convertita in sito statico senza server né AI (versione attuale).
3. Divisa in 3 file, caricata su GitHub e pubblicata su Vercel.
4. Aggiunte le ricorrenze del giorno con notifiche push alle 12:00 (funzionanti).

## Idee future (non ancora fatte)
- Quiz veloce nel feed sulle pillole lette
- Modalità chiara
- Raccolte/cartelle in "Leggi dopo"
- Funzionamento offline per le pillole salvate
- Statistiche di lettura (giorni consecutivi, pillole lette)
