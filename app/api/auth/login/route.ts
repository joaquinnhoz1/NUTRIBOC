import { NextRequest, NextResponse } from 'next/server'
import { signAdminToken, verifyPassword, hashPassword } from '@/lib/auth'
import { getAdminPassword } from '@/lib/settings'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Contraseña requerida' }, { status: 400 })
    }

    const stored = await getAdminPassword()
    const { match, needsRehash } = await verifyPassword(password, stored)

    if (!match) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
    }

    // Auto-migrate plain-text password to bcrypt hash on first successful login
    if (needsRehash) {
      const hashed = await hashPassword(password)
      await prisma.setting.upsert({
        where: { key: 'admin_password' },
        update: { value: hashed },
        create: { key: 'admin_password', value: hashed },
      })
    }

    const token = await signAdminToken()
    const response = NextResponse.json({ ok: true })
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
