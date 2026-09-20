import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import AdminPanel from './AdminPanel'
import CarDetail from './CarDetail'
import FinanciacionPage from './FinanciacionPage'
import './index.css'

function getRoute() {
  const hash = window.location.hash
  if (hash === '#admin') return { type: 'admin' as const }
  if (hash === '#financiacion-calc') return { type: 'financiacion' as const }
  if (hash.startsWith('#coche-')) return { type: 'car' as const, id: hash.replace('#coche-', '') }
  return { type: 'home' as const }
}

function Router() {
  const [route, setRoute] = useState(getRoute)

  useEffect(() => {
    const handler = () => setRoute(getRoute())
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])

  if (route.type === 'admin') return <AdminPanel />
  if (route.type === 'financiacion') return <FinanciacionPage />
  if (route.type === 'car') return <CarDetail id={route.id} />
  return <App />
}

const container = document.getElementById('root')!
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const root = (container as any)._reactRoot ?? ReactDOM.createRoot(container)
;(container as any)._reactRoot = root
root.render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>,
)
