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
    } catch {
        return null
    }
}

export default async function DraftDetailPage({ params }) {
    const draft = await getDraft(params.id)

    if (!draft) {
        notFound()
    }

    return <AdminDraftDetailContent draft={draft} />
}
