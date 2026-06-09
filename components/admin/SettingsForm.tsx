'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  settings: Record<string, string>
}

export function SettingsForm({ settings }: Props) {
  const router = useRouter()

  // Contact settings
  const [waNumber, setWaNumber] = useState(settings.whatsapp_number || '')
  const [waComprobante, setWaComprobante] = useState(settings.whatsapp_comprobante || '')
  const [businessHours, setBusinessHours] = useState(settings.business_hours || 'Lun a Sáb · 09 a 20 hs')
  const [businessHoursDetail, setBusinessHoursDetail] = useState(settings.business_hours_detail || 'Online y presencial')

  // Bank transfer settings
  const [cbu, setCbu] = useState(settings.transfer_cbu || '')
  const [alias, setAlias] = useState(settings.transfer_alias || '')
  const [titular, setTitular] = useState(settings.transfer_titular || '')
  const [banco, setBanco] = useState(settings.transfer_banco || '')
  const [fee, setFee] = useState(settings.consultation_fee || '5000')
  const [feeMp, setFeeMp] = useState(settings.consultation_fee_mp || settings.consultation_fee || '5000')

  // Agenda
  const [minDaysAhead, setMinDaysAhead] = useState(settings.min_days_ahead || '1')
  const [holdMinutes, setHoldMinutes] = useState(settings.booking_hold_minutes || '30')
  const [savingAgenda, setSavingAgenda] = useState(false)
  const [msgAgenda, setMsgAgenda] = useState('')
  const [errAgenda, setErrAgenda] = useState('')

  // Mercado Pago
  const [mpLink, setMpLink] = useState(settings.mp_link || '')
  const [savingMp, setSavingMp] = useState(false)
  const [msgMp, setMsgMp] = useState('')
  const [errMp, setErrMp] = useState('')

  // Stats
  const [statExp, setStatExp] = useState(settings.stat_experience || '10')
  const [statPat, setStatPat] = useState(settings.stat_patients || '800')
  const [savingStats, setSavingStats] = useState(false)
  const [msgStats, setMsgStats] = useState('')
  const [errStats, setErrStats] = useState('')

  // Password change
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')

  const [savingContact, setSavingContact] = useState(false)
  const [savingBank, setSavingBank] = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)
  const [msgContact, setMsgContact] = useState('')
  const [msgBank, setMsgBank] = useState('')
  const [msgPwd, setMsgPwd] = useState('')
  const [errContact, setErrContact] = useState('')
  const [errBank, setErrBank] = useState('')
  const [errPwd, setErrPwd] = useState('')

  async function saveContact(e: React.FormEvent) {
    e.preventDefault()
    setSavingContact(true); setMsgContact(''); setErrContact('')
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        whatsapp_number: waNumber,
        whatsapp_comprobante: waComprobante,
        business_hours: businessHours,
        business_hours_detail: businessHoursDetail,
      }),
    })
    setSavingContact(false)
    if (res.ok) { setMsgContact('Guardado correctamente'); router.refresh() }
    else setErrContact('Error al guardar')
  }

  async function saveBank(e: React.FormEvent) {
    e.preventDefault()
    setSavingBank(true); setMsgBank(''); setErrBank('')
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transfer_cbu: cbu,
        transfer_alias: alias,
        transfer_titular: titular,
        transfer_banco: banco,
        consultation_fee: fee,
        consultation_fee_mp: feeMp,
      }),
    })
    setSavingBank(false)
    if (res.ok) { setMsgBank('Guardado correctamente'); router.refresh() }
    else setErrBank('Error al guardar')
  }

  async function saveAgenda(e: React.FormEvent) {
    e.preventDefault()
    setSavingAgenda(true); setMsgAgenda(''); setErrAgenda('')
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ min_days_ahead: minDaysAhead, booking_hold_minutes: holdMinutes }),
    })
    setSavingAgenda(false)
    if (res.ok) { setMsgAgenda('Guardado correctamente'); router.refresh() }
    else setErrAgenda('Error al guardar')
  }

  async function saveMp(e: React.FormEvent) {
    e.preventDefault()
    setSavingMp(true); setMsgMp(''); setErrMp('')
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mp_link: mpLink }),
    })
    setSavingMp(false)
    if (res.ok) { setMsgMp('Guardado correctamente'); router.refresh() }
    else setErrMp('Error al guardar')
  }

  async function saveStats(e: React.FormEvent) {
    e.preventDefault()
    setSavingStats(true); setMsgStats(''); setErrStats('')
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stat_experience: statExp, stat_patients: statPat }),
    })
    setSavingStats(false)
    if (res.ok) { setMsgStats('Guardado correctamente'); router.refresh() }
    else setErrStats('Error al guardar')
  }

  async function savePwd(e: React.FormEvent) {
    e.preventDefault()
    setErrPwd('')
    if (newPwd !== confirmPwd) { setErrPwd('Las contraseñas nuevas no coinciden'); return }
    if (newPwd.length < 6) { setErrPwd('La contraseña debe tener al menos 6 caracteres'); return }
    setSavingPwd(true)
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _changePassword: true, currentPassword: currentPwd, newPassword: newPwd }),
    })
    setSavingPwd(false)
    if (res.ok) {
      setMsgPwd('Contraseña actualizada')
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('')
    } else {
      const data = await res.json()
      setErrPwd(data.error || 'Error al cambiar contraseña')
    }
  }

  function formatWA(raw: string) {
    const digits = raw.replace(/\D/g, '')
    return digits.startsWith('54') ? digits : `54${digits}`
  }

  return (
    <div>
      {/* ── Contact ── */}
      <div className="adm-card">
        <h2>📱 Contacto del sitio</h2>
        <p style={{ fontSize: 13.5, color: '#5C584B', marginBottom: 22 }}>
          Números de WhatsApp y horario de atención que aparecen en la sección Contacto.
        </p>
        <form onSubmit={saveContact}>
          <div className="adm-settings-grid">
            <div className="adm-filter-group">
              <label>WhatsApp del sitio (contacto público)</label>
              <input
                value={waNumber}
                onChange={e => setWaNumber(e.target.value)}
                placeholder="Ej: 542314541335"
                className="adm-input"
              />
              <span style={{ fontSize: 12, color: '#8a8780' }}>
                Link generado: wa.me/{formatWA(waNumber)}
              </span>
            </div>
            <div className="adm-filter-group">
              <label>WhatsApp para recibir comprobantes</label>
              <input
                value={waComprobante}
                onChange={e => setWaComprobante(e.target.value)}
                placeholder="Ej: 542314541335"
                className="adm-input"
              />
              <span style={{ fontSize: 12, color: '#8a8780' }}>
                A este número llegan los comprobantes de transferencia.
              </span>
            </div>
            <div className="adm-filter-group">
              <label>Horario de atención</label>
              <input
                value={businessHours}
                onChange={e => setBusinessHours(e.target.value)}
                placeholder="Lun a Sáb · 09 a 20 hs"
                className="adm-input"
              />
              <span style={{ fontSize: 12, color: '#8a8780' }}>
                Primera línea del horario en la sección Contacto.
              </span>
            </div>
            <div className="adm-filter-group">
              <label>Detalle del horario</label>
              <input
                value={businessHoursDetail}
                onChange={e => setBusinessHoursDetail(e.target.value)}
                placeholder="Online y presencial"
                className="adm-input"
              />
              <span style={{ fontSize: 12, color: '#8a8780' }}>
                Segunda línea debajo del horario.
              </span>
            </div>
          </div>
          <div className="adm-settings-actions">
            <button type="submit" className="adm-btn-primary" disabled={savingContact}>
              {savingContact ? 'Guardando…' : 'Guardar contacto'}
            </button>
            {msgContact && <span className="adm-msg-ok">✓ {msgContact}</span>}
            {errContact && <span className="adm-error" style={{ display: 'inline' }}>{errContact}</span>}
          </div>
        </form>
      </div>

      {/* ── Bank transfer ── */}
      <div className="adm-card">
        <h2>🏦 Datos bancarios y precio</h2>
        <p style={{ fontSize: 13.5, color: '#5C584B', marginBottom: 22 }}>
          Estos datos se muestran en el paso de transferencia al paciente.
        </p>
        <form onSubmit={saveBank}>
          <div className="adm-settings-grid">
            <div className="adm-filter-group">
              <label>CBU</label>
              <input value={cbu} onChange={e => setCbu(e.target.value)} placeholder="22 dígitos" className="adm-input" />
            </div>
            <div className="adm-filter-group">
              <label>Alias</label>
              <input value={alias} onChange={e => setAlias(e.target.value)} placeholder="mi.alias.banco" className="adm-input" />
            </div>
            <div className="adm-filter-group">
              <label>Titular de la cuenta</label>
              <input value={titular} onChange={e => setTitular(e.target.value)} placeholder="Nombre completo" className="adm-input" />
            </div>
            <div className="adm-filter-group">
              <label>Banco</label>
              <input value={banco} onChange={e => setBanco(e.target.value)} placeholder="Banco Nación / Galicia…" className="adm-input" />
            </div>
            <div className="adm-filter-group">
              <label>Precio — Transferencia ($)</label>
              <input
                type="number"
                value={fee}
                onChange={e => setFee(e.target.value)}
                placeholder="5000"
                className="adm-input"
                min="0"
              />
            </div>
            <div className="adm-filter-group">
              <label>Precio — Mercado Pago ($)</label>
              <input
                type="number"
                value={feeMp}
                onChange={e => setFeeMp(e.target.value)}
                placeholder="5000"
                className="adm-input"
                min="0"
              />
            </div>
          </div>
          <div className="adm-settings-actions">
            <button type="submit" className="adm-btn-primary" disabled={savingBank}>
              {savingBank ? 'Guardando…' : 'Guardar datos bancarios'}
            </button>
            {msgBank && <span className="adm-msg-ok">✓ {msgBank}</span>}
            {errBank && <span className="adm-error" style={{ display: 'inline' }}>{errBank}</span>}
          </div>
        </form>
      </div>

      {/* ── Agenda ── */}
      <div className="adm-card">
        <h2>📅 Agenda</h2>
        <p style={{ fontSize: 13.5, color: '#5C584B', marginBottom: 22 }}>
          Configurá los tiempos de anticipación y vencimiento de reservas.
        </p>
        <form onSubmit={saveAgenda}>
          <div className="adm-settings-grid">
            <div className="adm-filter-group">
              <label>Días mínimos de anticipación</label>
              <input
                type="number"
                value={minDaysAhead}
                onChange={e => setMinDaysAhead(e.target.value)}
                min="0"
                max="30"
                className="adm-input"
              />
              <span style={{ fontSize: 12, color: '#8a8780' }}>
                {minDaysAhead === '0' ? 'El paciente puede reservar para hoy mismo.' :
                 minDaysAhead === '1' ? 'El paciente puede reservar a partir de mañana.' :
                 `El paciente puede reservar con ${minDaysAhead} días de anticipación mínima.`}
              </span>
            </div>
            <div className="adm-filter-group">
              <label>Vencimiento de reservas pendientes (minutos)</label>
              <input
                type="number"
                value={holdMinutes}
                onChange={e => setHoldMinutes(e.target.value)}
                min="5"
                max="1440"
                className="adm-input"
              />
              <span style={{ fontSize: 12, color: '#8a8780' }}>
                {holdMinutes === '30' ? 'El turno se libera a los 30 minutos si no se confirma el pago.' :
                 `El turno se libera a los ${holdMinutes} minutos si no se confirma el pago.`}
              </span>
            </div>
          </div>
          <div className="adm-settings-actions" style={{ marginTop: 16 }}>
            <button type="submit" className="adm-btn-primary" disabled={savingAgenda}>
              {savingAgenda ? 'Guardando…' : 'Guardar'}
            </button>
            {msgAgenda && <span className="adm-msg-ok">✓ {msgAgenda}</span>}
            {errAgenda && <span className="adm-error" style={{ display: 'inline' }}>{errAgenda}</span>}
          </div>
        </form>
      </div>

      {/* ── Mercado Pago ── */}
      <div className="adm-card">
        <h2>💳 Mercado Pago</h2>
        <p style={{ fontSize: 13.5, color: '#5C584B', marginBottom: 22 }}>
          Link de pago de Mercado Pago. Si está configurado, los pacientes serán redirigidos a este link al elegir ese medio de pago.
        </p>
        <form onSubmit={saveMp}>
          <div className="adm-filter-group" style={{ maxWidth: 520 }}>
            <label>Link de pago de Mercado Pago</label>
            <input
              value={mpLink}
              onChange={e => setMpLink(e.target.value)}
              placeholder="https://mpago.la/..."
              className="adm-input"
            />
            <span style={{ fontSize: 12, color: '#8a8780' }}>
              Generá el link desde tu cuenta de Mercado Pago → Cobrar → Link de pago.
            </span>
          </div>
          <div className="adm-settings-actions">
            <button type="submit" className="adm-btn-primary" disabled={savingMp}>
              {savingMp ? 'Guardando…' : 'Guardar link'}
            </button>
            {msgMp && <span className="adm-msg-ok">✓ {msgMp}</span>}
            {errMp && <span className="adm-error" style={{ display: 'inline' }}>{errMp}</span>}
          </div>
        </form>
      </div>

      {/* ── Stats ── */}
      <div className="adm-card">
        <h2>📊 Estadísticas del Hero</h2>
        <p style={{ fontSize: 13.5, color: '#5C584B', marginBottom: 22 }}>
          Números que aparecen en la página principal debajo de los botones.
        </p>
        <form onSubmit={saveStats}>
          <div className="adm-settings-grid">
            <div className="adm-filter-group">
              <label>Años de experiencia</label>
              <input
                type="number"
                value={statExp}
                onChange={e => setStatExp(e.target.value)}
                min="0"
                className="adm-input"
              />
              <span style={{ fontSize: 12, color: '#8a8780' }}>
                Se muestra como &quot;+{statExp} años de experiencia&quot;.
              </span>
            </div>
            <div className="adm-filter-group">
              <label>Pacientes acompañados</label>
              <input
                type="number"
                value={statPat}
                onChange={e => setStatPat(e.target.value)}
                min="0"
                className="adm-input"
              />
              <span style={{ fontSize: 12, color: '#8a8780' }}>
                Se muestra como &quot;+{statPat} pacientes acompañados&quot;.
              </span>
            </div>
          </div>
          <div className="adm-settings-actions" style={{ marginTop: 16 }}>
            <button type="submit" className="adm-btn-primary" disabled={savingStats}>
              {savingStats ? 'Guardando…' : 'Guardar estadísticas'}
            </button>
            {msgStats && <span className="adm-msg-ok">✓ {msgStats}</span>}
            {errStats && <span className="adm-error" style={{ display: 'inline' }}>{errStats}</span>}
          </div>
        </form>
      </div>

      {/* ── Password ── */}
      <div className="adm-card">
        <h2>🔒 Cambiar contraseña</h2>
        <form onSubmit={savePwd}>
          <div className="adm-settings-grid" style={{ maxWidth: 420 }}>
            <div className="adm-filter-group">
              <label>Contraseña actual</label>
              <input
                type="password"
                value={currentPwd}
                onChange={e => setCurrentPwd(e.target.value)}
                className="adm-input"
                autoComplete="current-password"
              />
            </div>
            <div className="adm-filter-group">
              <label>Nueva contraseña</label>
              <input
                type="password"
                value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
                className="adm-input"
                autoComplete="new-password"
              />
            </div>
            <div className="adm-filter-group">
              <label>Repetir nueva contraseña</label>
              <input
                type="password"
                value={confirmPwd}
                onChange={e => setConfirmPwd(e.target.value)}
                className="adm-input"
                autoComplete="new-password"
              />
            </div>
          </div>
          {errPwd && <p className="adm-error" style={{ marginBottom: 12 }}>{errPwd}</p>}
          <div className="adm-settings-actions">
            <button type="submit" className="adm-btn-primary" disabled={savingPwd}>
              {savingPwd ? 'Cambiando…' : 'Cambiar contraseña'}
            </button>
            {msgPwd && <span className="adm-msg-ok">✓ {msgPwd}</span>}
          </div>
        </form>
      </div>
    </div>
  )
}
