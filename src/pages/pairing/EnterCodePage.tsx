import { useRef, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { buildIntegrityHash } from '@/lib/crypto'
import { supabase } from '@/lib/supabase'
import { padCode } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

export function EnterCodePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  function focusIndex(index: number) {
    inputRefs.current[index]?.focus()
  }

  function handleChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return

    const next = [...digits]
    next[index] = value
    setDigits(next)

    if (value && index < next.length - 1) {
      focusIndex(index + 1)
    }
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      focusIndex(index - 1)
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLDivElement>) {
    const pasted = padCode(event.clipboardData.getData('text').replace(/\D/g, ''))
    if (pasted.length !== 6) return

    event.preventDefault()
    const next = pasted.split('').slice(0, 6)
    setDigits(next)
    focusIndex(5)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return

    const code = digits.join('')
    if (code.length !== 6) {
      setError('Inserisci tutte le sei cifre')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const initiatedAt = new Date().toISOString()
      const integrityHash = await buildIntegrityHash([user.id, code], initiatedAt)

      const { data: sessionId, error: sessionError } = await supabase.rpc('create_session_from_pairing_code', {
        p_code: code,
        p_integrity_hash: integrityHash,
      })

      if (sessionError || !sessionId) {
        throw sessionError ?? new Error('Impossibile creare la sessione')
      }

      navigate(`/session/${sessionId}`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Errore durante il pairing')
      setLoading(false)
    }
  }

  return (
    <main className="safe-page-tight space-y-8">
      <button type="button" onClick={() => navigate('/pairing')} className="inline-flex min-h-11 items-center gap-2 rounded-full text-sm font-medium text-text-secondary transition active:scale-[0.98]">
        <ChevronLeft size={18} />
        Metodi di pairing
      </button>

      <section className="space-y-3">
        <h1 className="text-[1.75rem] font-bold">Inserisci il codice</h1>
        <p className="text-sm leading-6 text-text-secondary">
          Digita il codice mostrato sul dispositivo del partner. Le caselle avanzano da sole e supportano il backspace.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div onPaste={handlePaste} className="panel rounded-[28px] px-4 py-6">
          <div className="mx-auto flex w-fit max-w-full justify-center gap-2 sm:gap-3">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(node) => {
                  inputRefs.current[index] = node
                }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                onChange={(event) => handleChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                className="h-16 w-10 rounded-2xl border border-white/10 bg-white/4 text-center text-2xl font-bold text-text-primary outline-none transition focus:border-accent focus:bg-white/[0.08] sm:w-12"
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/4 px-4 py-4 text-sm leading-6 text-text-secondary">
          Il codice funziona solo per 10 minuti. Usalo quando siete presenti nello stesso luogo.
        </div>

        {error ? <div className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div> : null}

        <button
          type="submit"
          disabled={loading || digits.join('').length !== 6}
          className="flex min-h-14 w-full items-center justify-center rounded-full bg-accent text-base font-semibold text-white transition active:scale-[0.98] active:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Creazione sessione...' : 'Crea sessione'}
        </button>
      </form>
    </main>
  )
}
