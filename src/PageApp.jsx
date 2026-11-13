import React, { createElement, useEffect, useLayoutEffect, useState } from 'react';
import SalonPhoto from './SalonPhoto';
import pageManifest from './page-manifest.json';
const pageLoaders = import.meta.glob('./pages/*.json', { import: 'default' });
import { localUrl, localCss } from './paths';
import SiteHeader from './SiteHeader';
import HomeContent from './HomeContent';
import HeadingText from './HeadingText';
import SiteFooter from './SiteFooter';
import VoicesPage from './VoicesPage';
import { BookingLink, LineLink, TextLink } from './CallToAction';
import { extraPages, pageTitles, customPageTitles, siteName, formRoutes, bookingPath, inquiryTopics, therapyInquiryPath, workshopInquiryPath, maintenancePricing, formatPrice } from './site-config';
import { AccessPage, BookingPage, CourseOverview, CourseSchedule, FAQPage, FirstVisitPage, InquiryPage, LaunchNewsArticle, PrivacyPage, PrivateSessionPage, ProfilePage, PublicationNews, ServiceDirectory, launchNewsPath, launchNewsSummary } from './RenewalPages';

export function createPageApp(route) {
  const pageFile = pageManifest[route];

  const copyCorrections = [
    ['お申込み','お申し込み'],['少しづつ','少しずつ'],['届られたら','届けられたら'],['こと大切に','ことを大切に'],
    ['何を大切のしたい','何を大切にしたい'],['考えていいます','考えています'],
    ['基本東的には','基本的には'],['私はどうしたんだろう','私はどうしたいんだろう'],
    ['一人ではきづけなかった','一人では気づけなかった'],['日常で実施し','日常で実践し'],
    ['お話いただける','お話しいただける'],['税込み','税込'],
    ['対面でご希望の方には、心と身体をゆるめるハンドマッサージをご用意しています。','対面でご希望の方にのみ、心と身体をゆるめるハンドマッサージをご用意しています。'],
  ];
  function corrected(text) { return route === '/お客様の声/' ? text : copyCorrections.reduce((value,[from,to])=>value.replaceAll(from,to),text); }
  function nodeText(node) {
    return typeof node === 'string' ? node : (node?.children ?? []).map(nodeText).join('');
  }
  function findNode(node,predicate) {
    if(!node||typeof node==='string')return null;
    if(predicate(node))return node;
    return node.children?.map(child=>findNode(child,predicate)).find(Boolean);
  }
  function fromPage(page,predicate) {return page.nodes.map(n=>findNode(n,predicate)).find(Boolean);}

  const continuingCourseSummaryTerms = new Set(['3回コース', '5回コース', '10回コース', '1回の時間', 'おすすめの間隔', '方法']);
  const isNewsArchive = route === '/2026/09/' || route === '/category/uncategorized/';


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
      node = corrected(node);
      if (!inHeading) return node;
      return <React.Fragment key={key}>{node.split(/(プライベート|コーチング|セラピー|お問い合わせ|すみいみゆき|ホッとひと息♡|はじめての方へ|自分らしい|見つける|オリジナル|セッション)/g).map((part, index) => index % 2 ? <span className="heading-phrase" key={index}>{part}</span> : part)}</React.Fragment>;
    }
    if (node.tag === 'style' || node.tag === 'script') return null;
    if (['archive-header', 'comments-area'].includes(node.attrs.class)) return null;
    if (node.attrs.id === 'site-header') return <SiteHeader key={key} node={node}/>;
    if (node.attrs.class?.includes('sub-section') && !node.children.length) return null;
    if (node.attrs.id === 'booking-package-locale-ja' || node.tag === 'form') return null;
    if (node.attrs.class?.includes('screen-reader-response') || node.attrs.class?.includes('wpcf7-turnstile') || node.attrs.class?.includes('hidden-fields-container') || node.attrs.class?.includes('wpcf7-response-output')) return null;
    if (node.tag === 'p' && !node.children.length) return null;

    if (node.attrs.id === 'vk-mobile-nav-menu-btn') return null;
    if (node.attrs.id === 'vk-mobile-nav') return null;
    if (node.attrs.class?.includes('wp-block-vk-blocks-slider ')) return <ImageSlider key={key} node={node}/>;
    if (node.attrs.class === 'gh-details-row') {
      const term = nodeText(node.children.find(child => child?.tag === 'dt')).trim();
      if (!nodeText(node).trim() || (route === '/伴走コース/' && continuingCourseSummaryTerms.has(term)) ||
          (route === '/メンテナンスセッション/' && term === '時間・料金')) return null;
      if (route === '/伴走コース/' && term === '対面会場') return <div key={key} className="gh-details-row">
        <dt>{term}</dt><dd>東京都渋谷区代々木のプライベートサロン。詳しい住所は予約確定後に個別にご案内します。</dd>
      </div>;
    }
    if (node.attrs.class === 'gh-hero-title') {
      if (route === '/伴走コース/' || route === '/メンテナンスセッション/') return null;
      if (route === '/コーチング＆セラピー講座/') return <h2 key={key} className="gh-hero-title">初級コースで学ぶ、こころの整え方</h2>;
    }
    if (route === '/伴走コース/' && node.attrs.class === 'gh-hero-copy') return <div className="gh-hero-copy" key={key}><p>一人ひとりの目指したい姿やペースに合わせて、自分自身と丁寧に向き合い、気づきを日常の変化につなげていく継続コースです。</p></div>;
    if (node.attrs.class?.includes('vk_post_excerpt') && nodeText(node).includes('この度ホームページを立ち上げました')) {
      return <p key={key} className="vk_post_excerpt">{launchNewsSummary}</p>;
    }
    if (node.attrs.class?.includes('entry-header')) return <div className="entry-meta-wrap" key={key}>{node.children.filter(child=>typeof child==='string'||!/^h[1-6]$/.test(child.tag)).map((child,i)=>renderNode(child,i))}</div>;
    const props = { ...reactProps(node.attrs), key };
    const tag = node.tag === 'main' ? 'div' : node.attrs.class === 'gh-eyebrow' ? 'p' : node.tag === 'h1' ? 'h2' : node.tag === 'h5' && node.attrs.class?.includes('vk_post_title') ? 'h2' : node.tag;
    if (route === '/コーチング＆セラピー講座/' && node.tag === 'section' && node.children.some(child => child?.attrs?.class === 'gh-course-grid')) {
      props.id = 'course-levels';
    }
    if (route === '/単発講座/' && node.attrs.class === 'gh-course') {
      const heading = node.children.find(child => child?.attrs?.class === 'gh-course-head');
      props.id = nodeText(heading).includes('ママ知る') ? 'workshop-mama' : 'workshop-couples';
    }
    if(node.tag === 'a') {
      const label = nodeText(node).trim();
      if(label.includes('メンテナンスコーチングを予約する')) return <a key={key} className="action-button secondary-button" href={localUrl('/maintenance-coaching-contact/')}>メンテナンスコーチングについて問い合わせる<span aria-hidden="true">↗</span></a>;
      if(label.includes('講座を予約する')) return <a key={key} className="action-button" href={localUrl(therapyInquiryPath)}>講座について問い合わせる<span aria-hidden="true">↗</span></a>;
      const privateLink = props.href?.includes('/trial-session-booking/') || props.href?.includes('/coaching-course-contact/') || /お問い合わせ.*ご予約はこちら/.test(label);
      if(privateLink) return <BookingLink key={key}/>;
      if(props.href?.includes('line.me') && /vk_button|gh-button/.test(props.className||'')) return <LineLink key={key}/>;
      if(props.className?.includes('gh-button') || props.className?.includes('vk_button_link')) props.className = 'action-button secondary-button';
      if (props.href === localUrl(workshopInquiryPath)) {
        const course = label.includes('ママ知る') ? 'mama' : label.includes('仲良し夫婦') ? 'couples' : null;
        if (course) props.href += `?course=${course}`;
      }
      if (props.href === localUrl(launchNewsPath) && label === 'お知らせ') props['aria-label'] = 'ホームページ完成しました！';
    }

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
      props.autoPlay = false;
      props.loop = true;
      props.preload = 'metadata';
      props.poster = localUrl('/assets/4f5754040abafabe.jpg');
    }
    const children = node.children.map((child, i) => renderNode(child, i, inHeading || /^h[1-6]$/.test(node.tag)));
    if (route === '/コーチング＆セラピー講座/' && node.attrs.class === 'gh-hero') {
      children.push(<SalonPhoto key="workshop-photo" scene="small-group-workshop" className="course-scene"/>);
    }
    if (route === '/コーチング＆セラピー講座/' && node.tag === 'article' && node.attrs.class?.startsWith('gh-course-card')) {
      const course = node.attrs.class.includes('is-primary') ? 'beginner' : 'advanced';
      const label = inquiryTopics['コーチング＆セラピー講座'][course];
      children.push(<TextLink key="course-inquiry" href={`${therapyInquiryPath}?course=${course}`}>{label}について問い合わせる</TextLink>);
    }
    if (route === '/メンテナンスセッション/' && node.attrs.class === 'gh-hero') {
      children.push(<div key="maintenance-rate" className="maintenance-quick-info">
        <p><strong>{maintenancePricing.minutes}分・{formatPrice(maintenancePricing.regular)}</strong></p>
        <TextLink href="/maintenance-coaching-contact/">メンテナンスについて問い合わせる</TextLink>
      </div>);
    }
    return createElement(tag, props, children.length ? children : undefined);
  }

  function App({ initialContent = null }) {
    const extra = extraPages[route];
    const customTitle = customPageTitles[route] || extra?.title;
    const [content,setContent]=useState(initialContent || (customTitle?{title:customTitle,bodyClass:'page',nodes:[]}:null));
    const [loading,setLoading]=useState(Boolean(pageFile && !customTitle && !initialContent));
    const [loadError,setLoadError]=useState(false);
    useEffect(()=>{
      let cancelled=false;
      if(!pageFile || customTitle || initialContent)return;
      pageLoaders[`./pages/${pageFile}`]().then(page=>{if(!cancelled){setContent(page);setLoading(false);}}).catch(()=>{if(!cancelled){setLoadError(true);setLoading(false);}});
      return()=>{cancelled=true;};
    },[]);
    useLayoutEffect(()=>{
      if(!content)return;
      document.body.className=`${route==='/'?'home':'page'} renewal-site ${formRoutes.has(route)?'application-route no-sticky-reservation':route==='/プライバシーポリシー/'?'no-sticky-reservation':''}`;
      document.title = route==='/' ? `${siteName}｜渋谷区代々木・対面とオンライン` : `${pageTitles[route] || content.title.split(' | ')[0]} | ${siteName}`;
      if (window.location.hash) document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: 'instant' });
    },[content]);
    if(loading)return <main className="page-loading" aria-busy="true">読み込み中…</main>;
    if(loadError)return <main className="not-found"><h1>ページを読み込めませんでした</h1><p>通信環境をご確認のうえ、もう一度お試しください。</p><button className="action-button" onClick={()=>window.location.reload()}>再読み込み</button></main>;
    if(!content)return <main className="not-found"><h1>ページが見つかりません</h1><a href={localUrl('/')}>ホームへ戻る</a></main>;
    const title=pageTitles[route] || content.title.split(' | ')[0];
    const isBookingPage = route === bookingPath || route === '/coaching-course-contact/';
    const breadcrumbTitle = isBookingPage ? '申し込みフォーム' : formRoutes.has(route) && route !== '/contact/' ? 'お問い合わせ' : title;
    const entry=fromPage(content,n=>n.attrs?.class==='entry-body');
    let body;
    if(route==='/')body=<HomeContent/>;
    else if(route==='/はじめての方へ/')body=<FirstVisitPage/>;
    else if(route==='/コーチング/')body=<PrivateSessionPage/>;
    else if(isBookingPage)body=<BookingPage/>;
    else if(formRoutes.has(route))body=<InquiryPage route={route}/>;
    else if(route==='/よくある質問/')body=<FAQPage/>;
    else if(route==='/プライバシーポリシー/')body=<PrivacyPage/>;
    else if(route==='/メニュー/')body=<ServiceDirectory/>;
    else if(route==='/アクセス/')body=<AccessPage mapSrc={entry && findNode(entry, n => n.tag === 'iframe')?.attrs.src}/>;
    else if(route==='/お客様の声/')body=<VoicesPage node={entry} render={renderNode}/>;
    else if(route==='/すみいみゆきについて/')body=<ProfilePage node={entry} render={renderNode}/>;
    else if(route===launchNewsPath)body=<LaunchNewsArticle/>;
    else {
      const main=fromPage(content,n=>n.attrs?.class?.startsWith('main-section'));
      const importedContent = (main?.children ?? []).map((node, index) => renderNode(node, index));
      body = <>
        {route === '/伴走コース/' && <CourseOverview/>}
        {route === '/コーチング＆セラピー講座/' && <CourseSchedule/>}
        {route === '/単発講座/' && <nav className="topic-links workshop-links" aria-label="単発講座の一覧">
          <a href="#workshop-mama">ママ知る講座</a><a href="#workshop-couples">仲良し夫婦講座</a>
        </nav>}
        {route === '/お知らせ/' ? <>
          <PublicationNews/>
          <section className="past-news" id="past-news" aria-labelledby="past-news-title">
            <h2 id="past-news-title">過去のお知らせ</h2>
            {importedContent}
            <nav className="archive-links" aria-label="過去の記事">
              <a href={localUrl('/2026/09/')}>2026年9月の記事</a><a href={localUrl('/category/uncategorized/')}>お知らせの記事一覧</a>
            </nav>
          </section>
        </> : importedContent}
      </>;
    }
    return <>
      <a className="skip-link screen-reader-text" href="#main">コンテンツへスキップ</a>
      <SiteHeader route={route}/>
      {route !== '/' && <>
        <div className="page-header"><div className="container page-header-inner"><h1 className="page-header-title"><HeadingText>{title}</HeadingText></h1></div></div>
        <nav className="breadcrumb" aria-label="現在の位置"><ol className="container breadcrumb-list">
          <li><a href={localUrl('/')}>ホーム</a></li>
          {(isNewsArchive || route === launchNewsPath) && <li><a href={localUrl('/お知らせ/')}>お知らせ</a></li>}
          <li aria-current="page">{breadcrumbTitle}</li>
        </ol></nav>
      </>}
      <main id="main" tabIndex={-1} className={`renewal-main ${route === '/' ? 'is-home' : 'container'}`}>{body}</main>
      <SiteFooter route={route}/>
    </>;
  }
  return App;
}
