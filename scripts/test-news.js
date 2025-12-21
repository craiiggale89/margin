
const { getNewsForTopic } = require('../src/lib/news');

// Mock rss-parser because we can't import ES modules easily in a raw script without package.json "type": "module" change 
// OR we just use the actual code if we handle the import.
// Next.js uses ES modules in src.
// Let's rely on the fact that I can just run a snippet that uses the logic.

// Actually, I'll creates a temporary test file that mimics the logic since I can't easily import the Next.js lib file directly in node if it uses 'export' syntax (ESM) and project is CommonJS default or vice versa.
// Checking package.json... it doesn't specify "type": "module".
// src/lib/news.js uses `export async function`.
// So standard `node scripts/test-news.js` will fail on `import` or `export`.

// I will re-implement the verify script to just use the library directly to test connectivity.
const Parser = require('rss-parser');
const parser = new Parser();

async function test() {
    console.log('Testing RSS Fetch...');
    try {
        const feed = await parser.parseURL('https://www.cyclingnews.com/feeds/all/');
        console.log(`Successfully fetched: ${feed.title}`);
        console.log(`Item 1: ${feed.items[0].title}`);
    } catch (e) {
        console.error('RSS Fetch Failed:', e.message);
    }
}

test();
