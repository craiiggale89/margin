const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const counts = {
        pitches: await prisma.pitch.count(),
        drafts: await prisma.draft.count(),
        articles: await prisma.article.count(),
        agents: await prisma.agent.count()
    }
    console.log('Database Counts:', counts)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
