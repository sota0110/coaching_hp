import { autoReplyMessage, retentionDays, validateApplication, validEmail } from '../shared/application.js';

const json = (body, status = 200) => Response.json(body, { status, headers: {
  'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
} });
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const seconds = () => Math.floor(Date.now() / 1000);
async function digest(value) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))].map(x => x.toString(16).padStart(2, '0')).join('');
}
async function ipKey(ip, salt) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(salt), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return [...new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(ip)))].map(x => x.toString(16).padStart(2, '0')).join('');
}
async function takeBudget(db, key, limit, expires) {
  return Boolean(await db.prepare(`INSERT INTO rate_limits(key, count, expires_at) VALUES (?, 1, ?)
    ON CONFLICT(key) DO UPDATE SET count = count + 1 WHERE count < ? RETURNING count`).bind(key, expires, limit).first());
}
async function readBody(request) {
  if (Number(request.headers.get('content-length')) > 32768) throw new Error('BODY_TOO_LARGE');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('BAD_JSON');
  const chunks = []; let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 32768) { await reader.cancel(); throw new Error('BODY_TOO_LARGE'); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    return JSON.parse(new TextDecoder().decode(bytes));
  } finally { reader.releaseLock(); }
}
const receipt = row => json({ mode: 'production', reference: row.id, emailStatus: 'queued', reservationConfirmed: false }, 201);
function notificationText(application, data) {
  const date = value => value ? `${value.replace('T', ' ')}（日本時間）` : '未入力';
  const received = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).format(new Date(application.created_at * 1000));
  return [
    '新しい申し込み・お問い合わせを受け付けました。', '',
    `受付番号：${application.id}`, `受付日時：${received}（日本時間）`,
    `受付種別：${data.kind === 'private-session' ? 'プライベートコーチング相談のお申し込み' : 'お問い合わせ'}`,
    '', `お名前：${data.name}`, `メールアドレス：${data.email}`,
    `サービス：${data.service}`, `お問い合わせの講座：${data.course || '未入力'}`,
    `希望日時・第1希望：${date(data.firstPreference)}`, `希望日時・第2希望：${date(data.secondPreference)}`,
    `ご希望の相談方法：${data.method || '未入力'}`,
    '', 'ご相談内容：', data.message || '未入力', '',
    `個人情報の取り扱いへの同意：${data.consent ? '同意済み' : '未確認'}（ポリシー版：${data.privacyVersion}）`,
    '', 'このメールに返信すると申込者へ届きます。',
    '申し込み内容はCloudflare D1にも保存されています。',
    'この受付時点では予約は確定していません。',
  ].join('\n');
}

export function createWorker({ fetch: send = globalThis.fetch, pause = ms => new Promise(resolve => setTimeout(resolve, ms)) } = {}) {
  async function deliver(env, applicationId) {
    const now = seconds();
    const query = `SELECT * FROM mail_outbox WHERE status = 'pending' AND next_attempt_at <= ?${applicationId ? ' AND application_id = ?' : ''} ORDER BY next_attempt_at LIMIT 12`;
    const pending = await env.DB.prepare(query).bind(...(applicationId ? [now, applicationId] : [now])).all();
    for (const mail of pending.results) {
      // Provider idempotency expires after 24h. Ambiguous old sends require manual review.
      if (mail.first_attempt_at && now - mail.first_attempt_at >= 23 * 3600) {
        await env.DB.prepare("UPDATE mail_outbox SET status = 'failed', last_error = 'MANUAL_REVIEW_REQUIRED' WHERE id = ? AND status = 'pending'").bind(mail.id).run();
        continue;
      }
      const claimed = await env.DB.prepare(`UPDATE mail_outbox SET next_attempt_at = ?,
        first_attempt_at = COALESCE(first_attempt_at, ?), attempts = attempts + 1
        WHERE id = ? AND status = 'pending' AND next_attempt_at <= ? RETURNING id`).bind(now + 120, now, mail.id, now).first();
      if (!claimed) continue;
      const day = new Date().toISOString().slice(0, 10), month = day.slice(0, 7);
      const daily = await takeBudget(env.DB, `mail-day:${day}`, 90, now + 172800);
      const monthly = daily && await takeBudget(env.DB, `mail-month:${month}`, 2900, now + 35 * 86400);
      if (!monthly) {
        await env.DB.prepare('UPDATE mail_outbox SET next_attempt_at = ?, last_error = ? WHERE id = ?').bind(now + 3600, 'MAIL_BUDGET_REACHED', mail.id).run();
        continue;
      }
      const application = await env.DB.prepare('SELECT * FROM applications WHERE id = ?').bind(mail.application_id).first();
      if (!application) continue;
      const data = JSON.parse(application.payload);
      const notification = mail.kind === 'notification';
      const body = {
        from: env.MAIL_FROM,
        to: [notification ? env.NOTIFICATION_EMAIL : data.email],
        ...(notification ? { reply_to: data.email } : {}),
        subject: notification ? `【新しい受付】${application.id}` : `【こころのプライベートサロン】受付のお知らせ ${application.id}`,
        text: notification
          ? notificationText(application, data)
          : `${data.kind === 'inquiry' ? autoReplyMessage.replace('お申し込み', 'お問い合わせ') : autoReplyMessage}\n\n受付番号：${application.id}\n${data.kind === 'private-session' ? 'この時点では予約は確定していません。主催者からの日程調整の連絡をお待ちください。\n' : ''}\nこのメールは送信専用です。お問い合わせは公式LINEからお願いいたします。\nhttps://line.me/R/ti/p/@615ytuyo`,
      };
      try {
        const response = await send('https://api.resend.com/emails', {
          method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': mail.id },
          body: JSON.stringify(body), signal: AbortSignal.timeout(10000),
        });
        const result = await response.json().catch(() => null);
        if (response.ok && typeof result?.id === 'string') {
          await env.DB.prepare("UPDATE mail_outbox SET status = 'sent', sent_at = ?, provider_id = ?, last_error = NULL WHERE id = ?").bind(seconds(), result.id, mail.id).run();
        } else {
          // Only transient failures retry automatically. Do not log provider bodies (PII).
          const retry = response.status === 429 || response.status >= 500;
          await env.DB.prepare('UPDATE mail_outbox SET status = ?, next_attempt_at = ?, last_error = ? WHERE id = ?')
            .bind(retry ? 'pending' : 'failed', now + Math.min(3600, 60 * 2 ** Math.min(mail.attempts, 6)), `PROVIDER_HTTP_${response.status}`, mail.id).run();
        }
      } catch {
        await env.DB.prepare('UPDATE mail_outbox SET next_attempt_at = ?, last_error = ? WHERE id = ?').bind(now + 600, 'DELIVERY_UNCERTAIN', mail.id).run();
      }
      await pause(600); // Resend's default rate limit is shared across this account.
    }
  }

  async function accept(request, env, ctx) {
    if (request.method !== 'POST') return json({ error: 'POSTのみ受け付けています。' }, 405);
    const url = new URL(request.url);
    const allowed = [env.SITE_ORIGIN, env.PREVIEW_ORIGIN].filter(Boolean);
    if (request.headers.get('origin') !== url.origin || !allowed.includes(url.origin)) return json({ error: 'この送信元からは受け付けできません。' }, 403);
    if (!env.DB || !env.TURNSTILE_SECRET_KEY || !env.RESEND_API_KEY || !env.RATE_LIMIT_SALT || !validEmail(env.NOTIFICATION_EMAIL) || !env.MAIL_FROM) return json({ error: '現在フォームの受付を準備中です。公式LINEをご利用ください。' }, 503);
    if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return json({ error: '送信形式をご確認ください。' }, 415);
    const requestId = request.headers.get('idempotency-key');
    if (!uuid.test(requestId || '')) return json({ error: '画面を再読み込みしてお試しください。' }, 400);
    let input;
    try { input = await readBody(request); } catch (error) { return json({ error: '送信内容をご確認ください。' }, error.message === 'BODY_TOO_LARGE' ? 413 : 400); }
    let data;
    try { data = validateApplication(input); } catch (error) { return json({ error: error.message }, 400); }
    if (env.TEST_RECIPIENT && data.email.toLowerCase() !== env.TEST_RECIPIENT.toLowerCase()) return json({ error: '現在は運営者による受付テスト中です。実際のお申し込みは公式LINEをご利用ください。' }, 503);
    if (input.website || typeof input.turnstileToken !== 'string' || input.turnstileToken.length > 2048) return json({ error: '送信確認をやり直してください。' }, 400);
    const hash = await digest(JSON.stringify(data));
    const previous = await env.DB.prepare('SELECT id, payload_hash FROM applications WHERE request_id = ?').bind(requestId).first();
    if (previous) return previous.payload_hash === hash ? receipt(previous) : json({ error: '内容が変更されています。入力画面から確認し直してください。' }, 409);
    const now = seconds();
    const ip = await ipKey(request.headers.get('cf-connecting-ip') || 'unknown', env.RATE_LIMIT_SALT);
    if (!await takeBudget(env.DB, `ip:${ip}:${Math.floor(now / 900)}`, 10, now + 1800)) return json({ error: '送信回数が多いため、しばらく待ってからお試しください。' }, 429);
    let verified;
    try {
      const response = await send('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: input.turnstileToken, remoteip: request.headers.get('cf-connecting-ip') || undefined }),
        signal: AbortSignal.timeout(10000),
      });
      verified = response.ok && await response.json();
    } catch { return json({ error: '送信確認に接続できませんでした。もう一度お試しください。' }, 503); }
    if (!verified?.success || verified.hostname !== url.hostname || verified.action !== 'application') return json({ error: '送信確認の有効期限が切れました。もう一度確認してください。' }, 400);
    const day = new Date().toISOString().slice(0, 10), month = day.slice(0, 7);
    // Reserve room for 2 emails/application plus retries, below Resend's free limits.
    if (!await takeBudget(env.DB, `applications-day:${day}`, 40, now + 172800)
      || !await takeBudget(env.DB, `applications-month:${month}`, 1400, now + 35 * 86400)) return json({ error: '本日の受付上限に達しました。公式LINEからお問い合わせください。' }, 429);
    const id = `APP-${crypto.randomUUID()}`;
    try {
      await env.DB.batch([
        env.DB.prepare('INSERT INTO applications(id, request_id, payload_hash, payload, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)').bind(id, requestId, hash, JSON.stringify(data), now, now + retentionDays * 86400),
        ...['notification', 'reply'].map(kind => env.DB.prepare('INSERT INTO mail_outbox(id, application_id, kind, next_attempt_at) VALUES (?, ?, ?, ?)').bind(`${id}-${kind}`, id, kind, now)),
      ]);
    } catch {
      // Two identical requests may race. Only return success if the row really exists.
      const saved = await env.DB.prepare('SELECT id, payload_hash FROM applications WHERE request_id = ?').bind(requestId).first();
      if (saved?.payload_hash === hash) return receipt(saved);
      throw new Error('SAVE_FAILED');
    }
    ctx.waitUntil(deliver(env, id).catch(() => console.error('MAIL_DELIVERY_DEFERRED')));
    return receipt({ id });
  }

  return {
    async fetch(request, env, ctx) {
      const path = new URL(request.url).pathname;
      if (!path.startsWith('/api/')) return env.ASSETS.fetch(request);
      if (path !== '/api/applications') return json({ error: '見つかりません。' }, 404);
      try { return await accept(request, env, ctx); }
      catch { console.error('APPLICATION_API_ERROR'); return json({ error: '受付を完了できませんでした。同じ画面から再送信してください。' }, 503); }
    },
    async scheduled(_event, env, ctx) {
      ctx.waitUntil((async () => {
        const now = seconds();
        await env.DB.batch([
          env.DB.prepare('DELETE FROM applications WHERE expires_at <= ?').bind(now),
          env.DB.prepare('DELETE FROM rate_limits WHERE expires_at <= ?').bind(now),
        ]);
        await deliver(env);
      })().catch(() => console.error('MAINTENANCE_FAILED')));
    },
  };
}
export default createWorker();
