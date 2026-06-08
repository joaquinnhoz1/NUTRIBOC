import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromCookies } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await getAdminFromCookies()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { status, notes } = body

  const allowed = ['pending_transfer', 'confirmed', 'cancelled', 'pending_mp']
  if (status && !allowed.includes(status)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
  }

  const booking = await prisma.booking.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(notes !== undefined && { notes }),
      // Al confirmar, el turno queda fijo y no expira
      ...(status === 'confirmed' && { expiresAt: null }),
    },
  })

  return NextResponse.json(booking)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await getAdminFromCookies()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await prisma.booking.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
