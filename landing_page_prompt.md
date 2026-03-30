# Landing Page – Prompt tecnico per AI code assistants

> Usa questo prompt con **Cursor**, **Lovable**, **v0** o **Claude** per generare (o verificare) la landing page di **APP del Consenso**.

---

## 1. Stack tecnico

| Layer | Tecnologia |
|---|---|
| Framework | React 18 + TypeScript (Vite) |
| Routing | react-router-dom v6+ (`Link`, `Navigate`) |
| Stile | Tailwind CSS 3 |
| Animazioni | Framer Motion (`motion.div`, reveal on scroll) |
| Icone | lucide-react |
| State | `useAuthStore` (Zustand) |
| Utility | `downloadLinks`, `isIosSafariInstallPromptVisible`, `cn` (classnames) |

---

## 2. Palette – "Indigo Vault" (dark mode)

| Token | Hex | Uso |
|---|---|---|
| Background | `#131318` | Corpo pagina, footer |
| Surface Low | `#1B1B20` | Card, blocchi secondari |
| Surface | `#1F1F24` | Card hover, barre interne |
| Primary | `#C0C1FF` | Badge, trust icon, CTA gradient start, link attivi |
| Primary Container | `#8083FF` | CTA gradient end, accenti |
| On Primary | `#1000A9` | Testo su CTA primary |
| Tertiary | `#4EDEA3` | Icone trust, check, titolo "Per chi è" |
| Secondary | `#C6C4DF` | Testo di supporto, principi |
| On Surface | `#E4E1E9` | Testo body principale |
| On Surface Variant | `#C7C4D7` | Subheadline, paragrafi secondari |
| Outline Variant | `#464554` | Bordi ghost (`border-[#464554]/20`) |
| Dimmed | `#908FA0` | Microcopy, note discrete |
| Error Container | `#93000A` | Eventuali stati errore |
| On Error | `#FFB4AB` | Testo su errore |

### Effetti speciali

- **Glass border**: `border-[#464554]/20`
- **Backdrop blur**: `backdrop-blur-xl`, `backdrop-blur-md`, `backdrop-blur-sm`
- **Ambient glow**: cerchi `position: absolute` con `bg-[#C0C1FF]/[0.05] blur-[140px]` e `bg-[#4EDEA3]/[0.03] blur-[120px]`
- **Selection**: `selection:bg-[#C0C1FF]/30`

---

## 3. Tipografia

- **Font family**: Sans-serif di sistema (`font-sans`)
- **Hero H1**: `text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight text-white`
- **Section H2**: `text-3xl sm:text-4xl font-bold tracking-tight text-white`
- **Card H3**: `text-xl font-bold text-white`
- **Body**: `text-lg leading-relaxed text-[#C7C4D7]`
- **Small/Note**: `text-sm text-[#908FA0]`
- **Eyebrow badge**: `text-xs font-bold uppercase tracking-[0.12em] text-[#C0C1FF]`

---

## 4. Struttura sezioni

### 4.1 Header (fixed)

```
height: 72px | fixed top-0 | bg-[#131318]/85 backdrop-blur-xl
Left:  ShieldCheck icon + "APP del Consenso"
Center (md+): nav links → Come funziona · Per chi è · Privacy · Visione · FAQ
Right: "Accedi" (link) + "Apri l'app" (gradient pill → /register)
```

### 4.2 Hero

- Eyebrow badge in pill → "Piattaforma per il consenso chiaro e reciproco"
- H1 → "Un modo semplice, riservato e verificabile per confermare il consenso tra adulti."
- Paragrafo subheadline
- 2 CTA → "Apri l'app" (filled gradient pill) + "Scopri come funziona" (ghost pill → #come-funziona)
- Microcopy → installazione smartphone
- **Trust strip** (4 elementi con ShieldCheck icon): Reciproco · Revocabile · Privato · Pensato per adulti
- Nota disclaimer

### 4.3 "Che cos'è"

Grid 2 colonne (md): paragrafo principale + card di supporto con bordo ghost.

### 4.4 "Perché la chiarezza conta"

`bg-black/20`, centrato, 2 paragrafi. Sezione emozionale.

### 4.5 "I quattro principi"

4 card in griglia `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`.  
Ciascuna con:
- Icona Lucide in cerchio colorato (bg tinta/10, color tinta)
- Titolo + descrizione
- Principi: Chiarezza, Reciprocità, Revoca immediata, Riservatezza

### 4.6 "Come funziona" (`#come-funziona`)

Timeline verticale con 4 step numerati (01–04):
- Cerchio numerato sulla linea
- Card con titolo + descrizione
- `bg-black/10`

### 4.7 "Per chi è" (`#per-chi-e`)

3 card griglia `md:grid-cols-3`. Titoli `text-emerald-300`.

### 4.8 "Privacy e fiducia" + "Garanzie operative" (`#privacy`)

Layout `lg:grid-cols-2`:
- Sinistra: H2, paragrafo, 4 sotto-blocchi privacy (H4 + paragrafo ciascuno)
- Destra: card con gradient border `border-[#C0C1FF]/20`, lista a check con ShieldCheck icon, citazione finale in box scuro

### 4.9 "Accesso e disponibilità"

4 card griglia `lg:grid-cols-4`:
- Web app live, iPhone, Android, Disponibilità futura
- Blocchi condizionali: hint iOS (`isIosSafariInstallPromptVisible()`) e link APK Android (`downloadLinks`)

### 4.10 "La visione" + "Valori" (`#visione`)

Sezione **a sfondo primario invertito** (`bg-[#C0C1FF] text-[#131318]`):
- Sinistra: 2 paragrafi manifesto (font-medium opacity-90)
- Destra: 4 card valore in `bg-white/30 backdrop-blur-sm`

### 4.11 FAQ (`#faq`)

Accordion custom (`FaqItem` component):
- `useState` per toggle
- Animazione `motion.div` con height auto
- ChevronDown ruota 180° quando aperto

### 4.12 CTA Finale

Card `rounded-[40px]` con gradient bg, glow decorativo, 2 CTA:
- "Apri l'app" (bianco pieno → /register)
- "Accedi" (ghost → /login)

### 4.13 Footer

4 colonne: Prodotto · Supporto · Legal · Progetto  
Riga inferiore: copyright + tagline.

---

## 5. Animazioni Framer Motion

| Tipo | Props |
|---|---|
| Hero (mount) | `initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }}` |
| Reveal on scroll | `initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }}` |
| Card stagger | `transition={{ duration: 0.4, delay: i * 0.1 }}` |
| Privacy slide X | `initial={{ opacity: 0, x: -20 }}` / `x: 20` |
| FAQ height toggle | `animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}` |

---

## 6. Integrations da mantenere

```tsx
// Auth guard: redirect utente loggato
const { user } = useAuthStore()
if (user) return <Navigate to="/app" replace />

// iOS install hint
const showIosHint = isIosSafariInstallPromptVisible()

// Android APK link
const androidApkLink = downloadLinks.find(
  (item) => item.label === 'APK diretto'
)?.href ?? null
```

Questi blocchi **non devono essere rimossi né modificati**. L'intera landing è puramente UI; la logica di routing, autenticazione e download deve restare intatta.

---

## 7. Requisiti di qualità

- ✅ TypeScript strict compliance (`npx tsc --noEmit` senza errori)
- ✅ Mobile-first responsive (min 3 breakpoint: `sm`, `md`, `lg`)
- ✅ Smooth scroll tra sezioni con `id` anchor
- ✅ Tutti i CTA devono puntare a `/register` o `/login` via `<Link>`
- ✅ Nessun placeholder: icone reali da `lucide-react`, testi definitivi
- ✅ Dark mode only — nessun tema chiaro (escluso sezione Visione invertita)
- ✅ Accessibility: focus visible, semantic heading hierarchy (h1 → h2 → h3 → h4)
- ✅ Selection styling: `selection:bg-[#C0C1FF]/30`
