import { Clock3, House, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const tabs = [
  { to: '/app', label: 'Home', icon: House },
  { to: '/app/history', label: 'Storico', icon: Clock3 },
  { to: '/app/settings', label: 'Profilo', icon: UserRound },
]

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/8 bg-background/88 px-3 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 backdrop-blur-xl"
      aria-label="Navigazione principale"
    >
      <div className="mx-auto flex max-w-md items-center gap-2">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/app'}
            className={({ isActive }) =>
              cn(
                'flex min-h-12 flex-1 items-center justify-center rounded-full px-3 py-2 transition-all active:scale-[0.98]',
                isActive ? 'bg-accent/18 text-text-primary' : 'text-text-muted',
              )
            }
          >
            {({ isActive }) => (
              <div className="flex flex-col items-center gap-1">
                <Icon size={20} className={isActive ? 'text-accent' : 'text-text-muted'} />
                <span className={cn('text-[11px] font-medium', isActive && 'text-text-primary')}>{label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
