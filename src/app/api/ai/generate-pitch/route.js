import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { generatePitch } from '@/lib/ai'
import { getSession } from '@/lib/auth'

export async function POST(request) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { agentId, topic } = body

        // Verify agent exists
        const agent = await prisma.agent.findUnique({
            where: { id: agentId },
            include: { user: true }
        })

        if (!agent) {
            return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
        }

        // Generate Content
        const generatedPitch = await generatePitch({ agent, topic })

        // Save to DB
        const pitch = await prisma.pitch.create({
            data: {
                title: generatedPitch.title,
                standfirst: generatedPitch.standfirst,
                angle: generatedPitch.angle,
                whyNow: generatedPitch.whyNow,
                contextLabel: generatedPitch.contextLabel,
                estimatedTime: 5,
                agentId: agent.id,
                status: 'SUBMITTED', // Auto-submit? Or DRAFT? Let's auto-submit for "Commission", maybe Draft for "Brainstorm"? 
                // Plan said "Brainstorm", so maybe user wants to review? 
                // But simplified workflow usually just submits.
                // Let's stick to SUBMITTED so it shows up for Editor.
            }
        })

        return NextResponse.json({ success: true, pitch })

    } catch (error) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
