import prisma from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import AgentPitchesContent from '@/components/agent/AgentPitchesContent'

async function getAgentPitches(userId) {
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

        const pitches = await prisma.pitch.findMany({
            where: { agentId: agent.id },
            include: { draft: true },
            orderBy: { createdAt: 'desc' },
        })

        return pitches
    } catch {
        return []
    }
}

export default async function AgentPitchesPage() {
    const user = await getCurrentUser()
    const pitches = await getAgentPitches(user?.id)

    const activePitches = pitches.filter(p =>
        p.status === 'SUBMITTED' || p.status === 'IN_REVIEW' || p.status === 'REVISION_REQUESTED'
    )
    const approvedPitches = pitches.filter(p => p.status === 'APPROVED')
    const rejectedPitches = pitches.filter(p => p.status === 'REJECTED')

    return (
        <AgentPitchesContent
            activePitches={activePitches}
            approvedPitches={approvedPitches}
            rejectedPitches={rejectedPitches}
            pitchesLength={pitches.length}
        />
    )
}
