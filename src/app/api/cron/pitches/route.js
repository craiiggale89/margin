import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { generatePitch } from '@/lib/ai'

export const dynamic = 'force-dynamic' // Ensure Vercel doesn't cache this

export async function GET(request) {
    console.log('[Cron] Pitch generation triggered');
    try {
        // Authenticate Cron Request
        const authHeader = request.headers.get('authorization')
        const { searchParams } = new URL(request.url)
        const key = searchParams.get('key')
        const isDebug = searchParams.get('debug') === 'true'

        const CRON_SECRET = process.env.CRON_SECRET

        // Logging auth status (safe)
        console.log('[Cron] Auth Header:', authHeader ? 'Present' : 'Missing');
        console.log('[Cron] Key Parameter:', key ? 'Present' : 'Missing');
        console.log('[Cron] CRON_SECRET configured:', CRON_SECRET ? 'Yes' : 'No');

        const isValid = (authHeader === `Bearer ${CRON_SECRET}`) || (key === CRON_SECRET)

        // Allow debug mode in development without secret
        const allowDebug = (process.env.NODE_ENV === 'development' && isDebug)

        if (!isValid && !allowDebug) {
            console.error('[Cron] Unauthorized access attempt');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (allowDebug) {
            console.log('[Cron] Running in DEBUG mode (unauthenticated)');
        }

        // Fetch Active Agents
        const agents = await prisma.agent.findMany({
            where: { active: true }
        })

        console.log(`[Cron] Found ${agents.length} active agents`);

        if (!agents.length) {
            console.log('[Cron] No active agents - terminating');
            return NextResponse.json({ message: 'No active agents found' })
        }

        // Generate Pitches
        const results = []

        console.log('[Cron] Starting pitch generation for agents:', agents.map(a => a.name).join(', '));

        const promises = agents.map(async (agent) => {
            try {
                console.log(`[Cron] Generating pitch for agent: ${agent.name}`);
                const pitchContent = await generatePitch({ agent })

                console.log(`[Cron] Pitch generated for ${agent.name}: "${pitchContent.title}"`);

                const pitch = await prisma.pitch.create({
                    data: {
                        title: pitchContent.title,
                        standfirst: pitchContent.standfirst,
                        angle: pitchContent.angle,
                        whyNow: pitchContent.whyNow,
                        contextLabel: pitchContent.contextLabel,
                        estimatedTime: 5,
                        agentId: agent.id,
                        status: 'SUBMITTED',
                    }
                })
                console.log(`[Cron] Pitch saved to DB for ${agent.name} with ID: ${pitch.id}`);
                return { agent: agent.name, status: 'success', pitchId: pitch.id }
            } catch (e) {
                console.error(`[Cron] Failed for agent ${agent.name}:`, e)
                return { agent: agent.name, status: 'failed', error: e.message }
            }
        })

        results.push(...await Promise.all(promises))

        console.log('[Cron] Pitch generation completed. Results:', JSON.stringify(results));

        return NextResponse.json({ success: true, results })

    } catch (error) {
        console.error('[Cron] Fatal error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
