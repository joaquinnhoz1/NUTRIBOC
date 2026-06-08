import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createPreference } from '@/lib/mercadopago'

export async function POST(req: NextRequest) {
  const { bookingId } = await req.json()
  if (!bookingId) return NextResponse.json({ error: 'bookingId requerido' }, { status: 400 })

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
  if (!booking) return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })

  try {
    const preference = await createPreference({
      bookingId: booking.id,
      name: booking.name,
      email: booking.email,
      mode: booking.mode,
      date: booking.date,
      slot: booking.slot,
      amount: booking.amount ?? 5000,
    })

    await prisma.booking.update({
      where: { id: bookingId },
      data: { mpPreferenceId: preference.id },
    })

    return NextResponse.json({ preferenceId: preference.id, initPoint: preference.init_point })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'MP_NOT_CONFIGURED') {
      return NextResponse.json(
        { error: 'Mercado Pago no configurado. Completá las credenciales en .env.local' },
        { status: 503 }
      )
    }
    return NextResponse.json({ error: 'Error al crear preferencia' }, { status: 500 })
  }
}
