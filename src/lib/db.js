import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
        db: {
            url: process.env.DATABASE_URL + (process.env.DATABASE_URL?.includes('?') ? '&' : '?') + 'connection_limit=1'
        },
    },
})

// Always preserve the prisma instance in globalThis to prevent connection leaks 
// across hot reloads and serverless function invocations.
globalForPrisma.prisma = prisma

export default prisma
