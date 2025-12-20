import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireEditor } from '@/lib/auth'

export async function PATCH(request, { params }) {
    try {
        await requireEditor()

        const body = await request.json()
        const { action, content, notes, slug, contextLabel, readingTime, featured, sportFilter } = body
        const draftId = params.id

        // Update content
        if (content !== undefined) {
            await prisma.draft.update({
                where: { id: draftId },
                data: { content },
            })
            return NextResponse.json({ success: true })
        }

        // Handle status actions
        if (action) {
            const draft = await prisma.draft.findUnique({
                where: { id: draftId },
                include: { pitch: true },
            })

            if (!draft) {
                return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
            }

            switch (action) {
                case 'approve':
                    await prisma.draft.update({
                        where: { id: draftId },
                        data: { status: 'APPROVED' },
                    })
                    break

                case 'revision':
                    await prisma.draft.update({
                        where: { id: draftId },
                        data: {
                            status: 'REVISION_REQUESTED',
                            editorNotes: notes || null,
                        },
                    })
                    break

                case 'publish':
                    // Create the article
                    const article = await prisma.article.create({
                        data: {
                            slug,
                            title: draft.pitch.title,
                            standfirst: draft.pitch.standfirst,
                            content: draft.content,
                            contextLabel: contextLabel || draft.pitch.contextLabel,
                            byline: 'By Margin',
                            readingTime: readingTime || draft.pitch.estimatedTime,
                            featured: featured || false,
                            sportFilter: sportFilter || null,
                            draftId: draft.id,
                            publishedAt: new Date(),
                        },
                    })

                    // Update draft status
                    await prisma.draft.update({
                        where: { id: draftId },
                        data: { status: 'APPROVED' },
                    })

                    return NextResponse.json({ success: true, article })

                default:
                    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
            }

            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: 'No action provided' }, { status: 400 })
    } catch (error) {
        console.error('Draft update failed:', error)
        return NextResponse.json({ error: 'Failed to update draft' }, { status: 500 })
    }
}
