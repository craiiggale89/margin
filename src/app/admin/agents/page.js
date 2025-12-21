import prisma from '@/lib/db'
import { serializePrisma } from '@/lib/utils'
import AdminAgentsContent from '@/components/admin/AdminAgentsContent'

export const dynamic = 'force-dynamic'

async function getAgents() {
  try {
    const agents = await prisma.agent.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { pitches: true },
        },
      },
    })
    return agents
  } catch {
    return []
  }
}

export default async function AgentsPage() {
  const agents = await getAgents()
  return <AdminAgentsContent agents={serializePrisma(agents)} />
}
