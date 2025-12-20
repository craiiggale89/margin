import prisma from '@/lib/db'
import AdminAgentsContent from '@/components/admin/AdminAgentsContent'

async function getAgents() {
  try {
    const agents = await prisma.agent.findMany({
      include: {
        _count: {
          select: {
            pitches: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return agents
  } catch {
    return []
  }
}

export default async function AgentsPage() {
  const agents = await getAgents()
  return <AdminAgentsContent agents={agents} />
}
