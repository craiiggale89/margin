import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { generatePitch } from '@/lib/ai'

export const dynamic = 'force-dynamic' // Ensure Vercel doesn't cache this

export async function GET(request) {
    try {
        // Authenticate Cron Request
        const authHeader = request.headers.get('authorization')
        const { searchParams } = new URL(request.url)
        const key = searchParams.get('key')

        const CRON_SECRET = process.env.CRON_SECRET

        const validUnauthenticated = process.env.NODE_ENV === 'development' // Allow dev testing without secret if needed, or strictly enforce.
        // Better to strictly enforce if possible, but for local dev URL params are easier.

        const isValid = (authHeader === `Bearer ${CRON_SECRET}`) || (key === CRON_SECRET)

        if (!isValid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch Active Agents
        const agents = await prisma.agent.findMany({
            where: { active: true }
        })

        if (!agents.length) {
            return NextResponse.json({ message: 'No active agents found' })
        }

        // Generate Pitches
        const results = []

        // Sequential generation to avoid hitting rate limits (though concurrent is faster)
        // Using Promise.all for speed, assuming OpenAI rate limits allow ~10 requests.
        const promises = agents.map(async (agent) => {
            try {
                const pitchContent = await generatePitch({ agent }) // Topic is undefined, so random/news based

                const pitch = await prisma.pitch.create({
                    data: {
                        title: pitchContent.title,
                        standfirst: pitchContent.standfirst,
                        angle: pitchContent.angle,
                        whyNow: pitchContent.whyNow,
                        contextLabel: pitchContent.contextLabel,
                        estimatedTime: 5, // Default
                        agentId: agent.id,
                        status: 'SUBMITTED',
                    }
                })
                return { agent: agent.name, status: 'success', pitchId: pitch.id }
            } catch (e) {
                console.error(`Failed for ${agent.name}:`, e)
                return { agent: agent.name, status: 'failed', error: e.message }
            }
        })

        results.push(...await Promise.all(promises))

        return NextResponse.json({ success: true, results })

    } catch (error) {
        console.error('Cron Pitch Generation Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
