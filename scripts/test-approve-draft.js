const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function approveDraft() {
    const draftId = 'cmjhifpn3000l1370x94bgswv';
    console.log(`Programmatically approving draft ${draftId}...`);

    try {
        const updated = await prisma.draft.update({
            where: { id: draftId },
            data: { status: 'APPROVED' }
        });
        console.log('Success:', updated.status);
    } catch (e) {
        console.error('Error:', e.message);
    }
}

approveDraft()
    .finally(() => prisma.$disconnect());
