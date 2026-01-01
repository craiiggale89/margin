const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const articles = await prisma.article.findMany({
        include: { draft: true }
    })

    console.log('--- Articles and their Draft IDs ---')
    articles.forEach(a => {
        console.log(`Article: ${a.title}`)
        console.log(`  Draft ID: ${a.draftId}`)
        console.log(`  Draft Status: ${a.draft ? a.draft.status : 'MISSING'}`)
    })
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
