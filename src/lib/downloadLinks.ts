export interface DownloadLink {
  label: string
  href: string | null
  description: string
}

function resolveLink(value: string | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export const downloadLinks: DownloadLink[] = [
  {
    label: 'Web app',
    href: '/register',
    description: 'Installazione immediata da browser su smartphone.',
  },
  {
    label: 'APK diretto',
    href: resolveLink(import.meta.env.VITE_ANDROID_APK_URL),
    description: 'Scarica il file APK appena viene pubblicato.',
  },
  {
    label: 'Google Play',
    href: resolveLink(import.meta.env.VITE_GOOGLE_PLAY_URL),
    description: 'Apri la scheda Play Store quando disponibile.',
  },
  {
    label: 'App Store',
    href: resolveLink(import.meta.env.VITE_APP_STORE_URL),
    description: 'Apri la scheda App Store quando disponibile.',
  },
]
