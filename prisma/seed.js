const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // Create Editor user
    const editorPassword = await bcrypt.hash('editor123', 10)
    const editor = await prisma.user.upsert({
        where: { email: 'editor@margin.pub' },
        update: {},
        create: {
            email: 'editor@margin.pub',
            password: editorPassword,
            name: 'Editorial Team',
            role: 'EDITOR',
        },
    })
    console.log('Created editor:', editor.email)

    // Create Agent user
    const agentPassword = await bcrypt.hash('agent123', 10)
    const agentUser = await prisma.user.upsert({
        where: { email: 'agent@margin.pub' },
        update: {},
        create: {
            email: 'agent@margin.pub',
            password: agentPassword,
            name: 'Contributor',
            role: 'AGENT',
        },
    })
    console.log('Created agent user:', agentUser.email)

    // Create Contributor Agent profiles
    const newAgents = [
        {
            id: 'the-wire',
            name: 'The Wire (Agenda Setter)',
            focus: 'Surface timely but non-reactive article ideas grounded in recent sport events or discourse.',
            constraints: 'Pitch angles that explain why something matters beyond today. Connect events to preparation, decision-making, or long-term performance. Ask questions others are not asking yet. AVOID: Recaps, breaking-news tone, gossip, summaries. MANDATORY FORMAT: Headline, Standfirst, Why now, What’s genuinely new here, Evidence/context.',
            active: true,
            userId: agentUser.id
        },
        {
            id: 'cycling-tactics',
            name: 'Cycling: Racecraft & Tactics',
            focus: 'Analyse race dynamics and decision-making under fatigue.',
            constraints: 'Pitch tactical decisions, pacing errors, team choices, selection moments. AVOID: stage-by-stage recaps, hero worship, equipment gossip. NON-NEGOTIABLE: Every pitch must centre on a decision point and explain alternatives.',
            active: true,
            userId: agentUser.id
        },
        {
            id: 'running-dynamics',
            name: 'Running: Pacing & Dynamics',
            focus: 'Explain how running races are shaped by pacing, positioning, and constraint.',
            constraints: 'Pitch pacing errors, surges and hesitation, course effects, drafting and positioning. AVOID: PB celebration stories, shoe hype, generic race reports. NON-NEGOTIABLE: The reader should finish understanding how the race unfolded, not just who ran fast.',
            active: true,
            userId: agentUser.id
        },
        {
            id: 'training-systems',
            name: 'Training Systems',
            focus: 'Explore how performance is built over time through systems and consistency.',
            constraints: 'Pitch training philosophy, load management, long arcs of adaptation, why systems succeed or fail. AVOID: prescriptive plans, weekly schedules, "do this workout" advice. NON-NEGOTIABLE: Explain why, never how to copy.',
            active: true,
            userId: agentUser.id
        },
        {
            id: 'fuel-recovery',
            name: 'Fuel & Recovery Decisions',
            focus: 'Treat nutrition and recovery as strategic decisions with trade-offs.',
            constraints: 'Pitch fueling choices under constraint, recovery compromises, sleep, stress, timing decisions. AVOID: macros, meal plans, supplements as solutions. NON-NEGOTIABLE: Every pitch must identify what is gained and what is lost.',
            active: true,
            userId: agentUser.id
        },
        {
            id: 'aftermath',
            name: 'Aftermath (Injury / Return)',
            focus: 'Examine what performance leaves behind once competition ends.',
            constraints: 'Pitch injury cycles, burnout, confidence loss and return, decline and adaptation. AVOID: medical advice, diagnosis, miracle comeback narratives. LANGUAGE RULE: Use cautious, observational language. Uncertainty must be acknowledged.',
            active: true,
            userId: agentUser.id
        },
        {
            id: 'long-view',
            name: 'The Long View',
            focus: 'Use history, past eras, and old ideas to inform present performance.',
            constraints: 'Pitch historical parallels, technology shifts, old ideas resurfacing. AVOID: nostalgia, trivia, "greatest ever" framing. NON-NEGOTIABLE: Every pitch must clearly link past insight to current performance thinking.',
            active: true,
            userId: agentUser.id
        },
        {
            id: 'pattern-interpreter',
            name: 'The Pattern Interpreter (Gladwell-type)',
            focus: 'Identify counterintuitive patterns and second-order effects in endurance performance.',
            constraints: 'Pitch ideas where outcomes don’t match intuition, small causes with large effects, hidden system interactions. AVOID: anecdote-led conclusions, pop psychology. NON-NEGOTIABLE: State the counterintuitive insight clearly in the pitch.',
            active: true,
            userId: agentUser.id
        },
        {
            id: 'growth-error',
            name: 'The Growth & Error Analyst (Syed-type)',
            focus: 'Examine how learning, error interpretation, and feedback shape performance.',
            constraints: 'Pitch misinterpreted failures, learning loops, systemic vs individual error. AVOID: motivational language, mindset clichés. NON-NEGOTIABLE: Show how interpretation of error changes behaviour over time.',
            active: true,
            userId: agentUser.id
        },
        {
            id: 'provocateur',
            name: 'The Provocateur (Clarkson-type)',
            focus: 'Challenge orthodoxies and expose weak assumptions.',
            constraints: 'Pitch arguments that unsettle comfortable narratives, critiques grounded in evidence. AVOID: insults, sneering tone, culture-war bait. EDITOR RULE: Claims must be defensible. This agent is held to a higher bar.',
            active: true,
            userId: agentUser.id
        }
    ];

    for (const agentData of newAgents) {
        await prisma.agent.upsert({
            where: { id: agentData.id },
            update: agentData,
            create: agentData,
        })
        console.log(`Upserted agent: ${agentData.name}`)
    }

    // Get first agent for demo pitch
    const agent = await prisma.agent.findFirst({ where: { active: true } });

    // Create sample pitch
    const pitch = await prisma.pitch.upsert({
        where: { id: 'demo-pitch' },
        update: {},
        create: {
            id: 'demo-pitch',
            title: 'The Long Game: How Preparation Compounds Over Years',
            standfirst: 'An examination of how the most successful endurance athletes approach multi-year training cycles, and why the decisions made in January often decide results in July.',
            angle: 'This piece will explore the relationship between long-term planning and peak performance, drawing on examples from professional cycling and marathon running. The focus will be on the systems and processes that underpin sustained success rather than single-season results.',
            whyNow: 'With the 2024 Olympic cycle complete, many athletes are now in the early stages of planning for 2028. This is a natural moment to examine how elite athletes think about time.',
            contextLabel: 'Performance',
            estimatedTime: 12,
            status: 'APPROVED',
            agentId: agent.id,
        },
    })
    console.log('Created pitch:', pitch.title)

    // Create draft for the pitch
    const draft = await prisma.draft.upsert({
        where: { pitchId: pitch.id },
        update: {},
        create: {
            pitchId: pitch.id,
            content: `<p>Tadej Pogačar won the 2024 Tour de France by nearly six minutes. But the decisions that made that margin possible were not made in July. They were made years earlier.</p>

<p>Elite endurance performance is rarely the product of a single season of preparation. The athletes who consistently reach the highest levels share a common trait: they think in years, not months. Their training is not a sprint to the next race, but a patient accumulation of capacity over time.</p>

<h2>The Architecture of Long-Term Planning</h2>

<p>When Ineos Grenadiers signs a young rider, they are not optimising for immediate results. They are building a system. Training loads are modulated not just for the current season, but with an eye on development curves that span three to five years.</p>

<p>This approach requires discipline. It means holding back in moments when more might be possible, trusting that restraint now will pay dividends later. It means accepting that some seasons will be investments rather than returns.</p>

<h2>The Role of Consistency</h2>

<p>What separates the very best from the merely excellent is often not peak capacity, but the ability to train consistently over extended periods without interruption. Injuries, illness, and burnout are the enemies of long-term development.</p>

<p>The athletes who reach the pinnacle tend to be those who have found sustainable rhythms—who have learned to listen to their bodies, to respect recovery, and to resist the temptation to do more than is wise.</p>

<p>This is not glamorous work. It is the accumulation of thousands of small decisions, each one reinforcing the next.</p>`,
            status: 'APPROVED',
        },
    })
    console.log('Created draft')

    // Create published article
    const article = await prisma.article.upsert({
        where: { slug: 'the-long-game' },
        update: {},
        create: {
            slug: 'the-long-game',
            title: 'The Long Game: How Preparation Compounds Over Years',
            standfirst: 'An examination of how the most successful endurance athletes approach multi-year training cycles, and why the decisions made in January often decide results in July.',
            content: draft.content,
            contextLabel: 'Performance',
            byline: 'By Margin',
            readingTime: 12,
            featured: true,
            sportFilter: 'Cycling',
            draftId: draft.id,
            publishedAt: new Date('2024-12-15'),
        },
    })
    console.log('Created article:', article.title)

    // Create a second article
    const pitch2 = await prisma.pitch.upsert({
        where: { id: 'recovery-pitch' },
        update: {},
        create: {
            id: 'recovery-pitch',
            title: 'After the Finish Line: What Recovery Actually Means',
            standfirst: 'The race is over, the result recorded. But for the athlete, a different kind of work is just beginning. Understanding recovery reveals as much about performance as the event itself.',
            angle: 'This piece examines recovery not as the absence of training, but as an active process shaped by physiology, psychology, and time.',
            contextLabel: 'After',
            estimatedTime: 8,
            status: 'APPROVED',
            agentId: agent.id,
        },
    })

    const draft2 = await prisma.draft.upsert({
        where: { pitchId: pitch2.id },
        update: {},
        create: {
            pitchId: pitch2.id,
            content: `<p>Three hours after crossing the finish line of a Grand Tour stage, most riders are not celebrating. They are managing fatigue.</p>

<p>Recovery is often misunderstood as rest. But at the elite level, it is something far more deliberate—a process that begins the moment competition ends and continues until the body is ready to absorb training stress again.</p>

<h2>The Physiology of Coming Back</h2>

<p>Hard efforts deplete glycogen stores, create muscle damage, and elevate stress hormones. The body's response to these stressors follows predictable patterns, but the timeline varies between individuals.</p>

<p>Some athletes bounce back quickly. Others require more time. Understanding your own recovery profile is as important as knowing your threshold power or lactate curve.</p>

<h2>Sleep as Performance</h2>

<p>No recovery intervention matches the effectiveness of sleep. Yet many athletes underestimate its importance, treating it as time away from training rather than an essential component of it.</p>

<p>The best teams now employ sleep coaches. They track sleep quality with the same attention they give to power files. They understand that the gains made in bed rival those made on the road.</p>`,
            status: 'APPROVED',
        },
    })

    const article2 = await prisma.article.upsert({
        where: { slug: 'after-the-finish-line' },
        update: {},
        create: {
            slug: 'after-the-finish-line',
            title: 'After the Finish Line: What Recovery Actually Means',
            standfirst: 'The race is over, the result recorded. But for the athlete, a different kind of work is just beginning.',
            content: draft2.content,
            contextLabel: 'After',
            byline: 'By Margin',
            readingTime: 8,
            featured: false,
            sportFilter: 'Cycling',
            draftId: draft2.id,
            publishedAt: new Date('2024-12-10'),
        },
    })
    console.log('Created article:', article2.title)

    // Link articles as related
    try {
        await prisma.articleRelation.create({
            data: {
                fromId: article.id,
                toId: article2.id,
            },
        })
        await prisma.articleRelation.create({
            data: {
                fromId: article2.id,
                toId: article.id,
            },
        })
        console.log('Linked articles as related')
    } catch (e) {
        console.log('Article relations already exist or failed to link.')
    }

    console.log('\n✓ Database seeded successfully!')
    console.log('\nDemo credentials:')
    console.log('  Editor: editor@margin.pub / editor123')
    console.log('  Agent:  agent@margin.pub / agent123')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
