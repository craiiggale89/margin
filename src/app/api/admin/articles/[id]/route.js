import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { NextResponse } from 'next/server'
import { upgradeArticle } from '@/lib/ai'
import { gatherResearch } from '@/lib/research'

export async function PATCH(request, { params }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'EDITOR') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { action, title, standfirst, content, contextLabel, byline, imageUrl, featured, sportFilter } = body

        // Handle upgrade action - creates draft for review instead of direct update
        if (action === 'upgrade') {
            const article = await prisma.article.findUnique({
                where: { id: params.id },
                include: { draft: true }
            })

            if (!article) {
                return NextResponse.json({ error: 'Article not found' }, { status: 404 })
            }

            // Run Research Agent first to gather concrete anchors
            const athleteMatch = article.title.match(/(?:^|\s)([A-Z][a-z]+ [A-Z][a-z]+)(?:\s|$|'s|:)/);
            const athlete = athleteMatch ? athleteMatch[1] : null;

            const research = await gatherResearch({
                title: article.title,
                angle: article.standfirst,
                athlete: athlete,
                topic: article.contextLabel
            })

            // Upgrade with research injected
            const upgradedContent = await upgradeArticle({
                content: article.content,
                title: article.title,
                standfirst: article.standfirst,
                research: research
            })

            // Update the linked draft with upgraded content for review
            await prisma.draft.update({
                where: { id: article.draftId },
                data: {
                    content: upgradedContent,
                    status: 'SUBMITTED',
                    editorNotes: research.anchors?.length > 0
                        ? `Quality upgrade with ${research.anchors.length} researched anchors - awaiting review`
                        : 'Quality upgrade applied - awaiting review'
                }
            })

            return NextResponse.json({
                success: true,
                message: 'Upgrade created as draft for review',
                draftId: article.draftId,
                anchorsFound: research.anchors?.length || 0
            })
        }

        // Regular update
        const article = await prisma.article.update({
            where: { id: params.id },
            data: {
                title,
                standfirst,
                content,
                contextLabel: contextLabel || null,
                byline,
                imageUrl: imageUrl || null,
                featured,
                sportFilter: sportFilter || null,
            }
        })

        return NextResponse.json({ success: true, article })
    } catch (error) {
        console.error('Error updating article:', error)
        return NextResponse.json({ error: 'Failed to update article' }, { status: 500 })
    }
}

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'EDITOR') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const article = await prisma.article.findUnique({
            where: { id: params.id },
            include: {
                draft: {
                    include: {
                        pitch: {
                            include: {
                                agent: true,
                            },
                        },
                    },
                },
            },
        })

        if (!article) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 })
        }

        return NextResponse.json(article)
    } catch (error) {
        console.error('Error fetching article:', error)
        return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 })
    }
}
