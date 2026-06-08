'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DOW = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']

type Mode = 'presencial' | 'online'
type Step = 'select' | 'form' | 'payment' | 'transfer-sent' | 'success'

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function toYMD(d: Date) {
  return d.toISOString().split('T')[0]
}

interface SiteSettings {
  whatsapp_comprobante: string
  transfer_cbu: string
  transfer_alias: string
  transfer_titular: string
  transfer_banco: string
  consultation_fee: string
  consultation_fee_mp: string
  mp_link: string
}

const DEFAULT_SETTINGS: SiteSettings = {
  whatsapp_comprobante: '542314541335',
  transfer_cbu: '',
  transfer_alias: '',
  transfer_titular: 'Brenda Coloccini',
  transfer_banco: '',
  consultation_fee: '5000',
  consultation_fee_mp: '5000',
  mp_link: '',
}

export function BookingCalendar() {
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d }, [])
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => setSettings(s => ({ ...s, ...data })))
      .catch(() => {})
  }, [])

  // Step 1 state
  const [mode, setMode] = useState<Mode>('presencial')
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [dayBlocked, setDayBlocked] = useState(false)

  // Step 2 state
  const [step, setStep] = useState<Step>('select')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [formError, setFormError] = useState('')

  // Step 3 state
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [payError, setPayError] = useState('')
  const [loadingPay, setLoadingPay] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const fetchSlots = useCallback(async (date: Date, m: Mode) => {
    setLoadingSlots(true)
    setDayBlocked(false)
    setAvailableSlots([])
    try {
      const res = await fetch(`/api/availability?date=${toYMD(date)}&mode=${m}`)
      const data = await res.json()
      if (data.blockedDay) { setDayBlocked(true); setAvailableSlots([]) }
      else setAvailableSlots(data.slots || [])
    } catch { setAvailableSlots([]) }
    finally { setLoadingSlots(false) }
  }, [])

  useEffect(() => {
    if (selectedDate) fetchSlots(selectedDate, mode)
  }, [selectedDate, mode, fetchSlots])

  function handleModeChange(newMode: Mode) {
    setMode(newMode)
    setSelectedSlot(null)
    if (selectedDate) fetchSlots(selectedDate, newMode)
  }

  function handleNavMonth(delta: number) {
    setView(prev => {
      const next = new Date(prev.getFullYear(), prev.getMonth() + delta, 1)
      const min = new Date(today.getFullYear(), today.getMonth(), 1)
      return next < min ? min : next
    })
  }

  function handleDayClick(day: number) {
    const date = new Date(view.getFullYear(), view.getMonth(), day)
    setSelectedDate(date)
    setSelectedSlot(null)
  }

  const calDays = useMemo(() => {
    const first = new Date(view.getFullYear(), view.getMonth(), 1)
    const startDow = (first.getDay() + 6) % 7
    const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate()
    const cells: Array<{ day: number | null; disabled: boolean; selected: boolean }> = []
    for (let i = 0; i < startDow; i++) cells.push({ day: null, disabled: false, selected: false })
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(view.getFullYear(), view.getMonth(), d)
      const isSunday = date.getDay() === 0
      const isPast = date < today
      cells.push({ day: d, disabled: isPast || isSunday, selected: selectedDate ? sameDay(date, selectedDate) : false })
    }
    return cells
  }, [view, today, selectedDate])

  function handleContinue() {
    if (!selectedDate || !selectedSlot) return
    setStep('form')
  }

  async function handleFormSubmit(paymentType: 'transfer' | 'mercadopago') {
    setFormError('')
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setFormError('Completá todos los campos')
      return
    }
    setLoadingPay(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(), email: email.trim(), phone: phone.trim(),
          mode, date: toYMD(selectedDate!), slot: selectedSlot, paymentType,
        }),
      })
      if (res.status === 409) { setFormError('El turno ya fue reservado. Elegí otro.'); setStep('select'); return }
      if (!res.ok) { setFormError('Error al reservar. Intentá de nuevo.'); return }
      const booking = await res.json()
      setBookingId(booking.id)

      if (paymentType === 'transfer') {
        setStep('payment')
      } else {
        // Mercado Pago: usar link fijo si está configurado, sino crear preferencia con el SDK
        if (settings.mp_link) {
          window.location.href = settings.mp_link
        } else {
          const mpRes = await fetch('/api/mp/preference', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId: booking.id }),
          })
          const mp = await mpRes.json()
          if (!mpRes.ok) { setPayError(mp.error || 'Error al conectar con Mercado Pago'); setStep('payment'); return }
          window.location.href = mp.initPoint
        }
      }
    } catch { setFormError('Error de conexión. Intentá de nuevo.') }
    finally { setLoadingPay(false) }
  }

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => { setCopied(key); setTimeout(() => setCopied(null), 2000) })
  }

  function buildWAMessage() {
    const dateStr = selectedDate ? `${selectedDate.getDate()} de ${MONTHS[selectedDate.getMonth()]}` : ''
    const msg = `Hola Brenda! 👋 Te envío el comprobante de transferencia para mi turno:\n\n📅 Fecha: ${dateStr}\n⏰ Horario: ${selectedSlot}hs\n🏥 Modalidad: ${mode === 'presencial' ? 'Presencial' : 'Online'}\n👤 Nombre: ${name}\n\n[Adjuntar comprobante 📎]`
    const wa = settings.whatsapp_comprobante.replace(/\D/g, '')
    return `https://wa.me/${wa}?text=${encodeURIComponent(msg)}`
  }

  const modeLabel = mode === 'online' ? 'Consulta online' : 'Consulta presencial'
  const dateLabel = selectedDate ? `${selectedDate.getDate()} de ${MONTHS[selectedDate.getMonth()]}` : ''

  // ── Step: TRANSFER PAYMENT ──
  if (step === 'payment' && bookingId) {
    return (
      <div className="bk">
        <div className="bk-payment-header">
          <button className="bk-back" onClick={() => { setStep('form'); setPayError('') }}>← Volver</button>
          <div className="bk-booking-summary">
            <strong>{modeLabel}</strong> · {dateLabel} · {selectedSlot}hs
          </div>
        </div>
        <h3 className="bk-pay-title">Datos para transferir</h3>
        <p className="bk-pay-amount">Monto: <strong>$ {parseInt(settings.consultation_fee).toLocaleString('es-AR')}</strong></p>
        <div className="bk-bank-data">
          {settings.transfer_cbu && (
            <div className="bk-bank-row">
              <span className="bk-bank-label">CBU</span>
              <span className="bk-bank-value">{settings.transfer_cbu}</span>
              <button className="bk-copy" onClick={() => copyToClipboard(settings.transfer_cbu, 'cbu')}>
                {copied === 'cbu' ? '✓' : 'Copiar'}
              </button>
            </div>
          )}
          {settings.transfer_alias && (
            <div className="bk-bank-row">
              <span className="bk-bank-label">Alias</span>
              <span className="bk-bank-value">{settings.transfer_alias}</span>
              <button className="bk-copy" onClick={() => copyToClipboard(settings.transfer_alias, 'alias')}>
                {copied === 'alias' ? '✓' : 'Copiar'}
              </button>
            </div>
          )}
          {settings.transfer_titular && (
            <div className="bk-bank-row">
              <span className="bk-bank-label">Titular</span>
              <span className="bk-bank-value">{settings.transfer_titular}</span>
            </div>
          )}
          {settings.transfer_banco && (
            <div className="bk-bank-row">
              <span className="bk-bank-label">Banco</span>
              <span className="bk-bank-value">{settings.transfer_banco}</span>
            </div>
          )}
        </div>
        <p className="bk-pay-note">
          Una vez realizada la transferencia, enviá el comprobante por WhatsApp y tu turno será confirmado.
        </p>
        <a href={buildWAMessage()} target="_blank" rel="noopener noreferrer" className="bk-wa-btn"
          onClick={() => setTimeout(() => setStep('transfer-sent'), 1000)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.512 5.26l-.999 3.648 3.476-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.078 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
          Enviar comprobante por WhatsApp
        </a>
        {payError && <p className="bk-error">{payError}</p>}
      </div>
    )
  }

  // ── Step: TRANSFER SENT CONFIRMATION ──
  if (step === 'transfer-sent') {
    return (
      <div className="bk bk-success">
        <div className="bk-success-icon">✓</div>
        <h3>¡Turno reservado!</h3>
        <p><strong>{modeLabel}</strong><br />{dateLabel} · {selectedSlot}hs</p>
        <p className="bk-success-note">Brenda va a confirmar tu turno cuando reciba el comprobante. ¡Nos vemos pronto!</p>
      </div>
    )
  }

  // ── Step: PERSONAL FORM + PAYMENT SELECTION ──
  if (step === 'form') {
    return (
      <div className="bk">
        <div className="bk-payment-header">
          <button className="bk-back" onClick={() => setStep('select')}>← Volver</button>
          <div className="bk-booking-summary">
            <strong>{modeLabel}</strong> · {dateLabel} · {selectedSlot}hs
          </div>
        </div>
        <div className="bk-form">
          <div className="bk-form-group">
            <label>Nombre completo</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre" className="bk-input" />
          </div>
          <div className="bk-form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" className="bk-input" />
          </div>
          <div className="bk-form-group">
            <label>WhatsApp / Teléfono</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Ej: 2314 123456" className="bk-input" />
          </div>
          {formError && <p className="bk-error">{formError}</p>}
        </div>
        <div className="bk-pay-options">
          <p className="bk-pay-options-label">¿Cómo querés pagar?</p>
          <div className="bk-pay-btns">
            <button className="bk-pay-btn bk-pay-transfer" onClick={() => handleFormSubmit('transfer')} disabled={loadingPay}>
              <span>{loadingPay ? 'Un momento…' : '🏦 Transferencia bancaria'}</span>
              <span className="bk-pay-btn-price">$ {parseInt(settings.consultation_fee).toLocaleString('es-AR')}</span>
            </button>
            <button className="bk-pay-btn bk-pay-mp" onClick={() => handleFormSubmit('mercadopago')} disabled={loadingPay}>
              <span>{loadingPay ? 'Un momento…' : '💳 Mercado Pago'}</span>
              <span className="bk-pay-btn-price">$ {parseInt(settings.consultation_fee_mp || settings.consultation_fee).toLocaleString('es-AR')}</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Step: CALENDAR + SLOT SELECT ──
  return (
    <div className="bk">
      <div className="bk-modes" role="tablist">
        {(['presencial', 'online'] as Mode[]).map(m => (
          <button key={m} className={`bk-mode${mode === m ? ' is-active' : ''}`}
            onClick={() => handleModeChange(m)} role="tab" aria-selected={mode === m}>
            {m === 'presencial' ? 'Presencial' : 'Online'}
          </button>
        ))}
      </div>
      <div className="bk-grid">
        <div className="bk-cal">
          <div className="bk-cal-head">
            <button className="bk-nav" onClick={() => handleNavMonth(-1)} aria-label="Mes anterior">&#8249;</button>
            <span className="bk-month">{MONTHS[view.getMonth()]} {view.getFullYear()}</span>
            <button className="bk-nav" onClick={() => handleNavMonth(1)} aria-label="Mes siguiente">&#8250;</button>
          </div>
          <div className="bk-dow">{DOW.map(d => <span key={d}>{d}</span>)}</div>
          <div className="bk-days">
            {calDays.map((cell, i) =>
              cell.day === null ? <span key={i} className="bk-day is-empty" /> : (
                <button key={i}
                  className={`bk-day${cell.disabled ? ' is-disabled' : ''}${cell.selected ? ' is-selected' : ''}`}
                  disabled={cell.disabled} onClick={() => handleDayClick(cell.day!)}>
                  {cell.day}
                </button>
              )
            )}
          </div>
        </div>
        <div className="bk-side">
          <div className="bk-side-label">Horarios disponibles</div>
          <div className="bk-slots">
            {!selectedDate ? (
              <p className="bk-hint">Elegí un día en el calendario.</p>
            ) : loadingSlots ? (
              <p className="bk-hint">Cargando horarios…</p>
            ) : dayBlocked ? (
              <p className="bk-hint">Este día no hay turnos disponibles.</p>
            ) : availableSlots.length === 0 ? (
              <p className="bk-hint">No quedan turnos para este día.</p>
            ) : (
              availableSlots.map(slot => (
                <button key={slot} className={`bk-slot${selectedSlot === slot ? ' is-selected' : ''}`}
                  onClick={() => setSelectedSlot(slot)}>{slot}</button>
              ))
            )}
          </div>
        </div>
      </div>
      {selectedDate && selectedSlot && (
        <div className="bk-summary">
          <div className="bk-summary-text">
            <strong>{modeLabel}</strong> · {dateLabel} · {selectedSlot} hs
          </div>
          <button className="bk-confirm" onClick={handleContinue}>Continuar →</button>
        </div>
      )}
    </div>
  )
}
