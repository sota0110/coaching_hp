import React, { useEffect, useRef, useState } from 'react';
import { localUrl, pageRoute } from './paths';
import { bookingPath, navigation, siteName } from './site-config';
import { BookingLink } from './CallToAction';
import HeadingText from './HeadingText';

export default function SiteHeader({ route = pageRoute(window.location.pathname) }) {
  const dialog = useRef(null);
  const [open, setOpen] = useState(false);
  const showBooking = route !== bookingPath && route !== '/coaching-course-contact/';
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
  const renderLinks = (splitRows = false) => navigation.map(([label, href], index) => (
    <React.Fragment key={href}>
      <a href={localUrl(href)} aria-current={href === route ? 'page' : undefined}>{label}</a>
      {splitRows && index === 4 && <span className="nav-row-break" aria-hidden="true"/>}
    </React.Fragment>
  ));
  return <header className="salon-header" id="top">
    <div className="header-main">
      <a href={localUrl('/')} className="salon-brand" aria-label={siteName}>
        <svg className="brand-mark" viewBox="0 0 48 56" fill="none" aria-hidden="true"><path d="M24 51V22M24 39C6 39 4 26 7 16c12 0 18 8 17 23ZM24 29C41 29 44 14 40 5c-12 3-17 12-16 24Z" stroke="currentColor" strokeWidth="1.4"/><circle cx="24" cy="51" r="2" fill="currentColor"/></svg>
        <span><span className="brand-title"><HeadingText>{siteName}</HeadingText></span><span className="brand-subtitle">こころを整えることを、もっと日常に。</span></span>
      </a>
      {showBooking && <BookingLink className="header-reservation"/>}
      <button className="menu-toggle" aria-label="メニューを開く" aria-haspopup="dialog" aria-controls="vk-mobile-nav" aria-expanded={open} onClick={openMenu}><span/><span/><span className="menu-word">MENU</span></button>
    </div>
    <nav className="desktop-navigation" aria-label="メインナビゲーション">{renderLinks(true)}</nav>
    <dialog id="vk-mobile-nav" className="mobile-menu" ref={dialog} onClose={() => setOpen(false)} onKeyDown={trapFocus} aria-label="メインナビゲーション" onClick={event => {if(event.target === dialog.current) dialog.current.close();}}>
      <div className="mobile-menu-inner">
        <button className="menu-close" aria-label="メニューを閉じる" onClick={() => dialog.current.close()}>閉じる <span aria-hidden="true">×</span></button>
        {showBooking && <BookingLink className="menu-reservation"/>}
        <nav>{renderLinks()}</nav>
      </div>
    </dialog>
  </header>;
}
