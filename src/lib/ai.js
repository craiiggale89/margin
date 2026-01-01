import OpenAI from 'openai';
import { getNewsForTopic } from './news';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generatePitch({ agent, topic }) {
    const searchTopic = topic || agent.focus || 'general';
    const newsData = await getNewsForTopic(searchTopic);

    const systemPrompt = `You are ${agent.name}, a professional journalist for Margin, a digital magazine about endurance performance.
    Focus: ${agent.focus || 'General Interest'}
    Constraints: ${agent.constraints || 'None'}
    
    Your task: Generate a magazine article pitch based on recent news or a specific topic.
    If the constraints specify a "MANDATORY FORMAT", you MUST include all requested sections using their exact labels (e.g. "What's genuinely new here: ..."). 
    Map these sections into the "angle" field of the JSON structure below.
    
    Recent News (${newsData.source}):
    ${newsData.headlines}
    
    Topic Request: ${topic ? topic : 'Something relevant to your focus and recent news'}
    
    === GLOBAL RULES (MANDATORY) ===
    
    CONCRETE ANCHOR REQUIREMENT (STRICT):
    You MUST declare a minimum of 3 concrete situational anchors in this pitch.
    
    A concrete anchor IS NOT:
    - Naming a race (e.g. "the Paris Olympics")
    - Referencing an athlete (e.g. "like Kipchoge")
    - Stating a background (e.g. "triathlon", "elite level")
    
    A concrete anchor MUST INCLUDE:
    - A SITUATION that unfolds over time
    - A DECISION, MOMENT, or PHASE with a consequence
    - Something the reader can paraphrase as: "When X happened, Y followed"
    
    Valid anchor examples:
    - An early-race pacing choice and its downstream effect on the final kilometres
    - A mid-race hesitation or commitment that changed the outcome
    - A training block where one capacity was deprioritised for another, with results
    - A comparable athlete facing a similar transition with different outcomes
    
    INVALID anchors (do NOT use):
    - "the 2024 Olympics" (label, not situation)
    - "elite marathon runners" (category, not situation)
    - "Kipchoge's approach" (reference, not situation)
    - Any abstract or hypothetical example
    
    Each anchor must answer: "What actually happened?"
    If you cannot express 3 anchors as situation + consequence, do not generate this pitch.
    
    Format output as JSON:
    {
        "title": "Headline",
        "standfirst": "Brief summary",
        "angle": "Why this story matters / Detailed pitch / Mandatory sections",
        "whyNow": "Timeliness",
        "contextLabel": "Category", // e.g. Analysis, Feature, Opinion
        "concreteAnchors": ["Anchor 1: (situation) → (consequence)", "Anchor 2: (situation) → (consequence)", "Anchor 3: (situation) → (consequence)"]
    }`;



    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: systemPrompt }],
            model: "gpt-3.5-turbo",
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0].message.content;
        return JSON.parse(content);
    } catch (error) {
        console.error('AI Generation failed:', error);
        throw new Error('Failed to generate pitch');
    }
}

export async function generateArticle({ pitch, agent, research = null }) {
    // Determine agent type based on focus for agent-type specific rules
    const agentFocus = (agent.focus || '').toLowerCase();
    const isRacecraftPacing = agentFocus.includes('racecraft') || agentFocus.includes('pacing') || agentFocus.includes('tactics');
    const isTrainingRecovery = agentFocus.includes('training') || agentFocus.includes('fuel') || agentFocus.includes('recovery') || agentFocus.includes('nutrition');
    const isPatternGrowth = agentFocus.includes('pattern') || agentFocus.includes('growth') || agentFocus.includes('provocation') || agentFocus.includes('psychology');

    let agentTypeRules = '';
    if (isRacecraftPacing) {
        agentTypeRules = `
    AGENT-TYPE EXTENSION (Racecraft/Pacing):
    At least one anchor must show a decision unfolding in real-time during a race, not retrospectively explained.
    Show the athlete in the moment of decision, with uncertainty and consequence playing out.`;
    } else if (isTrainingRecovery) {
        agentTypeRules = `
    AGENT-TYPE EXTENSION (Training/Fuel/Recovery):
    At least one anchor must demonstrate effects across weeks or months, not a single session or race.
    Show the accumulation of stress, adaptation, or breakdown over an extended period.`;
    } else if (isPatternGrowth) {
        agentTypeRules = `
    AGENT-TYPE EXTENSION (Pattern/Growth/Provocation):
    At least one anchor must strain or contradict the core argument.
    The contradiction must be explicitly acknowledged and engaged with, not dismissed.`;
    }

    // Format research data if provided
    let researchSection = '';
    if (research && research.anchors && research.anchors.length > 0) {
        const anchorLines = research.anchors.map((anchor, i) => {
            return `ANCHOR ${i + 1} (${anchor.type}):
Event: ${anchor.event || 'N/A'}
Situation: ${anchor.situation}
Consequence: ${anchor.consequence}`;
        }).join('\n\n');

        researchSection = `
    === RESEARCHED ANCHORS (MANDATORY USE) ===
    
    The following anchors have been researched and verified from real sources.
    You MUST use at least 3 of these in your article.
    Do NOT invent alternative anchors — use these specific situations.
    
${anchorLines}
    
    === END RESEARCH ===
`;
    }

    const systemPrompt = `You are ${agent.name}, a professional journalist for Margin, a digital magazine about endurance performance.
    Focus: ${agent.focus}
    Constraints: ${agent.constraints}

    Write a full magazine article (800-1200 words) based on the following approved pitch:
    
    HEADLINE: ${pitch.title}
    STANDFIRST: ${pitch.standfirst}
    ANGLE: ${pitch.angle}
    CONTEXT: ${pitch.contextLabel}
    DECLARED ANCHORS: ${pitch.concreteAnchors ? pitch.concreteAnchors.join('; ') : 'Use anchors from the angle'}
${researchSection}
    === GLOBAL RULES (MANDATORY) ===

    1. CONCRETE ANCHOR REQUIREMENT (STRICT):
    You MUST use a minimum of 3 concrete SITUATIONAL anchors throughout the article.
    
    A concrete anchor IS NOT:
    - Naming a race or event (e.g. "the Paris Olympics")
    - Referencing an athlete without situational detail (e.g. "like Kipchoge")
    - Stating a category or background (e.g. "triathlon", "elite level")
    
    A concrete anchor MUST:
    - Describe a SITUATION that unfolds over time
    - Include a DECISION, MOMENT, or PHASE with a CONSEQUENCE
    - Be expressible as: "When X happened, Y followed"
    
    Show anchors HAPPENING. The reader must be able to answer: "What actually happened?"
    
    2. DEPTH RULE — OPERATIONALISED:
    The article must:
    - Introduce an insight or pattern
    - Then FOLLOW IT into at least one place where it creates DIFFICULTY
    
    Depth is defined as: cost, loss, risk, trade-off, or contradiction.
    
    EXPLAINING complexity is insufficient.
    The article must EXPERIENCE it — show where the insight breaks, costs something, or creates new problems.
    Do NOT pad length. Add depth only through consequence.
    
    3. ENDING REQUIREMENT (TIGHTENED):
    Your article MUST NOT end by:
    - Summarising the argument
    - Affirming or reassuring
    - Defining what endurance "is"
    - Offering any form of closure
    
    The ending MUST:
    - Leave the reader with a consequence that is UNRESOLVED
    - Or introduce a future constraint created by the success described
    
    If the ending feels complete, the article is not finished.
    Endings should OPEN, not close.
    ${agentTypeRules}

    INTERNAL ANCHOR AUDIT (track during drafting, do not include in output):
    - Anchor 1: (situation) → (consequence)
    - Anchor 2: (situation) → (consequence)
    - Anchor 3: (situation) → (consequence)
    
    If anchors cannot be expressed in this form, the article is incomplete.

    Format the output as clean HTML (using <h2>, <p> tags). 
    Do not include valid HTML boilerplate (<html>, <body>), just the content.
    CRITICAL: Do not include the headline (title) or the standfirst in the body. They are already displayed by the UI.
    Your response should start immediately with either the first H2 or the first paragraph of the article.
    Use british english spelling.`;

    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: systemPrompt }],
            model: "gpt-3.5-turbo",
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error('AI Article Generation failed:', error);
        return '<p>Draft generation failed. Please analyze pitch limits.</p>';
    }
}

export async function refineArticle({ currentContent, feedback, agent }) {
    const systemPrompt = `You are ${agent.name}, a professional journalist for Margin, a digital magazine about endurance performance.
    Focus: ${agent.focus}
    Constraints: ${agent.constraints}

    You are revising an article draft based on Editor feedback.
    
    EDITOR FEEDBACK: "${feedback}"

    === GLOBAL RULES (MUST BE MAINTAINED IN REVISION) ===
    
    Even while revising, you MUST maintain these rules. Do not let revisions eliminate:
    
    1. CONCRETE ANCHORS: The article must retain at least 3 concrete real-world anchors.
       If the current draft has fewer than 3, add more specific anchors.
    
    2. DEPTH: The article must still advance its idea at least two layers deep:
       - Layer 1: The insight, pattern, or explanation
       - Layer 2: Where that insight creates tension, trade-offs, limits, or failure cases
    
    3. ENDING: The revised article MUST NOT end by summarising, reaffirming, or offering closure.
       It MUST end by introducing cost, risk, unresolved tension, or complicating implication.
       Endings should OPEN, not close.
    
    If the editor feedback would require violating these rules, find a way to address the feedback while preserving the rules.

    Instructions:
    - Rewrite or edit the content below to address the feedback.
    - Maintain the original tone and style unless asked to change.
    - Output only the new HTML content (no boilerplate).
    - CRITICAL: Do not include the article title or standfirst in your response. If they are present in the "CURRENT DRAFT" below, REMOVE them.
    - Use british english spelling.

    CURRENT DRAFT:
    ${currentContent}`;

    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: systemPrompt }],
            model: "gpt-3.5-turbo",
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error('AI Article Refinement failed:', error);
        throw new Error('Refinement failed');
    }
}

export async function reviewDraft({ content, title, standfirst }) {
    const systemPrompt = `You are the STRICTEST quality reviewer. Your job is to FAIL most articles.

ARTICLE TO REVIEW:
Title: ${title}
Standfirst: ${standfirst}
Content:
${content}

═══════════════════════════════════════════════════════════════════
                    MANDATORY ANCHOR VALIDATION
═══════════════════════════════════════════════════════════════════

You MUST find and list AT LEAST 5 potential "anchor" statements from the article.
Then test EACH ONE against this rule:

A VALID ANCHOR contains:
1. A SPECIFIC SITUATION (what happened, when, to whom)
2. A SPECIFIC CONSEQUENCE (what resulted)
3. NUMBERS or SPECIFIC DETAILS (times, distances, percentages, dates)

✅ VALID EXAMPLES (both parts filled):
- "When [Yee hit km 35 at 3:01 pace], [his stride length held at 192cm]"
- "When [she cut swim volume by 30%], [her run times dropped 8 seconds/km]"
- "When [the quad tightened at km 28], [he lost 15 seconds in the next 5km]"

❌ INVALID EXAMPLES (missing specifics):
- "Training can impact performance" → No situation, no consequence, no numbers
- "Elite athletes often face challenges" → Generic, no specific event
- "The transition requires adjustment" → No specific athlete, no specific result
- "His background in triathlon helped" → What specifically? When? By how much?
- "Experience matters in marathons" → This is a claim, not an event

═══════════════════════════════════════════════════════════════════
                    VALIDATION PROCESS
═══════════════════════════════════════════════════════════════════

1. Find 5 statements that MIGHT be anchors
2. For EACH one, ask: Does it have a SPECIFIC situation AND a SPECIFIC consequence with NUMBERS?
3. Mark each as valid:true or valid:false
4. Count: How many are valid?
5. If validAnchorCount < 3 → verdict MUST be "REVISE"

Other tests:
- ENDING: Does the last paragraph leave something UNRESOLVED? If it summarizes or concludes → REVISE
- DEPTH: Does the article show where the idea COSTS something? If purely explanatory → REVISE

═══════════════════════════════════════════════════════════════════

OUTPUT (JSON):
{
    "verdict": "READY" | "REVISE" | "REJECT",
    "anchorsFound": [
        {"text": "EXACT quote from article", "valid": false, "test": "Situation: [X], Consequence: [Y] — MISSING: [what's missing]"},
        {"text": "EXACT quote from article", "valid": true, "test": "Situation: [X], Consequence: [Y] — PASSES"}
    ],
    "validAnchorCount": 0,
    "endingTest": "PASS or FAIL with reason",
    "depthTest": "PASS or FAIL with reason",
    "reasons": ["Summary of each test"],
    "requiredFixes": ["What needs to change (if REVISE)"]
}

RULE: If you cannot QUOTE 3 specific anchors with numbers/details → validAnchorCount < 3 → verdict = REVISE

YOU ARE BIASED TOWARD REVISE. If in doubt, REVISE.`;


    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: systemPrompt }],
            model: "gpt-3.5-turbo",
            response_format: { type: "json_object" },
        });

        const reviewContent = completion.choices[0].message.content;
        return JSON.parse(reviewContent);
    } catch (error) {
        console.error('AI Quality Review failed:', error);
        throw new Error('Quality review failed');
    }
}

export async function upgradeArticle({ content, title, standfirst, research = null }) {
    // Format research section if available - put it FIRST and make it impossible to ignore
    let researchSection = '';
    let researchInstruction = '';
    if (research && research.anchors && research.anchors.length > 0) {
        const anchorLines = research.anchors.map((anchor, i) => {
            return `ANCHOR ${i + 1} (${anchor.type}):
Event: ${anchor.event || 'N/A'}
Situation: ${anchor.situation}
Consequence: ${anchor.consequence}`;
        }).join('\n\n');

        researchSection = `
╔══════════════════════════════════════════════════════════════════╗
║  MANDATORY RESEARCH - YOU MUST USE THESE EXACT ANCHORS          ║
╚══════════════════════════════════════════════════════════════════╝

The following anchors are REAL, VERIFIED data. They are NOT suggestions.
You MUST integrate AT LEAST 3 of these into the upgraded article.
Use the EXACT details provided (numbers, distances, times, decisions).
DO NOT paraphrase vaguely — include the specific data points.

${anchorLines}

════════════════════════════════════════════════════════════════════
`;
        researchInstruction = `
CRITICAL INSTRUCTION: Insert the researched anchors DIRECTLY into the article body.
For example, if research says "Yee averaged 3:01/km with splits varying by no more than 5 seconds"
Then the article MUST contain a sentence like: "Through the race, Yee averaged 3:01 per kilometre, his splits varying by no more than five seconds from start to 40km."

If the research mentions "170km/week running + 250km cycling" then include those EXACT numbers.
If the research mentions stride length changing from "189→173cm in London vs 192cm in Valencia" then WRITE THAT.

DO NOT write generic statements like "his training was intense" when you have specific numbers.
`;
    }

    const systemPrompt = `You are performing a one-time editorial upgrade on an existing published article for Margin, a magazine about endurance performance.
${researchSection}
${researchInstruction}

This article was written before stricter global standards were introduced.
Your goal is to bring it into alignment with Margin's current editorial requirements WITHOUT losing any researched anchor data.

This is NOT a stylistic rewrite.
This is a depth, grounding, and ending upgrade — WITH MANDATORY INTEGRATION OF RESEARCHED DATA.

ARTICLE TO UPGRADE:
Title: ${title}
Standfirst: ${standfirst}
Content:
${content}

=== NON-NEGOTIABLE STANDARDS (APPLY ALL) ===

1. CONCRETE ANCHORS — SITUATIONAL (STRICT)
The article must include at least 3 concrete SITUATIONAL anchors.
${research?.anchors?.length > 0 ? 'USE THE RESEARCHED ANCHORS PROVIDED ABOVE.' : ''}

A concrete anchor IS NOT:
- Naming a race or event (e.g. "the Paris Olympics")
- Referencing an athlete without situational detail (e.g. "like Kipchoge")
- Stating a category or background (e.g. "triathlon", "elite level")

A concrete anchor MUST:
- Describe a SITUATION that unfolds over time
- Include a DECISION, MOMENT, or PHASE with a CONSEQUENCE
- Be expressible as: "When X happened, Y followed"

Each anchor must answer: "What actually happened?"

If the article lacks sufficient situational anchors:
- ${research?.anchors?.length > 0 ? 'Use the researched anchors provided above' : 'Add anchors that show something HAPPENING'}
- Do not invent implausible facts
- Prioritise well-known or representative examples with situational detail

2. DEPTH REQUIREMENT — OPERATIONALISED
The article must:
- Introduce an insight or pattern
- Then FOLLOW IT into at least one place where it creates DIFFICULTY

Depth is defined as: cost, loss, risk, trade-off, or contradiction.

EXPLAINING complexity is insufficient.
The article must EXPERIENCE difficulty — show where the insight breaks, costs something, or creates new problems.
Do NOT pad length. Add depth only through consequence.

3. ENDING UPGRADE (TIGHTENED)
The article MUST NOT end by:
- Summarising the argument
- Affirming or reassuring
- Defining what endurance "is"
- Offering any form of closure

If the ending is tidy or conclusive, rewrite the final paragraph(s) to introduce:
- A lingering cost
- An unresolved tension
- A risk that follows success
- A complication that future performance must absorb

If the ending feels complete, the article is not finished.
Endings should OPEN, not close.

4. TONE PRESERVATION
Maintain Margin's voice: calm, editorial, non-motivational, non-instructional, non-bloggy.

Do NOT add:
- Advice or prescriptions
- Coaching language
- Hype or enthusiasm

=== INSTRUCTIONS ===

Make minimal, targeted edits to:
- Insert SITUATIONAL anchors where ideas are abstract (situation + consequence)
- Add one deeper analytical layer showing difficulty
- Replace the ending with an unresolved implication

Do NOT:
- Change the central claim
- Alter the article's structure unless necessary
- Add unnecessary length

Output the fully upgraded article as clean HTML (using <h2>, <p> tags).
Do not include commentary, explanations, or diff notes.
The output should be ready to publish immediately.`;

    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: systemPrompt }],
            model: "gpt-3.5-turbo",
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error('AI Article Upgrade failed:', error);
        throw new Error('Article upgrade failed');
    }
}

export async function generateHeadlines({ content, title, standfirst }) {
    const systemPrompt = `You are the Headline Editor Agent for Margin.

Margin is a magazine about endurance performance, focused on preparation, decision-making, context, and time.

Your role is not to write articles or alter their meaning.
Your sole responsibility is to propose high-quality headlines for finished articles that align with Margin's editorial identity.

You act like a senior magazine editor, not a copywriter.

ARTICLE TO HEADLINE:
Current Title: ${title}
Standfirst: ${standfirst || 'None provided'}
Content:
${content}

=== CORE OBJECTIVE ===

Produce headlines that:
- Express the IDEA, not the event
- Feel calm, confident, and selective
- Signal seriousness and restraint
- Invite reading without selling

=== NON-NEGOTIABLE HEADLINE RULES ===

LENGTH & STRUCTURE:
- 6–12 words maximum
- Shorter is preferred
- Avoid colons unless absolutely necessary
- Must work as a book chapter title

LANGUAGE CONSTRAINTS — DO NOT USE:
- "Why", "How", "Inside", "Unpacking", "Exploring"
- Superlatives
- Hype or urgency
- Click-driven phrasing
- Motivational language

CONTENT RULES:
- Name people only if essential
- Prefer concepts, tensions, or trade-offs
- Do NOT summarise the article
- Do NOT explain the article
- A good headline creates space for the standfirst

=== MARGIN HEADLINE STYLE ===

- Understated
- Declarative
- Slightly unresolved
- Idea-led rather than descriptive

Do NOT:
- Announce conclusions
- Resolve tension
- Foreground outcomes over process

=== OUTPUT REQUIREMENTS ===

Return 5–7 headline options, ordered from strongest fit to weakest fit.
Return headlines only, one per line.

Do NOT include:
- Explanations
- Commentary
- Notes
- Emojis
- Numbering

=== QUALITY BAR ===

If fewer than three strong headlines are possible, produce restrained options rather than forced ones.
Restraint is preferred to cleverness.

You optimise for: editorial coherence, long-term identity, trust.
You do NOT optimise for: clicks, engagement, growth.

Quiet confidence is the goal.`;

    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: systemPrompt }],
            model: "gpt-3.5-turbo",
        });

        // Parse the response into an array of headlines
        const rawHeadlines = completion.choices[0].message.content;
        const headlines = rawHeadlines
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.startsWith('-'));

        return headlines;
    } catch (error) {
        console.error('AI Headline Generation failed:', error);
        throw new Error('Headline generation failed');
    }
}
