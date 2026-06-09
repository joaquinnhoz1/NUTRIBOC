import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSetting } from '@/lib/settings'

function parseSlots(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
  } catch {}
  return []
}

function dowFromDateStr(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).getDay()
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

    const dow = dowFromDateStr(date)
    const [rawPresencial, rawOnline] = await Promise.all([
      getSetting(`slots_presencial_${dow}`),
      getSetting(`slots_online_${dow}`),
    ])

    const allSlots = mode === 'online'
      ? parseSlots(rawOnline)
      : parseSlots(rawPresencial)

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
