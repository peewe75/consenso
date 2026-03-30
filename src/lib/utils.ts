import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export type SessionStatus = 'pending' | 'active' | 'confirmed' | 'revoked' | 'expired'
export type ConsentAction = 'confirmed' | 'revoked'

const AVATAR_PALETTE = [
  '#6366F1',
  '#8B5CF6',
  '#EC4899',
  '#10B981',
  '#F59E0B',
  '#3B82F6',
  '#EF4444',
  '#14B8A6',
] as const

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateAvatarColor(seed: string) {
  const value = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return AVATAR_PALETTE[value % AVATAR_PALETTE.length]
}

export function formatCountdown(expiresAt: string, now = Date.now()) {
  const diff = Math.max(0, new Date(expiresAt).getTime() - now)
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':')
}

export function isExpiringSoon(expiresAt: string, now = Date.now()) {
  const diff = new Date(expiresAt).getTime() - now
  return diff > 0 && diff <= 30 * 60 * 1000
}

export function isExpired(expiresAt: string, now = Date.now()) {
  return new Date(expiresAt).getTime() <= now
}

export function formatSessionDate(value: string) {
  return format(new Date(value), "d MMMM yyyy, HH:mm", { locale: it })
}

export function formatSessionTime(value: string) {
  return format(new Date(value), 'HH:mm', { locale: it })
}

export function getSessionStatusMeta(status: SessionStatus) {
  switch (status) {
    case 'pending':
      return { label: 'In attesa', color: 'text-warning', tone: 'bg-warning/12 border-warning/25' }
    case 'active':
      return { label: 'Attiva', color: 'text-success', tone: 'bg-success/12 border-success/25' }
    case 'confirmed':
      return { label: 'Confermata', color: 'text-success', tone: 'bg-success/12 border-success/25' }
    case 'revoked':
      return { label: 'Revocata', color: 'text-danger', tone: 'bg-danger/12 border-danger/25' }
    case 'expired':
      return { label: 'Scaduta', color: 'text-text-muted', tone: 'bg-surface border-border' }
  }
}

export function getMyActionMeta(status: ConsentAction | null) {
  if (status === 'confirmed') {
    return { label: 'Hai confermato', className: 'bg-success/12 text-success border-success/25' }
  }

  if (status === 'revoked') {
    return { label: 'Hai revocato', className: 'bg-danger/12 text-danger border-danger/25' }
  }

  return { label: 'In attesa della tua scelta', className: 'bg-surface-2 text-text-secondary border-border' }
}

export function padCode(code: string) {
  return code.padStart(6, '0').slice(0, 6)
}

export function isIosSafariInstallPromptVisible() {
  if (typeof window === 'undefined') return false
  const ua = window.navigator.userAgent
  const isIos = /iPhone|iPad|iPod/i.test(ua)
  const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS/i.test(ua)
  const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as Navigator & { standalone?: boolean }).standalone
  return isIos && isSafari && !standalone
}

export function initialsFromName(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?'
}
