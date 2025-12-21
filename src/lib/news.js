import Parser from 'rss-parser';

const parser = new Parser();

const FEEDS = {
    'cycling': 'https://www.cyclingnews.com/feeds/all/',
    'running': 'https://www.runnersworld.com/rss/all.xml',
    'tech': 'https://techcrunch.com/feed/',
    'general': 'http://feeds.bbci.co.uk/news/rss.xml'
};

export async function getNewsForTopic(topic = '') {
    try {
        const lowerTopic = topic.toLowerCase();
        let feedUrl = FEEDS.general;

        if (lowerTopic.includes('cycl') || lowerTopic.includes('bike')) {
            feedUrl = FEEDS.cycling;
        } else if (lowerTopic.includes('run') || lowerTopic.includes('marathon')) {
            feedUrl = FEEDS.running;
        } else if (lowerTopic.includes('tech') || lowerTopic.includes('ai')) {
            feedUrl = FEEDS.tech;
        }

        const feed = await parser.parseURL(feedUrl);

        // Get top 3 items
        const headlines = feed.items.slice(0, 3).map(item => `- ${item.title}: ${item.contentSnippet?.slice(0, 100)}...`).join('\n');

        return {
            source: feed.title,
            headlines
        };
    } catch (error) {
        console.error('Failed to fetch news:', error);
        return { source: 'None', headlines: 'No recent news available due to fetch error.' };
    }
}
