import { supabase } from './supabase'

const MAX_SIZE = 256
const QUALITY = 0.8

async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas non supportato'))

      // Crop quadrato dal centro
      const size = Math.min(img.width, img.height)
      const sx = (img.width - size) / 2
      const sy = (img.height - size) / 2

      canvas.width = MAX_SIZE
      canvas.height = MAX_SIZE
      ctx.drawImage(img, sx, sy, size, size, 0, 0, MAX_SIZE, MAX_SIZE)

      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Compressione fallita'))),
        'image/jpeg',
        QUALITY,
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Immagine non valida'))
    }

    img.src = url
  })
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const compressed = await compressImage(file)
  const path = `${userId}.jpg`

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, compressed, {
      contentType: 'image/jpeg',
      upsert: true,
    })

  if (error) throw error

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  // Append timestamp to bust cache
  return `${data.publicUrl}?t=${Date.now()}`
}

export async function deleteAvatar(userId: string): Promise<void> {
  const { error } = await supabase.storage.from('avatars').remove([`${userId}.jpg`])
  if (error) throw error
}
