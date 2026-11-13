import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'vite';
import { extraPages } from '../src/site-config.js';

test('all published pages render their content without browser JavaScript', async () => {
  const server = await createServer({
    server: { middlewareMode: true, watch: null, hmr: false, ws: false },
    appType: 'custom',
  });
  try {
    const { renderPage } = await server.ssrLoadModule('/src/prerender.jsx');
    const importedPages = JSON.parse(await readFile(new URL('../src/pages.json', import.meta.url), 'utf8'));
    for (const [route, page] of Object.entries({ ...importedPages, ...extraPages })) {
      const html = renderPage(route, { ...page, nodes: page.nodes || [] });
      assert.match(html, /<main id="main"/, route);
      assert.equal((html.match(/<h1[ >]/g) || []).length, 1, route);
      assert(!html.includes('読み込み中…'), route);
      assert(!html.includes('ページを読み込めませんでした'), route);
      if (route === '/コーチング/') {
        assert(html.includes('はじめての方も安心してご利用いただける'), route);
        assert(html.includes('セッションの流れ'), route);
      }
    }
  } finally {
    await server.close();
  }
});
