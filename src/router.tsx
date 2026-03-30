/* eslint-disable react-refresh/only-export-components */
import { Suspense, lazy, type ReactNode } from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { AppShell } from '@/components/layout/AppShell'

const WelcomePage = lazy(() => import('@/pages/auth/WelcomePage').then((module) => ({ default: module.WelcomePage })))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((module) => ({ default: module.LoginPage })))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then((module) => ({ default: module.RegisterPage })))
const HomePage = lazy(() => import('@/pages/home/HomePage').then((module) => ({ default: module.HomePage })))
const HistoryPage = lazy(() => import('@/pages/history/HistoryPage').then((module) => ({ default: module.HistoryPage })))
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage').then((module) => ({ default: module.SettingsPage })))
const PairingPage = lazy(() => import('@/pages/pairing/PairingPage').then((module) => ({ default: module.PairingPage })))
const ShowQRPage = lazy(() => import('@/pages/pairing/ShowQRPage').then((module) => ({ default: module.ShowQRPage })))
const ScanQRPage = lazy(() => import('@/pages/pairing/ScanQRPage').then((module) => ({ default: module.ScanQRPage })))
const EnterCodePage = lazy(() => import('@/pages/pairing/EnterCodePage').then((module) => ({ default: module.EnterCodePage })))
const SessionPage = lazy(() => import('@/pages/session/SessionPage').then((module) => ({ default: module.SessionPage })))

function withSuspense(element: ReactNode) {
  return (
    <Suspense fallback={<RouteFallback />}>
      {element}
    </Suspense>
  )
}

function RouteFallback() {
  return (
    <main className="safe-page-tight flex min-h-screen items-center justify-center">
      <div className="panel rounded-2xl px-5 py-5 text-sm text-text-secondary">Caricamento schermata...</div>
    </main>
  )
}

export const router = createBrowserRouter([
  { path: '/', element: withSuspense(<WelcomePage />) },
  { path: '/welcome', element: <Navigate to="/" replace /> },
  { path: '/login', element: withSuspense(<LoginPage />) },
  { path: '/register', element: withSuspense(<RegisterPage />) },
  {
    element: <AuthGuard />,
    children: [
      {
        path: '/app',
        element: <AppShell />,
        children: [
          { index: true, element: withSuspense(<HomePage />) },
          { path: 'history', element: withSuspense(<HistoryPage />) },
          { path: 'settings', element: withSuspense(<SettingsPage />) },
        ],
      },
      { path: '/pairing', element: withSuspense(<PairingPage />) },
      { path: '/pairing/show', element: withSuspense(<ShowQRPage />) },
      { path: '/pairing/scan', element: withSuspense(<ScanQRPage />) },
      { path: '/pairing/code', element: withSuspense(<EnterCodePage />) },
      { path: '/session/:id', element: withSuspense(<SessionPage />) },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
