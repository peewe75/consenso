import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Clock3, ShieldCheck, Users } from 'lucide-react'
import { ConsentButton } from '@/components/session/ConsentButton'
import { initialsFromName } from '@/lib/utils'

export function MockSession({ onBack }: { onBack: () => void }) {
  const [myStatus, setMyStatus] = useState<'pending' | 'confirmed' | 'revoked'>('pending')
  const [showRevokeSheet, setShowRevokeSheet] = useState(false)

  const participants = [
    {
      id: '1',
      profile: { display_name: 'Sofia (tu)', avatar_color: '#F43F5E', avatar_url: null },
      currentStatus: myStatus,
    },
    {
      id: '2',
      profile: { display_name: 'Matteo', avatar_color: '#3B82F6', avatar_url: null },
      currentStatus: 'pending',
    }
  ]

  return (
    <div className="relative min-h-screen bg-background p-6 pt-12">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed right-0 top-0 h-[44vh] w-1/2 rounded-full bg-accent/10 blur-[120px]" />

      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-text-muted"
      >
        <ChevronLeft size={18} />
        Esci dalla demo
      </button>

      <section className="panel mb-6 rounded-[28px] p-6 shadow-xl">
        <div className="mb-3">
          <span className="rounded-full bg-success/20 border border-success/20 px-3 py-1 text-[11px] font-bold uppercase text-success">
            Sessione Attiva
          </span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-text-primary">
          Simulazione Live
        </h1>
        <p className="mt-2 text-sm text-text-muted">Iniziata oggi, 22:42</p>

        <div className="mt-6 flex items-center justify-between rounded-2xl border border-border bg-surface/50 p-5 backdrop-blur-md">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-text-muted">Tempo rimasto</span>
            <div className="mt-1 flex items-center gap-3">
              <Clock3 size={24} className="text-success" />
              <span className="font-mono text-3xl font-bold text-success">04:42:15</span>
            </div>
          </div>
          <Clock3 size={48} className="opacity-10" />
        </div>
      </section>

      <section className="panel mb-6 rounded-[28px] p-6">
        <div className="mb-4 flex items-center gap-2 text-text-muted uppercase text-[11px] font-bold tracking-widest">
          <Users size={14} />
          Partecipanti
        </div>
        <div className="space-y-3">
          {participants.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-lg"
                style={{ backgroundColor: p.profile.avatar_color }}
              >
                {initialsFromName(p.profile.display_name)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-text-primary">{p.profile.display_name}</p>
                <p className="text-xs text-text-muted">
                  {p.currentStatus === 'confirmed' ? 'Confermato' : p.currentStatus === 'revoked' ? 'Revocato' : 'In attesa'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="panel p-6 rounded-[28px] mb-24">
        <div className="flex items-center gap-2 mb-2 text-accent">
          <ShieldCheck size={18} />
          <h2 className="text-sm font-bold uppercase tracking-wider">Privacy & Consenso</h2>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">
          In questa demo simulata, puoi provare il pulsante "Hold-to-Confirm" qui sotto.
        </p>
      </div>

      {/* Action Area */}
      <div className="fixed bottom-8 left-6 right-6">
        <div className="panel p-5 rounded-[32px] shadow-2xl bg-surface/80 backdrop-blur-xl border border-white/10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-text-primary">
                {myStatus === 'confirmed' ? 'Consenso Registrato' : 'Confirm Magic'}
              </h3>
              <p className="text-[11px] text-text-muted mt-0.5">Tieni premuto per simulare l'azione</p>
            </div>
            {myStatus === 'pending' ? (
              <ConsentButton mode="confirm" onAction={async () => setMyStatus('confirmed')} size="compact" />
            ) : (
              <button
                onClick={() => setShowRevokeSheet(true)}
                className="h-12 px-6 rounded-full bg-danger/10 border border-danger/20 text-danger text-sm font-bold"
              >
                Revoca
              </button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showRevokeSheet && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full max-w-md p-8 bg-surface rounded-t-[40px] border-t border-white/10"
            >
              <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-text-primary mb-2">Confermi la revoca?</h2>
              <p className="text-text-secondary text-sm mb-8 leading-relaxed">
                Questa è una simulazione. Premendo il tasto sotto resetterai il tuo stato in questa sessione demo.
              </p>
              <ConsentButton
                mode="revoke"
                onAction={async () => {
                  setMyStatus('pending')
                  setShowRevokeSheet(false)
                }}
              />
              <button
                onClick={() => setShowRevokeSheet(false)}
                className="w-full mt-4 h-14 rounded-full border border-border text-sm font-bold text-text-primary"
              >
                Annulla
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
