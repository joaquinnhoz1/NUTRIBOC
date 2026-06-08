'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <header className={scrolled ? 'scrolled' : ''}>
        <div className="wrap nav">
          <a className="brand" href="#inicio">
            <Image src="/nutriboc-black.png" alt="NUTRIBOC" height={40} width={55} style={{ height: 40, width: 'auto' }} />
            <span>
              <span className="bt">Brenda Coloccini</span>
              <span className="bs">Nutrición &amp; Bienestar</span>
            </span>
          </a>
          <nav className="menu">
            <a href="#como">Cómo funciona</a>
            <a href="#agenda">Agenda</a>
            <a href="#pagos">Pagos</a>
            <a href="#contacto">Contacto</a>
          </nav>
          <a href="#agenda" className="btn btn-primary">Reservar turno</a>
          <button
            className="burger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menú"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <a href="#como" onClick={closeMenu}>Cómo funciona</a>
        <a href="#agenda" onClick={closeMenu}>Agenda</a>
        <a href="#pagos" onClick={closeMenu}>Pagos</a>
        <a href="#contacto" onClick={closeMenu}>Contacto</a>
        <a href="#agenda" className="btn btn-primary" onClick={closeMenu}>Reservar turno</a>
      </div>
    </>
  )
}
