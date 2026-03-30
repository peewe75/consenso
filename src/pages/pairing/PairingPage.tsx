import { ChevronLeft, Hash, QrCode, ScanLine } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const OPTIONS = [
  {
    to: '/pairing/show',
    title: 'Mostra il mio QR',
    description: 'Genera un QR con scadenza a 10 minuti e un codice numerico di fallback.',
    icon: QrCode,
    tone: 'bg-accent/14 text-accent',
  },
  {
    to: '/pairing/scan',
    title: 'Scansiona QR',
    description: 'Apri la fotocamera e conferma il profilo prima di creare la sessione.',
    icon: ScanLine,
    tone: 'bg-success/14 text-success',
  },
  {
    to: '/pairing/code',
    title: 'Inserisci codice',
    description: 'Usa sei caselle separate per digitare il codice del partner in presenza.',
    icon: Hash,
    tone: 'bg-warning/14 text-warning',
  },
]

export function PairingPage() {
  const navigate = useNavigate()

  return (
    <main className="safe-page-tight space-y-8">
      <button type="button" onClick={() => navigate(-1)} className="inline-flex min-h-11 items-center gap-2 rounded-full text-sm font-medium text-text-secondary transition active:scale-[0.98]">
        <ChevronLeft size={18} />
        Torna indietro
      </button>

      <section className="space-y-3">
        <h1 className="text-[1.75rem] font-bold">Pairing di prossimita</h1>
        <p className="max-w-sm text-sm leading-6 text-text-secondary">
          Usa questo flusso soltanto quando siete davvero insieme. Il pairing serve a documentare una sessione condivisa, non a invitare persone a distanza.
        </p>
      </section>

      <section className="space-y-3">
        {OPTIONS.map(({ to, title, description, icon: Icon, tone }) => (
          <Link key={to} to={to} className="panel flex min-h-[104px] items-center gap-4 rounded-[24px] px-4 py-4 transition active:scale-[0.99]">
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${tone}`}>
              <Icon size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-text-primary">{title}</p>
              <p className="text-sm leading-6 text-text-secondary">{description}</p>
            </div>
          </Link>
        ))}
      </section>
    </main>
  )
}
