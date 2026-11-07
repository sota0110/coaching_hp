import React from 'react';
import HeadingText from './HeadingText';
import { localUrl } from './paths';
import { bookingLabel, bookingPath, formatPrice, lineUrl, sessionPricing } from './site-config';
export function BookingLink({className='', children=bookingLabel}) {
  return <a className={`action-button booking-button ${className}`} href={localUrl(bookingPath)} aria-label={bookingLabel}><span className="button-label"><HeadingText>{children}</HeadingText></span><span aria-hidden="true">↗</span></a>;
}
export function LineLink({children='公式LINEで質問する'}) {
  return <a className="action-button line-button" href={lineUrl}>{children}<span aria-hidden="true">↗</span></a>;
}
export function TextLink({href, children}) {
  return <a className="text-link" href={localUrl(href)}>{children}<span aria-hidden="true">→</span></a>;
}
export function PriceSummary({compact=false}) {
  const { minutes, regular, line } = sessionPricing;
  return <div className={`price-summary ${compact?'is-compact':''}`} aria-label="プライベートコーチング相談の料金">
    <p><span>{minutes}分</span><strong>{regular.toLocaleString('ja-JP')}<span>円（税込）</span></strong></p>
    <a className="line-price-link" href={lineUrl} aria-label={`公式LINEで申し込む（${formatPrice(line)}）`}>
      <span>公式LINEから<small>{(regular - line).toLocaleString('ja-JP')}円OFF</small></span>
      <strong>{formatPrice(line)} <span aria-hidden="true">↗</span></strong>
    </a>
  </div>;
}
export function ClosingInvitation() {
  return <section className="closing-invitation" aria-labelledby="closing-title"><div className="reading-width">
    <h2 id="closing-title">あなた自身を大切にする時間を、<br/>始めてみませんか？</h2>
    <p>大きな悩みでなくても大丈夫。</p><p>「少し話を聴いてほしい」<br/>「自分の気持ちを整理したい」</p>
    <p>そんな小さなきっかけを大切にしています。</p><p>あなたが自分らしく、笑顔で過ごせるように。<br/>まずは、お気軽にご相談ください。</p>
    <div className="action-group"><BookingLink/><LineLink/></div>
  </div></section>;
}
