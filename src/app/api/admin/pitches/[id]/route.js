import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireEditor } from '@/lib/auth'
import { generateArticle } from '@/lib/ai'
import { gatherResearch } from '@/lib/research'

export const dynamic = 'force-dynamic'
export const maxDuration = 60; // 60 seconds timeout for AI generation and research

export async function PATCH(request, { params }) {
    console.log(`[Pitches API] PATCH request for ${params.id}`);
    try {
        await requireEditor()

        const { action, notes } = await request.json()
        const pitchId = params.id
        console.log(`[Pitches API] Action: ${action || 'None'}`);

        let status
        switch (action) {
            case 'research':
                // Gather research for this pitch
                const pitchForResearch = await prisma.pitch.findUnique({
                    where: { id: pitchId }
                })

                if (!pitchForResearch) {
                    return NextResponse.json({ error: 'Pitch not found' }, { status: 404 })
                }

                // Extract athlete name from title/angle if present
                const athleteMatch = pitchForResearch.title.match(/(?:^|\s)([A-Z][a-z]+ [A-Z][a-z]+)(?:\s|$|'s|:)/);
                const athlete = athleteMatch ? athleteMatch[1] : null;

                const research = await gatherResearch({
                    title: pitchForResearch.title,
                    angle: pitchForResearch.angle,
                    athlete: athlete,
                    topic: pitchForResearch.contextLabel
                })

                // Store research in editorNotes as JSON
                await prisma.pitch.update({
                    where: { id: pitchId },
                    data: {
                        editorNotes: JSON.stringify(research)
                    }
                })

                return NextResponse.json({ success: true, research })

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

            // Parse stored research if available
            let research = null;
            if (currentPitch.editorNotes) {
                try {
                    research = JSON.parse(currentPitch.editorNotes);
                    if (!research.anchors) research = null; // Not valid research format
                } catch (e) {
                    // Not JSON, treat as regular notes
                    research = null;
                }
            }

            // Run generation but ensure we still create the record
            let aiContent = '<p>Generating draft content...</p>'
            try {
                if (agent) {
                    aiContent = await generateArticle({ pitch: currentPitch, agent, research })
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
