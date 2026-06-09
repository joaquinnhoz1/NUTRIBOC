import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSetting } from '@/lib/settings'

const DEFAULT_PRESENCIAL = ['09:00', '10:00', '11:00', '12:00', '15:00', '16:00', '17:00', '18:00']
const DEFAULT_ONLINE = ['08:00', '09:00', '13:00', '14:00', '19:00', '20:00']

function parseSlots(raw: string, fallback: string[]): string[] {
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed
  } catch {}
  return fallback
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')
  const mode = searchParams.get('mode')

  if (!date || !mode) {
    return NextResponse.json({ error: 'date and mode required' }, { status: 400 })
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !['presencial', 'online'].includes(mode)) {
    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
  }

  try {
    const blockedDay = await prisma.blockedDay.findUnique({ where: { date } })
    if (blockedDay) {
      return NextResponse.json({ blockedDay: true, slots: [] })
    }

    const [rawPresencial, rawOnline] = await Promise.all([
      getSetting('slots_presencial'),
      getSetting('slots_online'),
    ])

    const allSlots = mode === 'online'
      ? parseSlots(rawOnline, DEFAULT_ONLINE)
      : parseSlots(rawPresencial, DEFAULT_PRESENCIAL)

    const now = new Date()
    await prisma.booking.updateMany({
      where: {
        date,
        mode,
        status: { in: ['pending_transfer', 'pending_mp'] },
        expiresAt: { not: null, lte: now },
      },
      data: { status: 'cancelled' },
    })

    const [blockedSlots, bookedSlots] = await Promise.all([
      prisma.blockedSlot.findMany({
        where: { date, OR: [{ mode }, { mode: 'both' }] },
      }),
      prisma.booking.findMany({
        where: {
          date,
          mode,
          status: { in: ['pending_transfer', 'confirmed', 'pending_mp'] },
        },
        select: { slot: true },
      }),
    ])

    const blockedSlotSet = new Set(
      blockedSlots.flatMap(b => (b.slot === 'all' ? allSlots : [b.slot]))
    )
    const bookedSlotSet = new Set(bookedSlots.map(b => b.slot))

    const available = allSlots.filter(
      slot => !blockedSlotSet.has(slot) && !bookedSlotSet.has(slot)
    )

    return NextResponse.json({ blockedDay: false, slots: available })
  } catch (err) {
    console.error('[GET /api/availability]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
