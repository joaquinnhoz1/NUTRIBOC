'use client'

import { useEffect, useRef } from 'react'
import { Avocado, Leaf, Kiwi, Apple, Lemon, OrangeSlice } from './FoodSVGs'

const FOODS = [
  { id: 'f1', Comp: Avocado, size: 108, speed: 0.18 },
  { id: 'f2', Comp: Leaf, size: 96, speed: -0.22 },
  { id: 'f3', Comp: Kiwi, size: 92, speed: 0.26 },
  { id: 'f4', Comp: Apple, size: 100, speed: -0.16 },
  { id: 'f5', Comp: Lemon, size: 82, speed: 0.12 },
  { id: 'f6', Comp: OrangeSlice, size: 80, speed: -0.12 },
]

export function Hero() {
  const foodRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const handler = () => {
      const y = window.scrollY
      foodRefs.current.forEach((el, i) => {
        if (!el) return
        const speed = FOODS[i].speed
        el.style.marginTop = `${y * speed}px`
      })
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <section className="hero" id="inicio">
      <div
        className="blob"
        style={{ width: 520, height: 520, background: '#EDE3D0', top: -120, left: -100 }}
      />
      <div
        className="blob"
        style={{ width: 460, height: 460, background: '#E2E8D3', bottom: -140, right: -90 }}
      />

      {FOODS.map(({ id, Comp, size, speed }, i) => (
        <div
          key={id}
          className={`floatfood ${id}`}
          ref={el => { foodRefs.current[i] = el }}
          data-speed={speed}
        >
          <Comp size={size} />
        </div>
      ))}

      <div className="hero-inner">
        <span className="eyebrow">Licenciada en Nutrición · MN 13985 · MP 8362</span>
        <h1>
          Comé bien,<br />
          <em>viví mejor</em>
        </h1>
        <p className="role">Nut. Brenda Coloccini</p>
        <p className="hero-lead">
          Acompañamiento nutricional cálido y profesional. Hábitos reales que se sostienen, sin dietas imposibles ni culpas.
        </p>
        <div className="hero-actions">
          <a href="#agenda" className="btn btn-primary">Reservar turno</a>
          <a href="#como" className="btn btn-ghost">Cómo funciona</a>
        </div>
      </div>

      <div className="hero-scroll">
        <div className="mouse" />
        Scroll
      </div>
    </section>
  )
}
