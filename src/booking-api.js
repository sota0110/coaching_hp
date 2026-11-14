export { autoReplyMessage, bookingTimeZone, preferenceError, tokyoDateTime } from '../shared/application.js';
export const applicationMode = import.meta.env?.VITE_APPLICATION_MODE === 'production' ? 'production' : 'demo';
export const turnstileSiteKey = import.meta.env?.VITE_TURNSTILE_SITE_KEY || '';
export const acceptanceTest = import.meta.env?.VITE_ACCEPTANCE_MODE === 'test';
export async function submitApplication(application, { requestId, turnstileToken = '' } = {}) {
  if (!application.name?.trim() || !application.email?.trim()) throw new Error('入力内容をご確認ください。');
  if (applicationMode === 'demo') return { mode: 'demo', reference: `DEMO-${crypto.randomUUID().slice(0,8).toUpperCase()}` };
  const response = await fetch('/api/applications', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': requestId },
    body: JSON.stringify({ ...application, turnstileToken }), signal: AbortSignal.timeout(20000),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.mode !== 'production' || !result.reference) {
    throw new Error(result?.error || '受付状況を確認できませんでした。再送信しても同じ受付番号で処理します。');
  }
  return result;
}
