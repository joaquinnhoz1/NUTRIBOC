import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromCookies } from '@/lib/auth'

export async function GET() {
  const isAdmin = await getAdminFromCookies()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const today = new Date().toISOString().split('T')[0]

  const [total, confirmed, pendingTransfer, pendingMp, cancelled, todayBookings, revenue] =
    await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'confirmed' } }),
      prisma.booking.count({ where: { status: 'pending_transfer' } }),
      prisma.booking.count({ where: { status: 'pending_mp' } }),
      prisma.booking.count({ where: { status: 'cancelled' } }),
      prisma.booking.findMany({
        where: { date: today, status: { not: 'cancelled' } },
        orderBy: { slot: 'asc' },
      }),
      prisma.booking.aggregate({
        where: { status: 'confirmed' },
        _sum: { amount: true },
      }),
    ])

  // Next 7 days bookings
  const in7Days = new Date()
  in7Days.setDate(in7Days.getDate() + 7)
  const weekDate = in7Days.toISOString().split('T')[0]

  const upcoming = await prisma.booking.findMany({
    where: {
      date: { gte: today, lte: weekDate },
      status: { not: 'cancelled' },
    },
    orderBy: [{ date: 'asc' }, { slot: 'asc' }],
    take: 10,
  })

  return NextResponse.json({
    total,
    confirmed,
    pendingTransfer,
    pendingMp,
    cancelled,
    todayBookings,
    upcoming,
    revenue: revenue._sum.amount ?? 0,
  })
}
