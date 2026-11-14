import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { createWorker } from '../worker/index.js';
import { privacyVersion, validateApplication } from '../shared/application.js';

function database() {
  const sql = new DatabaseSync(':memory:');
  sql.exec(readFileSync(new URL('../migrations/0001_applications.sql', import.meta.url), 'utf8'));
  const prepare = query => {
    let values = [];
    const statement = {
      bind(...args) { values = args; return statement; },
      async first() { return sql.prepare(query).get(...values) ?? null; },
      async all() { return { results: sql.prepare(query).all(...values) }; },
      async run() { return { meta: sql.prepare(query).run(...values) }; },
    };
    return statement;
  };
  return { sql, prepare, async batch(statements) {
    sql.exec('BEGIN');
    try { const results = []; for (const stmt of statements) results.push(await stmt.run()); sql.exec('COMMIT'); return results; }
    catch (error) { sql.exec('ROLLBACK'); throw error; }
  } };
}
const application = () => ({ name: 'テスト利用者', email: 'applicant@example.com', kind: 'private-session', service: 'プライベートコーチング相談', firstPreference: '2099-12-01T10:00', secondPreference: '', method: 'オンライン（Zoom）', message: '非公開の相談内容', consent: true, privacyVersion, timeZone: 'Asia/Tokyo', turnstileToken: 'valid-token', website: '' });
function setup({ turnstile = true, providerStatus = 200 } = {}) {
  const DB = database(); const calls = []; const waiting = [];
  const env = { DB, SITE_ORIGIN: 'https://coaching-therapy.jp', TURNSTILE_SECRET_KEY: 'test-only', RATE_LIMIT_SALT: 'test-only', RESEND_API_KEY: 'test-only', NOTIFICATION_EMAIL: 'owner@example.com', MAIL_FROM: 'Salon <noreply@example.com>' };
  const worker = createWorker({ pause: async () => {}, fetch: async (url, options) => {
    calls.push({ url, options });
    return url.includes('turnstile') ? Response.json({ success: turnstile, hostname: 'coaching-therapy.jp', action: 'application' })
      : Response.json(providerStatus === 200 ? { id: crypto.randomUUID() } : { message: 'temporary failure' }, { status: providerStatus });
  } });
  const ctx = { waitUntil(value) { waiting.push(value); } };
  const post = (data = application(), id = crypto.randomUUID(), origin = env.SITE_ORIGIN) => worker.fetch(new Request(`${env.SITE_ORIGIN}/api/applications`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin, 'Idempotency-Key': id, 'CF-Connecting-IP': '192.0.2.1' }, body: JSON.stringify(data),
  }), env, ctx);
  const finish = async () => { await Promise.all(waiting.splice(0)); };
  return { DB, env, worker, calls, ctx, post, finish };
}

test('server validation rejects forged consent, invalid dates, services, types and oversized content', () => {
  for (const patch of [{ consent: false }, { privacyVersion: 'old' }, { firstPreference: '2099-02-30T10:00' }, { service: 'fake' }, { name: {} }, { email: 'x@example.com\r\nBcc: attacker@example.com' }, { message: 'x'.repeat(5001) }, { firstPreference: '2000-01-01T10:00' }]) {
    assert.throws(() => validateApplication({ ...application(), ...patch }));
  }
  assert.equal(validateApplication({ ...application(), kind: 'inquiry', service: 'その他のお問い合わせ' }).firstPreference, '');
});
test('accepted applications include all details in owner notification and keep consultation out of auto-reply', async () => {
  const s = setup();
  const input = { ...application(), secondPreference: '2099-12-02T14:30', message: '相談内容の1行目\n相談内容の2行目 <script>文字列</script>' };
  const response = await s.post(input);
  assert.equal(response.status, 201);
  const receipt = await response.json();
  assert.equal(receipt.reservationConfirmed, false);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.match(receipt.reference, /^APP-/);
  assert.equal(s.DB.sql.prepare('SELECT count(*) AS n FROM applications').get().n, 1);
  await s.finish();
  assert.equal(s.DB.sql.prepare("SELECT count(*) AS n FROM mail_outbox WHERE status = 'sent'").get().n, 2);
  const messages = s.calls.filter(c => c.url.includes('resend')).map(c => JSON.parse(c.options.body));
  assert.equal(messages.length, 2);
  const notification = messages.find(mail => mail.to[0] === 'owner@example.com');
  const reply = messages.find(mail => mail.to[0] === input.email);
  for (const field of ['name', 'email', 'service', 'method', 'message', 'privacyVersion']) assert(notification.text.includes(input[field]), field);
  assert(notification.text.includes('2099-12-01 10:00（日本時間）'));
  assert(notification.text.includes('2099-12-02 14:30（日本時間）'));
  assert(notification.text.includes('同意済み'));
  assert(notification.text.includes(receipt.reference));
  assert.equal(notification.html, undefined);
  assert(!reply.text.includes(input.message));
  assert.equal(messages[0].reply_to, 'applicant@example.com');
  assert.equal(messages[1].reply_to, undefined);
});
test('course inquiries include selected course, multiline message and explicit empty optional fields', async () => {
  const s = setup();
  const response = await s.post({ ...application(), kind: 'inquiry', service: 'コーチング＆セラピー講座', course: '初級コース', message: '講座について\n質問です。' });
  assert.equal(response.status, 201); await s.finish();
  const mail = s.calls.filter(c => c.url.includes('resend')).map(c => JSON.parse(c.options.body)).find(m => m.to[0] === 'owner@example.com');
  assert(mail.text.includes('お問い合わせの講座：初級コース'));
  assert(mail.text.includes('講座について\n質問です。'));
  assert(mail.text.includes('希望日時・第1希望：未入力'));
  assert(mail.text.includes('ご希望の相談方法：未入力'));
});
test('same idempotency key creates one application and retry does not require a fresh Turnstile token', async () => {
  const s = setup(), id = crypto.randomUUID();
  const first = await (await s.post(application(), id)).json(); await s.finish();
  const second = await (await s.post({ ...application(), turnstileToken: '' }, id)).json();
  assert.equal(first.reference, second.reference);
  assert.equal((await s.post({ ...application(), message: 'changed' }, id)).status, 409);
  assert.equal(s.calls.filter(c => c.url.includes('resend')).length, 2);
  assert.equal(s.calls.filter(c => c.url.includes('turnstile')).length, 1);
});
test('foreign origin, invalid challenge and honeypot cannot save an application', async () => {
  const s = setup({ turnstile: false });
  assert.equal((await s.post(application(), crypto.randomUUID(), 'https://attacker.example')).status, 403);
  assert.equal((await s.post({ ...application(), website: 'spam' })).status, 400);
  assert.equal((await s.post()).status, 400);
  assert.equal(s.DB.sql.prepare('SELECT count(*) AS n FROM applications').get().n, 0);
  assert.equal(s.calls.filter(c => c.url.includes('resend')).length, 0);
});
test('provider outage does not lose reception; cron retries using the same provider idempotency keys', async () => {
  const s = setup({ providerStatus: 503 });
  assert.equal((await s.post()).status, 201); await s.finish();
  const pending = s.DB.sql.prepare("SELECT * FROM mail_outbox WHERE status = 'pending'").all();
  assert.equal(pending.length, 2);
  s.DB.sql.exec('UPDATE mail_outbox SET next_attempt_at = 0');
  await s.worker.scheduled({}, s.env, s.ctx); await s.finish();
  for (const row of pending) assert.equal(s.calls.filter(c => c.options.headers['Idempotency-Key'] === row.id).length, 2);
  assert.equal(s.DB.sql.prepare('SELECT count(*) AS n FROM applications').get().n, 1);
});
test('permanent mail failure stays visible and old ambiguous delivery requires manual review', async () => {
  const s = setup({ providerStatus: 422 }); await s.post(); await s.finish();
  assert.equal(s.DB.sql.prepare("SELECT count(*) AS n FROM mail_outbox WHERE status = 'failed'").get().n, 2);
  s.DB.sql.exec("UPDATE mail_outbox SET status = 'pending', next_attempt_at = 0, first_attempt_at = 1");
  const before = s.calls.length;
  await s.worker.scheduled({}, s.env, s.ctx); await s.finish();
  assert.equal(s.calls.length, before);
  assert.equal(s.DB.sql.prepare("SELECT count(*) AS n FROM mail_outbox WHERE last_error = 'MANUAL_REVIEW_REQUIRED'").get().n, 2);
});
test('retention deletes expired applications and their outbox; current applications survive', async () => {
  const s = setup(); await s.post(); await s.finish();
  s.DB.sql.exec('UPDATE applications SET expires_at = 1');
  await s.worker.scheduled({}, s.env, s.ctx); await s.finish();
  assert.equal(s.DB.sql.prepare('SELECT count(*) AS n FROM applications').get().n, 0);
  assert.equal(s.DB.sql.prepare('SELECT count(*) AS n FROM mail_outbox').get().n, 0);
});
test('mail budgets prevent sending beyond free-plan safety margins', async () => {
  const s = setup(), now = new Date();
  s.DB.sql.prepare('INSERT INTO rate_limits VALUES (?, 90, ?)').run(`mail-day:${now.toISOString().slice(0, 10)}`, Math.floor(Date.now()/1000)+86400);
  await s.post(); await s.finish();
  assert.equal(s.calls.filter(c => c.url.includes('resend')).length, 0);
  assert.equal(s.DB.sql.prepare("SELECT count(*) AS n FROM mail_outbox WHERE last_error = 'MAIL_BUDGET_REACHED'").get().n, 2);
});
test('a missing production secret fails closed and no success receipt is invented', async () => {
  const s = setup(); delete s.env.RESEND_API_KEY;
  assert.equal((await s.post()).status, 503);
  assert.equal(s.DB.sql.prepare('SELECT count(*) AS n FROM applications').get().n, 0);
});
test('temporary publication only accepts the designated test recipient', async () => {
  const s = setup(); s.env.TEST_RECIPIENT = 'owner@example.com';
  assert.equal((await s.post()).status, 503);
  assert.equal(s.DB.sql.prepare('SELECT count(*) AS n FROM applications').get().n, 0);
  assert.equal((await s.post({ ...application(), email: 'owner@example.com' })).status, 201);
  await s.finish();
});
