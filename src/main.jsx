import React, { createElement, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import pageManifest from './page-manifest.json';
const pageLoaders = import.meta.glob('./pages/*.json', { import: 'default' });
import { LocalForm, BookingCalendar } from './LocalInteractions';
import { localUrl, localCss, pageRoute } from './paths';
const route = pageRoute(window.location.pathname);
const pageFile = pageManifest[route];
import './design.css';
import SiteHeader from './SiteHeader';
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
  if (props.style) props.style = Object.fromEntries(Object.entries(props.style).filter(([key]) => key === 'backgroundImage'));
  if (props.id?.startsWith('menu-') || props.id?.startsWith('post-')) delete props.id;
  // Navigation links retain their real destinations without toggle-button semantics.
  if (props.href) { delete props['aria-pressed']; delete props.role; }
  return props;
}

function ImageSlider({ node }) {
  const slides = node.children.find(child => child.attrs?.class === 'swiper-wrapper')?.children.filter(child => typeof child !== 'string') || [];
  const [active, setActive] = useState(0);
  return <div {...reactProps(node.attrs)} className={`${node.attrs.class} react-slider`} role="region" aria-label="サロンからのお知らせ">
    {slides.map((slide, index) => <div key={index} className={`${slide.attrs.class} react-slide`} aria-hidden={index !== active} style={{ opacity: index === active ? 1 : 0 }}>{slide.children.map((child, i) => renderNode(child, i))}</div>)}
    <button className="slide-arrow prev" aria-label="前のお知らせ" onClick={() => setActive((active + slides.length - 1) % slides.length)}>‹</button>
    <button className="slide-arrow next" aria-label="次のお知らせ" onClick={() => setActive((active + 1) % slides.length)}>›</button>
    <div className="slide-dots">{slides.map((_, index) => <button key={index} aria-label={`お知らせ ${index + 1}`} aria-current={active === index ? 'true' : undefined} onClick={() => setActive(index)}/>)}</div>
  </div>;
}

function renderNode(node, key, inHeading = false) {
  if (!node) return null;
  if (typeof node === 'string') {
    if (!inHeading) return node;
    return <React.Fragment key={key}>{node.split(/(プライベート|コーチング|セラピー|お問い合わせ|すみいみゆき|ホッとひと息♡|はじめての方へ|自分らしい|見つける|オリジナル|セッション)/g).map((part, index) => index % 2 ? <span className="heading-phrase" key={index}>{part}</span> : part)}</React.Fragment>;
  }
  if (node.tag === 'style' || node.tag === 'script') return null;
  if (node.attrs.id === 'site-header') return <SiteHeader key={key} node={node}/>;
  if (node.attrs.class?.includes('sub-section') && !node.children.length) return null;
  if (node.attrs.id === 'booking-package-locale-ja') return <BookingCalendar key={key}/>;
  if (node.tag === 'form') return <LocalForm key={key} node={node} render={renderNode}/>;
  if (node.attrs.class?.includes('screen-reader-response') || node.attrs.class?.includes('wpcf7-turnstile') || node.attrs.class?.includes('hidden-fields-container') || node.attrs.class?.includes('wpcf7-response-output')) return null;
  if (node.attrs.class === 'entry-body' && !node.children.length && ['/メニュー/','/コーチング＆セラピー講座　お問い合わせ/'].includes(route)) return <EmptyPageContent key={key} route={route} render={renderNode}/>;
  if (node.tag === 'p' && !node.children.length) return null;
  if (node.attrs.class === 'entry-body' && route === '/') return <HomeContent key={key} node={node} render={renderNode}/>;
  if (node.attrs.id === 'vk-mobile-nav-menu-btn') return null;
  if (node.attrs.id === 'vk-mobile-nav') return null;
  if (node.attrs.class?.includes('wp-block-vk-blocks-slider ')) return <ImageSlider key={key} node={node}/>;
  const props = { ...reactProps(node.attrs), key };
  if (props.href?.endsWith('#vk-mobile-nav')) props.onClick = event => {
    event.preventDefault();
    const toggle = document.querySelector('.menu-toggle');
    if (toggle && getComputedStyle(toggle).display !== 'none') toggle.click();
    else document.querySelector('.desktop-navigation a')?.focus();
  };
  if (['input','textarea','select'].includes(node.tag)) {
    if (props.type === 'submit') props.value = '入力内容を確認する';
    else if (props.value !== undefined) { props.defaultValue = props.value; delete props.value; }
    if (props['aria-required'] === 'true') props.required = true;
    delete props['aria-invalid'];
  }
  if (node.tag === 'iframe') props.title = 'サロンへのアクセスマップ';
  if (node.tag === 'a' && !node.children.some(child => typeof child === 'string' && child.trim()) && node.children.some(child => child.tag === 'img')) {
    if (props.href?.includes('note.com')) props['aria-label'] = 'note';
    if (props.href?.includes('ameblo.jp')) props['aria-label'] = 'アメブロ';
  }
  if (node.tag === 'video') {
    props['aria-label'] = '陽の光と緑に包まれたプライベートサロン';
    props.controls = true;
    props.autoPlay = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    props.loop = true;
    props.preload = 'metadata';
    props.poster = localUrl('/assets/4f5754040abafabe.jpg');
  }
  return createElement(node.tag, props, node.children.length ? node.children.map((child, i) => renderNode(child, i, inHeading || /^h[1-6]$/.test(node.tag))) : undefined);
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
  return <>{content.nodes.map((node, index) => renderNode(node, index))}</>;
}
createRoot(document.getElementById('root')).render(<App/>);
