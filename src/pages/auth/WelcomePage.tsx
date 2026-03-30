import { motion } from 'framer-motion'
import {
  Apple,
  ArrowRight,
  ChevronDown,
  EyeOff,
  Handshake,
  HeartHandshake,
  QrCode,
  ShieldCheck,
  Smartphone,
  TimerReset,
  TriangleAlert,
  Users
} from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { downloadLinks } from '@/lib/downloadLinks'
import { cn, isIosSafariInstallPromptVisible } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

// ─── Design tokens (Stitch — Indigo Vault) ───────────────────────────────────
// Background:   #131318   Surface low:   #1B1B20   Surface:      #1F1F24
// Primary:      #C0C1FF   Primary-ctr:   #8083FF   On-primary:   #1000A9
// Tertiary:     #4EDEA3   Secondary:     #C6C4DF
// On-surface:   #E4E1E9   On-surface-v:  #C7C4D7   Outline-v:    #464554
// Error-ctr:    #93000A   On-error-ctr:  #FFB4AB
// Ghost border: border-[#464554]/20   Glass: backdrop-blur-[12px]
// ─────────────────────────────────────────────────────────────────────────────

// Data definitions
const trustItems = [
  'Reciproco',
  'Revocabile',
  'Privato',
  'Pensato per adulti'
]

const principles = [
  {
    title: 'Chiarezza',
    desc: 'Le intenzioni vengono espresse in modo diretto, prima che l’incertezza prenda il posto del dialogo.',
    icon: Handshake,
    bg: 'bg-[#C0C1FF]/10',
    color: 'text-[#C0C1FF]'
  },
  {
    title: 'Reciprocità',
    desc: 'La conferma esiste solo se entrambe le persone partecipano attivamente allo stesso passaggio.',
    icon: HeartHandshake,
    bg: 'bg-[#C6C4DF]/10',
    color: 'text-[#C6C4DF]'
  },
  {
    title: 'Revoca immediata',
    desc: 'Il consenso non è statico: può essere sospeso o revocato in qualsiasi momento, fino alla chiusura della sessione.',
    icon: TimerReset,
    bg: 'bg-[#4EDEA3]/10',
    color: 'text-[#4EDEA3]'
  },
  {
    title: 'Riservatezza',
    desc: 'Il sistema è progettato per limitare i dati trattati e proteggere ciò che appartiene alla sfera privata.',
    icon: EyeOff,
    bg: 'bg-[#8083FF]/10',
    color: 'text-[#8083FF]'
  }
]

const steps = [
  {
    num: '01',
    title: 'Crea il tuo accesso',
    desc: 'Accedi da smartphone e prepara l’app in pochi secondi, senza procedure complesse.'
  },
  {
    num: '02',
    title: 'Avvia una sessione condivisa',
    desc: 'In presenza, una delle due persone genera un QR code o un codice numerico per associare la sessione all’altra parte.'
  },
  {
    num: '03',
    title: 'Confermate entrambi in modo attivo',
    desc: 'La conferma richiede un’azione intenzionale da parte di entrambe le persone, così il consenso nasce solo da una partecipazione reciproca.'
  },
  {
    num: '04',
    title: 'Mantieni sempre il controllo',
    desc: 'La sessione resta sotto il controllo di entrambe le parti e può essere modificata, sospesa o revocata fino alla sua conclusione.'
  }
]

const audienceBlocks = [
  {
    title: 'Per chi si frequenta',
    desc: 'Per adulti che vogliono costruire fiducia fin dall’inizio, evitando segnali confusi e privilegiando una comunicazione più esplicita.'
  },
  {
    title: 'Per coppie adulte',
    desc: 'Per chi considera il consenso una pratica continua e condivisa, non un presupposto implicito.'
  },
  {
    title: 'Per contesti educativi o consulenziali',
    desc: 'Per professionisti, educatori o progetti che lavorano su relazioni, rispetto e cultura del consenso, e desiderano mostrare strumenti contemporanei di comunicazione responsabile.'
  }
]

const installCards = [
  {
    title: 'Web app live',
    desc: 'Apri subito l’app dal browser del tuo smartphone e usala senza configurazioni difficili.',
    icon: Smartphone
  },
  {
    title: 'Installazione su iPhone',
    desc: 'Aggiungi la web app alla schermata Home in pochi passaggi e usala come se fosse un’app installata.',
    icon: Apple
  },
  {
    title: 'Installazione su Android',
    desc: 'Puoi installarla dal browser oppure usare la versione APK per un accesso ancora più diretto.',
    icon: ArrowRight
  },
  {
    title: 'Disponibilità futura',
    desc: 'Le future modalità di distribuzione potranno includere canali store e versioni ancora più immediate da usare, mantenendo la stessa logica di semplicità mobile-first.',
    icon: Users
  }
]

const values = [
  { k: 'Rispetto', v: 'ogni interazione significativa merita attenzione e riconoscimento reciproco.' },
  { k: 'Chiarezza', v: 'ciò che conta deve poter essere espresso senza ambiguità.' },
  { k: 'Parità', v: 'il controllo non appartiene a una sola parte, ma a entrambe.' },
  { k: 'Riservatezza', v: 'la sfera privata richiede strumenti sobri e progettati con misura.' }
]

const faqs = [
  {
    q: 'Questa app sostituisce il dialogo tra le persone?',
    a: 'No. L’app è uno strumento di supporto alla comunicazione del consenso, non un sostituto del dialogo continuo, della libertà individuale o della revoca in ogni momento.'
  },
  {
    q: 'Il consenso può essere revocato?',
    a: 'Sì. La revoca resta sempre possibile fino alla chiusura della sessione, secondo la logica dichiarata del prodotto.'
  },
  {
    q: 'Serve installarla?',
    a: 'No necessariamente. Può essere usata come web app da smartphone, con possibilità di installazione rapida su iPhone e Android.'
  },
  {
    q: 'Qual è il principio di privacy del servizio?',
    a: 'Il progetto dichiara un approccio orientato alla minimizzazione dei dati, alla riservatezza e a un design non invasivo.'
  },
  {
    q: 'È uno strumento pensato solo per chi si frequenta?',
    a: 'No. Può avere senso anche in contesti di educazione, confronto o consulenza, come esempio di strumento digitale per una comunicazione più esplicita e responsabile.'
  }
]

// ─────────────────────────────────────────────────────────────────────────────

export function WelcomePage() {
  const { user } = useAuthStore()

  if (user) {
    return <Navigate to="/app" replace />
  }

  const showIosHint = isIosSafariInstallPromptVisible()
  const androidApkLink = downloadLinks.find((item) => item.label === 'APK diretto')?.href ?? null

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#131318] text-[#E4E1E9] font-sans selection:bg-[#C0C1FF]/30">
      
      {/* 1. Header */}
      <header className="fixed inset-x-0 top-0 z-50 flex h-[72px] items-center justify-between border-b border-[#464554]/20 bg-[#131318]/85 px-4 sm:px-8 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-2 text-[#C0C1FF]">
          <ShieldCheck size={24} />
          <span className="text-lg font-extrabold tracking-tight">APP del Consenso</span>
        </div>
        
        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-[13px] font-semibold tracking-wide text-[#C7C4D7]">
          <a href="#come-funziona" className="hover:text-white transition-colors">Come funziona</a>
          <a href="#per-chi-e" className="hover:text-white transition-colors">Per chi è</a>
          <a href="#privacy" className="hover:text-white transition-colors">Privacy</a>
          <a href="#visione" className="hover:text-white transition-colors">Visione</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link to="/login" className="hidden sm:block text-sm font-semibold text-[#E4E1E9] transition-colors hover:text-white">
            Accedi
          </Link>
          <Link
            to="/register"
            className="flex h-9 sm:h-10 items-center justify-center rounded-full bg-gradient-to-b from-[#C0C1FF] to-[#8083FF] px-5 sm:px-6 text-sm font-bold text-[#1000A9] transition-all hover:opacity-90 hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(192,193,255,0.15)]"
          >
            Apri l'app
          </Link>
        </div>
      </header>

      <main className="relative pt-[72px]">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute left-[-20%] top-[-10%] h-[80vh] w-[80vw] rounded-full bg-[#C0C1FF]/[0.05] blur-[140px]" />
        <div className="pointer-events-none absolute right-[-10%] top-[40%] h-[60vh] w-[60vw] rounded-full bg-[#4EDEA3]/[0.03] blur-[120px]" />

        {/* 2. Hero */}
        <section className="relative mx-auto mt-16 max-w-[900px] px-6 text-center lg:mt-24 pb-20">
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
            <span className="inline-block rounded-full border border-[#464554]/30 bg-[#1F1F24]/50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#C0C1FF] mb-6 shadow-sm backdrop-blur-md">
              Piattaforma per il consenso chiaro e reciproco
            </span>
            <h1 className="text-balance text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight text-white mb-6">
              Un modo semplice, riservato e verificabile<br className="hidden sm:block" /> per confermare il consenso tra adulti.
            </h1>
            <p className="mx-auto max-w-2xl text-lg sm:text-xl leading-relaxed text-[#C7C4D7] mb-10 text-balance">
              APP del Consenso aiuta due persone adulte a esprimere e confermare in modo esplicito un consenso condiviso, con controllo reciproco, privacy essenziale e revoca sempre disponibile.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row mb-6">
              <Link to="/register" className="flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[#C0C1FF] px-8 text-base font-bold text-[#1000A9] transition-all hover:bg-white active:scale-[0.98] shadow-[0_8px_30px_rgba(192,193,255,0.2)]">
                Apri l'app
              </Link>
              <a href="#come-funziona" className="flex h-14 w-full sm:w-auto items-center justify-center rounded-full border border-[#464554]/40 bg-[#1B1B20]/50 px-8 text-base font-semibold text-[#E4E1E9] transition-all hover:bg-[#1F1F24] hover:border-white/20 active:scale-[0.98]">
                Scopri come funziona
              </a>
            </div>
            
            <p className="text-sm font-medium text-[#908FA0] mb-16">
              Utilizzabile da smartphone, installabile in pochi secondi su iPhone e Android come web app.
            </p>
            
            {/* Trust strip */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 border-y border-[#464554]/20 py-5">
              {trustItems.map(item => (
                <div key={item} className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#4EDEA3]" />
                  <span className="text-[13px] font-bold uppercase tracking-wider text-[#C7C4D7]">{item}</span>
                </div>
              ))}
            </div>
            
            <p className="mx-auto mt-8 max-w-2xl text-[13px] leading-relaxed text-[#908FA0]/80">
              Questo strumento supporta la comunicazione del consenso, ma non sostituisce il dialogo continuo, 
              la libertà di scelta o la possibilità di revoca in qualsiasi momento.
            </p>
          </motion.div>
        </section>

        {/* 3. Sezione “Che cos’è” */}
        <section className="mx-auto max-w-4xl px-6 py-20 lg:py-28">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.5 }}>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-6">Che cos’è APP del Consenso</h2>
            <div className="grid gap-8 md:grid-cols-2">
              <p className="text-lg leading-relaxed text-[#C7C4D7]">
                APP del Consenso è una web app progettata per supportare la comunicazione esplicita del consenso tra adulti in un flusso semplice, privato e reciproco. Nasce per ridurre ambiguità, favorire chiarezza e offrire a entrambe le parti uno spazio digitale di conferma e controllo condiviso.
              </p>
              <div className="rounded-3xl border border-[#464554]/20 bg-[#1B1B20]/40 p-6 backdrop-blur-sm">
                <p className="text-base leading-relaxed text-[#908FA0]">
                  Non trasforma una relazione in una procedura. Aiuta invece a rendere più chiaro un passaggio delicato, con una struttura comprensibile, accessibile da smartphone e pensata per essere usata in presenza.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* 4. Sezione “Perché la chiarezza conta” */}
        <section className="border-y border-[#464554]/10 bg-black/20 py-20 lg:py-28">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.5 }}>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-8">Perché la chiarezza conta</h2>
              <div className="space-y-6 text-lg leading-relaxed text-[#C7C4D7]">
                <p>Nelle interazioni tra adulti, il consenso non dovrebbe essere lasciato all’interpretazione o dato per implicito. Un consenso espresso in modo chiaro aiuta a costruire rispetto, riduce le ambiguità e rende più trasparente la comunicazione tra le persone.</p>
                <p>La tecnologia non può sostituire la relazione umana, ma può offrire uno spazio ordinato in cui confermare una volontà condivisa, con attenzione alla privacy e al controllo reciproco.</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 5. Sezione “I quattro principi” */}
        <section className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Costruita su quattro principi essenziali</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((pr, i) => (
              <motion.div
                key={pr.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex flex-col gap-5 rounded-3xl border border-[#464554]/20 bg-[#1B1B20]/60 p-7 hover:bg-[#1F1F24] transition-colors"
              >
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl', pr.bg, pr.color)}>
                  <pr.icon size={24} />
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold text-white">{pr.title}</h3>
                  <p className="text-[15px] leading-relaxed text-[#908FA0]">{pr.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 6. Sezione “Come funziona” */}
        <section id="come-funziona" className="border-t border-[#464554]/10 bg-black/10 py-20 lg:py-28 relative">
          <div className="mx-auto max-w-3xl px-6">
            <div className="mb-14 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">Come funziona</h2>
              <p className="text-lg text-[#C7C4D7]">Un flusso disegnato per la presenza e l'immediatezza.</p>
            </div>
            
            <div className="relative space-y-12 before:absolute before:inset-0 before:ml-[31px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#464554]/30 before:to-transparent">
              {steps.map((st, i) => (
                <motion.div key={st.num} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }} className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full border-4 border-[#131318] bg-[#1F1F24] text-[#C0C1FF] font-bold text-lg shadow-lg shrink-0 md:order-1 md:group-odd:-ml-8 md:group-even:-mr-8 z-10">
                    {st.num}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] rounded-3xl border border-[#464554]/20 bg-[#1B1B20]/80 p-6 md:p-8 ml-4 md:ml-0 backdrop-blur-sm">
                    <h3 className="text-xl font-bold text-white mb-2">{st.title}</h3>
                    <p className="text-[15px] leading-relaxed text-[#908FA0]">{st.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Sezione “Per chi è” */}
        <section id="per-chi-e" className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-12 text-center">Per chi è pensata</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {audienceBlocks.map((blk, i) => (
              <motion.div key={blk.title} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }} className="rounded-3xl border border-[#464554]/20 bg-[#1B1B20]/40 p-8 hover:border-[#464554]/40 transition-colors">
                <h3 className="text-emerald-300 text-lg font-bold mb-4">{blk.title}</h3>
                <p className="text-[#C7C4D7] leading-relaxed">{blk.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 8. Sezione “Privacy e fiducia” & 9. “Garanzie operative” */}
        <section id="privacy" className="border-y border-[#464554]/10 bg-[#1B1B20]/30 py-20 lg:py-28">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid gap-16 lg:grid-cols-2 items-start">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-6">Privacy e fiducia, fin dall’inizio</h2>
                <p className="text-lg text-[#C7C4D7] mb-10 leading-relaxed">
                  APP del Consenso è pensata secondo un principio semplice: raccogliere il minimo necessario e mantenere il massimo controllo possibile in mano agli utenti.
                </p>
                <div className="space-y-8">
                  <div>
                    <h4 className="font-bold text-[#E4E1E9] mb-1">Minimizzazione dei dati</h4>
                    <p className="text-sm text-[#908FA0] leading-relaxed">L’obiettivo è ridurre l’esposizione superflua e trattare solo le informazioni utili al funzionamento del flusso.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#E4E1E9] mb-1">Controllo condiviso</h4>
                    <p className="text-sm text-[#908FA0] leading-relaxed">La logica dell’app è reciproca: l’esperienza non si basa su una dichiarazione unilaterale, ma su una conferma attiva di entrambe le parti.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#E4E1E9] mb-1">Progettazione riservata</h4>
                    <p className="text-sm text-[#908FA0] leading-relaxed">L’app evita approcci invasivi e punta a un’esperienza sobria, comprensibile e rispettosa della sfera privata.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#E4E1E9] mb-1">Trasparenza d’uso</h4>
                    <p className="text-sm text-[#908FA0] leading-relaxed">L’utente deve capire sempre cosa sta facendo, cosa sta confermando e quali margini di controllo conserva in ogni momento.</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="rounded-[32px] border border-[#C0C1FF]/20 bg-[linear-gradient(to_bottom,rgba(192,193,255,0.05),rgba(31,31,36,0.8))] p-8 sm:p-10 backdrop-blur-md">
                <h3 className="text-2xl font-bold text-white mb-6">Garanzie operative che contano davvero</h3>
                <ul className="space-y-5 mb-8">
                  <li className="flex gap-3 text-[#C7C4D7]"><ShieldCheck className="text-[#4EDEA3] shrink-0" size={20} /> Sessione condivisa in presenza tramite QR code o codice numerico.</li>
                  <li className="flex gap-3 text-[#C7C4D7]"><ShieldCheck className="text-[#4EDEA3] shrink-0" size={20} /> Conferma attiva e non passiva da entrambe le parti.</li>
                  <li className="flex gap-3 text-[#C7C4D7]"><ShieldCheck className="text-[#4EDEA3] shrink-0" size={20} /> Possibilità di revoca immediata prima della chiusura della sessione.</li>
                  <li className="flex gap-3 text-[#C7C4D7]"><ShieldCheck className="text-[#4EDEA3] shrink-0" size={20} /> Esperienza mobile-first, semplice da usare e da installare.</li>
                </ul>
                <div className="rounded-2xl bg-black/30 p-5 mt-auto">
                  <p className="text-sm text-[#908FA0] italic">
                    L’obiettivo non è complicare la relazione, ma renderla più leggibile, più esplicita e più rispettosa per chi la vive.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 10. Sezione “Accesso e disponibilità” */}
        <section className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-10">Inizia nel modo che preferisci</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {installCards.map((c, i) => (
              <motion.div key={c.title} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.05 }} className="rounded-[24px] border border-[#464554]/20 bg-[#1F1F24]/30 p-6 flex flex-col justify-between hover:bg-[#1F1F24] transition-colors">
                 <div>
                   <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-5">
                      <c.icon size={18} className="text-[#C0C1FF]" />
                   </div>
                   <h3 className="font-bold text-white mb-3">{c.title}</h3>
                   <p className="text-sm text-[#908FA0] leading-relaxed">{c.desc}</p>
                 </div>
              </motion.div>
            ))}
          </div>

          {(showIosHint || androidApkLink) && (
            <div className="mt-8 flex flex-col gap-4">
              {showIosHint && (
                <div className="rounded-2xl border border-[#C0C1FF]/20 bg-[#C0C1FF]/10 px-6 py-5">
                  <p className="text-sm font-semibold text-white">iPhone rilevato</p>
                  <p className="mt-1 text-sm text-[#C7C4D7]">Tocca condividi in Safari e poi <span className="font-bold text-white">Aggiungi a schermata Home</span> per installare l'app.</p>
                </div>
              )}
              {androidApkLink && (
                 <a href={androidApkLink} className="self-start inline-flex items-center gap-2 rounded-full border border-[#C0C1FF]/30 bg-[#1B1B20] px-6 py-3 text-sm font-semibold text-[#C0C1FF] hover:bg-[#C0C1FF]/10 transition-colors">
                   <Smartphone size={16} /> Scarica APK per Android
                 </a>
              )}
            </div>
          )}
        </section>

        {/* 11 & 12. Visione e Valori */}
        <section id="visione" className="bg-[#C0C1FF] py-20 lg:py-28 text-[#131318]">
          <div className="mx-auto max-w-5xl px-6 grid gap-16 md:grid-cols-2 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6 text-[#1000A9]">La visione dietro il progetto</h2>
              <div className="space-y-6 text-lg font-medium opacity-90 leading-relaxed text-[#131318]">
                <p>Vogliamo contribuire a una cultura in cui il consenso sia più chiaro da esprimere, più semplice da condividere e più naturale da rispettare.</p>
                <p>Per noi la tecnologia non deve sostituire la relazione umana. Deve però poter offrire uno strumento sobrio, accessibile e responsabile per sostenere chiarezza, parità e consapevolezza nei momenti che contano.</p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="space-y-4">
              <h3 className="text-2xl font-bold mb-6 text-[#1000A9]">I nostri valori</h3>
              {values.map(val => (
                <div key={val.k} className="rounded-2xl bg-white/30 backdrop-blur-sm p-4">
                  <span className="font-bold text-[#1000A9]">{val.k}</span> — <span>{val.v}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 13. FAQ */}
        <section id="faq" className="mx-auto max-w-3xl px-6 py-20 lg:py-28">
           <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-10 text-center">Domande frequenti</h2>
           <div className="space-y-4">
             {faqs.map((faq, i) => (
                <FaqItem key={i} question={faq.q} answer={faq.a} />
             ))}
           </div>
        </section>

        {/* 14. CTA Finale */}
        <section className="mx-auto max-w-4xl px-6 pb-24">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="rounded-[40px] border border-[#464554]/30 bg-gradient-to-br from-[#1F1F24] to-[#131318] p-10 text-center shadow-2xl relative overflow-hidden">
             
             {/* Glow decor */}
             <div className="absolute top-0 right-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#C0C1FF]/10 blur-[60px] pointer-events-none" />
             
             <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight relative z-10">Porta più chiarezza nelle interazioni che contano.</h2>
             <p className="text-[#C7C4D7] mb-10 max-w-lg mx-auto text-lg relative z-10">Usa uno strumento pensato per adulti, progettato per il mobile e costruito intorno a reciprocità, controllo condiviso e riservatezza.</p>
             <div className="flex flex-col justify-center sm:flex-row gap-4 relative z-10">
                <Link to="/register" className="flex h-14 items-center justify-center rounded-full bg-white px-8 text-base font-bold text-[#131318] hover:bg-[#C0C1FF] transition-all active:scale-95 shadow-lg">Apri l'app</Link>
                <Link to="/login" className="flex h-14 items-center justify-center rounded-full border border-white/20 bg-black/40 px-8 text-base font-bold text-white hover:bg-black/60 transition-all active:scale-95">Accedi</Link>
             </div>
          </motion.div>
        </section>

      </main>

      {/* 15. Footer */}
      <footer className="border-t border-[#464554]/20 bg-[#131318] pt-16 pb-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
            <div>
              <h4 className="font-bold text-white mb-4">Prodotto</h4>
              <ul className="space-y-3 text-sm text-[#908FA0]">
                <li><a href="#come-funziona" className="hover:text-white transition-colors">Come funziona</a></li>
                <li><a href="#installazione" className="hover:text-white transition-colors">Installazione</a></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Accesso web app</Link></li>
                {androidApkLink && <li><a href={androidApkLink} className="hover:text-white transition-colors">APK Android</a></li>}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Supporto</h4>
              <ul className="space-y-3 text-sm text-[#908FA0]">
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contatti</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Aggiornamenti</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-[#908FA0]">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Termini d'uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Note importanti</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Progetto</h4>
              <ul className="space-y-3 text-sm text-[#908FA0]">
                <li><a href="#visione" className="hover:text-white transition-colors">Visione</a></li>
                <li><a href="#visione" className="hover:text-white transition-colors">Valori</a></li>
                <li><a href="#per-chi-e" className="hover:text-white transition-colors">Per chi è pensata</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#464554]/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#908FA0]">
            <p>APP del Consenso &copy; {new Date().getFullYear()}</p>
            <p>più chiarezza, più reciprocità, più rispetto nelle interazioni tra adulti.</p>
          </div>
        </div>
      </footer>

    </div>
  )
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="rounded-2xl border border-[#464554]/20 bg-[#1B1B20]/40 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
      >
        <span className="font-bold text-[#E4E1E9] text-lg pr-4">{question}</span>
        <ChevronDown size={20} className={cn('text-[#908FA0] shrink-0 transition-transform duration-300', isOpen && 'rotate-180')} />
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        className="overflow-hidden"
      >
        <div className="px-6 pb-6 text-[#C7C4D7] leading-relaxed border-t border-[#464554]/10 pt-4 mt-2">
          {answer}
        </div>
      </motion.div>
    </div>
  )
}
