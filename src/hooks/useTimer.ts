import { useEffect, useMemo, useState } from 'react'
import { formatCountdown, isExpired, isExpiringSoon } from '@/lib/utils'

export function useTimer(expiresAt: string | null) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!expiresAt) return

    const interval = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => window.clearInterval(interval)
  }, [expiresAt])

  return useMemo(() => {
    if (!expiresAt) {
      return {
        countdown: '00:00:00',
        expiringSoon: false,
        expired: false,
      }
    }

    return {
      countdown: formatCountdown(expiresAt, now),
      expiringSoon: isExpiringSoon(expiresAt, now),
      expired: isExpired(expiresAt, now),
    }
  }, [expiresAt, now])
}
