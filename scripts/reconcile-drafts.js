const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function reconcile() {
    console.log('--- Reconciliation Started ---');
    try {
        const approvedWithoutDraft = await prisma.pitch.findMany({
            where: {
                status: 'APPROVED',
                draft: null
            },
            include: {
                agent: true
            }
        });

        console.log(`Found ${approvedWithoutDraft.length} orphaned approved pitches.`);

        for (const pitch of approvedWithoutDraft) {
            console.log(`Fixing Pitch: ${pitch.id} (${pitch.title})`);

            await prisma.draft.create({
                data: {
                    pitchId: pitch.id,
                    content: '<p>Standard draft placeholder during reconciliation. AI generation skipped to avoid timeouts.</p><p>Please use "Refine" to generate or edit content.</p>',
                    status: 'DRAFT',
                }
            });
            console.log(`- Draft created.`);
        }

        console.log('--- Reconciliation Finished ---');
    } catch (error) {
        console.error('Error during reconciliation:', error);
    } finally {
        await prisma.$disconnect();
    }
}

reconcile();
