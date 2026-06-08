'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '542314541335'

interface Props {
  booking: {
    id: string
    status: string
    phone: string
    name: string
    date: string
    slot: string
    mode: string
  }
}

export function BookingActions({ booking }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function updateStatus(status: string) {
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
        <button className="adm-btn-ghost" onClick={() => updateStatus('confirmed')} disabled={loading} style={{ fontSize: 12, padding: '6px 12px' }}>
          Restaurar
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
