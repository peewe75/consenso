import { useState } from 'react'
import { LogOut, Shield, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { initialsFromName } from '@/lib/utils'

export function SettingsPage() {
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <main className="safe-page space-y-6">
      <section className="space-y-2">
        <h1 className="text-[1.75rem] font-bold">Profilo</h1>
        <p className="text-sm leading-6 text-text-secondary">Qui trovi il tuo pseudonimo, le impostazioni essenziali e il promemoria privacy.</p>
      </section>

      <section className="panel rounded-[28px] px-5 py-6">
        <div className="flex items-center gap-4">
          <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[24px] text-3xl font-bold text-white" style={{ backgroundColor: profile?.avatar_color ?? '#6366F1' }}>
            {initialsFromName(profile?.display_name ?? '?')}
          </div>
          <div>
            <p className="text-sm text-text-secondary">Pseudonimo</p>
            <h2 className="mt-1 text-xl font-semibold">{profile?.display_name ?? 'Profilo'}</h2>
            <p className="mt-1 text-sm text-text-secondary">Visibile solo nelle sessioni condivise con altri partecipanti.</p>
          </div>
        </div>
      </section>

      <section className="panel rounded-2xl px-4 py-4">
        <div className="flex items-start gap-3">
          <Shield size={18} className="mt-0.5 text-accent" />
          <div>
            <p className="text-sm font-semibold text-text-primary">Privacy by design</p>
            <p className="mt-1 text-sm leading-6 text-text-secondary">
              L&apos;app evita audio, documenti di identita e metadati superflui. Conserviamo solo cio che serve a documentare la sessione e a mantenere il tuo accesso.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="panel flex min-h-14 w-full items-center gap-3 rounded-2xl px-4 text-left text-danger transition active:scale-[0.99] disabled:opacity-50"
        >
          <LogOut size={18} />
          <span className="text-sm font-semibold">{loggingOut ? 'Uscita in corso...' : 'Esci dall’account'}</span>
        </button>

        <button
          type="button"
          className="flex min-h-14 w-full items-center gap-3 rounded-2xl border border-danger/20 bg-danger/8 px-4 text-left text-danger/80 transition active:scale-[0.99]"
        >
          <Trash2 size={18} />
          <span className="text-sm font-semibold">Elimina account (placeholder GDPR)</span>
        </button>
      </section>
    </main>
  )
}
