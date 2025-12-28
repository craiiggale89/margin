import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireEditor } from '@/lib/auth'
import { generateArticle } from '@/lib/ai'

export const dynamic = 'force-dynamic'

export async function PATCH(request, { params }) {
    console.log(`[Pitches API] PATCH request for ${params.id}`);
    try {
        await requireEditor()

        const { action, notes } = await request.json()
        const pitchId = params.id
        console.log(`[Pitches API] Action: ${action || 'None'}`);

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

        if (action === 'approve') {
            // Check if draft already exists
            const existingDraft = await prisma.draft.findUnique({
                where: { pitchId }
            })

            if (existingDraft) {
                // Already has a draft, just ensure status is correct
                await prisma.pitch.update({
                    where: { id: pitchId },
                    data: { status: 'APPROVED', editorNotes: notes || null }
                })
                return NextResponse.json({ success: true, message: 'Draft already exists' })
            }

            // Fetch Agent for AI Generation
            const currentPitch = await prisma.pitch.findUnique({ where: { id: pitchId } })
            const agent = await prisma.agent.findUnique({
                where: { id: currentPitch.agentId }
            })

            // Run generation but ensure we still create the record
            let aiContent = '<p>Generating draft content...</p>'
            try {
                if (agent) {
                    aiContent = await generateArticle({ pitch: currentPitch, agent })
                }
            } catch (err) {
                console.error('[Pitches API] AI Generation failed, using placeholder:', err)
                aiContent = '<p>AI generation timed out or failed. Please refresh or edit manually.</p>'
            }

            // Atomic-ish update: Use transaction to ensure pitch status and draft match
            const [updatedPitch, newDraft] = await prisma.$transaction([
                prisma.pitch.update({
                    where: { id: pitchId },
                    data: { status: 'APPROVED', editorNotes: notes || null }
                }),
                prisma.draft.create({
                    data: {
                        pitchId: pitchId,
                        title: currentPitch.title,
                        standfirst: currentPitch.standfirst,
                        content: aiContent,
                        status: 'DRAFT',
                    },
                })
            ])

            return NextResponse.json({ success: true, pitch: updatedPitch, draft: newDraft })
        }

        // Handle other actions (reject, revision)
        const updatedNonApprovalPitch = await prisma.pitch.update({
            where: { id: pitchId },
            data: {
                status,
                editorNotes: notes || null,
            },
        })

        return NextResponse.json({ success: true, pitch: updatedNonApprovalPitch })
    } catch (error) {
        console.error('Pitch update failed:', error)
        return NextResponse.json({ error: 'Failed to update pitch: ' + error.message }, { status: 500 })
    }
}
