import React, { useEffect, useState } from 'react';
import { localUrl } from './paths';
import { navigation, siteName, formRoutes, socialLinks } from './site-config';
import { BookingLink } from './CallToAction';
import HeadingText from './HeadingText';

function MobileBookingBar() {
  const [inlineBookingVisible, setInlineBookingVisible] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const visible = new Set();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.intersectionRatio >= 0.98) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      setInlineBookingVisible(visible.size > 0);
    }, { threshold: 0.98 });
    document.querySelectorAll('main .booking-button').forEach(link => observer.observe(link));
    return () => observer.disconnect();
  }, []);

  return <div className={`mobile-booking-bar${inlineBookingVisible ? ' inline-booking-visible' : ''}`}><BookingLink/></div>;
}

export default function SiteFooter({route}) {
  const sticky = !formRoutes.has(route) && route !== '/プライバシーポリシー/';
  return <><footer className="salon-footer"><div className="container footer-grid"><div className="footer-brand"><p>{siteName}</p><span>こころを整えることを、もっと日常に。</span><span>渋谷区・代々木｜対面・オンライン対応</span></div>
    <nav aria-label="フッターナビゲーション">{navigation.map(([label,href])=><a key={href} href={localUrl(href)}><HeadingText>{label}</HeadingText></a>)}</nav></div>
    <div className="container footer-utility"><nav aria-label="その他のご案内">{[['サービスのご案内','/メニュー/'],['よくある質問','/よくある質問/'],['単発講座','/単発講座/'],['メンテナンスコーチング','/メンテナンスセッション/'],['お知らせ','/お知らせ/'],['プライバシーポリシー','/プライバシーポリシー/']].map(([label,href])=><a href={localUrl(href)} key={href}>{label}</a>)}</nav><small>© {new Date().getFullYear()} {siteName}</small></div>
    <nav className="container footer-social-links" aria-label="SNS・ブログ">
      {socialLinks.map(({ label, account, href }) => <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label}（別タブで開きます）`}>
        <span><strong>{label}</strong><small>{account}</small></span><span aria-hidden="true">↗</span>
      </a>)}
    </nav>
    <p className="site-demo-label container">デモサイトです。フォームから実際の申し込み・メール送信は行われません。</p>
  </footer>{sticky && <MobileBookingBar/>}</>;
}
