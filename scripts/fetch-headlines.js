const Parser = require('rss-parser');
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

async function fetchAll() {
    console.log('# RECENT NEWS TOPICS FOR AGENTS\n');

    for (const [category, urls] of Object.entries(FEEDS)) {
        console.log(`## ${category.toUpperCase()}`);
        for (const url of urls) {
            try {
                const feed = await parser.parseURL(url);
                console.log(`### Source: ${feed.title}`);
                feed.items.slice(0, 3).forEach(item => {
                    console.log(`- ${item.title}`);
                });
                console.log('');
            } catch (error) {
                console.log(`- Failed to fetch ${url}`);
            }
        }
    }
}

fetchAll();
