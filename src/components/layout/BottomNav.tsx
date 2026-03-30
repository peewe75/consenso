import { Clock3, House, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const tabs = [
  { to: '/app', label: 'Home', icon: House },
  { to: '/app/history', label: 'Storico', icon: Clock3 },
  { to: '/app/settings', label: 'Profilo', icon: UserRound },
]

// ─── Stitch "Indigo Vault" BottomNav ─────────────────────────────────────────
// Active:   text-[#C0C1FF]  bg-[#C0C1FF]/10  rounded-2xl
// Inactive: text-[#464554]
// Container: bg-[#131318]/90 backdrop-blur-2xl rounded-t-[30px]
//            border-t border-[#464554]/20 shadow-[0_-10px_40px_rgba(0,0,0,0.4)]
// ─────────────────────────────────────────────────────────────────────────────

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex h-24 items-center justify-around rounded-t-[30px] border-t border-[#464554]/20 bg-[#131318]/90 px-4 pb-[calc(env(safe-area-inset-bottom)+8px)] shadow-[0_-10px_40px_rgba(0,0,0,0.4)] backdrop-blur-2xl"
      aria-label="Navigazione principale"
    >
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/app'}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center gap-1 rounded-2xl px-6 py-2 transition-all duration-300 active:scale-90',
              isActive ? 'bg-[#C0C1FF]/10 text-[#C0C1FF] font-bold' : 'text-[#464554] hover:text-[#C0C1FF]',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={22} className={isActive ? 'text-[#C0C1FF]' : 'text-[#464554]'} />
              <span className="text-[11px] font-medium uppercase tracking-[0.02em]">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
