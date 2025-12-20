import prisma from '@/lib/db'
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

    const submittedDrafts = drafts.filter(d => d.status === 'SUBMITTED' || d.status === 'IN_REVIEW')
    const otherDrafts = drafts.filter(d => d.status !== 'SUBMITTED' && d.status !== 'IN_REVIEW')

    return <AdminDraftsContent drafts={drafts} submittedDrafts={submittedDrafts} otherDrafts={otherDrafts} />
}
