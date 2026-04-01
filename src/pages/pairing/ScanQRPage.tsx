import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { buildIntegrityHash } from '@/lib/crypto'
import { supabase } from '@/lib/supabase'
import { initialsFromName } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { useSessionStore } from '@/stores/sessionStore'

const qrSchema = z.object({
  c: z.string().regex(/^\d{6}$/),
  u: z.string().min(1),
  n: z.string().min(2),
  a: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  i: z.string().url().nullable().optional(),
})

export function ScanQRPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { setPairedUser } = useSessionStore()
  const scannerRef = useRef<import('html5-qrcode').Html5Qrcode | null>(null)
  const [payload, setPayload] = useState<z.infer<typeof qrSchema> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)

  useEffect(() => {
    if (payload) return

    let active = true

    async function startScanner() {
      const { Html5Qrcode } = await import('html5-qrcode')
      if (!active) return

      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner

      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 260, height: 260 } },
          async (decodedText) => {
            try {
              const parsed = qrSchema.safeParse(JSON.parse(decodedText))

              if (!parsed.success || parsed.data.u === user?.id) {
                setError('QR non valido o generato dal tuo account')
                return
              }

              await scanner.stop()
              setPayload(parsed.data)
              setError(null)
            } catch {
              setError('QR non valido')
            }
          },
          () => undefined,
        )
      } catch {
        if (active) {
          setCameraError('Fotocamera non disponibile o permesso negato. Usa il codice numerico.')
        }
      }
    }

    void startScanner()

    return () => {
      active = false
      scannerRef.current?.stop().catch(() => undefined)
    }
  }, [payload, user?.id])

  async function handleConfirm() {
    if (!payload || !user) return

    setLoading(true)
    setError(null)

    try {
      const initiatedAt = new Date().toISOString()
      const integrityHash = await buildIntegrityHash([user.id, payload.c], initiatedAt)

      const { data: sessionId, error: sessionError } = await supabase.rpc('create_session_from_pairing_code', {
        p_code: payload.c,
        p_integrity_hash: integrityHash,
      })

      if (sessionError || !sessionId) {
        throw sessionError ?? new Error('Impossibile creare la sessione')
      }

      setPairedUser(payload.u, {
        id: payload.u,
        display_name: payload.n,
        avatar_color: payload.a,
        avatar_url: payload.i ?? null,
      })

      navigate(`/session/${sessionId}`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Errore durante il pairing')
      setLoading(false)
    }
  }

  function handleRescan() {
    setPayload(null)
    setError(null)
    setCameraError(null)
  }

  return (
    <main className="safe-page-tight space-y-8">
      <button type="button" onClick={() => navigate('/pairing')} className="inline-flex min-h-11 items-center gap-2 rounded-full text-sm font-medium text-text-secondary transition active:scale-[0.98]">
        <ChevronLeft size={18} />
        Metodi di pairing
      </button>

      <section className="space-y-3">
        <h1 className="text-[1.75rem] font-bold">Scansiona il QR</h1>
        <p className="text-sm leading-6 text-text-secondary">Punta la fotocamera sul QR del partner e verifica il profilo prima di creare la sessione.</p>
      </section>

      {!payload ? (
        <section className="panel rounded-[28px] px-4 py-4">
          {cameraError ? (
            <div className="space-y-4 py-6 text-center">
              <p className="text-sm leading-6 text-text-secondary">{cameraError}</p>
              <button
                type="button"
                onClick={() => navigate('/pairing/code')}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-white transition active:scale-[0.98]"
              >
                Usa il codice numerico
              </button>
            </div>
          ) : (
            <>
              <div id="qr-reader" className="overflow-hidden rounded-[22px]" />
              {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
            </>
          )}
        </section>
      ) : (
        <section className="panel rounded-[28px] px-5 py-6 text-center">
          {payload.i ? (
            <img src={payload.i} alt={payload.n} className="mx-auto h-20 w-20 rounded-[24px] object-cover" />
          ) : (
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] text-3xl font-bold text-white" style={{ backgroundColor: payload.a }}>
              {initialsFromName(payload.n)}
            </div>
          )}
          <h2 className="mt-4 text-xl font-semibold">{payload.n}</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">Controlla che il profilo mostrato corrisponda alla persona accanto a te, poi conferma per iniziare la sessione.</p>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-success/20 bg-success/10 px-3 py-2 text-sm font-medium text-success">
            <CheckCircle2 size={16} />
            QR valido
          </div>

          {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => void handleConfirm()}
              disabled={loading}
              className="flex min-h-14 w-full items-center justify-center rounded-full bg-accent text-base font-semibold text-white transition active:scale-[0.98] active:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Creazione sessione...' : 'Conferma e crea sessione'}
            </button>
            <button
              type="button"
              onClick={handleRescan}
              className="flex min-h-14 w-full items-center justify-center rounded-full border border-white/10 bg-white/4 text-base font-medium text-text-secondary transition active:scale-[0.98]"
            >
              Scansiona di nuovo
            </button>
          </div>
        </section>
      )}
    </main>
  )
}
