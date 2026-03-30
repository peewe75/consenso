import { useEffect, useState } from 'react'
import { Clock3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { cn, formatSessionDate, getMyActionMeta, getSessionStatusMeta } from '@/lib/utils'
import type { ConsentSession, ConsentStatusView } from '@/types/session'

type FilterKey = 'all' | 'confirmed' | 'revoked' | 'expired'

interface HistoryItem extends ConsentSession {
  myStatus: ConsentStatusView['current_status'] | null
}

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Tutte' },
  { key: 'confirmed', label: 'Confermate' },
  { key: 'revoked', label: 'Revocate' },
  { key: 'expired', label: 'Scadute' },
]

export function HistoryPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<FilterKey>('all')
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)

      let query = supabase.from('consent_sessions').select('*').order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data: sessions } = await query
      const sessionIds = (sessions ?? []).map((row) => row.id)
      const { data: statuses } =
        sessionIds.length > 0
          ? await supabase.from('v_current_consent_status').select('*').in('session_id', sessionIds)
          : { data: [] as ConsentStatusView[] | null }

      const statusMap = new Map((statuses ?? []).map((row) => [row.session_id, row.current_status]))
      setItems((sessions ?? []).map((row) => ({ ...row, myStatus: statusMap.get(row.id) ?? null })))
      setLoading(false)
    }

    void load()
  }, [filter])

  return (
    <main className="safe-page space-y-6">
      <section className="space-y-2">
        <h1 className="text-[1.75rem] font-bold">Storico</h1>
        <p className="max-w-sm text-sm leading-6 text-text-secondary">
          Vedi lo stato finale delle tue sessioni. Per privacy mostriamo la tua scelta, non quella individuale degli altri partecipanti.
        </p>
      </section>

      <section className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {FILTERS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setFilter(option.key)}
            className={cn(
              'min-h-11 shrink-0 rounded-full border px-4 text-sm font-medium transition active:scale-[0.98]',
              filter === option.key ? 'border-accent bg-accent text-white' : 'border-white/10 bg-white/4 text-text-secondary',
            )}
          >
            {option.label}
          </button>
        ))}
      </section>

      {loading ? (
        <div className="panel rounded-2xl px-4 py-10 text-center text-sm text-text-secondary">Caricamento sessioni...</div>
      ) : items.length === 0 ? (
        <div className="panel rounded-2xl px-4 py-10 text-center">
          <Clock3 size={22} className="mx-auto text-text-muted" />
          <p className="mt-3 text-sm text-text-secondary">Nessuna sessione trovata per questo filtro.</p>
        </div>
      ) : (
        <section className="space-y-3">
          {items.map((item) => {
            const status = getSessionStatusMeta(item.status)
            const mine = getMyActionMeta(item.myStatus)

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(`/session/${item.id}`)}
                className="panel w-full rounded-2xl px-4 py-4 text-left transition active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{formatSessionDate(item.initiated_at)}</p>
                    <p className="mt-1 text-sm leading-6 text-text-secondary">
                      Sessione con {item.participant_count} partecipanti
                    </p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${status.tone} ${status.color}`}>{status.label}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={`rounded-full border px-3 py-1 text-xs font-medium ${mine.className}`}>{mine.label}</span>
                  <span className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs font-medium text-text-secondary">
                    Scadenza: {item.expires_at ? formatSessionDate(item.expires_at) : '—'}
                  </span>
                </div>
              </button>
            )
          })}
        </section>
      )}
    </main>
  )
}
