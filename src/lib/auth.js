import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function getSession() {
    return await getServerSession(authOptions)
}

export async function getCurrentUser() {
    const session = await getSession()
    return session?.user
}

export async function requireAuth() {
    const user = await getCurrentUser()
    if (!user) {
        throw new Error('Unauthorized')
    }
    return user
}

export async function requireEditor() {
    const user = await requireAuth()
    if (user.role !== 'EDITOR') {
        throw new Error('Forbidden')
    }
    return user
}

export async function requireAgent() {
    const user = await requireAuth()
    if (user.role !== 'AGENT' && user.role !== 'EDITOR') {
        throw new Error('Forbidden')
    }
    return user
}
