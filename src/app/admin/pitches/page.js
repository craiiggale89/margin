import prisma from '@/lib/db'
import AdminPitchesContent from '@/components/admin/AdminPitchesContent'

async function getPitches() {
    try {
        const pitches = await prisma.pitch.findMany({
            include: {
                agent: true,
            },
            orderBy: [
                { status: 'asc' },
                { createdAt: 'desc' },
            ],
        })
        return pitches
    } catch {
        return []
    }
}

export default async function PitchesPage() {
    const pitches = await getPitches()

    const pendingPitches = pitches.filter(p => p.status === 'SUBMITTED' || p.status === 'IN_REVIEW')
    const otherPitches = pitches.filter(p => p.status !== 'SUBMITTED' && p.status !== 'IN_REVIEW')

    return <AdminPitchesContent pendingPitches={pendingPitches} otherPitches={otherPitches} pitches={pitches} />
}
