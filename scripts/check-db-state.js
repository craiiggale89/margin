const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: { id: true, email: true, role: true, name: true }
    });
    console.log('Users in DB:');
    console.table(users);

    const drafts = await prisma.draft.findMany({
        include: {
            pitch: true,
            article: true
        }
    });

    console.log('\nDrafts in DB:');
    drafts.forEach(d => {
        console.log(`- ID: ${d.id}, Status: ${d.status}, Pitch: ${d.pitch?.title}, Article: ${d.article ? 'Present' : 'None'}`);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
