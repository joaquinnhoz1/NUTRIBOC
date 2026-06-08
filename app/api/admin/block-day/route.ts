import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromCookies } from '@/lib/auth'

export async function GET() {
  const isAdmin = await getAdminFromCookies()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const days = await prisma.blockedDay.findMany({ orderBy: { date: 'asc' } })
  return NextResponse.json(days)
}

export async function POST(req: NextRequest) {
  const isAdmin = await getAdminFromCookies()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { date, reason } = await req.json()
  if (!date) return NextResponse.json({ error: 'date es requerido' }, { status: 400 })

  const blocked = await prisma.blockedDay.upsert({
    where: { date },
    update: { reason },
    create: { date, reason },
  })
  return NextResponse.json(blocked, { status: 201 })
}
