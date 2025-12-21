import prisma from '@/lib/db'
import { serializePrisma } from '@/lib/utils'
import AdminPitchesContent from '@/components/admin/AdminPitchesContent'

// ... (Pitches list mapping) ...

export default async function PitchesPage() {
    const pitches = await getPitches()
    const sPitches = serializePrisma(pitches)

    const pendingPitches = sPitches.filter(p => p.status === 'SUBMITTED' || p.status === 'IN_REVIEW')
    const otherPitches = sPitches.filter(p => p.status !== 'SUBMITTED' && p.status !== 'IN_REVIEW')

    return <AdminPitchesContent pendingPitches={pendingPitches} otherPitches={otherPitches} pitches={sPitches} />
}
