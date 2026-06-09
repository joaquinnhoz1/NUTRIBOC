import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

const secret = () => {
  const key = process.env.JWT_SECRET
  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET env var is required in production')
    }
    // Dev-only fallback — never valid in prod
    return new TextEncoder().encode('dev-secret-local-only-never-in-prod')
  }
  return new TextEncoder().encode(key)
}

export async function signAdminToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret())
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, secret())
    return true
  } catch {
    return false
  }
}

export async function getAdminFromCookies(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (!token) return false
  return verifyAdminToken(token)
}

const BCRYPT_PREFIX = /^\$2[ab]\$/

/** Returns true if the stored value is a bcrypt hash */
export function isBcryptHash(value: string): boolean {
  return BCRYPT_PREFIX.test(value)
}

/** Hash a plain-text password */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12)
}

/**
 * Compare a plain-text input against a stored value that may be either
 * a bcrypt hash (new) or a plain-text string (legacy migration).
 * Returns { match: boolean, needsRehash: boolean }
 */
export async function verifyPassword(
  input: string,
  stored: string,
): Promise<{ match: boolean; needsRehash: boolean }> {
  if (isBcryptHash(stored)) {
    return { match: await bcrypt.compare(input, stored), needsRehash: false }
  }
  // Legacy plain-text — compare directly, signal that it needs rehashing
  return { match: input === stored, needsRehash: true }
}
