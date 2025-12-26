import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const session = await getSession()
        if (!session || session.user.role !== 'EDITOR') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const settings = await prisma.settings.findUnique({
            where: { id: 'global' }
        })

        return NextResponse.json(settings || { cronEnabled: true, maxPitchesPerAgent: 1 })
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PATCH(request) {
    try {
        const session = await getSession()
        if (!session || session.user.role !== 'EDITOR') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { cronEnabled, maxPitchesPerAgent } = body

        const settings = await prisma.settings.upsert({
            where: { id: 'global' },
            create: {
                id: 'global',
                cronEnabled,
                maxPitchesPerAgent: parseInt(maxPitchesPerAgent)
            },
            update: {
                cronEnabled,
                maxPitchesPerAgent: parseInt(maxPitchesPerAgent)
            }
        })

        return NextResponse.json(settings)
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
