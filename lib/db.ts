import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrisma() {
  const authToken = process.env.DATABASE_AUTH_TOKEN
  const url = process.env.TURSO_DATABASE_URL
  if (authToken && url) {
    const adapter = new PrismaLibSql({ url, authToken })
    return new PrismaClient({ adapter })
  }
  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma ?? createPrisma()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
