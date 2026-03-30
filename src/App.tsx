import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { useAuthInit } from './hooks/useAuth'

function AuthInitializer() {
  useAuthInit()
  return null
}

export function App() {
  return (
    <>
      <AuthInitializer />
      <RouterProvider router={router} />
    </>
  )
}

export default App
