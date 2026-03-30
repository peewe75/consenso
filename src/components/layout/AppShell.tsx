import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'

export function AppShell() {
  return (
    <div className="relative min-h-screen bg-transparent text-text-primary">
      <Outlet />
      <BottomNav />
    </div>
  )
}
