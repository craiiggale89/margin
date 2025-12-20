import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAgent } from '@/lib/auth'

export async function POST(request) {
    try {
        await requireAgent()

        const { title, standfirst, angle, whyNow, contextLabel, estimatedTime, agentId } = await request.json()

        if (!title || !standfirst || !angle || !agentId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Check pitch limit
        const agent = await prisma.agent.findUnique({
            where: { id: agentId },
            include: {
                pitches: {
                    where: {
                        status: { in: ['SUBMITTED', 'IN_REVIEW'] },
                    },
                },
            },
        })

        if (!agent) {
            return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
        }

        if (agent.pitches.length >= agent.pitchLimit) {
            return NextResponse.json({
                error: `Pitch limit reached (${agent.pitchLimit}). Wait for existing pitches to be reviewed.`
            }, { status: 400 })
        }

        const pitch = await prisma.pitch.create({
            data: {
                title,
                standfirst,
                angle,
                whyNow: whyNow || null,
                contextLabel: contextLabel || null,
                estimatedTime: estimatedTime || 5,
                agentId,
                status: 'SUBMITTED',
            },
        })

        return NextResponse.json({ success: true, pitch })
    } catch (error) {
        console.error('Pitch creation failed:', error)
        return NextResponse.json({ error: 'Failed to create pitch' }, { status: 500 })
    }
}

export async function GET(request) {
    try {
        await requireAgent()

        const { searchParams } = new URL(request.url)
        const agentId = searchParams.get('agentId')

        const pitches = await prisma.pitch.findMany({
            where: agentId ? { agentId } : undefined,
            include: {
                agent: true,
                draft: true,
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(pitches)
    } catch (error) {
        console.error('Failed to fetch pitches:', error)
        return NextResponse.json({ error: 'Failed to fetch pitches' }, { status: 500 })
    }
}
