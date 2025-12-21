import prisma from '@/lib/db'
import { serializePrisma } from '@/lib/utils'
import AdminDraftsContent from '@/components/admin/AdminDraftsContent'

async function getDrafts() {
    try {
        const drafts = await prisma.draft.findMany({
            include: {
                pitch: {
                    include: {
                        agent: true,
                    },
                },
            },
            orderBy: [
                { status: 'asc' },
                { updatedAt: 'desc' },
            ],
        })
        return drafts
    } catch {
        return []
    }
}

export default async function DraftsPage() {
    const drafts = await getDrafts()
    const sDrafts = serializePrisma(drafts)

    const submittedDrafts = sDrafts.filter(d => d.status === 'SUBMITTED' || d.status === 'IN_REVIEW')
    const otherDrafts = sDrafts.filter(d => d.status !== 'SUBMITTED' && d.status !== 'IN_REVIEW')

    return <AdminDraftsContent drafts={sDrafts} submittedDrafts={submittedDrafts} otherDrafts={otherDrafts} />
}
