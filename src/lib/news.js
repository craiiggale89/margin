import Parser from 'rss-parser';

const parser = new Parser();

const FEEDS = {
    'cycling': [
        'https://www.cyclingnews.com/feeds/all/',
        'https://www.cyclingweekly.com/feed',
        'https://www.bikeradar.com/news/all/feed'
    ],
    'running': [
        'https://www.runnersworld.com/rss/all.xml',
        'https://athleticsweekly.com/news/feed/'
    ],
    'sport': [
        'https://push.api.bbci.co.uk/pushed/bbc-sport/news/rss.xml',
        'https://www.skysports.com/rss/12040'
    ]
};

export async function getNewsForTopic(topic = '') {
    try {
        const lowerTopic = topic.toLowerCase();
        let feeds = FEEDS.sport;

        if (lowerTopic.includes('cycl') || lowerTopic.includes('bike')) {
            feeds = FEEDS.cycling;
        } else if (lowerTopic.includes('run') || lowerTopic.includes('marathon')) {
            feeds = FEEDS.running;
        }

        // Randomly select one feed from the category for variety
        const feedUrl = feeds[Math.floor(Math.random() * feeds.length)];

        console.log(`[News] Fetching from ${feedUrl}`);
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
