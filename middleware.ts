import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = () => {
  const key = process.env.JWT_SECRET
  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET env var is required in production')
    }
    return new TextEncoder().encode('dev-secret-local-only-never-in-prod')
  }
  return new TextEncoder().encode(key)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get('admin_token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    try {
      await jwtVerify(token, secret())
    } catch {
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete('admin_token')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
