import { NextRequest, NextResponse } from 'next/server'
import { getSettings, setSettings, getAdminPassword } from '@/lib/settings'
import { getAdminFromCookies, signAdminToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const isAdmin = await getAdminFromCookies()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const settings = await getSettings()
  return NextResponse.json(settings)
}

export async function PUT(req: NextRequest) {
  const isAdmin = await getAdminFromCookies()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // Handle password change separately
  if (body._changePassword) {
    const { currentPassword, newPassword } = body
    const expected = await getAdminPassword()
    if (currentPassword !== expected) {
      return NextResponse.json({ error: 'La contraseña actual es incorrecta' }, { status: 400 })
    }
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' }, { status: 400 })
    }
    await prisma.setting.upsert({
      where: { key: 'admin_password' },
      update: { value: newPassword },
      create: { key: 'admin_password', value: newPassword },
    })
    // Issue a new token so the session stays valid
    const token = await signAdminToken()
    const res = NextResponse.json({ ok: true })
    res.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })
    return res
  }

  // Regular settings update
  const allowed = [
    'whatsapp_number',
    'whatsapp_comprobante',
    'transfer_cbu',
    'transfer_alias',
    'transfer_titular',
    'transfer_banco',
    'consultation_fee',
    'consultation_fee_mp',
    'mp_link',
    'slots_presencial',
    'slots_online',
    'min_days_ahead',
    'booking_hold_minutes',
    'business_hours',
    'business_hours_detail',
    'stat_experience',
    'stat_patients',
  ]

  const toSave: Record<string, string> = {}
  for (const key of allowed) {
    if (key in body) toSave[key] = String(body[key])
  }

  await setSettings(toSave)
  return NextResponse.json({ ok: true })
}
