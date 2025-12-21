import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireEditor } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request) {
    try {
        await requireEditor()

        const { name, focus, pitchLimit, constraints } = await request.json()

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        }

        const agent = await prisma.agent.create({
            data: {
                name,
                focus: focus || null,
                pitchLimit: pitchLimit || 3,
                constraints: constraints || null,
                active: true,
            },
        })

        return NextResponse.json({ success: true, agent })
    } catch (error) {
        console.error('Agent creation failed:', error)
        return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 })
    }
}

export async function GET() {
    try {
        const agents = await prisma.agent.findMany({
            where: { active: true },
            orderBy: { name: 'asc' },
        })
        return NextResponse.json(agents)
    } catch (error) {
        console.error('Failed to fetch agents:', error)
        return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 })
    }
}
