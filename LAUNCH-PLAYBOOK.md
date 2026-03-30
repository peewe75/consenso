# Launch Playbook: APP del Consenso
## Data di lancio target: Prima del voto finale al Senato sulla riforma violenza sessuale
## Tipo di lancio: Community Launch + PR organica + Social Media (Bootstrapped)
## Obiettivo primario: 500 installazioni PWA nei primi 30 giorni + 3 menzioni media nazionali

---

> **Contesto strategico chiave:** L'Italia ha approvato alla Camera (227–0) una riforma che introduce il "consenso libero e attuale" nel reato di violenza sessuale. Il disegno di legge è in discussione al Senato. Il giorno del voto finale è la finestra PR più importante. Questo playbook costruisce tutto intorno a quel momento.

---

## Positioning Statement

> *"Per adulti italiani consapevoli che vogliono documentare il consenso reciproco in modo semplice e privato, APP del Consenso è la prima web app italiana di documentazione del consenso che garantisce revocabilità istantanea, anonimato completo e accesso immediato da browser — senza documento d'identità, senza audio, senza installazione. A differenza di WeConsent (solo in inglese, richiede gov-ID) o delle app rimosse dagli store, APP del Consenso è disponibile adesso, gratis, in italiano."*

---

## Minimum Viable Launch (Bootstrapped, settimana 1)

Per chi vuole lanciare **questa settimana** con zero budget:

1. **Pubblica la landing su Hostinger** (il `dist/` è già pronto)
2. **Esegui le migrazioni Supabase** (`bootstrap_all.sql`)
3. **Crea un post LinkedIn/Instagram** con il positioning statement
4. **Invia email** a 5 persone di fiducia per il primo test reale
5. **Registra un Reel da 60 sec** che mostra il flusso: apri browser → installa PWA → pairing → conferma

Questo è sufficiente per avere trazione iniziale e raccogliere i primi feedback reali prima della campagna completa.

---

## Piano Settimana per Settimana

### Settimane 1–2: Fondamenta

**Obiettivo:** Mandare in produzione, impostare analytics, costruire gli asset.

#### Infrastruttura tecnica
- [ ] Deploy `dist/` su Hostinger → `public_html/` (il build è già pronto)
- [ ] Eseguire `bootstrap_all.sql` in Supabase SQL Editor (progetto `aivmwfehpjlchqkbulcy`)
- [ ] Verificare HTTPS attivo su Hostinger (obbligatorio per PWA + Capacitor)
- [ ] Testare il flusso completo su Huawei P30 Pro (PWA + APK sideload)
- [ ] Configurare Google Analytics 4 o Plausible (privacy-first, coerente con il brand)
- [ ] Creare UTM parameters per ogni canale: `?utm_source=instagram&utm_medium=social&utm_campaign=lancio`

#### Assets da creare
- [ ] **Video demo 60 sec** (Reel/TikTok/YouTube Shorts): coppia che apre il sito, installa, fa pairing, conferma — tono leggero, non drammatico
- [ ] **Schermata comparativa** PNG: "APP del Consenso vs WeConsent" (visuale semplice)
- [ ] **Grafica "Come funziona"**: 3 step animati (Installa → Pairing → Consenso)
- [ ] **Caption kit** per Instagram/LinkedIn/X (pronte da copiare-incollare, vedi sezione social)

#### Lista media e community da contattare
Costruire lista di 20+ target:
- Giornalisti: Wired Italia, Repubblica D, Corriere Buone Notizie, TgCom24 Tech
- Creator: influencer italiani su relazioni sane, psicologia, femminismo intersezionale
- Community: r/italy, r/sesso (Reddit Italia), forum universitari, Telegram gruppi giuridici
- Associazioni: D.i.Re (donne in rete), consultori universitari, Telefono Rosa

---

### Settimane 3–4: Costruzione dell'audience

**Obiettivo:** Creare consapevolezza del problema, non ancora dell'app.

#### Content Strategy: "Educa prima, vendi dopo"

Il tema è delicato. Il segreto è **non** iniziare promuovendo l'app — iniziare educando sul tema del consenso nel contesto della riforma legislativa italiana. L'app viene mostrata come soluzione naturale.

**Contenuto da pubblicare (2–3 pezzi a settimana):**

| Settimana | Tema | Formato | Canale |
|-----------|------|---------|--------|
| 3 | "Cosa cambia con la nuova legge sul consenso in Italia" | Post LinkedIn lungo | LinkedIn |
| 3 | "Il consenso non è un momento, è un processo" | Carosello Instagram 5 slide | Instagram |
| 3 | "Cosa fa un'app di consenso (e cosa NON può fare)" | Thread X/Twitter | X |
| 4 | "Privacy e intimità: come documentare senza esporre" | Post LinkedIn | LinkedIn |
| 4 | Behind-the-scenes: come è costruita la privacy nell'app | Reel 30 sec | Instagram |
| 4 | Beta tester: "Ho provato APP del Consenso" | Citazione + screenshot | Tutti |

#### Community engagement (senza spam)
- [ ] Partecipare a 3–5 thread Reddit/X/LinkedIn sul tema "consenso sessuale Italia" con risposte di valore
- [ ] Seguire e commentare post di associazioni antiviolenza italiane su Instagram
- [ ] Condividere la riforma legislativa con commento tecnico su LinkedIn (tono avvocato/esperto)

#### Beta tester recruitment
- [ ] Invitare 10–15 persone di fiducia per test reale (coppia di persone fisicamente insieme)
- [ ] Raccogliere screenshots/citazioni anonime dal test
- [ ] Documento: "cosa abbiamo imparato dai primi utenti"

---

### Settimane 5–6: Pre-lancio intensivo

**Obiettivo:** Massimizzare l'anticipazione, finalizzare tutti gli asset.

#### Email pre-lancio (se hai già una lista, anche piccola)

**Email 1 — Teaser (2 settimane prima)**
> **Oggetto:** L'Italia sta cambiando la legge sul consenso. Noi stavamo già costruendo la risposta.
>
> [NOME],
>
> Mentre il Senato italiano discute la riforma più importante degli ultimi decenni sul consenso sessuale, noi stavamo costruendo qualcosa in silenzio.
>
> Non un'app giuridica. Non una prova per tribunali. Ma uno strumento semplice, privato e gratuito per adulti consapevoli che vogliono documentare un momento di chiarezza reciproca.
>
> Il 10 aprile lo scoprirai.
>
> Nel frattempo, una domanda: hai mai pensato a come rendere esplicito un consenso senza rendere tutto imbarazzante?
>
> [Firma]

**Email 2 — Il reveal (1 settimana prima)**
> **Oggetto:** Ecco cosa abbiamo costruito (e perché non trovi nulla di simile in italiano)
>
> È una web app. Si chiama APP del Consenso. È gratuita, in italiano, e funziona dal browser del telefono — senza installare nulla dallo store.
>
> Come funziona in 3 passi:
> 1. Apri il sito sul tuo smartphone
> 2. Fai pairing di prossimità con l'altra persona via QR code (devete essere insieme fisicamente)
> 3. Tenete premuto 600ms per confermare il consenso reciproco — revocabile in qualsiasi momento
>
> Nessun documento d'identità. Nessuna registrazione audio. Solo pseudonimo e colore avatar.
>
> Lancia il [DATA]. Guarda il video →

**Email 3 — Prova sociale (3 giorni prima)**
> **Oggetto:** "Finalmente qualcosa che rispetta anche la mia privacy"
>
> I primi utenti hanno già testato APP del Consenso. Ecco cosa dicono (anonimizzato):
>
> *"Non mi aspettavo che fosse così veloce. In 2 minuti eravamo in sessione."*
> *"Il fatto che si possa revocare in qualsiasi momento cambia tutto."*
> *"Privacy totale: nemmeno l'altra persona vede il mio stato, solo il conteggio."*
>
> Domani è live. [DATA, ora]

#### Sequenza di lancio social (pre-schedule tutti questi post)
- [ ] Creare e schedulare 14 post (vedi sezione Social Media)
- [ ] Preparare Stories Instagram con countdown
- [ ] Creare evento/reminder su LinkedIn
- [ ] Preparare risposta tipo alle domande più frequenti

---

### Settimana 7: LAUNCH WEEK

#### Lunedì — Soft launch + VIP
- [ ] **Ore 9:00:** Inviare email di accesso anticipato ai beta tester
- [ ] **Ore 10:00:** Post LinkedIn "oggi è live per i nostri early tester"
- [ ] **Ore 12:00:** Reel Instagram con il video demo
- [ ] **Ore 14:00:** Prima risposta pubblica ai commenti/DM
- [ ] **Obiettivo:** Primi 50 utenti registrati

#### Martedì — Lancio pubblico
- [ ] **Ore 9:00:** Email principale a tutta la lista
- [ ] **Ore 9:30:** Thread X/Twitter di lancio (usa template sotto)
- [ ] **Ore 10:00:** Post LinkedIn di lancio lungo
- [ ] **Ore 11:00:** Carosello Instagram "Come funziona"
- [ ] **Ore 14:00:** Invio comunicato stampa a lista media
- [ ] **Ore 16:00:** Post in community (Reddit r/italy con valore, non spam)
- [ ] **Obiettivo:** 200 utenti registrati, 1 menzione media

#### Mercoledì — Social proof
- [ ] Email: "Cosa stanno dicendo i primi utenti"
- [ ] Post: citazioni anonime dai beta tester
- [ ] Story: screen recording del flusso reale
- [ ] Rispondere a ogni commento, menzione, DM

#### Giovedì — Gestione obiezioni
- [ ] Email: "Le domande più frequenti (risposte oneste)"
- [ ] Post: "Cosa l'app NON fa (e perché è una scelta deliberata)"
- [ ] Questo è cruciale: molti si chiederanno se l'app ha valore legale → risposta onesta crea fiducia

#### Venerdì — Azione media + community
- [ ] Follow-up con giornalisti che non hanno risposto
- [ ] Post in 3–5 Telegram group/community italiane pertinenti
- [ ] Email riassunto: "ecco cosa è successo questa settimana"

#### Weekend — Analisi e ringraziamento
- [ ] Ringraziare pubblicamente i primi utenti
- [ ] Raccogliere metriche della settimana
- [ ] Aggiornare la landing page con i dati reali (es. "già X utenti")

---

### Settimana 8: Post-lancio e PR

**Il momento più importante: il voto al Senato**

Quando il Senato voterà (o farà ulteriori rinvii) sulla riforma:

- [ ] **Comunicato stampa pronto** da inviare lo stesso giorno
- [ ] **Post di commento** tempestivo (tono esperto, non politico)
- [ ] **Offerta intervista** a testate che coprono il voto

**Survey ai nuovi utenti (entro 7 giorni dall'iscrizione):**
```
1. Come hai sentito parlare dell'app? (3 risposte)
2. In che contesto pensi di usarla?
3. Cosa cambieresti?
4. Vorresti che fosse disponibile su Google Play? (sì/no)
5. Consiglieresti l'app a qualcuno? (NPS 0-10)
```

---

## Email Templates Completi

### Email lancio principale (Martedì, giorno 2)

**Oggetto:** APP del Consenso è live — la prima app italiana del suo tipo

---

Ciao,

da oggi APP del Consenso è disponibile a tutti.

È una web app gratuita, in italiano, che permette a due o più adulti di documentare il consenso reciproco in modo semplice, privato e revocabile in qualsiasi momento.

**Come funziona:**
1. Apri [link] dal browser del tuo smartphone (nessuna installazione dallo store)
2. Crea un account con pseudonimo e colore avatar — nessun documento, nessun nome reale
3. Quando sei fisicamente con l'altra persona, fate pairing via QR code
4. Tenete premuto 600ms per confermare — oppure revocate in qualsiasi momento

**Cosa non fa l'app:**
Non è una prova legale. Non registra audio. Non conosce il tuo nome reale. Non vende i tuoi dati.

**Perché ora:**
L'Italia sta riscrivendo la legge sulla violenza sessuale per includere il "consenso libero e attuale". La conversazione pubblica su cosa significa consenso esplicito non è mai stata così urgente.

Provala subito → [LINK]

E se conosci qualcuno che potrebbe trovare utile questa conversazione, condividi questo link.

[Firma]

---

### Email obiezioni (Giovedì, giorno 4)

**Oggetto:** "Ma vale legalmente?" — risposta onesta

---

Questa è la domanda che riceviamo di più. Risposta breve: no, e lo diciamo chiaramente nell'app.

**Nessuna app può essere una prova legale del consenso.** LegalFling ha provato con blockchain ed è stata rimossa dagli store. WeConsent usa verifica gov-ID e lo posiziona come "sicurezza" ma i tribunali non accettano queste prove.

APP del Consenso non finge di essere qualcosa che non è.

Serve come: strumento di comunicazione esplicita, documentazione personale per la tua tranquillità, momento consapevole che rende il consenso un atto intenzionale e non implicito.

Non serve come: prova in tribunale, sostituto del dialogo continuo, garanzia legale di alcun tipo.

Pensiamo che questa onestà sia la ragione principale per cui vale la pena usarla.

[Link all'app]

---

## Social Media Content Calendar

### Thread X/Twitter — Lancio (Martedì)

```
1/ Dopo mesi di lavoro, oggi è live APP del Consenso.

La prima web app italiana per documentare il consenso reciproco tra adulti.
Gratuita. Privata. Revocabile in qualsiasi momento.

Ecco cosa abbiamo costruito (e perché siamo diversi da tutto il resto) 🧵

2/ Il problema:
In Italia stiamo riscrivendo la legge sulla violenza sessuale.
Il Parlamento ha approvato alla Camera (227-0) che il consenso deve essere "libero e attuale".

Ma nella vita reale, come si documenta questo? Come si rende esplicito senza rendere tutto imbarazzante?

3/ Le soluzioni esistenti hanno tutti lo stesso problema:
❌ LegalFling: rimossa da App Store e Play Store
❌ WeConsent: in waitlist, richiede documento d'identità e registrazione audio
❌ Consensual App: solo inglese, nessuna funzionalità di revoca

Nessuna è italiana. Nessuna è disponibile ora. Nessuna protegge davvero la privacy.

4/ APP del Consenso funziona così:

📱 Apri il sito dal browser (nessuna installazione)
🔐 Crea account con pseudonimo — nessun documento reale
📡 Pairing QR: devi essere fisicamente con l'altra persona
⏱️ Tieni premuto 600ms per confermare
🔄 Revoca in qualsiasi momento — in tempo reale

5/ Cosa NON fa:
— Non registra audio
— Non conosce il tuo nome
— Non è una prova legale
— Non vende i tuoi dati
— Non richiede verifica identità

È uno strumento di comunicazione consapevole. Niente di più, niente di meno.

6/ È gratuita. È in italiano. È live adesso.

Provala → [LINK]

Se conosci qualcuno che dovrebbe saperlo, un RT può fare la differenza 🙏
```

---

### Carosello Instagram — "Come funziona" (5 slide)

**Slide 1 (Cover):**
> APP del Consenso
> La prima web app italiana per documentare il consenso reciproco
> [Logo + sfondo dark indigo]

**Slide 2:**
> IL PROBLEMA
> L'Italia sta riscrivendo la legge sul consenso sessuale.
> Il Parlamento ha detto: il consenso deve essere "libero e attuale".
> Ma come si rende esplicito nella vita reale?

**Slide 3:**
> COME FUNZIONA
> 1️⃣ Apri il sito dal browser
> 2️⃣ Crea account con pseudonimo (nessun doc reale)
> 3️⃣ Pairing QR — solo quando siete fisicamente insieme
> 4️⃣ Tieni premuto 600ms per confermare

**Slide 4:**
> COSA LA RENDE DIVERSA
> ✅ Revoca immediata in qualsiasi momento
> ✅ Anonimato totale — solo pseudonimo
> ✅ Nessun audio, nessun documento
> ✅ Funziona dal browser — nessuna installazione
> ✅ Gratuita e in italiano

**Slide 5 (CTA):**
> Disponibile adesso.
> Gratis. In italiano.
> Apri il link in bio →

---

### LinkedIn Post lungo — Lancio

```
Ho costruito qualcosa che non esisteva in italiano.

Si chiama APP del Consenso. È live da oggi.

Quando ho iniziato a lavorarci, avevo una domanda semplice: in un paese dove il Parlamento sta ridefinendo il consenso sessuale (227 voti a favore, zero contrari alla Camera), dove sono gli strumenti pratici per adulti consapevoli?

Ho cercato. Ho trovato:
– LegalFling: rimossa da App Store e Play Store
– WeConsent: in inglese, richiede documento d'identità governativo e registrazione audio
– Nulla in italiano

Così ho costruito l'alternativa che avrei voluto trovare.

APP del Consenso fa una cosa sola, bene: permette a due o più adulti di documentare il consenso reciproco in modo semplice, privato e revocabile in qualsiasi momento.

Il principio guida è stato: privacy radicale.
Nessun nome reale. Nessun audio. Nessun documento. Solo pseudonimo e colore avatar.

Perché? Perché la fiducia si guadagna non chiedendo più del necessario.

Quello che l'app NON fa è altrettanto importante:
Non è una prova legale. Non garantisce nulla in tribunale. Lo diciamo chiaramente agli utenti. LegalFling ha provato la strada opposta con blockchain — è stata rimossa dagli store.

È gratuita. Funziona dal browser (nessuna installazione). È disponibile adesso.

[LINK]

Se lavori in ambito legale, in consultori, in associazioni per la prevenzione della violenza di genere, o semplicemente pensi che questa conversazione meriti attenzione: ti chiedo di condividere.

Il consenso non è imbarazzante. Renderlo esplicito è un atto di rispetto.

#consenso #privacy #italia #innovazione #legge
```

---

## Comunicato Stampa

**Per uso mediatico — da adattare e inviare al momento del voto al Senato**

---

**COMUNICATO STAMPA**
**Per rilascio immediato**

**APP DEL CONSENSO: LA PRIMA WEB APP ITALIANA PER DOCUMENTARE IL CONSENSO SESSUALE RECIPROCO È DISPONIBILE GRATUITAMENTE**

*Lancia nel momento del dibattito parlamentare sulla riforma della legge sulla violenza sessuale*

**[CITTÀ], [DATA]** — Mentre il Senato italiano discute la riforma che introduce il concetto di "consenso libero e attuale" nel reato di violenza sessuale, è disponibile da oggi APP del Consenso (app-del-consenso.it), la prima web app italiana che permette a due o più adulti di documentare il consenso reciproco in modo semplice, privato e revocabile in qualsiasi momento.

Diversamente dalle soluzioni internazionali esistenti — come WeConsent (che richiede verifica dell'identità tramite documento governativo e registrazione audio) o LegalFling (rimossa da App Store e Google Play per violazione delle policy) — APP del Consenso è progettata con un principio di **privacy radicale**: nessun nome reale, nessun documento, nessuna registrazione audio. Gli utenti accedono con un semplice pseudonimo e un colore avatar.

**Come funziona:**
Il pairing avviene via QR code di prossimità — entrambe le persone devono essere fisicamente presenti. La conferma del consenso richiede una pressione prolungata di 600 millisecondi (meccanismo anti-accidentale), e la revoca è disponibile in qualsiasi momento in tempo reale, durante l'intera finestra di cinque ore dalla creazione della sessione.

**Posizionamento:**
"Non è una prova legale e non fingere di esserlo è la nostra scelta più importante," spiega il team di sviluppo. "LegalFling ha provato la strada blockchain come 'contratto legalmente vincolante' ed è stata rimossa dagli store. Noi siamo uno strumento di comunicazione consapevole e documentazione personale — con onestà intellettuale sui suoi limiti."

**Disponibilità:**
APP del Consenso è disponibile gratuitamente come Progressive Web App (PWA) installabile da qualsiasi browser su Android e iPhone, senza passare dagli store. È la prima app del suo tipo in lingua italiana.

**Link:** [URL Hostinger]
**Contatto:** [email]

---

## Outreach Template — Giornalisti

**Oggetto email:** Prima risposta italiana al dibattito parlamentare sul consenso — [Prodotto disponibile da oggi/esclusiva]

---

Gentile [Nome],

Ho seguito la sua copertura del [tema specifico — es. riforma legge violenza sessuale, MeToo in Italia, tecnologia e intimità].

Da oggi è disponibile APP del Consenso, la prima web app italiana che permette a due adulti di documentare il consenso reciproco — senza documento d'identità, senza registrazione audio, senza valore legale (lo diciamo esplicitamente).

**Perché potrebbe interessare ai suoi lettori:**
– Primo prodotto italiano in un mercato dove l'unico concorrente internazionale (WeConsent) è ancora in waitlist e richiede gov-ID
– Lancia nel pieno del dibattito parlamentare sulla riforma del consenso
– Approccio privacy-first deliberatamente opposto a quello dei concorrenti

Posso offrire: accesso anticipato per testare il prodotto, intervista al team, dati di utilizzo dopo il lancio.

Cordiali saluti,
[Nome]
[Contatto]

---

## Coordinamento Partner/Community

### Associazioni da contattare (Settimana 3–4)

| Organizzazione | Tipo | Angolo | Cosa chiedere |
|---|---|---|---|
| D.i.Re — Donne in Rete | Antiviolenza | Strumento di consapevolezza | Endorsement, condivisione social |
| Telefono Rosa | Supporto vittime | Educazione al consenso | Menzione in materiali educativi |
| Arcigay | LGBTQ+ | Inclusività del consenso | Co-promozione a community |
| Consultori universitari | Educazione | Studenti universitari | Workshop, demo |
| Ordine degli Avvocati (locali) | Legale | Commento tecnico | Citazione in PR |

**Template di outreach per associazioni:**
```
Gentile [Nome],

Sono [nome] e ho sviluppato APP del Consenso, la prima web app italiana
gratuita per la documentazione del consenso reciproco tra adulti.

L'app nasce dalla consapevolezza che il consenso è un processo continuo,
revocabile in qualsiasi momento — non un atto unico irrevocabile.

Non ha valore legale (lo diciamo esplicitamente agli utenti) ma può essere
un utile strumento educativo e di comunicazione consapevole.

Sarebbe disponibile a valutare una collaborazione? Potrei condividere accesso
gratuito per voi e il materiale tecnico sull'app.

Cordiali saluti,
[Nome/Contatto]
```

---

## Metriche da Monitorare

### Dashboard di lancio (monitorare in tempo reale)

**Awareness:**
| Metrica | Target settimana 1 | Target mese 1 |
|---|---|---|
| Visite landing page | 1.000 | 5.000 |
| Installazioni PWA | 100 | 500 |
| Registrazioni account | 50 | 300 |
| Sessioni create | 20 | 100 |
| Menzioni media | 1 | 3 |

**Engagement:**
| Metrica | Benchmark |
|---|---|
| Email open rate | >30% (media settore: 22%) |
| CTR email | >4% |
| Bounce rate landing | <65% |
| Sessioni create / registrazioni | >15% (indicatore di utilizzo reale) |

**Qualità:**
| Metrica | Obiettivo |
|---|---|
| NPS early users | >50 |
| Sessioni completate (conferma reciproca) | >30% delle sessioni create |
| Revoche / sessioni totali | <20% (alta revoca = frizione UX) |

---

## Errori da Evitare (Specifici per questo prodotto)

1. **Affermare valore legale** — fatale per credibilità. Ogni comunicazione deve essere chiara: "strumento documentale e comunicativo, non prova legale."

2. **Tono troppo grave o clinico** — allontana gli utenti. Il consenso può essere trattato con naturalezza e persino leggerezza.

3. **Ignorare il timing legislativo** — il voto al Senato è un amplificatore gratuito. Preparare tutto in anticipo per attivarlo in poche ore.

4. **Spammare le community** — su Reddit e Telegram in particolare. Costruire presenza con valore prima del pitch.

5. **Non raccogliere feedback reali** — i primi 20 utenti reali (due persone fisicamente insieme) sono il feedback più prezioso. Contattarli direttamente.

6. **Trascurare la SEO italiana** — "app consenso sessuale", "come documentare il consenso", "alternativa LegalFling italiano" — zero concorrenti su queste keyword.

---

## Budget (Bootstrapped — €0 paid)

| Voce | Costo | Note |
|---|---|---|
| Hosting (Hostinger) | Già attivo | ~€8/mese |
| Supabase | Gratuito (free tier) | Fino a 500MB DB, 50.000 MAU |
| Dominio | ~€10/anno | Se non già attivo |
| Canva Pro (grafiche) | €0 (free tier) | Sufficiente per fase lancio |
| MailerLite/Brevo | €0 (free tier) | Fino a 500 contatti/9.000 email mese |
| **Totale** | **~€0–€20** | — |

**Quando investire (se il lancio funziona):**
- €50–100/mese: Meta Ads con targeting "adulti 22–35, Italia, interessi: relazioni, psicologia, legge"
- €200–500: Creator/influencer italiani (micro, 5K–50K follower) su lifestyle/relazioni

---

## Piano Post-Lancio (Settimane 9–12)

### Settimana 9: Google Play
- [ ] `npx cap add android` → Android Studio → genera APK firmato
- [ ] Test finale su Huawei P30 Pro
- [ ] Submit su Google Play Console (€25 una tantum)
- [ ] Attenzione: potrebbe essere rifiutata per "mature content" → avere PWA come backup pronto

### Settimane 10–11: SEO e contenuto
- [ ] Creare pagina `/vs/weconsent` (identificata nel competitor report)
- [ ] Scrivere articolo "Cosa cambia con la legge italiana sul consenso" (SEO + thought leadership)
- [ ] Inviare a 3 blog/testate per guest post

### Settimana 12: Analisi e v2
- [ ] Retrospettiva completa del lancio
- [ ] Feature più richiesta dagli utenti → prioritizzare
- [ ] Valutare App Store (iOS) — più complesso (richiede Mac + €99/anno Apple Developer)

---

## Checklist Giorno del Lancio

```
Ore 08:00
  [ ] Verifica che il sito risponda su Hostinger
  [ ] Verifica Supabase: tabelle presenti, RLS attiva
  [ ] Fai un test completo del flusso (registrazione → pairing → sessione → revoca)
  [ ] Controlla che l'email sia configurata su Supabase Auth

Ore 09:00
  [ ] Invia email a lista (o ai contatti personali se lista piccola)

Ore 09:30
  [ ] Pubblica thread su X/Twitter

Ore 10:00
  [ ] Pubblica post LinkedIn

Ore 10:30
  [ ] Pubblica Reel Instagram

Ore 11:00
  [ ] Invia comunicato stampa a lista giornalisti

Ore 12:00
  [ ] Primo check metriche (Google Analytics / Supabase logs)
  [ ] Rispondere a tutti i commenti/DM

Ore 14:00
  [ ] Post in community (Reddit, Telegram) con valore genuino

Ore 16:00
  [ ] Story Instagram con "siamo live!"

Ore 18:00
  [ ] Secondo check metriche
  [ ] Condividere qualsiasi menzione/citazione organica

Fine giornata
  [ ] Nota manuale: quante registrazioni, quante sessioni, feedback ricevuto
  [ ] Decisione: cosa amplificare domani?
```

---

*Playbook generato il 30 marzo 2026 — APP del Consenso Launch Strategy*
*Basato su: analisi competitiva, contesto legislativo italiano, stack tecnico esistente*
