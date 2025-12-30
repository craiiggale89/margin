import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireEditor } from '@/lib/auth'
import { refineArticle, reviewDraft } from '@/lib/ai'

export const dynamic = 'force-dynamic'

export async function PATCH(request, { params }) {
    console.log(`[Drafts API] PATCH request for ${params.id}`);
    try {
        await requireEditor()

        const body = await request.json()
        const { action, content, title, standfirst, notes, slug, contextLabel, readingTime, featured, sportFilter } = body
        const draftId = params.id

        console.log(`[Drafts API] Action: ${action || 'None'}${content ? ', Title/Content update' : ''}`);

        // Update content/title/standfirst
        if (content !== undefined || title !== undefined || standfirst !== undefined) {
            const updateData = {}
            if (content !== undefined) updateData.content = content
            if (title !== undefined) updateData.title = title
            if (standfirst !== undefined) updateData.standfirst = standfirst

            await prisma.draft.update({
                where: { id: draftId },
                data: updateData,
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

                case 'unapprove':
                    await prisma.draft.update({
                        where: { id: draftId },
                        data: { status: 'DRAFT' },
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

                case 'refine':
                    // Fetch Agent
                    const agent = await prisma.agent.findUnique({
                        where: { id: draft.pitch.agentId }
                    })

                    if (!agent) throw new Error('Agent not found')

                    // Refine Content
                    const refinedContent = await refineArticle({
                        currentContent: draft.content,
                        feedback: notes, // passing feedback in 'notes' field
                        agent
                    })

                    // Update Draft
                    await prisma.draft.update({
                        where: { id: draftId },
                        data: {
                            content: refinedContent,
                            // We keep status as is, or maybe 'DRAFT'?
                            // Let's assume editor is still working on it.
                        },
                    })
                    break

                case 'review':
                    // Run Quality Review Agent
                    const reviewResult = await reviewDraft({
                        content: draft.content,
                        title: draft.title || draft.pitch.title,
                        standfirst: draft.standfirst || draft.pitch.standfirst
                    })

                    return NextResponse.json({
                        success: true,
                        review: reviewResult
                    })

                case 'updatePublished':
                    // Update the published article with draft content
                    const linkedArticle = await prisma.article.findUnique({
                        where: { draftId: draft.id }
                    })

                    if (!linkedArticle) {
                        return NextResponse.json({ error: 'No published article found for this draft' }, { status: 404 })
                    }

                    await prisma.article.update({
                        where: { id: linkedArticle.id },
                        data: {
                            title: draft.title || linkedArticle.title,
                            standfirst: draft.standfirst || linkedArticle.standfirst,
                            content: draft.content
                        }
                    })

                    // Clear the editor notes since update is complete
                    await prisma.draft.update({
                        where: { id: draftId },
                        data: { editorNotes: null }
                    })

                    return NextResponse.json({ success: true, message: 'Published article updated' })

                case 'publish':
                    // Create the article
                    const article = await prisma.article.create({
                        data: {
                            slug,
                            title: draft.title || draft.pitch.title,
                            standfirst: draft.standfirst || draft.pitch.standfirst,
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
