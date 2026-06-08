import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

function getClient() {
  const token = process.env.MP_ACCESS_TOKEN
  if (!token || token === 'TU_ACCESS_TOKEN_AQUI') return null
  return new MercadoPagoConfig({ accessToken: token })
}

interface BookingDetails {
  bookingId: string
  name: string
  email: string
  mode: string
  date: string
  slot: string
  amount: number
}

export async function createPreference(booking: BookingDetails) {
  const client = getClient()
  if (!client) throw new Error('MP_NOT_CONFIGURED')

  const preference = new Preference(client)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  const result = await preference.create({
    body: {
      items: [
        {
          id: booking.bookingId,
          title: `Consulta nutricional ${booking.mode} — ${booking.date} ${booking.slot}hs`,
          quantity: 1,
          unit_price: booking.amount,
          currency_id: 'ARS',
        },
      ],
      payer: {
        name: booking.name,
        email: booking.email,
      },
      back_urls: {
        success: `${baseUrl}/reserva/exito?booking=${booking.bookingId}`,
        failure: `${baseUrl}/reserva/error?booking=${booking.bookingId}`,
        pending: `${baseUrl}/reserva/pendiente?booking=${booking.bookingId}`,
      },
      auto_return: 'approved',
      notification_url: `${baseUrl}/api/mp/webhook`,
      external_reference: booking.bookingId,
      statement_descriptor: 'NUTRIBOC',
    },
  })

  return result
}

export async function getPayment(paymentId: string) {
  const client = getClient()
  if (!client) return null
  const payment = new Payment(client)
  return payment.get({ id: paymentId })
}
