import { readFileSync } from 'node:fs';
const config = readFileSync('wrangler.jsonc','utf8');
if(config.includes('00000000-0000-0000-0000-000000000000')) throw new Error('Set the real D1 database_id in wrangler.jsonc before deployment.');
const html=readFileSync('dist/index.html','utf8');
if(html.includes('https://example.com')) throw new Error('Set PUBLIC_SITE_URL to your final HTTPS domain before building.');
