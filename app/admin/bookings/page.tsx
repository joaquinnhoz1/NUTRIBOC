import { prisma } from '@/lib/db'
import { BookingActions } from '@/components/admin/BookingActions'

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

function fmtDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-')
  return `${d} ${MONTHS[parseInt(m) - 1]} ${y}`
}

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmada',
  pending_transfer: 'Esperando comprobante',
  pending_mp: 'MP pendiente',
  cancelled: 'Cancelada',
  pending: 'Pendiente',
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; mode?: string; date?: string }>
}) {
  const params = await searchParams
  const where: Record<string, unknown> = {}
  if (params.status) where.status = params.status
  if (params.mode) where.mode = params.mode
  if (params.date) where.date = params.date

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: [{ date: 'asc' }, { slot: 'asc' }],
  })

  return (
    <>
      <div className="adm-page-header">
        <h1>Reservas</h1>
        <p>{bookings.length} resultado{bookings.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Filters */}
      <form className="adm-filters" method="GET">
        <div className="adm-filter-group">
          <label>Estado</label>
          <select name="status" defaultValue={params.status || ''} className="adm-input adm-select" style={{ width: 200 }}>
            <option value="">Todos</option>
            <option value="confirmed">Confirmadas</option>
            <option value="pending_transfer">Esperando comprobante</option>
            <option value="pending_mp">MP pendiente</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>
        <div className="adm-filter-group">
          <label>Modalidad</label>
          <select name="mode" defaultValue={params.mode || ''} className="adm-input adm-select" style={{ width: 160 }}>
            <option value="">Todas</option>
            <option value="presencial">Presencial</option>
            <option value="online">Online</option>
          </select>
        </div>
        <div className="adm-filter-group">
          <label>Fecha</label>
          <input type="date" name="date" defaultValue={params.date || ''} className="adm-input" style={{ width: 170 }} />
        </div>
        <button type="submit" className="adm-btn-primary">Filtrar</button>
        <a href="/admin/bookings" className="adm-btn-ghost">Limpiar</a>
      </form>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Fecha</th>
              <th>Horario</th>
              <th>Modalidad</th>
              <th>Pago</th>
              <th>Estado</th>
              <th>Monto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 && (
              <tr><td colSpan={8} className="adm-empty">Sin reservas</td></tr>
            )}
            {bookings.map(b => (
              <tr key={b.id}>
                <td>
                  <strong style={{ display: 'block', fontSize: 14.5 }}>{b.name}</strong>
                  <span style={{ fontSize: 12.5, color: '#5C584B' }}>{b.email}</span>
                  <span style={{ fontSize: 12.5, color: '#5C584B', display: 'block' }}>{b.phone}</span>
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(b.date)}</td>
                <td style={{ fontWeight: 600 }}>{b.slot}hs</td>
                <td>{b.mode === 'presencial' ? '🏥 Presencial' : '💻 Online'}</td>
                <td>{b.paymentType === 'transfer' ? '🏦 Transferencia' : '💳 Mercado Pago'}</td>
                <td><span className={`badge badge-${b.status}`}>{STATUS_LABELS[b.status] || b.status}</span></td>
                <td>{b.amount ? `$${b.amount.toLocaleString('es-AR')}` : '—'}</td>
                <td>
                  <BookingActions booking={{ id: b.id, status: b.status, phone: b.phone, name: b.name, date: b.date, slot: b.slot, mode: b.mode }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
