import OpenAI from 'openai';
import { getNewsForTopic } from './news';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generatePitch({ agent, topic }) {
    const searchTopic = topic || agent.focus || 'general';
    const newsData = await getNewsForTopic(searchTopic);

    const systemPrompt = `You are ${agent.name}, a professional journalist.
    Focus: ${agent.focus || 'General Interest'}
    Constraints: ${agent.constraints || 'None'}
    
    Your task: Generate a magazine article pitch based on recent news or a specific topic.
    If the constraints specify a "MANDATORY FORMAT", you MUST include all requested sections using their exact labels (e.g. "What’s genuinely new here: ..."). 
    Map these sections into the "angle" field of the JSON structure below.
    
    Recent News (${newsData.source}):
    ${newsData.headlines}
    
    Topic Request: ${topic ? topic : 'Something relevant to your focus and recent news'}
    
    Format output as JSON:
    {
        "title": "Headline",
        "standfirst": "Brief summary",
        "angle": "Why this story matters / Detailed pitch / Mandatory sections",
        "whyNow": "Timeliness",
        "contextLabel": "Category" // e.g. Analysis, Feature, Opinion
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

export async function generateArticle({ pitch, agent }) {
    const systemPrompt = `You are ${agent.name}, a professional journalist.
    Focus: ${agent.focus}
    Constraints: ${agent.constraints}

    Write a full magazine article (800-1200 words) based on the following approved pitch:
    
    HEADLINE: ${pitch.title}
    STANDFIRST: ${pitch.standfirst}
    ANGLE: ${pitch.angle}
    CONTEXT: ${pitch.contextLabel}

    Format the output as clean HTML (using <h2>, <p> tags). 
    Do not include valid HTML boilerplate (<html>, <body>), just the content.
    Do not include the headline or the standfirst in the body (they are rendered separately by the UI).
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
    const systemPrompt = `You are ${agent.name}, a professional journalist.
    Focus: ${agent.focus}
    Constraints: ${agent.constraints}

    You are revising an article draft based on Editor feedback.
    
    EDITOR FEEDBACK: "${feedback}"

    Instructions:
    - Rewrite or edit the content below to address the feedback.
    - Maintain the original tone and style unless asked to change.
    - Output only the new HTML content (no boilerplate).
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
