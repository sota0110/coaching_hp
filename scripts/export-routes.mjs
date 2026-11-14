import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createServer } from 'vite';
import { extraPages, pageTitles, customPageTitles, siteName, formatPrice, sessionPricing, formRoutes } from '../src/site-config.js';
const root = resolve(import.meta.dirname, '..');
const pages = {...JSON.parse(await readFile(join(root, 'src/pages.json'), 'utf8')), ...extraPages};
const html = await readFile(join(root, 'dist/index.html'), 'utf8');
const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"','&quot;');
const siteUrl = process.env.SITE_URL || 'https://coaching-therapy.coaching-therapy-react.workers.dev/';
const base = process.env.BASE_PATH || '/';
const renderer = await createServer({ base, server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom' });
const { renderPage } = await renderer.ssrLoadModule('/src/prerender.jsx');

function mainSection(node) {
  if (!node || typeof node === 'string') return null;
  if (node.attrs?.class?.startsWith('main-section')) return node;
  return node.children?.map(mainSection).find(Boolean);
}

try {
  for (const [path, page] of Object.entries(pages)) {
    const directory = join(root, 'dist', path);
    await mkdir(directory, { recursive: true });
    const title = path === '/' ? `${siteName}｜渋谷区代々木・対面とオンライン` : `${customPageTitles[path] || pageTitles[path] || page.title.split(' | ')[0]} | ${siteName}`;
    const description = page.description || (path === '/' ? `こころを整えることを、もっと日常に。渋谷区代々木のママと女性のためのプライベートサロン。${sessionPricing.minutes}分・${formatPrice(sessionPricing.regular)}、対面・オンライン対応。` : `${customPageTitles[path] || pageTitles[path] || page.title.split(' | ')[0]}のご案内。渋谷区代々木のこころのプライベートサロン。`);
    const canonicalPath = path === '/coaching-course-contact/' ? '/trial-session-booking/' : path;
    const canonical = new URL(canonicalPath.replace(/^\//,''),siteUrl).href;
    const metadata = `<link rel="canonical" href="${escape(canonical)}"/><meta property="og:type" content="website"/><meta property="og:title" content="${escape(title)}"/><meta property="og:description" content="${escape(description)}"/><meta property="og:url" content="${escape(canonical)}"/><meta property="og:image" content="${new URL('assets/home-salon-banner.jpg',siteUrl).href}"/>`;
    const customTitle = customPageTitles[path] || extraPages[path]?.title;
    const section = page.nodes?.map(mainSection).find(Boolean);
    const content = customTitle
      ? { title: customTitle, bodyClass: 'page', nodes: [] }
      : { title: page.title, bodyClass: page.bodyClass, nodes: section ? [section] : [] };
    const markup = renderPage(path, content);
    const data = JSON.stringify(content).replaceAll('<', '\\u003c');
    const bodyClass = `${path === '/' ? 'home' : 'page'} renewal-site ${formRoutes.has(path) ? 'application-route no-sticky-reservation' : path === '/プライバシーポリシー/' ? 'no-sticky-reservation' : ''}`;
    const output = html.replace(/<title>.*?<\/title>/, `<title>${escape(title)}</title>`).replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${escape(description)}"/>`).replace('</head>',`${metadata}</head>`)
      .replace('<body>', `<body class="${bodyClass}">`)
      .replace('<div id="root"></div>', `<div id="root">${markup}</div><script id="page-content" type="application/json">${data}</script>`);
    await writeFile(join(directory, 'index.html'), output);
  }
} finally {
  await renderer.close();
}
console.log(`Exported ${Object.keys(pages).length} page entry points.`);

await writeFile(join(root, 'dist', '404.html'), html.replace(/<title>.*?<\/title>/, '<title>ページが見つかりません</title>'));
