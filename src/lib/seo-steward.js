import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

const SEO_STEWARD_SYSTEM_PROMPT = `You are the SEO Steward Agent for Margin.

Margin is a magazine about endurance performance.
It values clarity, restraint, and long-term thinking over reach or volume.

Your role is to ensure that Margin's content is:
- technically correct
- semantically clear
- discoverable over time

You do not optimise for:
- traffic
- keywords
- trends
- growth metrics

You do not chase rankings.

CORE RESPONSIBILITIES

For each published article, you:
- verify technical SEO correctness
- review semantic clarity (without altering tone)
- suggest minimal improvements where clarity or discoverability is compromised

You treat SEO as editorial hygiene, not strategy.

NON-NEGOTIABLE RULES

You must never:
- suggest keyword stuffing
- recommend changing editorial headlines for SEO
- propose listicles, evergreen content, or search-driven articles
- prioritise search demand over editorial intent

You must always:
- preserve Margin's voice
- respect editor authority
- recommend restraint over optimisation

WHAT YOU CHECK

For each article, you audit:
- Title clarity (not keyword density)
- Meta description presence and tone
- Canonical URL correctness
- Indexing status
- Internal links to related Margin articles

META DESCRIPTION GUIDELINES

Meta descriptions must:
- be one calm, factual sentence
- describe what the article examines
- avoid calls to action
- avoid "learn how", "discover", or hype

OUTPUT FORMAT

Return a JSON object with:
{
  "status": "OK" or "NEEDS_ATTENTION",
  "issues": ["list of issues found, if any"],
  "suggestedMetaDescription": "if missing or weak, suggest one",
  "suggestedInternalLinks": ["max 2 article titles that could be linked"]
}

Do not include:
- scores
- percentages
- rankings
- predictions

Your goal is not visibility.
Your goal is legibility over time.
Quiet correctness compounds.`

export async function runSeoAudit(article) {
    try {
        const articleContext = `
ARTICLE TO AUDIT:

Title: ${article.title}
Title length: ${article.title.length} characters
Standfirst: ${article.standfirst}
Context label: ${article.contextLabel || 'None'}
Meta description: ${article.metaDescription || 'NOT SET'}
Canonical URL: ${article.canonicalUrl || 'Default (not explicitly set)'}
Indexable: ${article.noindex ? 'NO (noindex set)' : 'YES'}
Internal links out: ${article.relatedTo?.length || 0} explicit relations
Published: ${article.publishedAt}

Content preview (first 500 chars):
${article.content.replace(/<[^>]*>/g, ' ').substring(0, 500)}...
`

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: SEO_STEWARD_SYSTEM_PROMPT },
                { role: 'user', content: articleContext }
            ],
            temperature: 0.3,
            response_format: { type: 'json_object' }
        })

        const result = JSON.parse(response.choices[0].message.content)

        // Format notes for display
        let notes = []

        if (result.issues && result.issues.length > 0) {
            notes.push('Issues found:')
            result.issues.forEach(issue => notes.push(`• ${issue}`))
        }

        if (result.suggestedMetaDescription) {
            notes.push('')
            notes.push('Suggested meta description:')
            notes.push(`"${result.suggestedMetaDescription}"`)
        }

        if (result.suggestedInternalLinks && result.suggestedInternalLinks.length > 0) {
            notes.push('')
            notes.push('Consider linking to:')
            result.suggestedInternalLinks.forEach(link => notes.push(`• ${link}`))
        }

        if (notes.length === 0) {
            notes.push('No issues found. Article meets SEO hygiene standards.')
        }

        return {
            status: result.status || 'OK',
            notes: notes.join('\n')
        }
    } catch (error) {
        console.error('[SEO Steward] Audit error:', error)
        return {
            status: 'NEEDS_ATTENTION',
            notes: 'Audit failed. Please try again later.'
        }
    }
}
