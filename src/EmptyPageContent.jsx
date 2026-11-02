import React from 'react';
import contactForm from './contact-form.json';
import { localUrl } from './paths';

const services = [
  {href:'/コーチング/', title:'プライベートコーチング相談', text:'まずは、ホッと一息。今の気持ちを整理し、自分らしい一歩を見つける時間です。'},
  {href:'/メンテナンスセッション/', title:'メンテナンスコーチング', text:'伴走コースを修了された方へ。ご自身のタイミングで、心を整えていきましょう。'},
  {href:'/伴走コース/', title:'伴走コース', text:'継続的に自分自身と向き合いたい方に、マンツーマンで寄り添います。'},
  {href:'/コーチング＆セラピー講座/', title:'コーチング＆セラピー講座', text:'自分を整えることから始めて、人との関係や人生との向き合い方を学びます。'},
  {href:'/単発講座/', title:'単発講座', text:'今の自分に必要なテーマから、気軽に学んでいただけます。'},
];

/** Two public source pages have no body. Reuse existing services and contact UI. */
export default function EmptyPageContent({route, render}) {
  if (route === '/メニュー/') return <div className="entry-body service-directory"><h2>サービスのご案内</h2><p>そのときのあなたに合った方法で、心を整えていきましょう。</p><div className="service-grid">{services.map(service => <article className="service-card" key={service.href}><h3>{service.title}</h3><p>{service.text}</p><a className="directory-link" href={localUrl(service.href)}>詳しく見る <span aria-hidden="true">→</span></a></article>)}</div></div>;
  return <div className="entry-body"><p>コーチング＆セラピー講座についてのご質問・お問い合わせはこちらから。</p>{render(contactForm, 'course-contact-form')}</div>;
}
