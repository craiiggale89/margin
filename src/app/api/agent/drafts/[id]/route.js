import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAgent } from '@/lib/auth'

export async function PATCH(request, { params }) {
    try {
        await requireAgent()

        const { action, content } = await request.json()
        const draftId = params.id

        // Update content
        if (content !== undefined) {
            await prisma.draft.update({
                where: { id: draftId },
                data: { content },
            })
            return NextResponse.json({ success: true })
        }

        // Submit draft for review
        if (action === 'submit') {
            await prisma.draft.update({
                where: { id: draftId },
                data: { status: 'SUBMITTED' },
            })
            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: 'No action provided' }, { status: 400 })
    } catch (error) {
        console.error('Draft update failed:', error)
        return NextResponse.json({ error: 'Failed to update draft' }, { status: 500 })
    }
}
