import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const pages = JSON.parse(await readFile(join(root, 'src/pages.json'), 'utf8'));
const html = await readFile(join(root, 'dist/index.html'), 'utf8');
const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
for (const [path, page] of Object.entries(pages)) {
  const directory = join(root, 'dist', path);
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, 'index.html'), html.replace(/<title>.*?<\/title>/, `<title>${escape(page.title)}</title>`));
}
console.log(`Exported ${Object.keys(pages).length} page entry points.`);
