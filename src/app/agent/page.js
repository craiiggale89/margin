import prisma from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import AgentDashboardContent from '@/components/agent/AgentDashboardContent'

async function getAgentData(userId) {
    try {
        // Get agent associated with user (or first active agent for demo)
        let agent = await prisma.agent.findFirst({
            where: { userId, active: true },
        })

        // Fallback: get first active agent for demo purposes
        if (!agent) {
            agent = await prisma.agent.findFirst({
                where: { active: true },
            })
        }

        if (!agent) return null

        // Get pitch and draft counts
        const [pitchCounts, draftCounts] = await Promise.all([
            prisma.pitch.groupBy({
                by: ['status'],
                where: { agentId: agent.id },
                _count: true,
            }),
            prisma.draft.findMany({
                where: {
                    pitch: { agentId: agent.id },
                },
                select: { status: true },
            }),
        ])

        return {
            agent,
            pitchCounts: pitchCounts.reduce((acc, item) => {
                acc[item.status] = item._count
                return acc
            }, {}),
            draftCounts: draftCounts.reduce((acc, item) => {
                acc[item.status] = (acc[item.status] || 0) + 1
                return acc
            }, {}),
        }
    } catch {
        return null
    }
}

export default async function AgentDashboard() {
    const user = await getCurrentUser()
    const data = await getAgentData(user?.id)

    if (!data) {
        return <AgentDashboardContent agent={null} />
    }

    const { agent, pitchCounts, draftCounts } = data
    const pendingPitches = (pitchCounts.SUBMITTED || 0) + (pitchCounts.IN_REVIEW || 0)
    const approvedPitches = pitchCounts.APPROVED || 0
    const activeDrafts = (draftCounts.DRAFT || 0) + (draftCounts.REVISION_REQUESTED || 0)

    return (
        <AgentDashboardContent
            agent={agent}
            pitchCounts={pitchCounts}
            draftCounts={draftCounts}
            pendingPitches={pendingPitches}
            approvedPitches={approvedPitches}
            activeDrafts={activeDrafts}
        />
    )
}
