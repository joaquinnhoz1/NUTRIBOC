import { prisma } from '@/lib/db'

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

function fmtDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-')
  return `${d} ${MONTHS[parseInt(m) - 1]} ${y}`
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    confirmed: 'Confirmada',
    pending_transfer: 'Esperando comprobante',
    pending_mp: 'MP pendiente',
    cancelled: 'Cancelada',
    pending: 'Pendiente',
  }
  return map[s] || s
}

export default async function AdminDashboard() {
  const today = new Date().toISOString().split('T')[0]
  const in7 = new Date(); in7.setDate(in7.getDate() + 7)
  const weekDate = in7.toISOString().split('T')[0]

  const [statusCounts, upcoming, revenue] = await Promise.all([
    prisma.booking.groupBy({ by: ['status'], _count: true }),
    prisma.booking.findMany({
      where: { date: { gte: today, lte: weekDate }, status: { not: 'cancelled' } },
      orderBy: [{ date: 'asc' }, { slot: 'asc' }],
      take: 15,
    }),
    prisma.booking.aggregate({ where: { status: 'confirmed' }, _sum: { amount: true } }),
  ])

  const countByStatus = Object.fromEntries(statusCounts.map(r => [r.status, r._count]))
  const total = statusCounts.reduce((s, r) => s + r._count, 0)
  const confirmed = countByStatus['confirmed'] ?? 0
  const pendingTransfer = countByStatus['pending_transfer'] ?? 0
  const pendingMp = countByStatus['pending_mp'] ?? 0
  const cancelled = countByStatus['cancelled'] ?? 0

  const todayBookings = upcoming.filter(b => b.date === today)

  return (
    <>
      <div className="adm-page-header">
        <h1>Dashboard</h1>
        <p>Bienvenida, Brenda 👋 — {fmtDate(today)}</p>
      </div>

      <div className="adm-stats">
        <div className="adm-stat">
          <div className="adm-stat-label">Total reservas</div>
          <div className="adm-stat-value">{total}</div>
        </div>
        <div className="adm-stat green">
          <div className="adm-stat-label">Confirmadas</div>
          <div className="adm-stat-value">{confirmed}</div>
        </div>
        <div className="adm-stat orange">
          <div className="adm-stat-label">Esperando comprobante</div>
          <div className="adm-stat-value">{pendingTransfer}</div>
          <div className="adm-stat-sub">Transferencia pendiente</div>
        </div>
        <div className="adm-stat blue">
          <div className="adm-stat-label">MP pendiente</div>
          <div className="adm-stat-value">{pendingMp}</div>
        </div>
        <div className="adm-stat red">
          <div className="adm-stat-label">Canceladas</div>
          <div className="adm-stat-value">{cancelled}</div>
        </div>
        <div className="adm-stat green">
          <div className="adm-stat-label">Recaudado</div>
          <div className="adm-stat-value" style={{ fontSize: 24 }}>
            ${(revenue._sum.amount ?? 0).toLocaleString('es-AR')}
          </div>
          <div className="adm-stat-sub">Solo confirmadas</div>
        </div>
      </div>

      {todayBookings.length > 0 && (
        <div className="adm-card">
          <h2>📅 Turnos de hoy ({todayBookings.length})</h2>
          <div className="adm-upcoming">
            {todayBookings.map(b => (
              <div key={b.id} className={`adm-upcoming-item ${b.paymentType}`}>
                <div className="adm-upcoming-date">{b.slot}hs</div>
                <div className="adm-upcoming-info">
                  <div className="adm-upcoming-name">{b.name}</div>
                  <div className="adm-upcoming-detail">
                    {b.mode === 'presencial' ? 'Presencial' : 'Online'} · {b.email} · {b.phone}
                  </div>
                </div>
                <span className={`badge badge-${b.status}`}>{statusLabel(b.status)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="adm-card">
        <h2>📆 Próximos 7 días</h2>
        {upcoming.length === 0 ? (
          <p className="adm-empty">Sin turnos en los próximos 7 días</p>
        ) : (
          <div className="adm-upcoming">
            {upcoming.map(b => (
              <div key={b.id} className={`adm-upcoming-item ${b.paymentType}`}>
                <div className="adm-upcoming-date">{fmtDate(b.date)}</div>
                <div className="adm-upcoming-info">
                  <div className="adm-upcoming-name">{b.name} — {b.slot}hs</div>
                  <div className="adm-upcoming-detail">
                    {b.mode === 'presencial' ? 'Presencial' : 'Online'} · {b.paymentType === 'transfer' ? 'Transferencia' : 'MP'}
                  </div>
                </div>
                <span className={`badge badge-${b.status}`}>{statusLabel(b.status)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
