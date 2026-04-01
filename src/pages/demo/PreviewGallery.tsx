import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WelcomePage } from '@/pages/auth/WelcomePage'
import { MockSession } from './MockSession'
import { ProfileOnboardingPage } from '@/pages/onboarding/ProfileOnboardingPage'

type Screen = 'welcome' | 'onboarding' | 'session'

export function PreviewGallery() {
  const [activeScreen, setActiveScreen] = useState<Screen>('welcome')

  const renderScreen = () => {
    switch (activeScreen) {
      case 'welcome':
        return <WelcomePage />
      case 'onboarding':
        return <ProfileOnboardingPage />
      case 'session':
        return <MockSession onBack={() => setActiveScreen('welcome')} />
      default:
        return null
    }
  }

  return (
    <div className="relative min-h-screen bg-black">
      {/* Navigation Bar for Demo */}
      <nav className="fixed top-2 left-2 right-2 z-[100] flex justify-center">
        <div className="flex gap-1 p-1 bg-surface/40 backdrop-blur-2xl rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
          <Tab 
            active={activeScreen === 'welcome'} 
            onClick={() => setActiveScreen('welcome')} 
            label="Welcome" 
          />
          <Tab 
            active={activeScreen === 'onboarding'} 
            onClick={() => setActiveScreen('onboarding')} 
            label="Onboarding" 
          />
          <Tab 
            active={activeScreen === 'session'} 
            onClick={() => setActiveScreen('session')} 
            label="Simula Sessione" 
          />
        </div>
      </nav>

      <div className="pt-16 pb-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScreen}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.02, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Demo helper toast */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]">
        <div className="px-4 py-2 bg-accent/20 backdrop-blur-md rounded-full border border-accent/30 text-[10px] uppercase font-bold tracking-widest text-accent-light shadow-glow">
          Magic Preview Mode — Grafica App
        </div>
      </div>
    </div>
  )
}

function Tab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${
        active 
          ? 'bg-accent text-white shadow-xl' 
          : 'text-text-muted hover:bg-white/5 hover:text-text-primary'
      }`}
    >
      {label}
    </button>
  )
}
