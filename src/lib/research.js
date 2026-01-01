/**
 * Research Agent - Gathers concrete anchors via web search
 * Runs after pitch approval to find real data for article generation
 * Uses Google Gemini with search grounding
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Gathers research for an approved pitch using Gemini with Google Search
 * Returns structured anchors: race moments, decisions, training phases
 */
export async function gatherResearch({ title, angle, athlete, topic }) {
    if (!GEMINI_API_KEY) {
        console.warn('[Research] No GEMINI_API_KEY set, using fallback');
        return generateFallbackResearch({ title, angle, athlete, topic });
    }

    const searchPrompt = buildSearchPrompt({ title, angle, athlete, topic });

    try {
        // Use Gemini 1.5 Flash with Google Search grounding
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: searchPrompt
                        }]
                    }],
                    systemInstruction: {
                        parts: [{
                            text: `You are a sports research assistant for Margin, a magazine about endurance performance.

Your task is to find CONCRETE, SPECIFIC anchors for an article using Google Search. You must return real data, not generalities.

For each anchor, provide:
- SITUATION: What actually happened (specific moment, phase, or decision)
- CONSEQUENCE: What followed as a result

Return your findings as JSON in this exact format:
{
    "athlete": "Name",
    "anchors": [
        {
            "type": "race_moment|training_phase|decision|comparison",
            "event": "Specific event/competition name",
            "situation": "Detailed description of what happened",
            "consequence": "What resulted from this",
            "source": "Where this information came from"
        }
    ],
    "summary": "Brief overview of key findings"
}`
                        }]
                    },
                    tools: [{
                        googleSearch: {}
                    }],
                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 2000,
                    }
                }),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error('[Research] Gemini API error:', error);
            throw new Error('Research API failed');
        }

        const data = await response.json();
        console.log('[Research] Raw response parts:', JSON.stringify(data.candidates?.[0]?.content?.parts, null, 2)?.substring(0, 500));

        // Extract content from Gemini response
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!content) {
            console.error('[Research] No content in Gemini response');
            return generateFallbackResearch({ title, angle, athlete, topic });
        }

        console.log('[Research] Content received (first 300 chars):', content.substring(0, 300));

        // Parse JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (e) {
                console.error('[Research] JSON parse failed:', e.message);
            }
        }

        // If no JSON found, return as summary
        return {
            athlete: athlete || 'Unknown',
            anchors: [],
            summary: content,
            raw: true
        };

    } catch (error) {
        console.error('[Research] Failed to gather research:', error);
        return generateFallbackResearch({ title, angle, athlete, topic });
    }
}

/**
 * Builds the search prompt from pitch details
 */
function buildSearchPrompt({ title, angle, athlete, topic }) {
    const parts = [];

    if (athlete) {
        parts.push(`Find specific, concrete information about ${athlete}.`);
    }

    if (title) {
        parts.push(`Article topic: "${title}"`);
    }

    if (angle) {
        parts.push(`Article angle: ${angle}`);
    }

    parts.push(`
I need at least 3-5 concrete anchors, each with:

1. RACE MOMENTS - Specific kilometre splits, pacing decisions, tactical choices with exact details
   Example: "At km 35 of the 2024 Paris Marathon, X was 12 seconds behind but held back..."

2. TRAINING PHASES - Documented training blocks, volume changes, capacity trade-offs
   Example: "In the 2023 winter block, X reduced swim volume by 30% to rebuild run economy..."

3. DECISIONS - Specific choices made under constraint with outcomes
   Example: "When X felt the quad tighten at km 28, they chose to maintain pace rather than..."

4. COMPARISONS - Similar situations with different athletes/outcomes
   Example: "Unlike Y who attacked at km 30 and faded, X held back and..."

Focus on recent events (2023-2024) where possible.
Each anchor must answer: "What actually happened, and what followed?"`);

    return parts.join('\n\n');
}

/**
 * Fallback when no API key is available
 * Returns empty structure with guidance
 */
function generateFallbackResearch({ title, angle, athlete, topic }) {
    return {
        athlete: athlete || 'Unknown',
        anchors: [],
        summary: 'No research API configured. Please set GEMINI_API_KEY in environment variables.',
        fallback: true,
        searchSuggestions: [
            `Search: "${athlete || topic} race results 2024"`,
            `Search: "${athlete || topic} training interview"`,
            `Search: "${athlete || topic} splits pacing strategy"`,
        ]
    };
}

/**
 * Formats research for injection into article generation prompt
 */
export function formatResearchForPrompt(research) {
    if (!research || !research.anchors || research.anchors.length === 0) {
        return '';
    }

    const anchorLines = research.anchors.map((anchor, i) => {
        return `ANCHOR ${i + 1} (${anchor.type}):
Event: ${anchor.event || 'N/A'}
Situation: ${anchor.situation}
Consequence: ${anchor.consequence}
Source: ${anchor.source || 'Research'}`;
    }).join('\n\n');

    return `
=== RESEARCHED ANCHORS (MANDATORY USE) ===

The following anchors have been researched and verified.
You MUST use at least 3 of these in your article.
Do not invent alternative anchors — use these specific situations.

${anchorLines}

=== END RESEARCH ===
`;
}
