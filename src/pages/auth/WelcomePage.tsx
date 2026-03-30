import { motion } from 'framer-motion'
import { Apple, ArrowRight, Download, QrCode, ShieldCheck, Smartphone, TimerReset, TriangleAlert } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import { downloadLinks } from '@/lib/downloadLinks'
import { cn, isIosSafariInstallPromptVisible } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

const installCards = [
  {
    title: 'Android in pochi secondi',
    body: 'Apri la web app in Chrome e usa Installa app. Il flusso PWA e gia pronto per smartphone Android.',
    badge: 'Disponibile ora',
    icon: Smartphone,
  },
  {
    title: 'iPhone da Safari',
    body: 'Apri il sito su iPhone e usa Aggiungi a schermata Home per ottenere modalita standalone e accesso rapido.',
    badge: 'Disponibile ora',
    icon: Apple,
  },
  {
    title: 'APK e store nativi',
    body: 'La pagina e gia pronta ad ospitare link diretti ad APK, Google Play e App Store appena pubblichi i pacchetti.',
    badge: 'Pronta per pubblicazione',
    icon: Download,
  },
] as const

const featureStrip = [
  { label: 'Pairing in presenza', icon: QrCode },
  { label: 'Revoca immediata', icon: TimerReset },
  { label: 'Privacy by design', icon: ShieldCheck },
] as const

export function WelcomePage() {
  const { user } = useAuthStore()

  if (user) {
    return <Navigate to="/app" replace />
  }

  const showIosHint = isIosSafariInstallPromptVisible()

  return (
    <main className="min-h-screen bg-background text-text-primary">
      <section className="relative isolate overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="relative min-h-[100svh] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.32),transparent_28%),linear-gradient(180deg,rgba(17,17,29,0.9),rgba(10,10,16,0.98))]"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_12%,rgba(16,185,129,0.12),transparent_18%),radial-gradient(circle_at_20%_78%,rgba(245,158,11,0.12),transparent_22%)]" />

          <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-between gap-14 px-[calc(env(safe-area-inset-left)+20px)] pb-[calc(env(safe-area-inset-bottom)+28px)] pt-[calc(env(safe-area-inset-top)+20px)] lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,420px)] lg:items-center lg:px-8">
            <div className="max-w-xl space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-text-secondary">
                <ShieldCheck size={14} className="text-accent" />
                APP del Consenso
              </div>

              <div className="space-y-5">
                <h1 className="max-w-lg text-balance text-5xl font-bold leading-[0.95] sm:text-6xl">
                  Installa sul tuo smartphone una traccia privata del consenso condiviso.
                </h1>
                <p className="max-w-md text-base leading-7 text-text-secondary sm:text-lg">
                  Apri la web app da iPhone o Android, installala in pochi secondi e usa pairing di prossimita, conferma reciproca e revoca immediata in un flusso progettato per adulti consapevoli.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="flex min-h-14 items-center justify-center gap-2 rounded-full bg-accent px-6 text-base font-semibold text-white shadow-[0_0_40px_rgba(99,102,241,0.28)] transition active:scale-[0.98] active:opacity-90"
                >
                  Apri la web app
                  <ArrowRight size={18} />
                </Link>
                <a
                  href="#installazione"
                  className="flex min-h-14 items-center justify-center rounded-full border border-white/10 bg-white/4 px-6 text-base font-medium text-text-primary transition active:scale-[0.98] active:opacity-80"
                >
                  Vedi come installarla
                </a>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {featureStrip.map(({ label, icon: Icon }) => (
                  <div key={label} className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-4 text-sm text-text-secondary">
                    <Icon size={18} className="mb-3 text-accent" />
                    <p>{label}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-warning/20 bg-warning/10 px-4 py-4">
                <div className="flex items-start gap-3">
                  <TriangleAlert size={18} className="mt-0.5 text-warning" />
                  <p className="text-sm leading-6 text-text-secondary">
                    L&apos;app ha valore documentale e comunicativo. Non sostituisce il dialogo, il consenso continuo o valutazioni legali.
                  </p>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 28, rotate: -3 }}
              animate={{ opacity: 1, y: 0, rotate: -1.5 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.12 }}
              className="mx-auto w-full max-w-[26rem]"
            >
              <div className="relative rounded-[38px] border border-white/10 bg-[linear-gradient(180deg,rgba(33,33,48,0.98),rgba(13,13,20,0.98))] p-3 shadow-[0_40px_120px_rgba(0,0,0,0.46)]">
                <div className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(99,102,241,0.16),rgba(15,15,20,0.92)_28%,rgba(15,15,20,1))] p-5">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-text-secondary">
                    <span>Download ready</span>
                    <span>5h sessione</span>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="rounded-[28px] border border-white/8 bg-black/20 px-4 py-5">
                      <p className="text-sm text-text-secondary">Modalita smartphone</p>
                      <p className="mt-2 text-3xl font-bold">Installazione PWA</p>
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/8">
                        <motion.div
                          initial={{ width: '18%' }}
                          animate={{ width: ['18%', '84%', '62%'] }}
                          transition={{ duration: 5.5, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                          className="h-full rounded-full bg-accent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-4">
                        <p className="text-text-secondary">Pairing</p>
                        <p className="mt-2 font-semibold text-text-primary">QR + codice 6 cifre</p>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-4">
                        <p className="text-text-secondary">Azione critica</p>
                        <p className="mt-2 font-semibold text-text-primary">Hold 600 ms</p>
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-success/20 bg-success/10 px-4 py-4">
                      <p className="text-sm text-success">Consenso sempre revocabile</p>
                      <p className="mt-2 text-lg font-semibold text-text-primary">Gli altri vedono solo il conteggio aggregato, non il tuo stato personale.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <section id="installazione" className="mx-auto max-w-6xl space-y-10 px-[calc(env(safe-area-inset-left)+20px)] py-14 sm:px-8">
        <div className="max-w-xl space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-text-secondary">Installazione</p>
          <h2 className="text-balance text-3xl font-bold sm:text-4xl">Una sola landing, tre percorsi di download e installazione.</h2>
          <p className="text-base leading-7 text-text-secondary">
            Oggi la distribuzione immediata passa dalla PWA installabile. La stessa pagina e pronta per ospitare anche APK diretto e link store quando vorrai pubblicarli.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {installCards.map(({ title, body, badge, icon: Icon }, index) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.08, ease: 'easeOut' }}
              className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(34,34,58,0.88),rgba(15,15,20,0.92))] px-5 py-6 shadow-[0_24px_70px_rgba(0,0,0,0.28)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/6">
                  <Icon size={20} className="text-accent" />
                </div>
                <span className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                  {badge}
                </span>
              </div>
              <h3 className="mt-6 text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-text-secondary">{body}</p>
            </motion.article>
          ))}
        </div>

        {showIosHint ? (
          <div className="rounded-[28px] border border-accent/20 bg-accent/10 px-5 py-5">
            <p className="text-sm font-semibold text-text-primary">Suggerimento iPhone rilevato</p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Stai usando Safari su iOS: dopo l&apos;apertura tocca condividi e poi <span className="font-medium text-text-primary">Aggiungi a schermata Home</span> per completare l&apos;installazione.
            </p>
          </div>
        ) : null}
      </section>

      <section className="mx-auto max-w-6xl px-[calc(env(safe-area-inset-left)+20px)] pb-6 sm:px-8">
        <div className="grid gap-6 rounded-[36px] border border-white/8 bg-[linear-gradient(180deg,rgba(99,102,241,0.12),rgba(15,15,20,0.94))] px-5 py-6 shadow-[0_30px_90px_rgba(0,0,0,0.34)] lg:grid-cols-[minmax(0,0.95fr)_minmax(0,0.75fr)] lg:px-8 lg:py-8">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-text-secondary">Privacy</p>
            <h2 className="text-balance text-3xl font-bold">Zero dati sensibili visibili, solo quello che serve davvero alla sessione.</h2>
            <p className="max-w-xl text-base leading-7 text-text-secondary">
              Nessun audio, nessun documento, nessun nome reale obbligatorio. Ogni persona entra con pseudonimo e colore avatar, e gli altri partecipanti non vedono il tuo stato individuale.
            </p>
          </div>

          <div className="space-y-3 text-sm text-text-secondary">
            <div className="rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-4">Trigger automatico su auth.users per creare il profilo senza passaggi extra.</div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-4">RLS attiva su profili, codici, sessioni, partecipanti e conferme.</div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-4">Realtime pronto per aggiornare conferme, revoche e scadenze senza refresh manuale.</div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-[calc(env(safe-area-inset-left)+20px)] pb-[calc(env(safe-area-inset-bottom)+32px)] pt-12 sm:px-8">
        <div className="rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,rgba(34,34,58,0.82),rgba(15,15,20,0.95))] px-5 py-7 text-center shadow-[0_22px_70px_rgba(0,0,0,0.3)]">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-text-secondary">Download e accesso</p>
          <h2 className="mt-3 text-balance text-3xl font-bold sm:text-4xl">Aprila da smartphone e installala subito.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-text-secondary">
            La PWA e gia pronta per Android e iPhone. Quando pubblicherai APK, Google Play o App Store, questa stessa landing potra ospitare i link diretti senza cambiare struttura.
          </p>

          <div className="mt-7 grid gap-3 lg:grid-cols-4">
            {downloadLinks.map((item) => (
              <DownloadAction key={item.label} {...item} />
            ))}
          </div>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="flex min-h-14 items-center justify-center gap-2 rounded-full bg-accent px-6 text-base font-semibold text-white shadow-[0_0_40px_rgba(99,102,241,0.28)] transition active:scale-[0.98] active:opacity-90"
            >
              Inizia ora
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="flex min-h-14 items-center justify-center rounded-full border border-white/10 bg-white/4 px-6 text-base font-medium text-text-primary transition active:scale-[0.98] active:opacity-80"
            >
              Ho gia un account
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

function DownloadAction({ label, href, description }: { label: string; href: string | null; description: string }) {
  const className = cn(
    'flex min-h-16 flex-col justify-center rounded-[24px] border px-4 py-4 text-left transition',
    href
      ? 'border-white/10 bg-white/[0.045] text-text-primary active:scale-[0.98] active:opacity-80'
      : 'border-white/8 bg-white/[0.025] text-text-muted opacity-72',
  )

  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold">{label}</span>
        <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]', href ? 'bg-success/12 text-success' : 'bg-white/8 text-text-muted')}>
          {href ? 'Live' : 'Presto'}
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
    </>
  )

  if (!href) {
    return <div className={className}>{content}</div>
  }

  const isInternal = href.startsWith('/')

  if (isInternal) {
    return (
      <Link to={href} className={className}>
        {content}
      </Link>
    )
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {content}
    </a>
  )
}
