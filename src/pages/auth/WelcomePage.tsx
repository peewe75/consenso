import { motion } from 'framer-motion'
import {
  Apple,
  ArrowRight,
  ChevronDown,
  Eye,
  Handshake,
  HeartHandshake,
  Lightbulb,
  RefreshCcw,
  Shield,
  ShieldCheck,
  Smartphone,
  Users
} from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { downloadLinks } from '@/lib/downloadLinks'
import { cn, isIosSafariInstallPromptVisible } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

/* ═══════════════════════════════════════════════════════════════════════════
   DESIGN TOKENS — Warm / Rassicurante
   bg:           #F7F4EE    surface:      #FBF8F3    surface-2:    #EFE8DE
   text:         #25211C    text-muted:   #6F6A63    border:       #DDD4C8
   primary:      #1E6B68    primary-hover:#16514F    primary-soft: #DCE9E5
   warm-muted:   #EEE4D7

   Display font: DM Serif Display
   Body font:    Inter
   ═══════════════════════════════════════════════════════════════════════ */

// ─── Reveal helper ──────────────────────────────────────────────────────────
function fadeProps(delay = 0) {
  
  return {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' } as const,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay },
  }
}

// ─── Data ───────────────────────────────────────────────────────────────────

const trustPills = ['Privato', 'Reciproco', 'Revocabile', 'Mobile-first']

const principles = [
  {
    title: 'Chiarezza',
    desc: 'Le intenzioni vengono espresse in modo diretto, prima che l\u2019incertezza prenda il posto del dialogo.',
    Icon: Handshake,
    img: '/images/principle-clarity-icon.png',
  },
  {
    title: 'Reciprocità',
    desc: 'La conferma esiste solo quando entrambe le persone partecipano attivamente allo stesso passaggio.',
    Icon: HeartHandshake,
    img: '/images/principle-reciprocity-icon.png',
  },
  {
    title: 'Revoca continua',
    desc: 'Il consenso può essere sospeso o revocato in qualsiasi momento, fino alla chiusura della sessione.',
    Icon: RefreshCcw,
    img: '/images/principle-revocation-icon.png',
  },
  {
    title: 'Riservatezza',
    desc: 'Il sistema è progettato per raccogliere il minimo necessario e proteggere ciò che appartiene alla sfera privata.',
    Icon: Eye,
    img: '/images/principle-privacy-icon.png',
  },
]

const clarityCards = [
  {
    title: 'Riduce l\u2019ambiguità',
    desc: 'Un consenso espresso in modo chiaro aiuta a costruire rispetto e rende più trasparente la comunicazione.',
    Icon: Lightbulb,
  },
  {
    title: 'Costruisce fiducia',
    desc: 'Quando entrambe le persone partecipano attivamente, la relazione parte da basi più solide.',
    Icon: HeartHandshake,
  },
  {
    title: 'Tutela entrambi',
    desc: 'Un flusso ordinato protegge la dignità e la libertà di scelta di chi è coinvolto.',
    Icon: Shield,
  },
]

const steps = [
  { num: '01', title: 'Crea il tuo accesso', desc: 'Accedi da smartphone e prepara l\u2019app in pochi secondi, senza procedure complesse.' },
  { num: '02', title: 'Avvia una sessione condivisa', desc: 'In presenza, una persona genera un QR code o un codice numerico per associare la sessione all\u2019altra parte.' },
  { num: '03', title: 'Confermate entrambi', desc: 'La conferma richiede un\u2019azione intenzionale di entrambe le persone: il consenso nasce solo dalla partecipazione reciproca.' },
  { num: '04', title: 'Mantieni il controllo', desc: 'La sessione resta sotto il controllo di entrambe le parti e può essere modificata, sospesa o revocata in ogni momento.' },
]

const audiences = [
  { title: 'Per chi si frequenta', desc: 'Per adulti che vogliono costruire fiducia fin dall\u2019inizio, privilegiando una comunicazione più chiara ed esplicita.' },
  { title: 'Per coppie adulte', desc: 'Per chi considera il consenso una pratica continua e condivisa, non un presupposto implicito.' },
  { title: 'Per contesti educativi', desc: 'Per professionisti, educatori o progetti che lavorano su relazioni, rispetto e cultura del consenso.' },
]

const privacyBullets = [
  'Raccogliamo solo le informazioni essenziali al funzionamento del servizio.',
  'Nessun nome reale obbligatorio, nessun documento richiesto nella versione attuale.',
  'Entrambe le parti mantengono il controllo: la conferma è sempre reciproca.',
  'La revoca è immediata e disponibile fino alla chiusura della sessione.',
  'Nessun audio obbligatorio, nessun contenuto registrato senza una tua azione.',
]

const installCards = [
  { title: 'Web app', desc: 'Apri l\u2019app dal browser del tuo smartphone e usala subito, senza installazioni complesse.', Icon: Smartphone },
  { title: 'iPhone', desc: 'Aggiungi la web app alla schermata Home in pochi passaggi: funziona come un\u2019app nativa.', Icon: Apple },
  { title: 'Android', desc: 'Puoi installarla dal browser oppure usare la versione APK per un accesso diretto.', Icon: ArrowRight },
  { title: 'In arrivo', desc: 'Le future modalità di distribuzione potranno includere Google Play e App Store.', Icon: Users },
]

const values = [
  { k: 'Rispetto', v: 'ogni interazione significativa merita attenzione e riconoscimento reciproco.' },
  { k: 'Chiarezza', v: 'ciò che conta deve poter essere espresso senza ambiguità.' },
  { k: 'Parità', v: 'il controllo non appartiene a una sola parte, ma a entrambe.' },
  { k: 'Riservatezza', v: 'la sfera privata richiede strumenti sobri e progettati con misura.' },
]

const faqs = [
  { q: 'Questa app sostituisce il dialogo tra le persone?', a: 'No. L\u2019app è uno strumento di supporto alla comunicazione del consenso, non un sostituto del dialogo continuo, della libertà individuale o della revoca in ogni momento.' },
  { q: 'Il consenso può essere revocato?', a: 'Sì. La revoca resta sempre possibile fino alla chiusura della sessione, secondo la logica dichiarata del prodotto.' },
  { q: 'Serve installarla per usarla?', a: 'No necessariamente. Può essere usata come web app da smartphone, con possibilità di installazione rapida su iPhone e Android.' },
  { q: 'Quali dati vengono raccolti?', a: 'Il progetto dichiara un approccio orientato alla minimizzazione dei dati. Nessun nome reale è obbligatorio, nessun documento è richiesto nella versione attuale.' },
  { q: 'È pensata solo per chi si frequenta?', a: 'No. Può avere senso anche in contesti di educazione, confronto o consulenza, come esempio di strumento digitale per una comunicazione più esplicita e responsabile.' },
  { q: 'Come funziona il pairing?', a: 'In presenza, una persona genera un QR code o un codice numerico. L\u2019altra persona lo scansiona o lo inserisce per associarsi alla stessa sessione.' },
]

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

export function WelcomePage() {
  const { user } = useAuthStore()
  if (user) return <Navigate to="/app" replace />

  const showIosHint = isIosSafariInstallPromptVisible()
  const androidApkLink = downloadLinks.find((i) => i.label === 'APK diretto')?.href ?? null

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#25211C] font-[Inter,ui-sans-serif,system-ui,sans-serif] selection:bg-[#1E6B68]/20 antialiased">
      <StickyHeader />
      <main>
        <HeroSection />
        <WhatIsSection />
        <WhyClaritySection />
        <PrinciplesSection />
        <HowItWorksSection />
        <AudienceSection />
        <PrivacyTrustSection />
        <AccessInstallSection showIosHint={showIosHint} androidApkLink={androidApkLink} />
        <VisionSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <LandingFooter androidApkLink={androidApkLink} />
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// 1. STICKY HEADER
// ═════════════════════════════════════════════════════════════════════════════

function StickyHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-[#DDD4C8]/60 bg-[#F7F4EE]/90 px-5 sm:px-8 backdrop-blur-lg">
      <div className="flex items-center gap-2">
        <ShieldCheck size={22} className="text-[#1E6B68]" />
        <span className="text-[15px] font-bold tracking-tight text-[#25211C]" style={{ fontFamily: "'DM Serif Display', serif" }}>APP del Consenso</span>
      </div>

      <nav className="hidden md:flex items-center gap-7 text-[13px] font-semibold text-[#6F6A63]">
        <a href="#come-funziona" className="transition-colors hover:text-[#25211C]">Come funziona</a>
        <a href="#per-chi-e" className="transition-colors hover:text-[#25211C]">Per chi è</a>
        <a href="#privacy" className="transition-colors hover:text-[#25211C]">Privacy</a>
        <a href="#visione" className="transition-colors hover:text-[#25211C]">Visione</a>
        <a href="#faq" className="transition-colors hover:text-[#25211C]">FAQ</a>
      </nav>

      <div className="flex items-center gap-3">
        <Link to="/login" className="hidden sm:block text-sm font-semibold text-[#6F6A63] transition-colors hover:text-[#25211C]">
          Accedi
        </Link>
        <Link to="/register" className="flex h-9 items-center rounded-full bg-[#1E6B68] px-5 text-[13px] font-bold text-white transition-all hover:bg-[#16514F] active:scale-[0.97] shadow-sm">
          Apri l'app
        </Link>
      </div>
    </header>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// 2. HERO
// ═════════════════════════════════════════════════════════════════════════════

function HeroSection() {
  const fade = fadeProps()

  return (
    <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-28 overflow-hidden">
      {/* Warm ambient glow */}
      <div className="pointer-events-none absolute right-[-15%] top-[-10%] h-[60vh] w-[60vw] rounded-full bg-[#DCE9E5]/40 blur-[120px]" />
      <div className="pointer-events-none absolute left-[-10%] bottom-0 h-[40vh] w-[50vw] rounded-full bg-[#EEE4D7]/50 blur-[100px]" />

      <div className="relative mx-auto max-w-6xl px-6 lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
        {/* Text column */}
        <motion.div {...fade} className="text-center lg:text-left">
          <span className="inline-block rounded-full border border-[#DDD4C8] bg-[#FBF8F3] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#1E6B68] mb-6 shadow-sm">
            Piattaforma per il consenso chiaro e reciproco
          </span>

          <h1 className="text-[2rem] sm:text-[2.75rem] lg:text-[3.25rem] font-bold leading-[1.12] tracking-tight text-[#25211C] mb-6" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Più chiarezza, più rispetto nelle interazioni che contano.
          </h1>

          <p className="mx-auto max-w-xl lg:mx-0 text-lg sm:text-xl leading-relaxed text-[#6F6A63] mb-8">
            APP del Consenso aiuta due persone adulte a esprimere e confermare un consenso condiviso — con controllo reciproco, privacy essenziale e revoca sempre disponibile.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start mb-5">
            <Link to="/register" className="flex h-[52px] w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[#1E6B68] px-8 text-base font-bold text-white transition-all hover:bg-[#16514F] active:scale-[0.97] shadow-[0_4px_20px_rgba(30,107,104,0.18)]">
              Apri l'app
              <ArrowRight size={18} />
            </Link>
            <a href="#come-funziona" className="flex h-[52px] w-full sm:w-auto items-center justify-center rounded-full border border-[#DDD4C8] bg-white px-7 text-base font-semibold text-[#25211C] transition-all hover:bg-[#FBF8F3] hover:border-[#1E6B68]/30 active:scale-[0.97]">
              Scopri come funziona
            </a>
          </div>

          <p className="text-[13px] text-[#6F6A63]/80 mb-8 lg:mb-0">
            Utilizzabile da smartphone, installabile in pochi secondi su iPhone e Android.
          </p>

          {/* Trust pills — mobile horizontal scroll, desktop inline */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-2 lg:mt-6">
            {trustPills.map((pill) => (
              <span key={pill} className="inline-flex items-center gap-1.5 rounded-full border border-[#DCE9E5] bg-[#DCE9E5]/40 px-3.5 py-1 text-[12px] font-semibold text-[#1E6B68]">
                <ShieldCheck size={13} />
                {pill}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Mockup column */}
        <motion.div {...fadeProps(0.15)} className="mt-14 lg:mt-0 flex items-center justify-center">
          <div className="relative w-full max-w-[360px] lg:max-w-[540px] rounded-[32px] overflow-hidden shadow-[0_24px_60px_rgba(30,107,104,0.1)] bg-white/40 backdrop-blur-sm border border-[#DDD4C8]/50 flex items-center justify-center p-2">
            <img 
              src="/images/hero-phone-mockup.jpg" 
              alt="Mockup smartphone dell’app APP del Consenso con interfaccia mobile chiara, privata e rassicurante"
              className="w-full h-auto object-contain rounded-[24px]"
              fetchPriority="high"
            />
          </div>
        </motion.div>
      </div>

      {/* Disclaimer */}
      <div className="mx-auto max-w-2xl px-6 mt-12 lg:mt-16 text-center">
        <p className="text-[12px] leading-relaxed text-[#6F6A63]/60">
          Questo strumento supporta la comunicazione del consenso, ma non sostituisce il dialogo continuo,
          la libertà di scelta o la possibilità di revoca in qualsiasi momento.
        </p>
      </div>
    </section>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// 3. CHE COS'È
// ═════════════════════════════════════════════════════════════════════════════

function WhatIsSection() {
  const fade = fadeProps()
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div {...fade} className="grid gap-10 md:grid-cols-2 md:items-start">
          <div>
            <h2 className="text-[1.75rem] sm:text-[2rem] font-bold leading-tight tracking-tight text-[#25211C] mb-5" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Che cos'è APP del Consenso
            </h2>
            <p className="text-lg leading-relaxed text-[#6F6A63]">
              Una web app progettata per supportare la comunicazione esplicita del consenso tra adulti, in un flusso semplice, privato e reciproco. Nasce per ridurre le ambiguità e offrire uno spazio digitale di conferma e controllo condiviso.
            </p>
          </div>
          <div className="rounded-2xl border border-[#DDD4C8] bg-[#FBF8F3] overflow-hidden shadow-sm flex flex-col">
            <img 
              src="/images/what-is-dialogue.jpg" 
              alt="Illustrazione editoriale di due adulti che conversano in modo calmo e rispettoso in un ambiente riservato"
              className="w-full h-auto aspect-[4/3] object-cover"
              loading="lazy"
            />
            <div className="p-7 flex-1">
              <p className="text-[15px] leading-relaxed text-[#6F6A63]">
                Non trasforma una relazione in una procedura. Aiuta invece a rendere più chiaro un passaggio delicato, con una struttura comprensibile, accessibile da smartphone e pensata per essere usata in presenza.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// 4. PERCHÉ LA CHIAREZZA CONTA
// ═════════════════════════════════════════════════════════════════════════════

function WhyClaritySection() {
  return (
    <section className="bg-[#FBF8F3] py-20 lg:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div {...fadeProps()}>
          <h2 className="text-center text-[1.75rem] sm:text-[2rem] font-bold tracking-tight text-[#25211C] mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Perché la chiarezza conta
          </h2>
          <p className="text-center text-lg text-[#6F6A63] mb-14 max-w-2xl mx-auto">
            Nelle interazioni tra adulti, il consenso non dovrebbe essere lasciato all'interpretazione. Esprimerlo in modo chiaro costruisce rispetto e riduce le ambiguità.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {clarityCards.map((c, i) => (
            <motion.div key={c.title} {...fadeProps(i * 0.08)} className="rounded-2xl border border-[#DDD4C8] bg-white p-7 hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-[#DCE9E5] flex items-center justify-center mb-5">
                <c.Icon size={22} className="text-[#1E6B68]" />
              </div>
              <h3 className="text-lg font-bold text-[#25211C] mb-2">{c.title}</h3>
              <p className="text-[15px] leading-relaxed text-[#6F6A63]">{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// 5. I QUATTRO PRINCIPI
// ═════════════════════════════════════════════════════════════════════════════

function PrinciplesSection() {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div {...fadeProps()}>
          <h2 className="text-[1.75rem] sm:text-[2rem] font-bold tracking-tight text-[#25211C] mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Costruita su quattro principi
          </h2>
          <p className="text-lg text-[#6F6A63] mb-12 max-w-xl">Ogni decisione di design parte da qui.</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((p, i) => (
            <motion.div key={p.title} {...fadeProps(i * 0.07)} className="rounded-2xl border border-[#DDD4C8] bg-[#FBF8F3] p-6 hover:bg-[#DCE9E5]/30 transition-colors">
              <img src={p.img} alt={`Icona editoriale che rappresenta ${p.title.toLowerCase()}`} className="w-[42px] h-[42px] object-contain mb-4 mix-blend-multiply opacity-90" loading="lazy" />
              <h3 className="text-[17px] font-bold text-[#25211C] mb-2">{p.title}</h3>
              <p className="text-[14px] leading-relaxed text-[#6F6A63]">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// 6. COME FUNZIONA
// ═════════════════════════════════════════════════════════════════════════════

function HowItWorksSection() {
  return (
    <section id="come-funziona" className="bg-[#FBF8F3] py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <motion.div {...fadeProps()} className="text-center mb-10">
          <h2 className="text-[1.75rem] sm:text-[2rem] font-bold tracking-tight text-[#25211C] mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Come funziona
          </h2>
          <p className="text-lg text-[#6F6A63]">Un flusso disegnato per la presenza e l'immediatezza.</p>
        </motion.div>

        <motion.div {...fadeProps()} className="mb-14 overflow-hidden rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.04)] border border-[#DDD4C8] bg-white">
          <img 
            src="/images/how-it-works-flow.jpg" 
            alt="Schema visivo del funzionamento dell’app con accesso, pairing in presenza, conferma reciproca e controllo con revoca"
            className="w-full h-auto object-contain"
            loading="lazy"
          />
        </motion.div>

        <div className="relative space-y-8 before:absolute before:left-[31px] before:top-0 before:h-full before:w-px before:bg-[#DDD4C8]">
          {steps.map((s, i) => (
            <motion.div key={s.num} {...fadeProps(i * 0.08)} className="relative flex items-start gap-5 pl-0">
              <div className="flex-shrink-0 w-16 h-16 rounded-full border-[3px] border-[#F7F4EE] bg-[#1E6B68] text-white font-bold text-base flex items-center justify-center shadow-sm z-10">
                {s.num}
              </div>
              <div className="rounded-2xl border border-[#DDD4C8] bg-white p-6 flex-1 shadow-sm">
                <h3 className="text-lg font-bold text-[#25211C] mb-1.5">{s.title}</h3>
                <p className="text-[15px] leading-relaxed text-[#6F6A63]">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// 7. PER CHI È
// ═════════════════════════════════════════════════════════════════════════════

function AudienceSection() {
  return (
    <section id="per-chi-e" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div {...fadeProps()}>
          <h2 className="text-center text-[1.75rem] sm:text-[2rem] font-bold tracking-tight text-[#25211C] mb-12" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Per chi è pensata
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {audiences.map((a, i) => (
            <motion.div key={a.title} {...fadeProps(i * 0.08)} className="rounded-2xl border border-[#DDD4C8] bg-[#FBF8F3] p-7 hover:border-[#1E6B68]/30 transition-colors">
              <h3 className="text-[17px] font-bold text-[#1E6B68] mb-3">{a.title}</h3>
              <p className="text-[15px] leading-relaxed text-[#6F6A63]">{a.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// 8. PRIVACY E FIDUCIA
// ═════════════════════════════════════════════════════════════════════════════

function PrivacyTrustSection() {
  return (
    <section id="privacy" className="bg-[#1E6B68] text-white py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-14 lg:grid-cols-2 items-center">
          <motion.div {...fadeProps()} className="order-2 lg:order-1">
            <h2 className="text-[1.75rem] sm:text-[2rem] font-bold tracking-tight mb-8" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Privacy e fiducia,<br/>fin dall'inizio
            </h2>
            <ul className="space-y-6">
              {privacyBullets.map((b, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <ShieldCheck className="text-[#DCE9E5] shrink-0 mt-0.5" size={24} />
                  <span className="text-base leading-relaxed text-white/90">{b}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div {...fadeProps(0.1)} className="order-1 lg:order-2 flex flex-col pt-4 lg:pt-0">
            <div className="rounded-3xl bg-white/5 border border-white/10 overflow-hidden shadow-2xl backdrop-blur-sm mb-6">
              <img 
                src="/images/privacy-visual.jpg" 
                alt="Visual astratto che rappresenta privacy, minimizzazione dei dati, controllo condiviso e design riservato"
                className="w-full h-auto aspect-[4/3] object-contain"
                loading="lazy"
              />
            </div>
            <p className="text-sm text-white/70 italic leading-relaxed text-center px-4">
              L'obiettivo non è complicare la relazione, ma renderla più leggibile, più esplicita e più rispettosa per chi la vive.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// 9. ACCESSO E INSTALLAZIONE
// ═════════════════════════════════════════════════════════════════════════════

function AccessInstallSection({ showIosHint, androidApkLink }: { showIosHint: boolean; androidApkLink: string | null }) {
  return (
    <section className="bg-[#FBF8F3] py-20 lg:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div {...fadeProps()}>
          <h2 className="text-[1.75rem] sm:text-[2rem] font-bold tracking-tight text-[#25211C] mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Inizia nel modo che preferisci
          </h2>
          <p className="text-lg text-[#6F6A63] mb-10 max-w-xl">Accesso semplice e immediato, senza procedure complesse.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {installCards.map((c, i) => (
            <motion.div key={c.title} {...fadeProps(i * 0.06)} className="rounded-2xl border border-[#DDD4C8] bg-white p-6 hover:shadow-sm transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#DCE9E5] flex items-center justify-center mb-4">
                <c.Icon size={20} className="text-[#1E6B68]" />
              </div>
              <h3 className="font-bold text-[#25211C] mb-2">{c.title}</h3>
              <p className="text-sm text-[#6F6A63] leading-relaxed">{c.desc}</p>
            </motion.div>
          ))}
        </div>

        {(showIosHint || androidApkLink) && (
          <div className="mt-8 flex flex-col gap-4">
            {showIosHint && (
              <div className="rounded-2xl border border-[#1E6B68]/20 bg-[#DCE9E5]/50 px-6 py-5">
                <p className="text-sm font-semibold text-[#25211C]">iPhone rilevato</p>
                <p className="mt-1 text-sm text-[#6F6A63]">Tocca condividi in Safari e poi <span className="font-bold text-[#25211C]">Aggiungi a schermata Home</span> per installare l'app.</p>
              </div>
            )}
            {androidApkLink && (
              <a href={androidApkLink} className="self-start inline-flex items-center gap-2 rounded-full border border-[#1E6B68]/30 bg-white px-6 py-3 text-sm font-semibold text-[#1E6B68] hover:bg-[#DCE9E5]/50 transition-colors">
                <Smartphone size={16} /> Scarica APK per Android
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// 10. VISIONE
// ═════════════════════════════════════════════════════════════════════════════

function VisionSection() {
  return (
    <section id="visione" className="bg-white py-20 lg:py-28 overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 grid gap-14 lg:grid-cols-2 items-center">
        <motion.div {...fadeProps()}>
          <h2 className="text-[1.75rem] sm:text-[2rem] font-bold tracking-tight text-[#25211C] mb-6" style={{ fontFamily: "'DM Serif Display', serif" }}>
            La visione dietro il progetto
          </h2>
          <div className="space-y-4 text-lg leading-relaxed text-[#6F6A63] mb-10">
            <p>Vogliamo contribuire a una cultura in cui il consenso sia più chiaro da esprimere, più semplice da condividere e più naturale da rispettare.</p>
            <p>Per noi la tecnologia non deve sostituire la relazione umana. Deve però poter offrire uno strumento sobrio, accessibile e responsabile per sostenere chiarezza, parità e consapevolezza nei momenti che contano.</p>
          </div>
          <div className="space-y-3">
            <h3 className="text-[17px] font-bold text-[#25211C] mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>I nostri valori</h3>
            {values.map((v) => (
              <div key={v.k} className="rounded-xl border border-[#DDD4C8] bg-[#FBF8F3] p-4 text-[15px]">
                <span className="font-bold text-[#1E6B68]">{v.k}</span> &mdash; <span className="text-[#6F6A63]">{v.v}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div {...fadeProps(0.1)} className="rounded-[32px] border border-[#DDD4C8] overflow-hidden shadow-sm bg-[#FBF8F3]">
          <img 
            src="/images/vision-manifesto.jpg"
            alt="Visual editoriale simbolica che rappresenta chiarezza, rispetto e fiducia come percorso condiviso"
            className="w-full h-auto object-cover aspect-[4/5]"
            loading="lazy"
          />
        </motion.div>
      </div>
    </section>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// 11. FAQ
// ═════════════════════════════════════════════════════════════════════════════

function FAQSection() {
  return (
    <section id="faq" className="bg-[#FBF8F3] py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <motion.div {...fadeProps()}>
          <h2 className="text-center text-[1.75rem] sm:text-[2rem] font-bold tracking-tight text-[#25211C] mb-10" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Domande frequenti
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <FaqItem key={i} question={f.q} answer={f.a} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl border border-[#DDD4C8] bg-white overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6B68] focus-visible:ring-offset-2 rounded-xl">
        <span className="font-semibold text-[#25211C] pr-4">{question}</span>
        <ChevronDown size={20} className={cn('text-[#6F6A63] shrink-0 transition-transform duration-300', open && 'rotate-180')} />
      </button>
      <motion.div initial={false} animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
        <div className="px-6 pb-5 text-[15px] text-[#6F6A63] leading-relaxed border-t border-[#DDD4C8]/60 pt-4">
          {answer}
        </div>
      </motion.div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// 12. CTA FINALE
// ═════════════════════════════════════════════════════════════════════════════

function FinalCTASection() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6">
        <motion.div {...fadeProps()} className="rounded-3xl border border-[#DDD4C8] bg-gradient-to-br from-[#DCE9E5]/40 to-[#FBF8F3] p-10 sm:p-14 text-center shadow-sm relative overflow-hidden">
          <div className="pointer-events-none absolute top-0 right-0 h-48 w-48 -translate-y-1/3 translate-x-1/3 rounded-full bg-[#1E6B68]/8 blur-[50px]" />

          <h2 className="text-[1.5rem] sm:text-[2rem] font-bold text-[#25211C] mb-4 leading-tight relative z-10" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Porta più chiarezza nelle interazioni che contano.
          </h2>
          <p className="text-[#6F6A63] mb-8 max-w-md mx-auto text-lg relative z-10">
            Usa uno strumento pensato per adulti, progettato per il mobile e costruito intorno a reciprocità, controllo condiviso e riservatezza.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 relative z-10">
            <Link to="/register" className="flex h-[52px] items-center justify-center rounded-full bg-[#1E6B68] px-8 text-base font-bold text-white hover:bg-[#16514F] transition-all active:scale-[0.97] shadow-sm">
              Apri l'app
            </Link>
            <Link to="/login" className="flex h-[52px] items-center justify-center rounded-full border border-[#DDD4C8] bg-white px-8 text-base font-semibold text-[#25211C] hover:bg-[#FBF8F3] transition-all active:scale-[0.97]">
              Accedi
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// 13. FOOTER
// ═════════════════════════════════════════════════════════════════════════════

function LandingFooter({ androidApkLink }: { androidApkLink: string | null }) {
  return (
    <footer className="border-t border-[#DDD4C8] bg-[#F7F4EE] pt-14 pb-8">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          <div>
            <h4 className="font-bold text-[#25211C] mb-4 text-sm">Prodotto</h4>
            <ul className="space-y-2.5 text-sm text-[#6F6A63]">
              <li><a href="#come-funziona" className="hover:text-[#25211C] transition-colors">Come funziona</a></li>
              <li><Link to="/register" className="hover:text-[#25211C] transition-colors">Accesso web app</Link></li>
              {androidApkLink && <li><a href={androidApkLink} className="hover:text-[#25211C] transition-colors">APK Android</a></li>}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[#25211C] mb-4 text-sm">Supporto</h4>
            <ul className="space-y-2.5 text-sm text-[#6F6A63]">
              <li><a href="#faq" className="hover:text-[#25211C] transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-[#25211C] transition-colors">Contatti</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[#25211C] mb-4 text-sm">Legal</h4>
            <ul className="space-y-2.5 text-sm text-[#6F6A63]">
              <li><a href="#" className="hover:text-[#25211C] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#25211C] transition-colors">Termini d'uso</a></li>
              <li><a href="#" className="hover:text-[#25211C] transition-colors">Note importanti</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[#25211C] mb-4 text-sm">Progetto</h4>
            <ul className="space-y-2.5 text-sm text-[#6F6A63]">
              <li><a href="#visione" className="hover:text-[#25211C] transition-colors">Visione</a></li>
              <li><a href="#per-chi-e" className="hover:text-[#25211C] transition-colors">Per chi è</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#DDD4C8] pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-[12px] text-[#6F6A63]">
          <p className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-[#1E6B68]" />
            APP del Consenso &copy; {new Date().getFullYear()}
          </p>
          <p>Più chiarezza, più reciprocità, più rispetto nelle interazioni tra adulti.</p>
        </div>
      </div>
    </footer>
  )
}
