import React, { useRef, useState } from 'react';
import { localUrl } from './paths';
import { LineLink } from './CallToAction';
import { autoReplyMessage, submitApplication } from './booking-api';

const labels = {
  name:'お名前', email:'メールアドレス', service:'サービス', firstPreference:'希望日時・第1希望（日本時間）',
  secondPreference:'希望日時・第2希望（日本時間）', method:'ご希望の相談方法', message:'ご相談内容',
};
export default function BookingForm({inquiry=false, service='プライベートコーチング相談'}) {
  const [review, setReview] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const form = useRef(null), heading = useRef(null);
  const focusHeading = () => requestAnimationFrame(() => heading.current?.focus());
  const today = new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo'}).format(new Date());
  const confirm = event => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (values.website) return;
    setError('');setReview(Object.fromEntries(Object.entries(values).filter(([name])=>labels[name])));focusHeading();
  };
  const send = async () => {
    if (sending) return;
    setSending(true);setError('');
    try { setReceipt(await submitApplication({...review, timeZone:'Asia/Tokyo', kind:inquiry?'inquiry':'private-session'}));focusHeading(); }
    catch { setError('処理を完了できませんでした。入力内容を保持していますので、もう一度お試しください。'); }
    finally {setSending(false);}
  };
  const edit = () => {setReview(null);setError('');requestAnimationFrame(()=>form.current?.querySelector('input[name="name"]')?.focus());};
  if (receipt) return <section className="application-receipt" aria-labelledby="receipt-title">
    <p className="demo-badge">デモ送信完了・実際の送信は行っていません</p><h2 id="receipt-title" ref={heading} tabIndex={-1}>{inquiry?'お問い合わせの流れをご確認いただけました。':'お申し込みの流れをご確認いただけました。'}</h2>
    <p>この画面は確認用です。申し込み通知・自動返信メールの送信、申し込み内容の外部保存は行っていません。予約も確定していません。</p>
    <div className="reply-preview"><h3>本番運用時の自動返信メール（プレビュー）</h3><p>{inquiry?autoReplyMessage.replace('お申し込み','お問い合わせ'):autoReplyMessage}</p></div>
    {inquiry ? <p>本番運用時には、主催者が内容を確認し、メールでご連絡します。</p> : <ol className="reservation-steps"><li>主催者がご希望の日時を確認します。</li><li>メールでご連絡し、日程を調整します。</li><li>双方で日時が確定したら予約完了です。</li></ol>}
    <p className="small-note">デモ確認番号：{receipt.reference}</p><div className="action-group"><a className="action-button" href={localUrl('/')}>ホームへ戻る</a><LineLink/></div>
  </section>;
  return <div className="application-panel">
    <p className="demo-notice"><strong>現在はデモフォームです。</strong>入力・確認・デモ送信の流れをお試しいただけます。入力内容はメール送信・外部保存されません。</p>
    <form ref={form} className="application-form" onSubmit={confirm} hidden={review!==null}>
      <p className="required-note"><span className="required-mark">必須</span>のある項目をご入力ください。</p>
      <div className="form-field"><label htmlFor="application-name">お名前 <span className="required-mark">必須</span></label><input id="application-name" name="name" required autoComplete="name" maxLength={120}/></div>
      <div className="form-field"><label htmlFor="application-email">メールアドレス <span className="required-mark">必須</span></label><input id="application-email" type="email" name="email" required autoComplete="email" maxLength={254}/></div>
      {inquiry ? <div className="form-field"><label htmlFor="application-service">お問い合わせのサービス <span className="required-mark">必須</span></label><select id="application-service" name="service" defaultValue={service} required>{['プライベートコーチング相談','継続コーチング伴走コース','コーチング＆セラピー講座','単発講座','メンテナンスコーチング','その他のお問い合わせ'].map(value=><option key={value}>{value}</option>)}</select></div> : <input type="hidden" name="service" value="プライベートコーチング相談"/>}
      {!inquiry && <><div className="form-field"><label htmlFor="application-first">希望日時・第1希望 <span className="field-unit">日本時間</span> <span className="required-mark">必須</span></label><input id="application-first" type="datetime-local" name="firstPreference" min={`${today}T00:00`} required aria-describedby="date-help"/><p id="date-help" className="field-help">予約枠を表示するカレンダーではありません。ご都合のよい日時をお知らせください。</p></div>
      <div className="form-field"><label htmlFor="application-second">希望日時・第2希望 <span className="field-unit">日本時間・任意</span></label><input id="application-second" type="datetime-local" name="secondPreference" min={`${today}T00:00`}/></div>
      <fieldset className="form-field method-options"><legend>ご希望の相談方法 <span className="required-mark">必須</span></legend><label><input type="radio" name="method" value="対面（渋谷区代々木）" required/>対面（渋谷区代々木）</label><label><input type="radio" name="method" value="オンライン（Zoom）" required/>オンライン（Zoom）</label></fieldset></>}
      <div className="form-field"><label htmlFor="application-message">ご相談内容 <span className="field-unit">任意</span></label><textarea id="application-message" name="message" rows={6} maxLength={5000} aria-describedby="message-help"/><p id="message-help" className="field-help">差し支えのない範囲でご記入ください。詳しいお話はご相談の際に伺います。</p></div>
      <label className="form-consent"><input type="checkbox" name="consent" required/><span><a href={localUrl('/プライバシーポリシー/')} target="_blank" rel="noopener">プライバシーポリシー（仮設定・別タブ）</a>を確認しました。<span className="required-mark">必須</span></span></label>
      <div className="form-trap" aria-hidden="true"><label>Website<input name="website" autoComplete="off" tabIndex={-1}/></label></div>
      <button className="action-button" type="submit">入力内容を確認する<span aria-hidden="true">→</span></button>
    </form>
    {review && <section className="application-review" aria-labelledby="review-title"><h2 id="review-title" ref={heading} tabIndex={-1}>入力内容の確認</h2><p>内容をご確認のうえ、デモ送信へお進みください。</p><dl>{Object.entries(review).map(([key,value])=><div key={key}><dt>{labels[key]}</dt><dd>{value ? (['firstPreference','secondPreference'].includes(key) ? value.replace('T','　') : value) : '未入力'}</dd></div>)}</dl>
      {error && <p className="form-error" role="alert">{error}</p>}<div className="action-group"><button className="action-button" type="button" disabled={sending} onClick={send}>{sending?'処理中…':'デモ送信する（実際には送信されません）'}</button><button className="action-button secondary-button" type="button" disabled={sending} onClick={edit}>入力内容を修正する</button></div>
    </section>}
  </div>;
}
