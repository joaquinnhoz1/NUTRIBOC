'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
const DELETE_AFTER = 30 // segundos

interface Props {
  booking: {
    id: string
    status: string
    phone: string
    name: string
    date: string
    slot: string
    mode: string
    cancelledAt: string | null
  }
}

export function BookingActions({ booking }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  function calcRemaining(): number | null {
    if (booking.status !== 'cancelled' || !booking.cancelledAt) return null
    const elapsed = Math.floor((Date.now() - new Date(booking.cancelledAt).getTime()) / 1000)
    return Math.max(0, DELETE_AFTER - elapsed)
  }

  const [countdown, setCountdown] = useState<number | null>(calcRemaining)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const deleteRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (booking.status !== 'cancelled') return

    const remaining = calcRemaining()

    // Ya expiró mientras estábamos fuera — borrar de inmediato
    if (remaining !== null && remaining <= 0) {
      fetch(`/api/bookings/${booking.id}`, { method: 'DELETE' }).then(() => router.refresh())
      return
    }

    if (remaining === null) return

    setCountdown(remaining)

    timerRef.current = setInterval(() => {
      setCountdown(s => (s !== null ? s - 1 : null))
    }, 1000)

    deleteRef.current = setTimeout(async () => {
      await fetch(`/api/bookings/${booking.id}`, { method: 'DELETE' })
      router.refresh()
    }, remaining * 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (deleteRef.current) clearTimeout(deleteRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking.status, booking.id, booking.cancelledAt, router])

  async function updateStatus(status: string) {
    // Si restauramos, cancelamos el auto-borrado
    if (timerRef.current) clearInterval(timerRef.current)
    if (deleteRef.current) clearTimeout(deleteRef.current)
    setCountdown(null)

    setLoading(true)
    await fetch(`/api/bookings/${booking.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setLoading(false)
    router.refresh()
  }

  function fmtDate(dateStr: string) {
    const [y, m, d] = dateStr.split('-')
    return `${d} ${MONTHS[parseInt(m) - 1]} ${y}`
  }

  function openWA() {
    const msg = `Hola ${booking.name}! Te confirmamos tu turno de nutrición:\n📅 ${fmtDate(booking.date)} a las ${booking.slot}hs\n🏥 Modalidad: ${booking.mode === 'presencial' ? 'Presencial' : 'Online'}\n¡Nos vemos! 🌿`
    const phone = booking.phone.replace(/\D/g, '')
    const fullPhone = phone.startsWith('54') ? phone : `54${phone}`
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="actions">
      {booking.status === 'pending_transfer' && (
        <button className="adm-btn-confirm" onClick={() => updateStatus('confirmed')} disabled={loading}>
          ✓ Confirmar
        </button>
      )}
      {booking.status !== 'cancelled' && (
        <button className="adm-btn-danger" onClick={() => updateStatus('cancelled')} disabled={loading}>
          Cancelar
        </button>
      )}
      {booking.status === 'cancelled' && (
        <button
          className="adm-btn-ghost"
          onClick={() => updateStatus('confirmed')}
          disabled={loading}
          style={{ fontSize: 12, padding: '6px 12px', borderColor: countdown !== null && countdown <= 10 ? '#e65100' : undefined, color: countdown !== null && countdown <= 10 ? '#e65100' : undefined }}
        >
          Restaurar {countdown !== null ? `(${countdown}s)` : ''}
        </button>
      )}
      <button
        title="Enviar WA"
        style={{ background: '#edf7ef', border: '1px solid #a8d5b0', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 15 }}
        onClick={openWA}
      >
        💬
      </button>
    </div>
  )
}
