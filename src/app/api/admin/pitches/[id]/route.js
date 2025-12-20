import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireEditor } from '@/lib/auth'

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
            await prisma.draft.create({
                data: {
                    pitchId: pitch.id,
                    content: '',
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
