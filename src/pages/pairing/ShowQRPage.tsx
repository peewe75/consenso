import { useCallback, useEffect, useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { ChevronLeft, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { padCode } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

const CODE_LIFETIME_SECONDS = 10 * 60

export function ShowQRPage() {
  const navigate = useNavigate()
  const { user, profile } = useAuthStore()
  const [code, setCode] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(CODE_LIFETIME_SECONDS)
  const [loading, setLoading] = useState(true)

  const generateCode = useCallback(async () => {
    if (!user) return

    setLoading(true)

    await supabase
      .from('pairing_codes')
      .update({ used_at: new Date().toISOString() })
      .eq('creator_id', user.id)
      .is('used_at', null)

    const { data: freshCode, error } = await supabase.rpc('generate_pairing_code_safe')

    if (error || !freshCode) {
      setLoading(false)
      return
    }

    const expiry = new Date(Date.now() + CODE_LIFETIME_SECONDS * 1000).toISOString()

    const { error: insertError } = await supabase.from('pairing_codes').insert({
      creator_id: user.id,
      code: freshCode,
      expires_at: expiry,
    })

    if (insertError) {
      setLoading(false)
      return
    }

    setCode(freshCode)
    setExpiresAt(expiry)
    setSecondsLeft(CODE_LIFETIME_SECONDS)
    setLoading(false)
  }, [user])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void generateCode()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [generateCode])

  useEffect(() => {
    if (!expiresAt) return

    const timer = window.setInterval(() => {
      const diff = Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000))
      setSecondsLeft(diff)

      if (diff === 0) {
        void generateCode()
      }
    }, 1000)

    return () => window.clearInterval(timer)
  }, [expiresAt, generateCode])

  useEffect(() => {
    if (!code || !user) return

    const channel = supabase
      .channel(`pairing:${code}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pairing_codes',
          filter: `code=eq.${code}`,
        },
        async (payload) => {
          if (!payload.new.used_at) return

          const { data } = await supabase
            .from('consent_participants')
            .select('session_id, joined_at')
            .eq('user_id', user.id)
            .order('joined_at', { ascending: false })
            .limit(1)

          const latestSessionId = data?.[0]?.session_id
          if (latestSessionId) navigate(`/session/${latestSessionId}`)
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [code, navigate, user])

  const qrValue = useMemo(
    () =>
      code && user && profile
        ? JSON.stringify({
            c: code,
            u: user.id,
            n: profile.display_name,
            a: profile.avatar_color,
          })
        : '',
    [code, profile, user],
  )

  const progress = (secondsLeft / CODE_LIFETIME_SECONDS) * 100

  return (
    <main className="safe-page-tight space-y-8">
      <button type="button" onClick={() => navigate('/pairing')} className="inline-flex min-h-11 items-center gap-2 rounded-full text-sm font-medium text-text-secondary transition active:scale-[0.98]">
        <ChevronLeft size={18} />
        Metodi di pairing
      </button>

      <section className="space-y-3">
        <h1 className="text-[1.75rem] font-bold">Mostra il tuo QR</h1>
        <p className="text-sm leading-6 text-text-secondary">Il partner lo scansiona sul posto. Se la fotocamera non e disponibile, puo usare anche il codice numerico qui sotto.</p>
      </section>

      <section className="panel rounded-[30px] px-5 py-6 text-center">
        {loading || !code ? (
          <div className="py-10 text-sm text-text-secondary">Generazione del codice in corso...</div>
        ) : (
          <div className="space-y-6">
            <div className="mx-auto flex w-fit items-center justify-center rounded-[28px] bg-white p-5 shadow-[0_25px_60px_rgba(0,0,0,0.28)]">
              <QRCodeSVG value={qrValue} size={220} level="M" />
            </div>

            <div>
              <p className="text-sm text-text-secondary">Codice visivo di fallback</p>
              <p className="mt-2 font-mono text-[2rem] font-bold tracking-[0.35em] text-accent">{padCode(code)}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/4 px-4 py-4 text-left">
              <div className="flex items-center justify-between text-sm text-text-secondary">
                <span>Scadenza QR</span>
                <span>{Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/8">
                <div className="h-2 rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        )}
      </section>

      <button
        type="button"
        onClick={() => void generateCode()}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/4 px-5 text-sm font-medium text-text-secondary transition active:scale-[0.98]"
      >
        <RefreshCw size={16} />
        Rigenera il codice
      </button>
    </main>
  )
}
