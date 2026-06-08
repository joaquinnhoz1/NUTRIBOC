import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromCookies } from '@/lib/auth'

const HOLD_MINUTES = 30

export async function GET(req: NextRequest) {
  const isAdmin = await getAdminFromCookies()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const mode = searchParams.get('mode')
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (mode) where.mode = mode
  if (dateFrom || dateTo) {
    where.date = {}
    if (dateFrom) (where.date as Record<string, string>).gte = dateFrom
    if (dateTo) (where.date as Record<string, string>).lte = dateTo
  }

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: [{ date: 'asc' }, { slot: 'asc' }],
  })

  return NextResponse.json(bookings)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, email, phone, mode, date, slot, paymentType } = body

  if (!name || !email || !phone || !mode || !date || !slot || !paymentType) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const now = new Date()

  // Liberar reservas expiradas para este slot antes de verificar disponibilidad
  await prisma.booking.updateMany({
    where: {
      date,
      mode,
      slot,
      status: { in: ['pending_transfer', 'pending_mp'] },
      expiresAt: { not: null, lte: now },
    },
    data: { status: 'cancelled' },
  })

  // Verificar disponibilidad
  const existingBooking = await prisma.booking.findFirst({
    where: {
      date,
      mode,
      slot,
      status: { in: ['pending_transfer', 'confirmed', 'pending_mp'] },
    },
  })
  if (existingBooking) {
    return NextResponse.json({ error: 'El turno ya no está disponible' }, { status: 409 })
  }

  const status = paymentType === 'transfer' ? 'pending_transfer' : 'pending_mp'
  const amount = parseFloat(process.env.NEXT_PUBLIC_CONSULTATION_FEE || '5000')
  const expiresAt = new Date(now.getTime() + HOLD_MINUTES * 60 * 1000)

  const booking = await prisma.booking.create({
    data: { name, email, phone, mode, date, slot, paymentType, status, amount, expiresAt },
  })

  return NextResponse.json(booking, { status: 201 })
}
