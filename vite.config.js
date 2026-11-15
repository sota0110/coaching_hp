import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  // Keep the browser bundle limited to the text parser and Japanese phrase model.
  resolve: { alias: {
    budoux: fileURLToPath(new URL('./src/budoux-browser.js', import.meta.url)),
    'budoux-parser': fileURLToPath(new URL('./node_modules/budoux/module/parser.js', import.meta.url)),
    'budoux-ja-model': fileURLToPath(new URL('./node_modules/budoux/module/data/models/ja.js', import.meta.url)),
  } },
  esbuild: {
    jsxFactory: 'readableCreateElement',
    jsxInject: "import { readableCreateElement } from '/src/readable-text.js'",
  },
});
