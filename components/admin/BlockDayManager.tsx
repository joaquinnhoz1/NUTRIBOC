'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface BlockedDay { id: string; date: string; label: string; reason: string | null }

export function BlockDayManager({ blockedDays }: { blockedDays: BlockedDay[] }) {
  const router = useRouter()
  const [date, setDate] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!date) { setError('Elegí una fecha'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/admin/block-day', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, reason: reason || null }),
    })
    setLoading(false)
    if (res.ok) { setDate(''); setReason(''); router.refresh() }
    else { const d = await res.json(); setError(d.error || 'Error') }
  }

  async function handleRemove(id: string) {
    await fetch(`/api/admin/block-day/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div className="adm-card">
      <h2>🚫 Bloquear día completo</h2>
      <form className="adm-block-form" onSubmit={handleAdd}>
        <div className="adm-filter-group">
          <label>Fecha</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="adm-input" style={{ width: 180 }} />
        </div>
        <div className="adm-filter-group" style={{ flex: 1 }}>
          <label>Motivo (opcional)</label>
          <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Ej: Feriado, viaje…" className="adm-input" />
        </div>
        <button type="submit" className="adm-btn-primary" disabled={loading}>
          {loading ? '…' : 'Bloquear día'}
        </button>
      </form>
      {error && <p className="adm-error" style={{ marginBottom: 12 }}>{error}</p>}

      {blockedDays.length === 0 ? (
        <p className="adm-empty">Sin días bloqueados</p>
      ) : (
        <div className="adm-blocks-list">
          {blockedDays.map(d => (
            <div key={d.id} className="adm-block-item">
              <span>📅 <strong>{d.label}</strong></span>
              {d.reason && <span className="reason">{d.reason}</span>}
              <button className="adm-btn-danger" onClick={() => handleRemove(d.id)}>Desbloquear</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
