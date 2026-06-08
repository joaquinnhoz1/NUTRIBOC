'use client'

import React, { useEffect, useRef } from 'react'

interface SectionRevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
  tag?: keyof React.JSX.IntrinsicElements
}

export function SectionReveal({ children, className = '', delay = 0, tag: Tag = 'div' }: SectionRevealProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    el.style.transitionDelay = `${delay}ms`

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in')
          observer.unobserve(el)
        }
      },
      { threshold: 0.12 }
    )

    observer.observe(el)

    setTimeout(() => {
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add('in')
      }
    }, 200)

    return () => observer.disconnect()
  }, [delay])

  return (
    // @ts-expect-error dynamic tag
    <Tag ref={ref} className={`reveal ${className}`}>
      {children}
    </Tag>
  )
}
