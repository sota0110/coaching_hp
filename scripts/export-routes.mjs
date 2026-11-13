import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { extraPages, pageTitles, customPageTitles, siteName, formatPrice, sessionPricing } from '../src/site-config.js';
const root = resolve(import.meta.dirname, '..');
const pages = {...JSON.parse(await readFile(join(root, 'src/pages.json'), 'utf8')), ...extraPages};
const html = await readFile(join(root, 'dist/index.html'), 'utf8');
const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"','&quot;');
const siteUrl = process.env.SITE_URL || 'https://sota0110.github.io/coaching_hp/';
for (const [path, page] of Object.entries(pages)) {
  const directory = join(root, 'dist', path);
  await mkdir(directory, { recursive: true });
  const title = path === '/' ? `${siteName}｜渋谷区代々木・対面とオンライン` : `${customPageTitles[path] || pageTitles[path] || page.title.split(' | ')[0]} | ${siteName}`;
  const description = page.description || (path === '/' ? `こころを整えることを、もっと日常に。渋谷区代々木のママと女性のためのプライベートサロン。${sessionPricing.minutes}分・${formatPrice(sessionPricing.regular)}、対面・オンライン対応。` : `${customPageTitles[path] || pageTitles[path] || page.title.split(' | ')[0]}のご案内。渋谷区代々木のこころのプライベートサロン。`);
  const canonicalPath = path === '/coaching-course-contact/' ? '/trial-session-booking/' : path;
  const canonical = new URL(canonicalPath.replace(/^\//,''),siteUrl).href;
  const metadata = `<link rel="canonical" href="${escape(canonical)}"/><meta property="og:type" content="website"/><meta property="og:title" content="${escape(title)}"/><meta property="og:description" content="${escape(description)}"/><meta property="og:url" content="${escape(canonical)}"/><meta property="og:image" content="${new URL('assets/home-salon-without-book.jpg',siteUrl).href}"/>`;
  const output = html.replace(/<title>.*?<\/title>/, `<title>${escape(title)}</title>`).replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${escape(description)}"/>`).replace('</head>',`${metadata}</head>`);
  await writeFile(join(directory, 'index.html'), output);
}
console.log(`Exported ${Object.keys(pages).length} page entry points.`);

await writeFile(join(root, 'dist', '.nojekyll'), '');
await writeFile(join(root, 'dist', '404.html'), html.replace(/<title>.*?<\/title>/, '<title>ページが見つかりません</title>'));
