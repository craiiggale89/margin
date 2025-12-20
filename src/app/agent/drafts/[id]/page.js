import { notFound } from 'next/navigation'
import prisma from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import AgentDraftDetailContent from '@/components/agent/AgentDraftDetailContent'

async function getDraft(id, userId) {
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

export default async function AgentDraftDetailPage({ params }) {
    const user = await getCurrentUser()
    const draft = await getDraft(params.id, user?.id)

    if (!draft) {
        notFound()
    }

    // Don't allow editing if already submitted or approved
    const isEditable = draft.status === 'DRAFT' || draft.status === 'REVISION_REQUESTED'

    return <AgentDraftDetailContent draft={draft} isEditable={isEditable} />
}
