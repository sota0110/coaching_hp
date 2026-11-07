/** Replace this adapter with the AWS/VPS API when real reception is enabled. */
export const applicationMode = 'demo';
export const autoReplyMessage = 'お申し込みありがとうございます。\n\n内容を確認のうえ、2営業日以内を目安にメールにてご連絡いたします。\n\nどうぞよろしくお願いいたします。';
export const bookingTimeZone = 'Asia/Tokyo';
const bookingClock = new Intl.DateTimeFormat('sv-SE', {
  timeZone: bookingTimeZone,
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

export function tokyoDateTime(date = new Date()) {
  const parts = Object.fromEntries(bookingClock.formatToParts(date).map(({ type, value }) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function preferenceError({ firstPreference, secondPreference }, now = new Date()) {
  const earliest = tokyoDateTime(now);
  if (firstPreference < earliest) return { field: 'firstPreference', message: '第1希望は現在以降の日時を選んでください。' };
  if (!secondPreference) return null;
  if (secondPreference < earliest) return { field: 'secondPreference', message: '第2希望は現在以降の日時を選んでください。' };
  if (secondPreference === firstPreference) return { field: 'secondPreference', message: '第2希望には第1希望と異なる日時を選んでください。' };
  return null;
}

export async function submitApplication(application) {
  // A demo never transmits or persists the visitor's personal information.
  if (!application.name?.trim() || !application.email?.trim()) throw new Error('入力内容をご確認ください。');
  return { mode: applicationMode, reference: `DEMO-${crypto.randomUUID().slice(0,8).toUpperCase()}` };
}
