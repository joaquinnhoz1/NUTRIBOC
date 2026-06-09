'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const links = [
  { href: '/admin', label: 'Dashboard', icon: <GridIcon /> },
  { href: '/admin/bookings', label: 'Reservas', icon: <CalIcon /> },
  { href: '/admin/schedule', label: 'Horarios y bloqueos', icon: <LockIcon /> },
  { href: '/admin/settings', label: 'Configuración', icon: <GearIcon /> },
]

export function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const isLogin = pathname === '/admin/login'
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const INACTIVITY_MS = 30 * 60 * 1000

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  useEffect(() => {
    if (isLogin) return

    function reset() {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(logout, INACTIVITY_MS)
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']
    events.forEach(e => window.addEventListener(e, reset, { passive: true }))
    reset()

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      events.forEach(e => window.removeEventListener(e, reset))
    }
  }, [isLogin])

  if (isLogin) return null

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="adm-sidebar">
        <div className="adm-sidebar-logo">
          <div className="mark">NB</div>
          <span>Nutri.bcg<small>Panel Admin</small></span>
        </div>
        <nav className="adm-nav">
          <div className="adm-nav-label">Menú</div>
          {links.map(l => (
            <Link key={l.href} href={l.href} className={pathname === l.href ? 'active' : ''}>
              {l.icon}{l.label}
            </Link>
          ))}
        </nav>
        <div className="adm-sidebar-footer">
          <button className="adm-logout-btn" onClick={logout}>
            <LogoutIcon /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="adm-mobile-header">
        <div className="adm-mobile-logo">
          <div className="mark">NB</div>
          <span>Nutri.bcg <small>Admin</small></span>
        </div>
        <button className="adm-mobile-logout" onClick={logout} aria-label="Cerrar sesión">
          <LogoutIcon />
        </button>
      </header>

      {/* Mobile bottom nav */}
      <nav className="adm-mobile-nav">
        {links.map(l => (
          <Link key={l.href} href={l.href} className={`adm-mobile-nav-item${pathname === l.href ? ' active' : ''}`}>
            {l.icon}
            <span>{l.label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}

function GridIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
}
function CalIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
}
function LockIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
}
function GearIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
}
function LogoutIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
}
