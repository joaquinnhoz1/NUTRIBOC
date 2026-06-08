import { NextRequest, NextResponse } from 'next/server'
import { signAdminToken } from '@/lib/auth'
import { getAdminPassword } from '@/lib/settings'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  const expected = await getAdminPassword()

  if (password !== expected) {
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
  }

  const token = await signAdminToken()
  const response = NextResponse.json({ ok: true })
  response.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24h
    path: '/',
  })

  return response
}
