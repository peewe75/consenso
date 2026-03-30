import { useCallback, useMemo, useRef, useState } from 'react'
import { LoaderCircle, ShieldCheck, ShieldOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConsentButtonProps {
  mode: 'confirm' | 'revoke'
  onAction: () => Promise<void>
  disabled?: boolean
  label?: string
}

const HOLD_DURATION = 600
const RADIUS = 44
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function ConsentButton({ mode, onAction, disabled, label }: ConsentButtonProps) {
  const [progress, setProgress] = useState(0)
  const [acting, setActing] = useState(false)
  const intervalRef = useRef<number | null>(null)
  const startedAtRef = useRef<number | null>(null)
  const completedRef = useRef(false)

  const palette = useMemo(
    () =>
      mode === 'confirm'
        ? {
            base: '#6366F1',
            soft: 'rgba(99, 102, 241, 0.16)',
            icon: ShieldCheck,
            fallbackLabel: 'Tieni premuto 600 ms per confermare',
          }
        : {
            base: '#EF4444',
            soft: 'rgba(239, 68, 68, 0.16)',
            icon: ShieldOff,
            fallbackLabel: 'Tieni premuto 600 ms per revocare',
          },
    [mode],
  )

  const reset = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    startedAtRef.current = null
    completedRef.current = false
    setProgress(0)
  }, [])

  const startPress = useCallback(() => {
    if (disabled || acting || intervalRef.current) return

    navigator.vibrate?.([10])
    startedAtRef.current = performance.now()
    completedRef.current = false

    intervalRef.current = window.setInterval(() => {
      const startedAt = startedAtRef.current ?? performance.now()
      const ratio = Math.min((performance.now() - startedAt) / HOLD_DURATION, 1)
      setProgress(ratio)

      if (ratio < 1 || completedRef.current) return

      completedRef.current = true
      navigator.vibrate?.([50])
      setActing(true)
      reset()

      void onAction().finally(() => {
        setActing(false)
        setProgress(0)
      })
    }, 16)
  }, [acting, disabled, onAction, reset])

  const cancelPress = useCallback(() => {
    if (completedRef.current) return
    reset()
  }, [reset])

  const dashOffset = CIRCUMFERENCE * (1 - progress)
  const Icon = palette.icon

  return (
    <div className="flex flex-col items-center gap-3 text-center select-none">
      <button
        type="button"
        disabled={disabled || acting}
        onPointerDown={startPress}
        onPointerUp={cancelPress}
        onPointerLeave={cancelPress}
        onPointerCancel={cancelPress}
        className={cn(
          'relative flex h-36 w-36 items-center justify-center rounded-full border border-white/10 transition duration-150 active:scale-[0.98] disabled:opacity-45',
          acting && 'pointer-events-none',
        )}
        style={{
          background: `radial-gradient(circle at top, ${palette.soft}, rgba(15, 15, 20, 0.94) 68%)`,
          boxShadow: `0 0 42px ${palette.soft}`,
        }}
        aria-label={mode === 'confirm' ? 'Tieni premuto per confermare il consenso' : 'Tieni premuto per revocare il consenso'}
      >
        <svg className="absolute inset-0" width="144" height="144" viewBox="0 0 144 144" aria-hidden="true">
          <circle cx="72" cy="72" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
          <circle
            cx="72"
            cy="72"
            r={RADIUS}
            fill="none"
            stroke={palette.base}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 72 72)"
          />
        </svg>

        <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-black/20">
          {acting ? <LoaderCircle className="animate-spin" size={34} color={palette.base} /> : <Icon size={34} color={palette.base} />}
        </div>
      </button>

      <p className="max-w-[14rem] text-sm leading-5 text-text-secondary">
        {acting ? 'Elaborazione in corso...' : label ?? palette.fallbackLabel}
      </p>
    </div>
  )
}
