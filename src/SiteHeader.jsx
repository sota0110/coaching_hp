import React, { useEffect, useRef, useState } from 'react';
import { localUrl, pageRoute } from './paths';

function find(node, predicate) {
  if (!node || typeof node === 'string') return null;
  if (predicate(node)) return node;
  return node.children?.map(child => find(child, predicate)).find(Boolean);
}
function text(node) {
  return typeof node === 'string' ? node : (node.children || []).map(text).join('');
}
export default function SiteHeader({ node }) {
  const dialog = useRef(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);
  const openMenu = () => { dialog.current.showModal(); setOpen(true); };
  const trapFocus = event => {
    if (event.key !== 'Tab') return;
    const controls = [...dialog.current.querySelectorAll('button, a[href]')];
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  const brand = text(find(node, n => n.attrs?.class === 'site-header-logo'));
  const nav = find(node, n => n.tag === 'ul');
  const links = nav.children.filter(n => typeof n !== 'string').map(item => find(item, n => n.tag === 'a')).filter(Boolean);
  const split = brand.indexOf('。') + 1;
  const renderLinks = () => links.map((link, i) => <a key={i} href={localUrl(link.attrs.href)} aria-current={pageRoute(link.attrs.href) === pageRoute(window.location.pathname) ? 'page' : undefined}>{text(link)}</a>);
  return <header className="salon-header" id="top">
    <div className="header-main">
      <a href={localUrl('/')} className="salon-brand">
        <svg className="brand-mark" viewBox="0 0 48 56" fill="none" aria-hidden="true"><path d="M24 51V22M24 39C6 39 4 26 7 16c12 0 18 8 17 23ZM24 29C41 29 44 14 40 5c-12 3-17 12-16 24Z" stroke="currentColor" strokeWidth="1.4"/><circle cx="24" cy="51" r="2" fill="currentColor"/></svg>
        <span><span className="brand-title">{brand.slice(0, split).split(/(もっと日常に。)/g).map((part, i) => <span className="heading-phrase" key={i}>{part}</span>)}</span><span className="brand-subtitle">{brand.slice(split)}</span></span>
      </a>
      <a className="header-contact" href={localUrl('/contact/')}>お問い合わせ・予約<span aria-hidden="true">↗</span></a>
      <button className="menu-toggle" aria-label="メニューを開く" aria-haspopup="dialog" onClick={openMenu}><span/><span/><span className="menu-word">MENU</span></button>
    </div>
    <nav className="desktop-navigation" aria-label="メインナビゲーション">{renderLinks()}</nav>
    <dialog id="vk-mobile-nav" className="mobile-menu" ref={dialog} onClose={() => setOpen(false)} onKeyDown={trapFocus} aria-label="メインナビゲーション" onClick={event => {if(event.target === dialog.current) dialog.current.close();}}>
      <div className="mobile-menu-inner"><button className="menu-close" aria-label="メニューを閉じる" onClick={() => dialog.current.close()}>閉じる <span aria-hidden="true">×</span></button><nav>{renderLinks()}<a href={localUrl('/メニュー/')}>サービスのご案内</a></nav></div>
    </dialog>
  </header>;
}
