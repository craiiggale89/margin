import { notFound } from 'next/navigation'
import prisma from '@/lib/db'
import AdminDraftDetailContent from '@/components/admin/AdminDraftDetailContent'

async function getDraft(id) {
    try {
        const draft = await prisma.draft.findUnique({
            where: { id },
            include: {
                pitch: {
                    include: {
                        agent: true,
                    },
                },
                article: true,
            },
        })
        return draft
    } catch (error) {
        console.error(`[Draft Page] Error fetching draft ${id}:`, error);
        throw error; // Let Next.js show an error page instead of a 404
    }
}

export default async function DraftDetailPage({ params }) {
    const draft = await getDraft(params.id)

    if (!draft) {
        notFound()
    }

    return <AdminDraftDetailContent draft={draft} />
}
