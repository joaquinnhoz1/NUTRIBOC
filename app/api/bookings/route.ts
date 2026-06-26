import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromCookies } from '@/lib/auth'
import { getSetting } from '@/lib/settings'
import { sendBookingNotification } from '@/lib/email'

// ── Validation helpers ──────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DATE_RE  = /^\d{4}-\d{2}-\d{2}$/
const SLOT_RE  = /^\d{2}:\d{2}$/
const VALID_MODES         = ['presencial', 'online'] as const
const VALID_PAYMENT_TYPES = ['transfer', 'mercadopago'] as const

function validateBookingInput(body: Record<string, unknown>): string | null {
  const { name, email, phone, mode, date, slot, paymentType } = body as Record<string, string>

  if (!name?.trim())    return 'El nombre es requerido'
  if (name.trim().length > 100) return 'El nombre no puede superar los 100 caracteres'

  if (!email?.trim())   return 'El email es requerido'
  if (!EMAIL_RE.test(email.trim())) return 'El formato del email no es válido'

  if (!phone?.trim())   return 'El teléfono es requerido'
  if (phone.trim().length > 30) return 'El teléfono no puede superar los 30 caracteres'

  if (!mode || !VALID_MODES.includes(mode as typeof VALID_MODES[number]))
    return 'La modalidad debe ser presencial u online'

  if (!date || !DATE_RE.test(date)) return 'La fecha debe tener el formato YYYY-MM-DD'

  if (!slot || !SLOT_RE.test(slot)) return 'El horario debe tener el formato HH:MM'

  if (!paymentType || !VALID_PAYMENT_TYPES.includes(paymentType as typeof VALID_PAYMENT_TYPES[number]))
    return 'El tipo de pago debe ser transfer o mercadopago'

  return null
}

// ── Routes ──────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const isAdmin = await getAdminFromCookies()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status   = searchParams.get('status')
  const mode     = searchParams.get('mode')
  const dateFrom = searchParams.get('dateFrom')
  const dateTo   = searchParams.get('dateTo')

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (mode)   where.mode   = mode
  if (dateFrom || dateTo) {
    where.date = {}
    if (dateFrom) (where.date as Record<string, string>).gte = dateFrom
    if (dateTo)   (where.date as Record<string, string>).lte = dateTo
  }

  try {
    const bookings = await prisma.booking.findMany({
      where,
      orderBy: [{ date: 'asc' }, { slot: 'asc' }],
    })
    return NextResponse.json(bookings)
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const validationError = validateBookingInput(body)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const { name, email, phone, mode, date, slot, paymentType } = body as Record<string, string>
    const trimmedName  = name.trim()
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedPhone = phone.trim()

    const now = new Date()

    const feeKey = paymentType === 'transfer' ? 'consultation_fee' : 'consultation_fee_mp'
    const [feeRaw, holdRaw] = await Promise.all([
      getSetting(feeKey),
      getSetting('booking_hold_minutes'),
    ])
    const amount      = parseFloat(feeRaw || process.env.NEXT_PUBLIC_CONSULTATION_FEE || '5000')
    const holdMinutes = parseInt(holdRaw || '30') || 30
    const expiresAt   = new Date(now.getTime() + holdMinutes * 60 * 1000)
    const status      = paymentType === 'transfer' ? 'pending_transfer' : 'pending_mp'

    // Atomic transaction: expire → check → create
    // prisma.$transaction is serializable in LibSQL/Turso, preventing race conditions
    const booking = await prisma.$transaction(async (tx) => {
      // Lazily cancel expired holds for this slot
      await tx.booking.updateMany({
        where: {
          date,
          mode,
          slot,
          status: { in: ['pending_transfer', 'pending_mp'] },
          expiresAt: { not: null, lte: now },
        },
        data: { status: 'cancelled' },
      })

      // Check availability inside the same transaction
      const conflict = await tx.booking.findFirst({
        where: {
          date,
          mode,
          slot,
          status: { in: ['pending_transfer', 'confirmed', 'pending_mp'] },
        },
        select: { id: true },
      })
      if (conflict) {
        throw Object.assign(new Error('SLOT_TAKEN'), { code: 'SLOT_TAKEN' })
      }

      return tx.booking.create({
        data: {
          name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone,
          mode,
          date,
          slot,
          paymentType,
          status,
          amount,
          expiresAt,
        },
      })
    })

    await sendBookingNotification({
      name:        booking.name,
      email:       booking.email,
      phone:       booking.phone,
      mode:        booking.mode,
      date:        booking.date,
      slot:        booking.slot,
      paymentType: booking.paymentType,
      amount:      booking.amount ?? 0,
    }).catch(err => console.error('[email] Error enviando notificación:', err))

    return NextResponse.json(booking, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof Error && (err as NodeJS.ErrnoException & { code?: string }).code === 'SLOT_TAKEN') {
      return NextResponse.json({ error: 'El turno ya no está disponible' }, { status: 409 })
    }
    console.error('[POST /api/bookings]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
