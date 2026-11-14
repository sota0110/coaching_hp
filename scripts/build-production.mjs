import { loadEnv } from 'vite';
import { spawnSync } from 'node:child_process';
const env = { ...process.env, ...loadEnv('production', process.cwd(), ''), ...Object.fromEntries(Object.entries(process.env).filter(([key]) => ['VITE_TURNSTILE_SITE_KEY', 'SITE_URL'].includes(key))) };
if (!env.VITE_TURNSTILE_SITE_KEY || env.VITE_TURNSTILE_SITE_KEY.includes('replace-') || env.VITE_TURNSTILE_SITE_KEY.startsWith('1x0000')) throw new Error('本番用の公開Turnstile site keyを設定してください。');
const site = new URL(env.SITE_URL || 'https://coaching-therapy.jp/');
if (site.protocol !== 'https:' || site.hostname.endsWith('.invalid')) throw new Error('本番のHTTPS URLを設定してください。');
Object.assign(env, { VITE_APPLICATION_MODE: 'production', BASE_PATH: '/', SITE_URL: site.href });
for (const args of [['node_modules/vite/bin/vite.js', 'build'], ['scripts/export-routes.mjs']]) {
  const result = spawnSync(process.execPath, args, { env, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
