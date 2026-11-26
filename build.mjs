// Build index.html (a complete, standalone HTML document) from ../portfolio.html,
// which is a head+body fragment authored for the Claude artifact host (the host
// injects doctype/charset/viewport at publish time; a statically served file needs
// them itself, or mobile browsers fall back to a 980px layout and lose responsiveness).
//
// Single source of truth: edit ../portfolio.html, then run `node build.mjs`.
//
// When a public URL exists (pages.dev or a custom domain), set SITE_URL below and
// re-run: that turns on canonical, og:url, og:image, and the sitemap reference.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(root, '..', 'portfolio.html'), 'utf8');

// Final public origin, no trailing slash. Leave '' until the site is live.
const SITE_URL = '';

const SPLIT = '<header class="site">';
const idx = src.indexOf(SPLIT);
if (idx === -1) {
  console.error('Could not find body start marker:', SPLIT);
  process.exit(1);
}
// Drop the fragment's own <title>; a stronger, SEO-friendly one is emitted below.
const headFragment = src.slice(0, idx).replace(/<title>[\s\S]*?<\/title>\s*/i, '').trimEnd();
const bodyFragment = src.slice(idx).trimEnd();

const TITLE = 'John-Scott W. Smith, Digital Strategy & Growth Leader';
const DESC = 'John-Scott W. Smith, Digital Strategy and Growth Leader in Richmond, VA. Fifteen years turning business goals into technical roadmaps that pay for themselves, across hospitality, fintech, and regulated consumer.';

const person = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'John-Scott W. Smith',
  jobTitle: 'Senior Manager, Digital Strategy',
  description: 'Digital strategy and growth leader with fifteen years turning business goals into technical roadmaps that pay for themselves.',
  address: { '@type': 'PostalAddress', addressLocality: 'Richmond', addressRegion: 'VA', addressCountry: 'US' },
  sameAs: ['https://www.linkedin.com/in/John-ScottSmith'],
  knowsAbout: ['Digital Strategy', 'Marketing Analytics', 'Lifecycle Marketing', 'Marketing Operations', 'Revenue Growth', 'SQL', 'Power BI', 'Tableau', 'Salesforce Marketing Cloud']
};
if (SITE_URL) person.url = SITE_URL + '/';

const urlTags = SITE_URL ? [
  `  <link rel="canonical" href="${SITE_URL}/">`,
  `  <meta property="og:url" content="${SITE_URL}/">`,
  `  <meta property="og:image" content="${SITE_URL}/og.png">`,
  `  <meta name="twitter:image" content="${SITE_URL}/og.png">`
] : [
  '  <!-- Set SITE_URL in build.mjs when live to emit canonical, og:url, og:image -->'
];

const seoHead = [
  `  <title>${TITLE}</title>`,
  `  <meta name="description" content="${DESC}">`,
  '  <meta name="author" content="John-Scott W. Smith">',
  '  <meta name="theme-color" content="#15173c">',
  '  <meta property="og:type" content="website">',
  `  <meta property="og:title" content="${TITLE}">`,
  `  <meta property="og:description" content="${DESC}">`,
  '  <meta name="twitter:card" content="summary_large_image">',
  ...urlTags,
  '  <script type="application/ld+json">' + JSON.stringify(person) + '</script>'
].join('\n');

const doc = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${headFragment}
${seoHead}
</head>
<body>
${bodyFragment}
</body>
</html>
`;

writeFileSync(join(root, 'index.html'), doc, 'utf8');
console.log('Built index.html (' + doc.length + ' bytes), SITE_URL=' + (SITE_URL || '(none)'));
