const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const id = 'cmjfjvpl0003cfwplj18oblh'
    const draft = await prisma.draft.findUnique({
        where: { id },
        include: { pitch: true }
    })
    console.log('Draft:', draft)

    if (!draft) {
        // Try finding by id without include
        const draftOnly = await prisma.draft.findUnique({ where: { id } })
        console.log('Draft (no include):', draftOnly)
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
