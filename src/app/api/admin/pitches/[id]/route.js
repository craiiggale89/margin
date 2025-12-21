import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireEditor } from '@/lib/auth'
import { generateArticle } from '@/lib/ai'

export async function PATCH(request, { params }) {
    try {
        await requireEditor()

        const { action, notes } = await request.json()
        const pitchId = params.id

        let status
        switch (action) {
            case 'approve':
                status = 'APPROVED'
                break
            case 'reject':
                status = 'REJECTED'
                break
            case 'revision':
                status = 'REVISION_REQUESTED'
                break
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

        const pitch = await prisma.pitch.update({
            where: { id: pitchId },
            data: {
                status,
                editorNotes: notes || null,
            },
        })

        // If approved, create a draft automatically
        if (action === 'approve') {
            // Fetch Agent for AI Generation
            const agent = await prisma.agent.findUnique({
                where: { id: pitch.agentId }
            })

            // Generate full article
            const aiContent = agent ? await generateArticle({ pitch, agent }) : ''

            await prisma.draft.create({
                data: {
                    pitchId: pitch.id,
                    content: aiContent,
                    status: 'DRAFT',
                },
            })
        }

        return NextResponse.json({ success: true, pitch })
    } catch (error) {
        console.error('Pitch update failed:', error)
        return NextResponse.json({ error: 'Failed to update pitch' }, { status: 500 })
    }
}
