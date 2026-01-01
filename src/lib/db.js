import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: ['error', 'warn'],
})

// Always preserve the prisma instance in globalThis to prevent connection leaks 
// across hot reloads and serverless function invocations.
globalForPrisma.prisma = prisma

export default prisma
