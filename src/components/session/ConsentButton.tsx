import { useCallback, useMemo, useRef, useState } from 'react'
import { LoaderCircle, ShieldCheck, ShieldOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConsentButtonProps {
  mode: 'confirm' | 'revoke'
  onAction: () => Promise<void>
  disabled?: boolean
  label?: string
  size?: 'default' | 'compact'
}

// ─── Stitch "Indigo Vault" ConsentButton ──────────────────────────────────────
// Outer SVG:   144×144  r=68  stroke-width=3
// Track:       rgba(70,69,84,0.2)
// Arc confirm: #C0C1FF   Arc revoke: #FFB4AB
// Inner:       112px     gradient-bg      icon 40px
// Acting arc:  #4EDEA3 (tertiary)
// ─────────────────────────────────────────────────────────────────────────────

const HOLD_DURATION = 600
const RADIUS = 68
const CIRCUMFERENCE = 2 * Math.PI * RADIUS   // ≈ 427.26

export function ConsentButton({
  mode,
  onAction,
  disabled,
  label,
  size = 'default',
}: ConsentButtonProps) {
  const [progress, setProgress] = useState(0)
  const [acting, setActing] = useState(false)
  const intervalRef = useRef<number | null>(null)
  const startedAtRef = useRef<number | null>(null)
  const completedRef = useRef(false)
  const compact = size === 'compact'

  const palette = useMemo(
    () =>
      mode === 'confirm'
        ? {
            arcColor: '#C0C1FF',
            innerGradient: 'linear-gradient(135deg, #C0C1FF 0%, #8083FF 100%)',
            innerShadow: '0 0 40px rgba(192,193,255,0.2)',
            iconColor: '#07006C',
            icon: ShieldCheck,
            fallbackLabel: 'Tieni premuto 600 ms per confermare',
          }
        : {
            arcColor: '#FFB4AB',
            innerGradient: 'linear-gradient(135deg, #FFB4AB 0%, #93000A 100%)',
            innerShadow: '0 0 40px rgba(255,180,171,0.2)',
            iconColor: '#FFDAD6',
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
  const frameClasses = compact ? 'h-28 w-28' : 'h-36 w-36'
  const innerClasses = compact ? 'h-[5.5rem] w-[5.5rem]' : 'h-28 w-28'
  const iconSize = compact ? 32 : 40
  const helperClasses = compact ? 'max-w-[11rem] text-xs leading-4' : 'max-w-[15rem] text-sm leading-5'

  return (
    <div className="flex select-none flex-col items-center gap-4 text-center">
      <button
        type="button"
        disabled={disabled || acting}
        onPointerDown={startPress}
        onPointerUp={cancelPress}
        onPointerLeave={cancelPress}
        onPointerCancel={cancelPress}
        className={cn(
          'relative flex items-center justify-center rounded-full transition duration-150 active:scale-[0.97] disabled:opacity-45',
          frameClasses,
          acting && 'pointer-events-none',
        )}
        aria-label={
          mode === 'confirm'
            ? 'Tieni premuto per confermare il consenso'
            : 'Tieni premuto per revocare il consenso'
        }
        >
        {/* SVG ring */}
        <svg
          className="absolute inset-0"
          width={compact ? '112' : '144'}
          height={compact ? '112' : '144'}
          viewBox="0 0 144 144"
          aria-hidden="true"
        >
          {/* Track */}
          <circle
            cx="72"
            cy="72"
            r={RADIUS}
            fill="none"
            stroke="rgba(70,69,84,0.2)"
            strokeWidth="3"
          />
          {/* Progress arc */}
          <circle
            cx="72"
            cy="72"
            r={RADIUS}
            fill="none"
            stroke={acting ? '#4EDEA3' : palette.arcColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={acting ? 0 : dashOffset}
            transform="rotate(-90 72 72)"
            className="transition-all duration-100"
          />
        </svg>

        {/* Inner circle */}
        <div
          className={cn('relative z-10 flex items-center justify-center rounded-full', innerClasses)}
          style={{
            background: acting
              ? 'linear-gradient(135deg, #4EDEA3 0%, #00885D 100%)'
              : palette.innerGradient,
            boxShadow: acting ? '0 0 40px rgba(78,222,163,0.2)' : palette.innerShadow,
          }}
        >
          {acting ? (
            <LoaderCircle className="animate-spin" size={iconSize} color="#003824" />
          ) : (
            <Icon size={iconSize} color={palette.iconColor} />
          )}
        </div>
      </button>

      <p className={cn('font-medium text-[#C7C4D7]', helperClasses)}>
        {acting ? 'Elaborazione in corso...' : (label ?? palette.fallbackLabel)}
      </p>
    </div>
  )
}
