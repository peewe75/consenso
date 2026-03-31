import { useState } from 'react'
import { Check, Edit2, LogOut, Shield, Trash2, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth as useClerkAuth } from '@clerk/clerk-react'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/authStore'
import { cn, initialsFromName } from '@/lib/utils'

const AVATAR_COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#14B8A6']

const profileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Lo pseudonimo deve avere almeno 2 caratteri')
    .max(30, 'Lo pseudonimo può avere massimo 30 caratteri'),
  avatarColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
})

export function SettingsPage() {
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()
  const { setProfile } = useAuthStore()
  const { getToken } = useClerkAuth()

  // Logout
  const [loggingOut, setLoggingOut] = useState(false)

  // Delete account
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Edit profile
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(profile?.display_name ?? '')
  const [editColor, setEditColor] = useState(profile?.avatar_color ?? '#6366F1')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  const isBusy = loggingOut || deletingAccount || savingProfile

  async function handleLogout() {
    setLoggingOut(true)
    await signOut()
    navigate('/', { replace: true })
  }

  async function handleDeleteAccount() {
    setDeletingAccount(true)
    setDeleteError(null)
    try {
      const token = await getToken()
      if (!token) {
        throw new Error('Sessione non valida. Effettua il logout e riaccedi prima di procedere.')
      }

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Errore sconosciuto' }))
        throw new Error((err as { error?: string }).error ?? 'Errore durante la cancellazione')
      }

      await signOut()
      navigate('/', { replace: true })
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Errore sconosciuto')
      setDeletingAccount(false)
    }
  }

  function startEditing() {
    setEditName(profile?.display_name ?? '')
    setEditColor(profile?.avatar_color ?? '#6366F1')
    setProfileError(null)
    setEditing(true)
  }

  function cancelEditing() {
    setEditing(false)
    setProfileError(null)
  }

  async function handleSaveProfile() {
    const parsed = profileSchema.safeParse({ displayName: editName, avatarColor: editColor })
    if (!parsed.success) {
      setProfileError(parsed.error.issues[0]?.message ?? 'Controlla i dati del profilo')
      return
    }

    setSavingProfile(true)
    setProfileError(null)

    const { error } = await supabase.rpc('upsert_my_profile', {
      p_display_name: parsed.data.displayName,
      p_avatar_color: parsed.data.avatarColor,
    })

    if (error) {
      setProfileError(error.message)
      setSavingProfile(false)
      return
    }

    if (profile) {
      setProfile({ ...profile, display_name: parsed.data.displayName, avatar_color: parsed.data.avatarColor })
    }
    setSavingProfile(false)
    setEditing(false)
  }

  return (
    <main className="safe-page space-y-6">
      <section className="space-y-2">
        <h1 className="text-[1.75rem] font-bold">Profilo</h1>
        <p className="text-sm leading-6 text-text-secondary">Qui trovi il tuo pseudonimo, le impostazioni essenziali e il promemoria privacy.</p>
      </section>

      {/* Profile card — view / edit */}
      <section className="panel rounded-[28px] px-5 py-6">
        {editing ? (
          <div className="space-y-5">
            {/* Avatar preview */}
            <div className="flex justify-center">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-[24px] text-3xl font-bold text-white shadow-sm"
                style={{ backgroundColor: editColor }}
              >
                {initialsFromName(editName || '?')}
              </div>
            </div>

            {/* Display name input */}
            <label className="block space-y-2">
              <span className="text-sm font-medium text-text-secondary">Pseudonimo</span>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                minLength={2}
                maxLength={30}
                placeholder="Es. Stella, Marco, Vale"
                className="min-h-12 w-full rounded-2xl border border-border bg-background px-4 text-base text-text-primary outline-none transition placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/10"
              />
            </label>

            {/* Color picker */}
            <div className="space-y-3">
              <span className="text-sm font-medium text-text-secondary">Colore avatar</span>
              <div className="grid grid-cols-4 gap-3">
                {AVATAR_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setEditColor(color)}
                    className={cn(
                      'flex min-h-11 items-center justify-center rounded-2xl border border-border shadow-sm transition active:scale-[0.98]',
                      editColor === color && 'ring-2 ring-accent ring-offset-2 ring-offset-background',
                    )}
                    style={{ backgroundColor: color }}
                    aria-label={`Colore ${color}`}
                  />
                ))}
              </div>
            </div>

            {profileError && (
              <p className="rounded-xl border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">{profileError}</p>
            )}

            {/* Save / Cancel */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-accent text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
              >
                <Check size={16} />
                {savingProfile ? 'Salvataggio...' : 'Salva'}
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                disabled={savingProfile}
                className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-border bg-surface-2 text-sm font-medium transition active:scale-[0.98] disabled:opacity-50"
              >
                <X size={16} />
                Annulla
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div
              className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-[24px] text-3xl font-bold text-white"
              style={{ backgroundColor: profile?.avatar_color ?? '#6366F1' }}
            >
              {initialsFromName(profile?.display_name ?? '?')}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-text-secondary">Pseudonimo</p>
              <h2 className="mt-1 truncate text-xl font-semibold">{profile?.display_name ?? 'Profilo'}</h2>
              <p className="mt-1 text-sm text-text-secondary">Visibile solo nelle sessioni condivise con altri partecipanti.</p>
            </div>
            <button
              type="button"
              onClick={startEditing}
              disabled={isBusy}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2 transition active:scale-[0.98] disabled:opacity-50"
              aria-label="Modifica profilo"
            >
              <Edit2 size={16} className="text-text-secondary" />
            </button>
          </div>
        )}
      </section>

      {/* Privacy notice */}
      <section className="panel rounded-2xl px-4 py-4">
        <div className="flex items-start gap-3">
          <Shield size={18} className="mt-0.5 shrink-0 text-accent" />
          <div>
            <p className="text-sm font-semibold text-text-primary">Privacy by design</p>
            <p className="mt-1 text-sm leading-6 text-text-secondary">
              L&apos;app evita audio, documenti di identità e metadati superflui. Conserviamo solo ciò che serve a documentare la sessione e a mantenere il tuo accesso.
            </p>
          </div>
        </div>
      </section>

      {/* Actions */}
      <section className="space-y-3">
        <button
          type="button"
          onClick={handleLogout}
          disabled={isBusy}
          className="panel flex min-h-14 w-full items-center gap-3 rounded-2xl px-4 text-left text-danger transition active:scale-[0.99] disabled:opacity-50"
        >
          <LogOut size={18} />
          <span className="text-sm font-semibold">{loggingOut ? 'Uscita in corso...' : "Esci dall'account"}</span>
        </button>

        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          disabled={isBusy}
          className="flex min-h-14 w-full items-center gap-3 rounded-2xl border border-danger/20 bg-danger/8 px-4 text-left text-danger/80 transition active:scale-[0.99] disabled:opacity-50"
        >
          <Trash2 size={18} />
          <span className="text-sm font-semibold">Elimina account (GDPR)</span>
        </button>
      </section>

      {/* Delete account modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[28px] bg-surface p-6 shadow-xl ring-1 ring-border">
            <h3 className="text-xl font-bold text-danger">Elimina account</h3>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Questa azione è <strong className="text-text-primary">irreversibile</strong>.
              Tutti i tuoi dati, le sessioni e le conferme verranno eliminati definitivamente.
            </p>
            <p className="mt-4 text-sm font-medium text-text-primary">
              Digita <span className="font-mono text-danger">ELIMINA</span> per confermare:
            </p>
            <input
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none transition focus:border-danger focus:ring-1 focus:ring-danger"
              placeholder="ELIMINA"
              autoComplete="off"
            />
            {deleteError && <p className="mt-2 text-sm text-danger">{deleteError}</p>}
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmationText !== 'ELIMINA' || deletingAccount}
                className="flex min-h-12 items-center justify-center rounded-xl bg-danger text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
              >
                {deletingAccount ? 'Eliminazione in corso...' : 'Conferma eliminazione'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmDelete(false)
                  setDeleteConfirmationText('')
                  setDeleteError(null)
                }}
                disabled={deletingAccount}
                className="flex min-h-12 items-center justify-center rounded-xl bg-surface-2 text-sm font-medium transition active:scale-[0.98] disabled:opacity-50"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
