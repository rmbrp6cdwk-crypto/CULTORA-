# CULTORA · Memoria del progetto (per l'assistente AI)

> Se sei un assistente AI e stai leggendo questo file: è il riassunto completo del progetto.
> Leggi anche `index.html`, `style.css`, `script.js`, `feste.js` e `esplora.js` in questo stesso repository prima di proporre modifiche.

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
- Sito statico: **solo HTML + CSS + JavaScript puro**. Niente build, niente AI. Eccezioni: GitHub Actions per le notifiche e una piccola funzione Vercel (`api/beppa.js`) per Beppa.
- File nella radice del repository:
  - `index.html`: struttura, meta tag, font Google (Fraunces, Outfit, JetBrains Mono)
  - `style.css`: tutto lo stile (dark mode)
  - `script.js`: tutta la logica, dentro un'unica funzione `(() => { ... })();`
  - `feste.js`, `feste.json`, `sw.js`, `manifest.json`: ricorrenze e notifiche
  - `esplora.js`: scheda Esplora. Usa `window.Cultora`, l'interfaccia esposta in fondo a `script.js` (createFeed, buildPill, openTitle, onUpdate…), e aggiunge il suo CSS da solo. Le nuove funzioni si possono aggiungere qui senza toccare `script.js`.
  - `scripts/notifica.mjs` e `.github/workflows/notifiche.yml`: invio automatico delle notifiche
  - `beppa.js` e `api/beppa.js`: Beppa, la bibliotecaria che spiega le parole (vedi funzione 10)
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
9. **Esplora** (scheda nella barra in basso, file `esplora.js`):
   - **Di cosa parla l'Italia oggi:** le voci più lette ieri su Wikipedia IT (`/api/rest_v1/feed/featured/AAAA/MM/GG`, campo `mostread`), come pillole con badge "N. 1 · 35 mila letture".
   - **Immagine del giorno:** stessa API (campo `image`), visualizzatore a schermo intero con descrizione, autore e licenza.
   - **Tana del coniglio:** nella scheda articolo, toccando le voci correlate si forma un percorso in alto (tappe cliccabili). Chiudendo dopo almeno 3 passi il percorso si salva in `localStorage` (`cultora_tane`) e compare in Esplora.
   - Scartate dall'utente: "Intorno a me" e "Indovina l'anno".
10. **Beppa, la bibliotecaria** (`beppa.js` + funzione Vercel `api/beppa.js`): quando apri Approfondisci, Beppa (faccina SVG disegnata nel codice) saluta con un fumetto che sparisce dopo 7 secondi. Selezionando una parola nell'articolo compare "Chiedi a Beppa", che apre una finestrella con 3 significati riassunti dal Vocabolario Treccani e il tasto "More" verso la pagina Treccani.
   - `api/beppa.js` gira su Vercel (gratis, cartella `api/` riconosciuta in automatico): legge la pagina `treccani.it/vocabolario/<parola>/` (dati in `__NEXT_DATA__`), prova anche `<parola>1`, riporta plurali e verbi alla forma base con il Wikizionario e, se Treccani non ha la parola, usa la definizione del Wikizionario.
   - Treccani non ha un'API ufficiale: se cambia il suo sito, va sistemato `api/beppa.js`.

## Notifiche ricorrenze (come funzionano)
- `feste.js`: banner, campanella, iscrizione push, apertura ricerca da `?q=`, **logo festivo** (tutto il giorno della ricorrenza il logo diventa dorato e luccicante, il puntino diventa un'icona a tema scelta da `TEMI` (cuore, stella, foglia, π…); toccando il logo si apre la scheda "Oggi si celebra" con Scopri). Usa l'interfaccia di `script.js` (clicca i pulsanti esistenti).
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
5. Aggiunti il logo festivo (tutto il giorno nelle ricorrenze) e la scheda Esplora (tendenze, immagine del giorno, tana del coniglio).
6. Aggiunta Beppa, la bibliotecaria che spiega le parole con il Vocabolario Treccani.

## Idee future (non ancora fatte)
- Quiz veloce nel feed sulle pillole lette
- Modalità chiara
- Raccolte/cartelle in "Leggi dopo"
- Funzionamento offline per le pillole salvate
- Statistiche di lettura (giorni consecutivi, pillole lette)
