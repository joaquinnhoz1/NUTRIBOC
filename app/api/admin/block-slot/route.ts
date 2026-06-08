import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromCookies } from '@/lib/auth'

export async function GET() {
  const isAdmin = await getAdminFromCookies()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const slots = await prisma.blockedSlot.findMany({ orderBy: { date: 'asc' } })
  return NextResponse.json(slots)
}

export async function POST(req: NextRequest) {
  const isAdmin = await getAdminFromCookies()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { date, slot, mode, reason } = await req.json()
  if (!date || !slot || !mode) {
    return NextResponse.json({ error: 'date, slot y mode son requeridos' }, { status: 400 })
  }

  const blocked = await prisma.blockedSlot.create({ data: { date, slot, mode, reason } })
  return NextResponse.json(blocked, { status: 201 })
}
