'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const SLOTS_PRESENCIAL = ['09:00','10:00','11:00','12:00','15:00','16:00','17:00','18:00']
const SLOTS_ONLINE = ['08:00','09:00','13:00','14:00','19:00','20:00']

interface BlockedSlot { id: string; date: string; label: string; slot: string; mode: string; reason: string | null }

const MODE_LABELS: Record<string, string> = {
  presencial: 'Presencial',
  online: 'Online',
  both: 'Ambas',
}

export function BlockSlotManager({ blockedSlots }: { blockedSlots: BlockedSlot[] }) {
  const router = useRouter()
  const [date, setDate] = useState('')
  const [slot, setSlot] = useState('all')
  const [mode, setMode] = useState('both')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const allSlots = mode === 'online' ? SLOTS_ONLINE : mode === 'presencial' ? SLOTS_PRESENCIAL : [...new Set([...SLOTS_PRESENCIAL, ...SLOTS_ONLINE])].sort()

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!date) { setError('Elegí una fecha'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/admin/block-slot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, slot, mode, reason: reason || null }),
    })
    setLoading(false)
    if (res.ok) { setDate(''); setSlot('all'); setReason(''); router.refresh() }
    else { const d = await res.json(); setError(d.error || 'Error') }
  }

  async function handleRemove(id: string) {
    await fetch(`/api/admin/block-slot/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div className="adm-card">
      <h2>⏰ Bloquear horario específico</h2>
      <form className="adm-block-form" onSubmit={handleAdd}>
        <div className="adm-filter-group">
          <label>Fecha</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="adm-input" style={{ width: 180 }} />
        </div>
        <div className="adm-filter-group">
          <label>Modalidad</label>
          <select value={mode} onChange={e => setMode(e.target.value)} className="adm-input adm-select" style={{ width: 150 }}>
            <option value="both">Ambas</option>
            <option value="presencial">Presencial</option>
            <option value="online">Online</option>
          </select>
        </div>
        <div className="adm-filter-group">
          <label>Horario</label>
          <select value={slot} onChange={e => setSlot(e.target.value)} className="adm-input adm-select" style={{ width: 150 }}>
            <option value="all">Todo el día</option>
            {allSlots.map(s => <option key={s} value={s}>{s}hs</option>)}
          </select>
        </div>
        <div className="adm-filter-group" style={{ flex: 1 }}>
          <label>Motivo (opcional)</label>
          <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Ej: Reunión, descanso…" className="adm-input" />
        </div>
        <button type="submit" className="adm-btn-primary" disabled={loading}>
          {loading ? '…' : 'Bloquear'}
        </button>
      </form>
      {error && <p className="adm-error" style={{ marginBottom: 12 }}>{error}</p>}

      {blockedSlots.length === 0 ? (
        <p className="adm-empty">Sin horarios bloqueados</p>
      ) : (
        <div className="adm-blocks-list">
          {blockedSlots.map(s => (
            <div key={s.id} className="adm-block-item">
              <span>⏰ <strong>{s.label}</strong> · {s.slot === 'all' ? 'Todo el día' : `${s.slot}hs`} · {MODE_LABELS[s.mode]}</span>
              {s.reason && <span className="reason">{s.reason}</span>}
              <button className="adm-btn-danger" onClick={() => handleRemove(s.id)}>Quitar</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
