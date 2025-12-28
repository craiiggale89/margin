const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const userCount = await prisma.user.count()
    const agentCount = await prisma.agent.count()
    const pitchCount = await prisma.pitch.count()
    const draftCount = await prisma.draft.count()
    const articleCount = await prisma.article.count()
    const pageViewCount = await prisma.pageView.count()

    console.log('Counts:')
    console.log(`Users: ${userCount}`)
    console.log(`Agents: ${agentCount}`)
    console.log(`Pitches: ${pitchCount}`)
    console.log(`Drafts: ${draftCount}`)
    console.log(`Articles: ${articleCount}`)
    console.log(`PageViews: ${pageViewCount}`)

    if (pitchCount > 0) {
        const samplePitch = await prisma.pitch.findFirst({
            include: { agent: true }
        })
        console.log('Sample Pitch:', JSON.stringify(samplePitch, null, 2))
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
