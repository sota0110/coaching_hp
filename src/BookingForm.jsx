import React, { useEffect, useRef, useState } from 'react';
import { localUrl } from './paths';
import { LineLink } from './CallToAction';
import { acceptanceTest, applicationMode, autoReplyMessage, bookingTimeZone, preferenceError, submitApplication, tokyoDateTime } from './booking-api';
import { privacyVersion, services } from '../shared/application.js';
import Turnstile from './Turnstile';
import { inquiryTopics } from './site-config';

const labels = {
  name: 'お名前',
  email: 'メールアドレス',
  service: 'サービス',
  course: 'お問い合わせの講座',
  firstPreference: '希望日時・第1希望（日本時間）',
  secondPreference: '希望日時・第2希望（日本時間）',
  method: 'ご希望の相談方法',
  message: 'ご相談内容',
};

const production = applicationMode === 'production';

export function DemoNotice() {
  if (acceptanceTest) return <p className="demo-notice booking-demo-notice"><strong>受付テスト中です。</strong>現在は運営者による動作確認用です。実際のお申し込み・お問い合わせは<a href="https://line.me/R/ti/p/@615ytuyo">公式LINE</a>をご利用ください。</p>;
  if (production) return null;
  return <p className="demo-notice booking-demo-notice">
    <strong>デモフォーム</strong>入力内容は送信しません。
  </p>;
}

function FieldError({ error, field }) {
  if (error?.field !== field) return null;
  return <p id={`${field}-error`} className="field-error" role="alert">{error.message}</p>;
}

export default function BookingForm({ inquiry = false, service = 'プライベートコーチング相談', initialCourse = '' }) {
  const [review, setReview] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState(null);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [verificationAttempt, setVerificationAttempt] = useState(0);
  const submission = useRef(null);
  const [selectedService, setSelectedService] = useState(service);
  const form = useRef(null);
  const heading = useRef(null);
  const [earliest, setEarliest] = useState('');
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setEarliest(tokyoDateTime());
    setReady(true);
  }, []);
  const courses = Object.values(inquiryTopics[selectedService] ?? {});

  const focusHeading = () => requestAnimationFrame(() => heading.current?.focus());
  const showFieldError = invalid => {
    setFieldError(invalid);
    requestAnimationFrame(() => form.current?.elements.namedItem(invalid.field)?.focus());
  };
  const invalidProps = (field, hint) => {
    const invalid = fieldError?.field === field;
    return {
      'aria-invalid': invalid || undefined,
      'aria-describedby': [hint, invalid ? `${field}-error` : null].filter(Boolean).join(' ') || undefined,
    };
  };

  const confirm = event => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    values.name = values.name.trim();
    if (!values.name) {
      showFieldError({ field: 'name', message: 'お名前を入力してください。' });
      return;
    }

    const invalid = inquiry ? null : preferenceError(values);
    if (invalid) {
      showFieldError(invalid);
      return;
    }

    setError('');
    setFieldError(null);
    submission.current = { requestId: crypto.randomUUID(), website: values.website || '' };
    setReview(Object.fromEntries(Object.entries(values).filter(([name]) => Object.hasOwn(labels, name))));
    focusHeading();
  };

  const send = async () => {
    if (sending) return;
    const invalid = inquiry ? null : preferenceError(review);
    if (invalid) {
      setReview(null);
      showFieldError(invalid);
      return;
    }

    setSending(true);
    setError('');
    try {
      const result = await submitApplication({
        ...review,
        timeZone: bookingTimeZone,
        kind: inquiry ? 'inquiry' : 'private-session',
        consent: true, privacyVersion, website: submission.current.website,
      }, { requestId: submission.current.requestId, turnstileToken });
      setReceipt(result);
      focusHeading();
    } catch (failure) {
      setError(failure.message || '処理を完了できませんでした。入力内容を保持していますので、もう一度お試しください。');
      setVerificationAttempt(value => value + 1);
    } finally {
      setSending(false);
    }
  };

  const edit = () => {
    setReview(null);
    setError('');
    requestAnimationFrame(() => form.current?.elements.namedItem('name')?.focus());
  };

  if (receipt) return <section className="application-receipt" aria-labelledby="receipt-title">
    <h2 id="receipt-title" ref={heading} tabIndex={-1}>{acceptanceTest ? 'テスト受付が完了しました' : production ? '受け付けました' : 'デモ送信完了'}</h2>
    <p>{production ? 'お送りいただいた内容を保存しました。受付のお知らせをメールでお送りします。メールが届かない場合も、この画面に受付番号が表示されていれば受け付けは完了しています。' : '入力内容の確認が完了しました。本番の受付では、以下の文面をメールでお送りします。'}</p>
    {production && <p>通常2営業日以内を目安に主催者からご連絡します。連絡がない場合は、受付番号を添えて公式LINEからお問い合わせください。</p>}
    {!production && <div className="reply-preview">
      <h3>自動返信メールのプレビュー</h3>
      <p>{inquiry ? autoReplyMessage.replace('お申し込み', 'お問い合わせ') : autoReplyMessage}</p>
    </div>}
    {!inquiry && <>
      <h3 className="receipt-next-title">{production ? '日程調整の流れ（予約はまだ確定していません）' : '本番での日程調整の流れ'}</h3>
      <ol className="reservation-steps">
        <li>主催者がご希望の日時を確認します。</li>
        <li>メールでご連絡し、日程を調整します。</li>
        <li>双方で日時が確定したら予約完了です。</li>
      </ol>
    </>}
    <p className="small-note">{production ? '受付番号' : 'デモ確認番号'}：{receipt.reference}</p>
    <div className="action-group"><a className="action-button" href={localUrl('/')}>ホームへ戻る</a><LineLink/></div>
  </section>;

  return <div className="application-panel">
    <form
      id="application-form"
      ref={form}
      className="application-form"
      aria-label={inquiry ? 'お問い合わせフォーム' : 'プライベートコーチング相談のお申し込みフォーム'}
      onSubmit={confirm}
      onInput={() => fieldError && setFieldError(null)}
      hidden={review !== null}
    >
      <div className="form-trap" aria-hidden="true"><label htmlFor="application-website">Webサイト</label><input id="application-website" name="website" autoComplete="off" tabIndex={-1}/></div>
      <div className="form-field">
        <label htmlFor="application-name">お名前 <span className="required-mark">必須</span></label>
        <input id="application-name" name="name" required autoComplete="name" maxLength={120} {...invalidProps('name')}/>
        <FieldError error={fieldError} field="name"/>
      </div>
      <div className="form-field">
        <label htmlFor="application-email">メールアドレス <span className="required-mark">必須</span></label>
        <input id="application-email" type="email" name="email" required autoComplete="email" maxLength={254}/>
      </div>
      {inquiry ? <>
        <div className="form-field">
          <label htmlFor="application-service">お問い合わせのサービス <span className="required-mark">必須</span></label>
          <select id="application-service" name="service" value={selectedService} onChange={event => setSelectedService(event.target.value)} required>
            {services.map(value => <option key={value}>{value}</option>)}
          </select>
        </div>
        {courses.length > 0 && <div className="form-field" key={selectedService}>
          <label htmlFor="application-course">お問い合わせの講座 <span className="field-unit">任意</span></label>
          <select id="application-course" name="course" defaultValue={selectedService === service ? initialCourse : ''}>
            <option value="">検討中</option>
            {courses.map(course => <option key={course}>{course}</option>)}
          </select>
        </div>}
      </> : <input type="hidden" name="service" value={service}/>}
      {!inquiry && <>
        <div className="form-field">
          <label htmlFor="application-first">希望日時・第1希望 <span className="field-unit">日本時間</span> <span className="required-mark">必須</span></label>
          <input id="application-first" type="datetime-local" name="firstPreference" min={earliest} required {...invalidProps('firstPreference', 'date-help')}/>
          <p id="date-help" className="field-help">ご都合のよい日時をお選びください。</p>
          <FieldError error={fieldError} field="firstPreference"/>
        </div>
        <div className="form-field">
          <label htmlFor="application-second">希望日時・第2希望 <span className="field-unit">日本時間・任意</span></label>
          <input id="application-second" type="datetime-local" name="secondPreference" min={earliest} {...invalidProps('secondPreference')}/>
          <FieldError error={fieldError} field="secondPreference"/>
        </div>
        <fieldset className="form-field method-options">
          <legend>ご希望の相談方法 <span className="required-mark">必須</span></legend>
          <label><input type="radio" name="method" value="対面（渋谷区代々木）" required/>対面（渋谷区代々木）</label>
          <label><input type="radio" name="method" value="オンライン（Zoom）" required/>オンライン（Zoom）</label>
        </fieldset>
      </>}
      <div className="form-field">
        <label htmlFor="application-message">ご相談内容 <span className="field-unit">任意</span></label>
        <textarea id="application-message" name="message" rows={5} maxLength={5000} aria-describedby="message-help"/>
        <p id="message-help" className="field-help">差し支えのない範囲でご記入ください。</p>
      </div>
      <label className="form-consent">
        <input type="checkbox" name="consent" required/>
        <span><a href={localUrl('/プライバシーポリシー/')} target="_blank" rel="noopener">プライバシーポリシー{production ? '（別タブ）' : '（仮設定・別タブ）'}</a>を確認し、個人情報の取り扱いに同意します。<span className="required-mark">必須</span></span>
      </label>
      <button className="action-button" type="submit" disabled={!ready}>入力内容を確認する<span aria-hidden="true">→</span></button>
    </form>
    {review && <section className="application-review" aria-labelledby="review-title">
      <h2 id="review-title" ref={heading} tabIndex={-1}>入力内容の確認</h2>
      <p>内容をご確認のうえ、{production ? '送信' : 'デモ送信'}へお進みください。</p>
      <dl>{Object.entries(review).map(([key, value]) => {
        const isDate = key === 'firstPreference' || key === 'secondPreference';
        return <div key={key}><dt>{labels[key]}</dt><dd>{value ? (isDate ? value.replace('T', '　') : value) : '未入力'}</dd></div>;
      })}</dl>
      {production && <><Turnstile onToken={setTurnstileToken} attempt={verificationAttempt}/><button className="verification-retry" type="button" disabled={sending} onClick={() => setVerificationAttempt(value => value + 1)}>送信確認をやり直す</button></>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="action-group">
        <button className="action-button" type="button" disabled={sending || (production && !turnstileToken)} onClick={send}>{sending ? '送信中…' : acceptanceTest ? 'テスト送信する' : production ? (inquiry ? 'お問い合わせを送信する' : '申し込みを送信する') : 'デモ送信する（実際には送信されません）'}</button>
        <button className="action-button secondary-button" type="button" disabled={sending} onClick={edit}>入力内容を修正する</button>
      </div>
    </section>}
  </div>;
}
