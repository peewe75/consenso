import { useRef, useState } from 'react'
import { Camera, Palette, Trash2 } from 'lucide-react'
import { cn, initialsFromName } from '@/lib/utils'
import { uploadAvatar, deleteAvatar } from '@/lib/avatar'

const AVATAR_COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#14B8A6']

interface AvatarPickerProps {
  userId: string
  displayName: string
  avatarColor: string
  avatarUrl: string | null
  onColorChange: (color: string) => void
  onAvatarUrlChange: (url: string | null) => void
  size?: 'md' | 'lg'
}

export function AvatarPicker({
  userId,
  displayName,
  avatarColor,
  avatarUrl,
  onColorChange,
  onAvatarUrlChange,
  size = 'lg',
}: AvatarPickerProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [showColors, setShowColors] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sizeClasses = size === 'lg'
    ? 'h-28 w-28 rounded-[32px] text-4xl'
    : 'h-20 w-20 rounded-[24px] text-3xl'

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validazione client-side
    if (!file.type.startsWith('image/')) {
      setError('Seleziona un file immagine')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('L\'immagine deve essere inferiore a 5MB')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const url = await uploadAvatar(userId, file)
      onAvatarUrlChange(url)
    } catch {
      setError('Errore durante il caricamento')
    } finally {
      setUploading(false)
      // Reset input per permettere di selezionare lo stesso file
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleRemovePhoto() {
    setUploading(true)
    setError(null)
    try {
      await deleteAvatar(userId)
      onAvatarUrlChange(null)
    } catch {
      setError('Errore durante la rimozione')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar preview */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className={cn(
          'relative flex items-center justify-center font-bold text-white shadow-sm transition active:scale-[0.98] disabled:opacity-50',
          sizeClasses,
        )}
        style={{ backgroundColor: avatarUrl ? undefined : avatarColor }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className={cn('h-full w-full object-cover', size === 'lg' ? 'rounded-[32px]' : 'rounded-[24px]')}
          />
        ) : (
          initialsFromName(displayName || '?')
        )}

        {/* Camera overlay */}
        <div className={cn(
          'absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition hover:opacity-100',
          size === 'lg' ? 'rounded-[32px]' : 'rounded-[24px]',
        )}>
          <Camera size={size === 'lg' ? 28 : 22} className="text-white" />
        </div>
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Carica foto profilo"
      />

      {uploading && (
        <p className="text-sm text-text-secondary">Caricamento in corso...</p>
      )}

      {error && (
        <p className="text-sm text-danger">{error}</p>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-4 py-2 text-sm font-medium text-text-secondary transition active:scale-[0.98] disabled:opacity-50"
        >
          <Camera size={16} />
          {avatarUrl ? 'Cambia foto' : 'Carica foto'}
        </button>

        <button
          type="button"
          onClick={() => setShowColors(!showColors)}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-4 py-2 text-sm font-medium text-text-secondary transition active:scale-[0.98]"
        >
          <Palette size={16} />
          Colore
        </button>

        {avatarUrl && (
          <button
            type="button"
            onClick={() => void handleRemovePhoto()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-full border border-danger/20 bg-danger/10 px-4 py-2 text-sm font-medium text-danger transition active:scale-[0.98] disabled:opacity-50"
          >
            <Trash2 size={16} />
            Rimuovi
          </button>
        )}
      </div>

      {/* Color picker grid */}
      {showColors && (
        <div className="grid grid-cols-4 gap-3 pt-2">
          {AVATAR_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => {
                onColorChange(color)
                setShowColors(false)
              }}
              className={cn(
                'flex min-h-11 items-center justify-center rounded-2xl border border-border shadow-sm transition active:scale-[0.98]',
                avatarColor === color && 'ring-2 ring-accent ring-offset-2 ring-offset-background',
              )}
              style={{ backgroundColor: color }}
              aria-label={`Colore ${color}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
