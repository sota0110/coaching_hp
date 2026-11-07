/** Replace this adapter with the AWS/VPS API when real reception is enabled. */
export const applicationMode = 'demo';
export const autoReplyMessage = 'お申し込みありがとうございます。\n\n内容を確認のうえ、2営業日以内を目安にメールにてご連絡いたします。\n\nどうぞよろしくお願いいたします。';
export async function submitApplication(application) {
  // A demo never transmits or persists the visitor's personal information.
  if (!application.name || !application.email) throw new Error('入力内容をご確認ください。');
  return { mode: applicationMode, reference: `DEMO-${crypto.randomUUID().slice(0,8).toUpperCase()}` };
}
