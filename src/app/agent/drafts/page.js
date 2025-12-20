import prisma from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import AgentDraftsContent from '@/components/agent/AgentDraftsContent'

async function getAgentDrafts(userId) {
    try {
        // Get agent for user (or first active agent for demo)
        let agent = await prisma.agent.findFirst({
            where: { userId, active: true },
        })

        if (!agent) {
            agent = await prisma.agent.findFirst({
                where: { active: true },
            })
        }

        if (!agent) return []

        const drafts = await prisma.draft.findMany({
            where: {
                pitch: { agentId: agent.id },
            },
            include: {
                pitch: true,
                article: true,
            },
            orderBy: { updatedAt: 'desc' },
        })

        return drafts
    } catch {
        return []
    }
}

export default async function AgentDraftsPage() {
    const user = await getCurrentUser()
    const drafts = await getAgentDrafts(user?.id)

    const activeDrafts = drafts.filter(d =>
        d.status === 'DRAFT' || d.status === 'REVISION_REQUESTED'
    )
    const submittedDrafts = drafts.filter(d =>
        d.status === 'SUBMITTED' || d.status === 'IN_REVIEW'
    )
    const completedDrafts = drafts.filter(d => d.status === 'APPROVED')

    return (
        <AgentDraftsContent
            drafts={drafts}
            activeDrafts={activeDrafts}
            submittedDrafts={submittedDrafts}
            completedDrafts={completedDrafts}
        />
    )
}
