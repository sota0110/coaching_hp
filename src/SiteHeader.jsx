import React, { useEffect, useRef, useState } from 'react';
import { localUrl, pageRoute } from './paths';
import { bookingPath, navigation, siteName } from './site-config';
import { BookingLink } from './CallToAction';
import HeadingText from './HeadingText';
import './navigation.css';

const consultationLinks = navigation.filter(([, href]) => ['/コーチング/', '/伴走コース/'].includes(href));

function ConsultationMenu({ route, mobile = false, menuVisible = true }) {
  const group = useRef(null);
  const trigger = useRef(null);
  const clickOpened = useRef(false);
  const [expanded, setExpanded] = useState(false);
  const id = mobile ? 'mobile-consultation-links' : 'desktop-consultation-links';
  const active = consultationLinks.some(([, href]) => href === route);
  const close = () => { clickOpened.current = false; setExpanded(false); };
  useEffect(() => {
    if (mobile && !menuVisible) close();
  }, [mobile, menuVisible]);
  useEffect(() => {
    if (!expanded) return;
    const closeOutside = event => {
      if (!group.current?.contains(event.target)) close();
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [expanded]);
  return <div ref={group} className={`consultation-menu${active ? ' is-current' : ''}`}
    onPointerEnter={event => { if (!mobile && event.pointerType === 'mouse') setExpanded(true); }}
    onPointerLeave={event => { if (!mobile && event.pointerType === 'mouse' && !clickOpened.current) setExpanded(false); }}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) close(); }}
    onKeyDown={event => {
      if (event.key === 'Escape' && expanded) {
        event.preventDefault(); event.stopPropagation(); close(); trigger.current.focus();
      }
    }}>
    <button ref={trigger} type="button" className="consultation-trigger" aria-expanded={expanded} aria-controls={id}
      onClick={event => {
        if (mobile || event.detail === 0) {
          clickOpened.current = false; setExpanded(value => !value);
        } else if (clickOpened.current) close();
        else { clickOpened.current = true; setExpanded(true); }
      }}>
      <span>1on1相談</span><svg className="consultation-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="m2 4 4 4 4-4" stroke="currentColor" strokeWidth="1.5"/></svg>
    </button>
    <div id={id} className="consultation-submenu" hidden={!expanded}>
      {consultationLinks.map(([label, href]) => <a key={href} href={localUrl(href)} aria-current={href === route ? 'page' : undefined}>
        <span>{label}</span><span aria-hidden="true">→</span>
      </a>)}
    </div>
  </div>;
}

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
    const controls = [...dialog.current.querySelectorAll('button, a[href]')].filter(control => control.getClientRects().length);
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  const renderLinks = (mobile = false) => navigation.map(([label, href]) => {
    if (href === '/伴走コース/') return null;
    if (href === '/コーチング/') return <ConsultationMenu key={href} route={route} mobile={mobile} menuVisible={!mobile || open}/>;
    return <a key={href} href={localUrl(href)} aria-current={href === route ? 'page' : undefined}>{label}</a>;
  });
  return <header className="salon-header" id="top">
    <div className="header-main">
      <a href={localUrl('/')} className="salon-brand" aria-label={siteName}>
        <svg className="brand-mark" viewBox="0 0 48 56" fill="none" aria-hidden="true"><path d="M24 51V22M24 39C6 39 4 26 7 16c12 0 18 8 17 23ZM24 29C41 29 44 14 40 5c-12 3-17 12-16 24Z" stroke="currentColor" strokeWidth="1.4"/><circle cx="24" cy="51" r="2" fill="currentColor"/></svg>
        <span><span className="brand-title"><HeadingText>{siteName}</HeadingText></span><span className="brand-subtitle">こころを整えることを、もっと日常に。</span></span>
      </a>
      {showBooking && <BookingLink className="header-reservation"/>}
      <button className="menu-toggle" aria-label="メニューを開く" aria-haspopup="dialog" aria-controls="vk-mobile-nav" aria-expanded={open} onClick={openMenu}><span/><span/><span className="menu-word">MENU</span></button>
    </div>
    <nav className="desktop-navigation" aria-label="メインナビゲーション">{renderLinks()}</nav>
    <dialog id="vk-mobile-nav" className="mobile-menu" ref={dialog} onClose={() => setOpen(false)} onKeyDown={trapFocus} aria-label="メインナビゲーション" onClick={event => {if(event.target === dialog.current) dialog.current.close();}}>
      <div className="mobile-menu-inner">
        <button className="menu-close" aria-label="メニューを閉じる" onClick={() => dialog.current.close()}>閉じる <span aria-hidden="true">×</span></button>
        {showBooking && <BookingLink className="menu-reservation"/>}
        <nav>{renderLinks(true)}</nav>
      </div>
    </dialog>
  </header>;
}
