import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getPayment } from '@/lib/mercadopago'

export async function POST(req: NextRequest) {
  const body = await req.json()

  // MP sends different event types
  const type = body.type || body.topic
  const dataId = body.data?.id || body.id

  if (type !== 'payment' || !dataId) {
    return NextResponse.json({ ok: true })
  }

  try {
    const payment = await getPayment(String(dataId))
    if (!payment) return NextResponse.json({ ok: true })

    const bookingId = payment.external_reference
    const status = payment.status // 'approved' | 'pending' | 'rejected' | 'cancelled'

    if (!bookingId) return NextResponse.json({ ok: true })

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking) return NextResponse.json({ ok: true })

    let newStatus = booking.status
    if (status === 'approved') newStatus = 'confirmed'
    else if (status === 'pending') newStatus = 'pending_mp'
    else if (status === 'rejected' || status === 'cancelled') newStatus = 'cancelled'

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: newStatus, mpPaymentId: String(dataId) },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}

// MP also sends GET to verify the endpoint
export async function GET() {
  return NextResponse.json({ ok: true })
}
