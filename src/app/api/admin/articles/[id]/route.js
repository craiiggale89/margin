import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { NextResponse } from 'next/server'
import { upgradeArticle } from '@/lib/ai'
import { gatherResearch } from '@/lib/research'

export const maxDuration = 60; // 60 seconds timeout for AI research and upgrade tasks

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
            // Extract athlete name - skip common title words
            const titleWithoutCommon = article.title.replace(/^(Unpacking|Inside|Beyond|Exploring|Rethinking|The|A)\s+/gi, '');
            const athleteMatch = titleWithoutCommon.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)(?:'s|\s|$|:)/);
            const athlete = athleteMatch ? athleteMatch[1].trim() : null;
            console.log('[Upgrade] Extracted athlete:', athlete);

            // RELEASE DB CONNECTION while waiting for long AI tasks (~20s)
            // This prevents "Max clients reached" for other users.
            await prisma.$disconnect();

            const research = await gatherResearch({
                title: article.title,
                angle: article.standfirst,
                athlete: athlete,
                topic: article.contextLabel
            })
            console.log('[Upgrade] Research result:', JSON.stringify(research, null, 2));

            // Upgrade with research injected
            const upgradedContent = await upgradeArticle({
                content: article.content,
                title: article.title,
                standfirst: article.standfirst,
                research: research
            })

            // Build editor notes based on research status
            let editorNotes = '';
            if (research.fallback) {
                editorNotes = '⚠️ RESEARCH FAILED - Upgrade applied WITHOUT verified anchors. Review carefully for missing concrete data.';
            } else if (research.anchors?.length > 0) {
                const anchorSummaries = research.anchors.slice(0, 3).map(a =>
                    `• ${a.type}: ${a.situation?.substring(0, 80)}...`
                ).join('\n');
                editorNotes = `✅ ${research.anchors.length} ANCHORS FOUND:\n${anchorSummaries}`;
            } else {
                editorNotes = '⚠️ No anchors found by research. Upgrade applied with existing content only.';
            }

            // Update the linked draft with upgraded content for review
            await prisma.draft.update({
                where: { id: article.draftId },
                data: {
                    content: upgradedContent,
                    status: 'SUBMITTED',
                    editorNotes: editorNotes
                }
            })

            return NextResponse.json({
                success: true,
                message: 'Upgrade created as draft for review',
                draftId: article.draftId,
                anchorsFound: research.anchors?.length || 0
            })
        }

        // Handle hide action
        if (action === 'hide') {
            await prisma.article.update({
                where: { id: params.id },
                data: { hidden: true }
            })
            return NextResponse.json({ success: true, message: 'Article hidden' })
        }

        // Handle show action
        if (action === 'show') {
            await prisma.article.update({
                where: { id: params.id },
                data: { hidden: false }
            })
            return NextResponse.json({ success: true, message: 'Article visible' })
        }

        // Handle reorder action
        if (action === 'reorder') {
            const { displayOrder } = body
            await prisma.article.update({
                where: { id: params.id },
                data: { displayOrder: displayOrder || 0 }
            })
            return NextResponse.json({ success: true, message: 'Order updated' })
        }

        // Handle feature toggle action
        if (action === 'feature') {
            await prisma.article.update({
                where: { id: params.id },
                data: { featured: true }
            })
            return NextResponse.json({ success: true, message: 'Article featured' })
        }

        if (action === 'unfeature') {
            await prisma.article.update({
                where: { id: params.id },
                data: { featured: false }
            })
            return NextResponse.json({ success: true, message: 'Article unfeatured' })
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
