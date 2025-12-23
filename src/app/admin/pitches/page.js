import prisma from '@/lib/db'
import { serializePrisma } from '@/lib/utils'
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
    } catch (error) {
        console.error('Failed to fetch pitches:', error)
        return []
    }
}

export default async function PitchesPage() {
    const pitches = await getPitches()
    const sPitches = serializePrisma(pitches)

    const pendingPitches = sPitches.filter(p => p.status === 'SUBMITTED' || p.status === 'IN_REVIEW')
    const otherPitches = sPitches.filter(p => p.status !== 'SUBMITTED' && p.status !== 'IN_REVIEW')

    return <AdminPitchesContent pendingPitches={pendingPitches} otherPitches={otherPitches} pitches={sPitches} />
}
