import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, Clock3, ShieldCheck } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useRealtime } from '@/hooks/useRealtime'
import { useSession } from '@/hooks/useSession'
import { formatSessionDate, formatSessionTime, getSessionStatusMeta } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'


export function SessionPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const { session, loading, error, confirmConsent, revokeConsent, reload } = useSession(id ?? null)
  const [showRevokeSheet, setShowRevokeSheet] = useState(false)

  useRealtime(id ?? null, reload)

  const visualState = useMemo(() => {
    if (!session) return null
    return getSessionStatusMeta(session.status)
  }, [session])

  if (loading || !session || !visualState) {
    return (
      <main className="safe-page-tight flex min-h-screen items-center justify-center">
        <div className="panel rounded-2xl px-5 py-6 text-sm text-text-muted">
          {error ?? 'Caricamento sessione...'}
        </div>
      </main>
    )
  }

  const otherParticipants = session.participants.filter((p) => p.user_id !== user?.id)
  const canInteract = !['confirmed', 'revoked', 'expired'].includes(session.status)

  async function handleRevoke() {
    setShowRevokeSheet(false)
    await revokeConsent()
  }

  return (
    <main className="min-h-screen bg-[#F7F4EE] px-6 pt-12 pb-24 relative overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-[15%] left-[-5%] w-32 h-32 bg-[#1E6B68]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-48 h-48 bg-[#E89E7A]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-24 left-10 opacity-20 pointer-events-none">
        <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
           <div className="w-6 h-4 flex items-end gap-1">
              <div className="w-1.5 h-2 bg-[#1E6B68] rounded-full" />
              <div className="w-1.5 h-4 bg-[#1E6B68] rounded-full" />
              <div className="w-1.5 h-3 bg-[#1E6B68] rounded-full" />
           </div>
        </div>
      </div>
      <div className="absolute top-[35%] right-8 opacity-20 pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
             <ShieldCheck size={20} className="text-[#1E6B68]" />
          </div>
      </div>

      <div className="max-w-md mx-auto space-y-8 animate-fade-in-up">
        {/* Header Section */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-[#25211C]">
            Stato del Consenso
          </h1>

          {/* Status Banner */}
          <div className="relative group overflow-hidden bg-[#D9EBE9] rounded-[24px] p-5 flex items-center justify-between border border-[#1E6B68]/10 shadow-[0_4px_20px_rgba(30,107,104,0.05)]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#2D5B58] flex items-center justify-center shadow-sm">
                <ShieldCheck size={22} className="text-white" />
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-[#2D5B58] text-base">
                  {visualState.label === 'Sessione attiva' ? 'Confermato e Attivo' : visualState.label}
                </p>
                <div className="flex items-center gap-1.5 text-[#2D5B58]/70 text-xs">
                  <Clock3 size={12} />
                  <span>Aggiornato alle {formatSessionTime(session.initiated_at)}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => navigate('/app')}
              aria-label="Torna alla home"
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 transition"
            >
              <ChevronLeft size={20} className="text-[#2D5B58] rotate-180" />
            </button>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Card: With Who */}
          <div className="bento-card bg-white col-span-1 min-h-[120px] flex flex-col justify-center">
            <span className="text-[13px] text-[#A8A29A] font-medium mb-1">Con chi</span>
            <p className="text-lg font-bold text-[#25211C] leading-tight">
              {otherParticipants[0]?.profile.display_name || 'Nessun altro'}
            </p>
          </div>

          {/* Card: Activity Type */}
          <div className="bento-card bg-white col-span-1 min-h-[120px] flex flex-col justify-center">
            <span className="text-[13px] text-[#A8A29A] font-medium mb-1">Tipo di Attività</span>
            <p className="text-lg font-bold text-[#25211C] leading-tight">
              {session.confirmedCount === session.participant_count ? 'Conferma Scambiata' : 'In attesa'}
            </p>
          </div>

          {/* Card: Date & Time */}
          <div className="bento-card bg-white col-span-2 py-6 flex flex-col justify-center">
            <span className="text-[13px] text-[#A8A29A] font-medium mb-1">Data e Ora</span>
            <p className="text-xl font-bold text-[#25211C]">
              {formatSessionDate(session.initiated_at)}, {formatSessionTime(session.initiated_at)}
            </p>
          </div>

          {/* Large Outcome Card */}
          <div className="bento-card bg-white col-span-2 py-10 flex flex-col items-center justify-center text-center space-y-2">
            <div className="text-2xl font-bold text-[#25211C] max-w-[200px] leading-[1.1]">
              Consenso Reciproco Verificato
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 space-y-4">
          {canInteract && session.myStatus !== 'confirmed' ? (
             <button
                onClick={confirmConsent}
                className="w-full bg-[#1E6B68] text-white font-bold py-5 rounded-[20px] shadow-lg active:scale-[0.98] transition hover:bg-[#16514f]"
             >
                Conferma Consenso
             </button>
          ) : (
             <div className="w-full bg-[#1E6B68] text-white font-bold py-5 rounded-[20px] text-center shadow-lg flex items-center justify-center gap-2">
                <ShieldCheck size={20} />
                Confermato
             </div>
          )}

          <button
            onClick={() => setShowRevokeSheet(true)}
            className="w-full bg-[#D9EBE9] text-[#1E6B68] border border-[#1E6B68]/20 font-bold py-5 rounded-[20px] active:scale-[0.98] transition hover:bg-[#c9dfdd]"
          >
            Revoca o Modifica
          </button>

          <div className="flex flex-col items-center gap-6 pt-4">
            <button className="text-[#6F6A63] text-sm underline font-medium hover:text-[#25211C] transition">
              Gestisci Preferenze di Privacy
            </button>
            
            <button 
              onClick={() => navigate('/history')}
              className="bg-white px-8 py-4 rounded-full text-[#25211C] font-bold text-base shadow-sm border border-[#DDD4C8]/50 active:scale-[0.95] transition"
            >
              Cronologia Attività
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showRevokeSheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full bg-white rounded-t-[32px] p-8 pb-12 space-y-6"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto" />
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#25211C]">Sei sicuro?</h3>
                <p className="text-[#6F6A63] text-sm leading-relaxed">
                  Stai per revocare il tuo consenso. Questa azione è immediata e irreversibile per questa sessione.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowRevokeSheet(false)}
                  className="py-4 rounded-2xl bg-gray-100 text-[#25211C] font-bold"
                >
                  Annulla
                </button>
                <button
                  onClick={handleRevoke}
                  className="py-4 rounded-2xl bg-danger text-white font-bold"
                >
                  Revoca
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

