import React, { createElement, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import pageManifest from './page-manifest.json';
const pageLoaders = import.meta.glob('./pages/*.json', { import: 'default' });
import { LocalForm, BookingCalendar } from './LocalInteractions';
import { localUrl, localCss, pageRoute } from './paths';
const route = pageRoute(window.location.pathname);
const pageFile = pageManifest[route];
import './reference.css';
import './interactions.css';
import './layout.css';
import HomeContent from './HomeContent';
import EmptyPageContent from './EmptyPageContent';

const attributeNames = { itemprop: 'itemProp', itemscope: 'itemScope', itemtype: 'itemType', spellcheck: 'spellCheck',  maxlength: 'maxLength', minlength: 'minLength', autocomplete: 'autoComplete', novalidate: 'noValidate', referrerpolicy: 'referrerPolicy', viewbox: 'viewBox',  class: 'className', for: 'htmlFor', tabindex: 'tabIndex', autoplay: 'autoPlay', playsinline: 'playsInline', readonly: 'readOnly', colspan: 'colSpan', rowspan: 'rowSpan', frameborder: 'frameBorder', allowfullscreen: 'allowFullScreen', datetime: 'dateTime', crossorigin: 'crossOrigin' };
const booleans = new Set(['itemScope', 'noValidate', 'autoPlay', 'muted', 'controls', 'loop', 'playsInline', 'open', 'disabled', 'required', 'readOnly']);
function reactProps(attributes) {
  const props = {};
  for (const [name, value] of Object.entries(attributes)) {
    const key = attributeNames[name] || name;
    if (name === 'style') {
      props.style = Object.fromEntries(value.split(';').filter(Boolean).map(declaration => {
        const colon = declaration.indexOf(':');
        const property = declaration.slice(0, colon).trim();
        return [property.startsWith('--') ? property : property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()), declaration.slice(colon + 1).trim()];
      }));
    } else props[key] = booleans.has(key) ? true : value;
  }
  for (const key of ['href', 'src', 'poster']) {
    if (props[key]) props[key] = localUrl(props[key]);
  }
  if (props.style) {
    for (const key of Object.keys(props.style)) {
      props.style[key] = localCss(props.style[key]);
    }
  }
  // Navigation links retain their real destinations without toggle-button semantics.
  if (props.href) { delete props['aria-pressed']; delete props.role; }
  return props;
}

function ImageSlider({ node }) {
  const slides = node.children.find(child => child.attrs?.class === 'swiper-wrapper')?.children.filter(child => typeof child !== 'string') || [];
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => setActive(current => (current + 1) % slides.length), 7000);
    return () => clearInterval(timer);
  }, [paused, slides.length]);
  return <div {...reactProps(node.attrs)} className={`${node.attrs.class} react-slider`} role="region" aria-label="サロンからのお知らせ" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
    {slides.map((slide, index) => <div key={index} className={`${slide.attrs.class} react-slide`} aria-hidden={index !== active} style={{ opacity: index === active ? 1 : 0 }}>{slide.children.map((child, i) => renderNode(child, i))}</div>)}
    <button className="slide-arrow prev" aria-label="前のお知らせ" onClick={() => setActive((active + slides.length - 1) % slides.length)}>‹</button>
    <button className="slide-arrow next" aria-label="次のお知らせ" onClick={() => setActive((active + 1) % slides.length)}>›</button>
    <div className="slide-dots">{slides.map((_, index) => <button key={index} aria-label={`お知らせ ${index + 1}`} aria-current={active === index ? 'true' : undefined} onClick={() => setActive(index)}/>)}</div>
  </div>;
}

function MobileNavigation({ node }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);
  useEffect(() => {
    const handleEscape = event => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);
  return <>
    <button id="vk-mobile-nav-menu-btn" className={`vk-mobile-nav-menu-btn ${open ? 'menu-is-open' : ''}`} aria-label={open ? 'メニューを閉じる' : 'メニューを開く'} aria-expanded={open} aria-controls="vk-mobile-nav" onClick={() => setOpen(!open)}>{open ? '閉じる' : 'MENU'}</button>
    {open && <button className="menu-backdrop" aria-label="メニューを閉じる" onClick={() => setOpen(false)}/>}
    <div {...reactProps(node.attrs)} className={`${node.attrs.class} react-navigation ${open ? 'is-open' : ''}`} hidden={!open} onClick={event => { if (event.target.closest('a')) setOpen(false); }}>{node.children.map((child, i) => renderNode(child, i))}</div>
  </>;
}

function renderNode(node, key) {
  if (!node) return null;
  if (typeof node === 'string') return node;
  if (node.attrs.id === 'booking-package-locale-ja') return <BookingCalendar key={key}/>;
  if (node.tag === 'form') return <LocalForm key={key} node={node} render={renderNode}/>;
  if (node.attrs.class?.includes('screen-reader-response') || node.attrs.class?.includes('wpcf7-turnstile') || node.attrs.class?.includes('hidden-fields-container') || node.attrs.class?.includes('wpcf7-response-output')) return null;
  if (node.attrs.class === 'entry-body' && !node.children.length && ['/メニュー/','/コーチング＆セラピー講座　お問い合わせ/'].includes(route)) return <EmptyPageContent key={key} route={route} render={renderNode}/>;
  if (node.tag === 'p' && !node.children.length) return null;
  if (node.attrs.class === 'entry-body' && route === '/') return <HomeContent key={key} node={node} render={renderNode}/>;
  if (node.attrs.id === 'vk-mobile-nav-menu-btn') return null;
  if (node.attrs.id === 'vk-mobile-nav') return <MobileNavigation key={key} node={node}/>;
  if (node.attrs.class?.includes('wp-block-vk-blocks-slider ')) return <ImageSlider key={key} node={node}/>;
  const props = { ...reactProps(node.attrs), key };
  if (['input','textarea','select'].includes(node.tag)) {
    if (props.type === 'submit') props.value = '入力内容を確認する';
    else if (props.value !== undefined) { props.defaultValue = props.value; delete props.value; }
    if (props['aria-required'] === 'true') props.required = true;
    delete props['aria-invalid'];
  }
  if (node.tag === 'iframe') props.title = 'サロンへのアクセスマップ';
  if (node.tag === 'video') props['aria-label'] = '陽の光と緑に包まれたプライベートサロン';
  return createElement(node.tag, props, node.children.length ? node.children.map((child, i) => renderNode(child, i)) : undefined);
}

function App() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(Boolean(pageFile));
  useEffect(() => {
    let cancelled = false;
    if (!pageFile) return;
    pageLoaders[`./pages/${pageFile}`]().then(page => {
      if (cancelled) return;
      document.body.className = page.bodyClass;
      document.title = page.title;
      setContent(page);
      setLoading(false);
    }).catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);
  if (loading) return <main className="page-loading" aria-busy="true">読み込み中…</main>;
  if (!content) return <main className="not-found"><h1>ページが見つかりません</h1><p>URLをご確認いただくか、トップページからお進みください。</p><a href={localUrl("/")}>トップページへ戻る</a></main>;
  return <><style>{localCss(content.css)}</style>{content.nodes.map((node, index) => renderNode(node, index))}</>;
}
createRoot(document.getElementById('root')).render(<App/>);
