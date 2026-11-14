export const privacyVersion = '2026-11-14-v2';
export const retentionDays = 365;
export const services = [
  'プライベートコーチング相談', '継続コーチング伴走コース',
  'コーチング＆セラピー講座', '単発講座', 'メンテナンスコーチング', 'その他のお問い合わせ',
];
export const coursesByService = {
  'コーチング＆セラピー講座': ['初級コース', '中上級コース'],
  '単発講座': ['コーチングママ知る講座', 'コーチング仲良し夫婦講座'],
};
export const methods = ['対面（渋谷区代々木）', 'オンライン（Zoom）'];
export const bookingTimeZone = 'Asia/Tokyo';
export const autoReplyMessage = 'お申し込みありがとうございます。\n\n内容を確認のうえ、2営業日以内を目安にメールにてご連絡いたします。\n\nどうぞよろしくお願いいたします。';
const clock = new Intl.DateTimeFormat('sv-SE', {
  timeZone: bookingTimeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});
export function tokyoDateTime(date = new Date()) {
  const parts = Object.fromEntries(clock.formatToParts(date).map(({ type, value }) => [type, value]));
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
const validDate = value => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)
  && Number.isFinite(Date.parse(`${value}:00+09:00`))
  && tokyoDateTime(new Date(`${value}:00+09:00`)) === value;
export const validEmail = value => typeof value === 'string' && value.length <= 254
  && /^[^\s@<>\x00-\x1f\x7f]+@[^\s@<>\x00-\x1f\x7f]+\.[^\s@<>\x00-\x1f\x7f]+$/.test(value);
export function validateApplication(input, now = new Date()) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('入力内容をご確認ください。');
  const limits = { name: 120, email: 254, service: 80, course: 80, firstPreference: 16, secondPreference: 16, method: 40, message: 5000, kind: 30, timeZone: 20 };
  const value = {};
  for (const [key, max] of Object.entries(limits)) {
    if (input[key] !== undefined && typeof input[key] !== 'string') throw new Error('入力内容をご確認ください。');
    value[key] = (input[key] ?? '').trim();
    if (value[key].length > max || /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value[key])) throw new Error('入力内容が長すぎるか、使用できない文字が含まれています。');
  }
  if (!value.name || /[\r\n]/.test(value.name) || !validEmail(value.email)) throw new Error('お名前とメールアドレスをご確認ください。');
  if (!services.includes(value.service) || !['inquiry', 'private-session'].includes(value.kind) || value.timeZone !== bookingTimeZone) throw new Error('サービスの選択をご確認ください。');
  if (input.consent !== true || input.privacyVersion !== privacyVersion) throw new Error('最新のプライバシーポリシーをご確認ください。');
  if (value.course && !coursesByService[value.service]?.includes(value.course)) throw new Error('講座の選択をご確認ください。');
  if (value.kind === 'private-session') {
    if (value.service !== services[0] || !methods.includes(value.method) || !validDate(value.firstPreference)
      || (value.secondPreference && !validDate(value.secondPreference))) throw new Error('希望日時と相談方法をご確認ください。');
    const invalid = preferenceError(value, now);
    if (invalid) throw new Error(invalid.message);
  } else {
    value.firstPreference = ''; value.secondPreference = ''; value.method = '';
  }
  return { ...value, consent: true, privacyVersion };
}
