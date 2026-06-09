'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  initialPresencial: Record<number, string[]>
  initialOnline: Record<number, string[]>
}

type Mode = 'presencial' | 'online'

const DAYS = [
  { dow: 1, label: 'Lun' },
  { dow: 2, label: 'Mar' },
  { dow: 3, label: 'Mié' },
  { dow: 4, label: 'Jue' },
  { dow: 5, label: 'Vie' },
  { dow: 6, label: 'Sáb' },
  { dow: 0, label: 'Dom' },
]

function sortSlots(slots: string[]): string[] {
  return [...slots].sort((a, b) => {
    const [ah, am] = a.split(':').map(Number)
    const [bh, bm] = b.split(':').map(Number)
    return ah * 60 + am - (bh * 60 + bm)
  })
}

function SlotPanel({
  mode,
  slots,
  onChange,
}: {
  mode: Mode
  slots: string[]
  onChange: (slots: string[]) => void
}) {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  function addSlot() {
    setError('')
    const val = input.trim()
    if (!/^\d{1,2}:\d{2}$/.test(val)) {
      setError('Formato incorrecto. Usá HH:MM (ej: 09:30)')
      return
    }
    const [h, m] = val.split(':').map(Number)
    if (h > 23 || m > 59) { setError('Hora inválida'); return }
    const normalized = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    if (slots.includes(normalized)) { setError('Ese horario ya existe'); return }
    onChange(sortSlots([...slots, normalized]))
    setInput('')
  }

  function removeSlot(slot: string) {
    onChange(slots.filter(s => s !== slot))
  }

  const label = mode === 'presencial' ? 'Presencial' : 'Online'

  return (
    <div style={{ flex: 1, minWidth: 240 }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: '#6E7B52', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '.08em' }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, minHeight: 42, marginBottom: 16 }}>
        {slots.length === 0 && (
          <span style={{ fontSize: 13, color: '#8a8780' }}>Sin horarios — día cerrado</span>
        )}
        {slots.map(slot => (
          <span key={slot} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#DFE5D1', borderRadius: 50, padding: '5px 12px',
            fontSize: 13.5, fontWeight: 600, color: '#2C2A22',
          }}>
            {slot}
            <button
              onClick={() => removeSlot(slot)}
              title="Eliminar"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#6E7B52', fontWeight: 700, fontSize: 15, lineHeight: 1,
                padding: '0 0 1px', display: 'flex', alignItems: 'center',
              }}
            >×</button>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <input
            type="time"
            value={input}
            onChange={e => { setInput(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && addSlot()}
            className="adm-input"
            style={{ maxWidth: 130 }}
          />
          {error && <p style={{ fontSize: 12, color: '#c0392b', marginTop: 4 }}>{error}</p>}
        </div>
        <button
          onClick={addSlot}
          className="adm-btn-ghost"
          style={{ whiteSpace: 'nowrap', marginTop: 0 }}
        >
          + Agregar
        </button>
      </div>
    </div>
  )
}

export function SlotEditor({ initialPresencial, initialOnline }: Props) {
  const router = useRouter()
  const [activeDow, setActiveDow] = useState(1)
  const [presencial, setPresencial] = useState<Record<number, string[]>>(initialPresencial)
  const [online, setOnline] = useState<Record<number, string[]>>(initialOnline)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  function setDayPresencial(dow: number, slots: string[]) {
    setPresencial(prev => ({ ...prev, [dow]: slots }))
  }

  function setDayOnline(dow: number, slots: string[]) {
    setOnline(prev => ({ ...prev, [dow]: slots }))
  }

  async function save() {
    setSaving(true); setMsg(''); setErr('')
    const body: Record<string, string> = {}
    for (let d = 0; d <= 6; d++) {
      body[`slots_presencial_${d}`] = JSON.stringify(presencial[d] ?? [])
      body[`slots_online_${d}`] = JSON.stringify(online[d] ?? [])
    }
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setSaving(false)
    if (res.ok) { setMsg('Horarios guardados correctamente'); router.refresh() }
    else setErr('Error al guardar')
  }

  const activeDay = DAYS.find(d => d.dow === activeDow)!

  return (
    <div className="adm-card">
      <h2>🕐 Horarios disponibles</h2>
      <p style={{ fontSize: 13.5, color: '#5C584B', marginBottom: 22 }}>
        Configurá los horarios para cada día de la semana. Un día sin horarios queda cerrado para reservas.
      </p>

      {/* Tabs días */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap' }}>
        {DAYS.map(({ dow, label }) => {
          const hasPresencial = (presencial[dow] ?? []).length > 0
          const hasOnline = (online[dow] ?? []).length > 0
          const isOpen = hasPresencial || hasOnline
          const isActive = activeDow === dow
          return (
            <button
              key={dow}
              onClick={() => setActiveDow(dow)}
              style={{
                padding: '7px 16px',
                borderRadius: 8,
                border: isActive ? '2px solid #6E7B52' : '2px solid #E4D9C6',
                background: isActive ? '#6E7B52' : isOpen ? '#F3F0E8' : '#fafafa',
                color: isActive ? '#fff' : isOpen ? '#2C2A22' : '#aaa',
                fontWeight: isActive ? 700 : 500,
                fontSize: 13.5,
                cursor: 'pointer',
                transition: 'all .15s',
                position: 'relative',
              }}
            >
              {label}
              {!isOpen && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#c0392b', border: '1px solid #fff',
                }} />
              )}
            </button>
          )
        })}
      </div>

      <p style={{ fontSize: 13, color: '#8a8780', marginBottom: 20 }}>
        Editando: <strong style={{ color: '#2C2A22' }}>{activeDay.label}</strong>
        {(presencial[activeDow] ?? []).length === 0 && (online[activeDow] ?? []).length === 0 && (
          <span style={{ color: '#c0392b', marginLeft: 8 }}>· Sin horarios (día cerrado)</span>
        )}
      </p>

      {/* Paneles presencial / online */}
      <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginBottom: 24 }}>
        <SlotPanel
          mode="presencial"
          slots={presencial[activeDow] ?? []}
          onChange={slots => setDayPresencial(activeDow, slots)}
        />
        <div style={{ width: 1, background: '#E4D9C6', flexShrink: 0 }} />
        <SlotPanel
          mode="online"
          slots={online[activeDow] ?? []}
          onChange={slots => setDayOnline(activeDow, slots)}
        />
      </div>

      <div className="adm-settings-actions">
        <button className="adm-btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar horarios'}
        </button>
        {msg && <span className="adm-msg-ok">✓ {msg}</span>}
        {err && <span className="adm-error" style={{ display: 'inline' }}>{err}</span>}
      </div>
    </div>
  )
}
