import { Resend } from 'resend'

const NOTIFY_TO = 'nutribcg@gmail.com'

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

function fmtDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-')
  return `${d} ${MONTHS[parseInt(m) - 1]} ${y}`
}

interface BookingData {
  name: string
  email: string
  phone: string
  mode: string
  date: string
  slot: string
  paymentType: string
  amount: number
}

export async function sendBookingNotification(booking: BookingData) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY not set — skipping notification')
    return
  }

  const resend = new Resend(apiKey)

  const modeLabel = booking.mode === 'presencial' ? 'Presencial' : 'Online'
  const payLabel  = booking.paymentType === 'transfer' ? 'Transferencia bancaria' : 'Mercado Pago'

  await resend.emails.send({
    from:    'Nutri.bcg <onboarding@resend.dev>',
    to:      NOTIFY_TO,
    subject: `Nueva reserva — ${booking.name} · ${fmtDate(booking.date)} ${booking.slot}hs`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#FAF6EF;border-radius:16px">
        <h2 style="color:#2C2A22;font-size:22px;margin-bottom:4px">Nueva reserva recibida</h2>
        <p style="color:#6E7B52;font-size:14px;margin-bottom:28px">${fmtDate(booking.date)} · ${booking.slot}hs · ${modeLabel}</p>

        <table style="width:100%;border-collapse:collapse;font-size:15px">
          <tr>
            <td style="padding:10px 0;color:#5C584B;border-bottom:1px solid #e8e4da;width:40%">Paciente</td>
            <td style="padding:10px 0;color:#2C2A22;border-bottom:1px solid #e8e4da;font-weight:600">${booking.name}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#5C584B;border-bottom:1px solid #e8e4da">Email</td>
            <td style="padding:10px 0;color:#2C2A22;border-bottom:1px solid #e8e4da">${booking.email}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#5C584B;border-bottom:1px solid #e8e4da">Teléfono</td>
            <td style="padding:10px 0;color:#2C2A22;border-bottom:1px solid #e8e4da">${booking.phone}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#5C584B;border-bottom:1px solid #e8e4da">Modalidad</td>
            <td style="padding:10px 0;color:#2C2A22;border-bottom:1px solid #e8e4da">${modeLabel}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#5C584B;border-bottom:1px solid #e8e4da">Pago</td>
            <td style="padding:10px 0;color:#2C2A22;border-bottom:1px solid #e8e4da">${payLabel}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#5C584B">Monto</td>
            <td style="padding:10px 0;color:#2C2A22;font-weight:600">$${booking.amount.toLocaleString('es-AR')}</td>
          </tr>
        </table>

        <div style="margin-top:28px;padding:16px;background:#fff;border-radius:10px;border:1px solid #e8e4da">
          <p style="margin:0;color:#5C584B;font-size:13px">
            ${booking.paymentType === 'transfer'
              ? '⏳ El paciente debe enviar el comprobante de transferencia por WhatsApp. Confirmá la reserva desde el panel admin una vez que lo recibas.'
              : '💳 El paciente eligió Mercado Pago. La reserva se confirma automáticamente al acreditarse el pago.'}
          </p>
        </div>

        <p style="margin-top:24px;text-align:center">
          <a href="https://nutribcg.vercel.app/admin/bookings"
             style="background:#6E7B52;color:#fff;padding:12px 24px;border-radius:50px;text-decoration:none;font-weight:600;font-size:14px">
            Ver en el panel admin
          </a>
        </p>
      </div>
    `,
  })
}
