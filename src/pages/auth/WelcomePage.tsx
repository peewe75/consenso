import { motion } from 'framer-motion'
import { Apple, ArrowRight, QrCode, ShieldCheck, Smartphone, TimerReset, TriangleAlert } from 'lucide-react'
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

const featureCards = [
  {
    label: 'Pairing in presenza',
    body: 'Associa il profilo tramite QR Code o codice numerico per una validazione sicura e immediata.',
    icon: QrCode,
    iconClass: 'text-[#C0C1FF] bg-[#C0C1FF]/10',
  },
  {
    label: 'Revoca immediata',
    body: 'Il consenso è dinamico. Puoi revocarlo in qualsiasi istante prima che la sessione si chiuda.',
    icon: TimerReset,
    iconClass: 'text-[#4EDEA3] bg-[#4EDEA3]/10',
  },
  {
    label: 'Privacy by design',
    body: 'Nessun nome reale, nessun audio. Solo pseudonimo e colore avatar. RLS su ogni tabella.',
    icon: ShieldCheck,
    iconClass: 'text-[#C6C4DF] bg-[#C6C4DF]/10',
  },
] as const

const installSteps = [
  {
    platform: 'iOS / Safari',
    icon: Apple,
    steps: ['Apri questo sito su Safari', 'Tocca il tasto "Condividi"', 'Seleziona "Aggiungi alla schermata Home"'],
  },
  {
    platform: 'Android / Chrome',
    icon: Smartphone,
    steps: ['Apri Chrome e naviga al sito', 'Tocca i tre puntini in alto a destra', 'Seleziona "Installa app"'],
  },
] as const

// ─────────────────────────────────────────────────────────────────────────────

export function WelcomePage() {
  const { user } = useAuthStore()

  if (user) {
    return <Navigate to="/app" replace />
  }

  const showIosHint = isIosSafariInstallPromptVisible()
  const androidApkLink = downloadLinks.find((item) => item.label === 'APK diretto')?.href ?? null

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#131318] text-[#E4E1E9]">
      {/* ── Fixed Header ──────────────────────────────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-50 flex h-20 items-center justify-between border-b border-[#464554]/20 bg-[#131318]/80 px-6 shadow-[0_4px_40px_rgba(99,102,241,0.06)] backdrop-blur-xl">
        <div className="flex items-center gap-2 text-[#C0C1FF]">
          <ShieldCheck size={26} />
          <span className="text-xl font-bold tracking-tight">APP del Consenso</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-[#C7C4D7] transition-colors hover:text-[#E4E1E9]">
            Accedi
          </Link>
          <Link
            to="/register"
            className="flex min-h-10 items-center justify-center rounded-full bg-gradient-to-b from-[#C0C1FF] to-[#8083FF] px-5 text-sm font-bold text-[#1000A9] shadow-[0_2px_20px_rgba(192,193,255,0.18)] transition-all hover:opacity-90 active:scale-95"
          >
            Registrati
          </Link>
        </div>
      </header>

      <main className="relative pt-20">
        {/* Ambient Radial Glows */}
        <div className="pointer-events-none fixed left-[-10%] top-[-10%] h-[60%] w-[60%] rounded-full bg-[#C0C1FF]/10 blur-[120px]" />
        <div className="pointer-events-none fixed bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-[#4EDEA3]/5 blur-[100px]" />

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section className="relative mx-auto max-w-6xl px-6 pb-24 pt-14 lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,420px)] lg:items-center lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="max-w-xl space-y-7"
          >
            {/* Brand badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#464554]/20 bg-[#1B1B20] px-4 py-1.5">
              <ShieldCheck size={14} className="text-[#C0C1FF]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#C0C1FF]">APP del Consenso</span>
            </div>

            <h1 className="text-[clamp(2.4rem,6vw,3.5rem)] font-bold leading-[0.95] tracking-tight text-[#E4E1E9]">
              Installa sul tuo smartphone una traccia privata del consenso condiviso.
            </h1>

            <p className="max-w-lg text-lg leading-relaxed text-[#C7C4D7]">
              Apri la web app da iPhone o Android, installala in pochi secondi e usa pairing di prossimità, conferma reciproca e revoca immediata in un flusso progettato per adulti consapevoli.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="flex min-h-14 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#C0C1FF] to-[#8083FF] px-8 text-base font-bold text-[#1000A9] shadow-[0_4px_40px_rgba(192,193,255,0.18)] transition-all hover:opacity-90 active:scale-[0.98]"
              >
                Apri la web app
                <ArrowRight size={18} />
              </Link>
              <a
                href="#installazione"
                className="flex min-h-14 items-center justify-center rounded-full border border-[#464554]/20 bg-transparent px-8 text-base font-semibold text-[#E4E1E9] transition-all hover:bg-[#1F1F24] active:scale-[0.98]"
              >
                Vedi come installarla
              </a>
            </div>

            {/* Warning banner */}
            <div className="flex items-start gap-3 rounded-2xl border border-[#93000A]/20 bg-[#93000A]/20 px-5 py-4">
              <TriangleAlert size={18} className="mt-0.5 shrink-0 text-[#FFB4AB]" />
              <p className="text-sm leading-6 text-[#FFB4AB]">
                <strong className="mb-1 block">Attenzione</strong>
                L&apos;app ha valore documentale e comunicativo. Non sostituisce il dialogo, il consenso continuo o valutazioni legali.
              </p>
            </div>
          </motion.div>

          {/* Phone mockup */}
          <motion.div
            initial={{ opacity: 0, y: 28, rotate: -3 }}
            animate={{ opacity: 1, y: 0, rotate: -1.5 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.12 }}
            className="mx-auto mt-12 w-full max-w-[26rem] lg:mt-0"
          >
            <div className="relative rounded-[38px] border border-[#464554]/20 bg-gradient-to-b from-[#21213080] to-[#0D0D14fd] p-3 shadow-[0_40px_120px_rgba(0,0,0,0.48)]">
              <div className="rounded-[30px] border border-[#464554]/20 bg-[linear-gradient(180deg,rgba(99,102,241,0.16),rgba(15,15,20,0.92)_28%,rgba(15,15,20,1))] p-5">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-[#908FA0]">
                  <span>Sessione attiva</span>
                  <span className="font-mono text-[#4EDEA3]">04:22:41</span>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="rounded-[28px] border border-[#464554]/20 bg-black/20 px-4 py-5">
                    <p className="text-sm text-[#908FA0]">Countdown</p>
                    <p className="mt-2 font-mono text-3xl font-bold text-[#4EDEA3]">04:22:41</p>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/8">
                      <motion.div
                        initial={{ width: '72%' }}
                        animate={{ width: ['72%', '68%', '71%'] }}
                        transition={{ duration: 5.5, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                        className="h-full rounded-full bg-[#4EDEA3]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl border border-[#464554]/20 bg-white/[0.035] px-4 py-4">
                      <p className="text-[#908FA0]">Pairing</p>
                      <p className="mt-2 font-semibold text-[#E4E1E9]">QR + codice</p>
                    </div>
                    <div className="rounded-2xl border border-[#464554]/20 bg-white/[0.035] px-4 py-4">
                      <p className="text-[#908FA0]">Conferma</p>
                      <p className="mt-2 font-semibold text-[#E4E1E9]">Hold 600 ms</p>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-[#4EDEA3]/20 bg-[#4EDEA3]/10 px-4 py-4">
                    <p className="text-sm text-[#4EDEA3]">Sempre revocabile</p>
                    <p className="mt-2 text-sm font-semibold text-[#E4E1E9]">1/2 hanno confermato.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── Feature Cards ───────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {featureCards.map(({ label, body, icon: Icon, iconClass }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="flex flex-col gap-4 rounded-[28px] border border-[#464554]/20 p-8"
                style={{
                  background: 'linear-gradient(180deg, rgba(34,34,58,0.4) 0%, rgba(26,26,36,0.4) 100%)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconClass}`}>
                  <Icon size={22} />
                </div>
                <h3 className="text-xl font-bold text-[#E4E1E9]">{label}</h3>
                <p className="text-sm leading-6 text-[#C7C4D7]">{body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Installation ────────────────────────────────────────────────── */}
        <section id="installazione" className="mx-auto max-w-6xl px-6 pb-20">
          <div className="mb-10">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.24em] text-[#908FA0]">Installazione</p>
            <h2 className="text-4xl font-bold tracking-tight text-[#E4E1E9]">Come installarla</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {installSteps.map(({ platform, icon: Icon, steps }) => (
              <div key={platform} className="rounded-[28px] border border-[#464554]/20 bg-[#1B1B20] p-8">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
                    <Icon size={20} className="text-[#C7C4D7]" />
                  </div>
                  <span className="text-xl font-bold text-[#E4E1E9]">{platform}</span>
                </div>
                <ol className="space-y-4 text-sm text-[#C7C4D7]">
                  {(steps as readonly string[]).map((step, i) => (
                    <li key={step} className="flex gap-3">
                      <span className="font-bold text-[#C0C1FF]">0{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>

          {androidApkLink ? (
            <div className="mt-6 rounded-[28px] border border-[#C0C1FF]/20 bg-[linear-gradient(180deg,rgba(192,193,255,0.12),rgba(27,27,32,0.96))] p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-2xl space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#C0C1FF]/12">
                      <Smartphone size={20} className="text-[#C0C1FF]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#908FA0]">Android APK</p>
                      <h3 className="text-2xl font-bold text-[#E4E1E9]">Installazione come vera app Android</h3>
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-[#C7C4D7]">
                    Se scegli l&apos;APK diretto, l&apos;app viene installata come normale app Android. Non e un semplice collegamento:
                    compare tra le app del telefono e si puo aprire o disinstallare come qualsiasi altra app.
                  </p>
                </div>

                {androidApkLink.startsWith('/') ? (
                  <Link
                    to={androidApkLink}
                    className="flex min-h-12 items-center justify-center rounded-full bg-gradient-to-b from-[#C0C1FF] to-[#8083FF] px-6 text-sm font-bold text-[#1000A9] transition-all hover:opacity-90 active:scale-[0.98]"
                  >
                    Scarica APK
                  </Link>
                ) : (
                  <a
                    href={androidApkLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-h-12 items-center justify-center rounded-full bg-gradient-to-b from-[#C0C1FF] to-[#8083FF] px-6 text-sm font-bold text-[#1000A9] transition-all hover:opacity-90 active:scale-[0.98]"
                  >
                    Scarica APK
                  </a>
                )}
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="rounded-[24px] border border-white/8 bg-black/15 p-5">
                  <p className="text-sm font-semibold text-[#E4E1E9]">Come installarla</p>
                  <ol className="mt-4 space-y-3 text-sm leading-6 text-[#C7C4D7]">
                    <li className="flex gap-3">
                      <span className="font-bold text-[#C0C1FF]">01.</span>
                      Apri il link dell&apos;APK dal tuo smartphone Android e scarica il file.
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-[#C0C1FF]">02.</span>
                      Tocca il file scaricato: Android mostrera un avviso di sicurezza.
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-[#C0C1FF]">03.</span>
                      Consenti l&apos;installazione per il browser o per l&apos;app File, di solito con la voce{' '}
                      <span className="font-semibold text-[#E4E1E9]">Consenti da questa sorgente</span>.
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-[#C0C1FF]">04.</span>
                      Torna indietro e conferma <span className="font-semibold text-[#E4E1E9]">Installa</span>.
                    </li>
                  </ol>
                </div>

                <div className="rounded-[24px] border border-white/8 bg-black/15 p-5">
                  <p className="text-sm font-semibold text-[#E4E1E9]">Cosa vedra l&apos;utente</p>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-[#C7C4D7]">
                    <li>Su Samsung e Huawei il sistema puo chiedere l&apos;autorizzazione solo la prima volta.</li>
                    <li>Dopo l&apos;installazione l&apos;app appare nella schermata app del telefono con la sua icona.</li>
                    <li>Da quel momento si apre come app Android normale, senza passare dal browser.</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : null}

          {showIosHint ? (
            <div className="mt-6 rounded-[28px] border border-[#C0C1FF]/20 bg-[#C0C1FF]/10 px-5 py-5">
              <p className="text-sm font-semibold text-[#E4E1E9]">Suggerimento iPhone rilevato</p>
              <p className="mt-2 text-sm leading-6 text-[#C7C4D7]">
                Stai usando Safari su iOS: dopo l&apos;apertura tocca condividi e poi{' '}
                <span className="font-medium text-[#E4E1E9]">Aggiungi a schermata Home</span> per completare l&apos;installazione.
              </p>
            </div>
          ) : null}
        </section>

        {/* ── Download CTA ────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-6 pb-[calc(env(safe-area-inset-bottom)+48px)]">
          <div className="rounded-[36px] border border-[#464554]/20 bg-[linear-gradient(180deg,rgba(99,102,241,0.12),rgba(15,15,20,0.94))] px-5 py-8 shadow-[0_30px_90px_rgba(0,0,0,0.34)] lg:px-8">
            <p className="text-center text-sm font-medium uppercase tracking-[0.24em] text-[#908FA0]">Download e accesso</p>
            <h2 className="mt-3 text-balance text-center text-3xl font-bold text-[#E4E1E9] sm:text-4xl">
              Aprila da smartphone e installala subito.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-base leading-7 text-[#C7C4D7]">
              La PWA è già pronta per Android e iPhone. Quando pubblicherai APK, Google Play o App Store, questa stessa landing potrà ospitare i link diretti senza cambiare struttura.
            </p>

            <div className="mt-7 grid gap-3 lg:grid-cols-4">
              {downloadLinks.map((item) => (
                <DownloadAction key={item.label} {...item} />
              ))}
            </div>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                className="flex min-h-14 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#C0C1FF] to-[#8083FF] px-8 text-base font-bold text-[#1000A9] shadow-[0_4px_40px_rgba(192,193,255,0.18)] transition-all hover:opacity-90 active:scale-[0.98]"
              >
                Inizia ora
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                className="flex min-h-14 items-center justify-center rounded-full border border-[#464554]/20 bg-transparent px-8 text-base font-semibold text-[#E4E1E9] transition-all hover:bg-[#1F1F24] active:scale-[0.98]"
              >
                Ho già un account
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

// ─── DownloadAction ───────────────────────────────────────────────────────────

function DownloadAction({ label, href, description }: { label: string; href: string | null; description: string }) {
  const className = cn(
    'flex min-h-16 flex-col justify-center rounded-[24px] border px-4 py-4 text-left transition',
    href
      ? 'border-[#464554]/20 bg-[#1F1F24] text-[#E4E1E9] hover:bg-[#2A292F] active:scale-[0.98]'
      : 'border-[#464554]/20 bg-[#1B1B20] text-[#908FA0] opacity-60',
  )

  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold">{label}</span>
        <span
          className={cn(
            'rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]',
            href ? 'bg-[#4EDEA3]/12 text-[#4EDEA3]' : 'bg-white/8 text-[#908FA0]',
          )}
        >
          {href ? 'Live' : 'Presto'}
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-[#C7C4D7]">{description}</p>
    </>
  )

  if (!href) return <div className={className}>{content}</div>
  if (href.startsWith('/')) return <Link to={href} className={className}>{content}</Link>
  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {content}
    </a>
  )
}
