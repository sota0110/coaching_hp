import React from 'react';

function collect(node, predicate, result = []) {
  if (typeof node === 'string') return result;
  if (predicate(node)) result.push(node);
  node.children?.forEach(child => collect(child, predicate, result));
  return result;
}

// Separate existing pricing text from the description without changing a character.
function servicePresentation(node) {
  if (node?.tag !== 'p') return node;
  const start = node.children.findIndex(child => typeof child === 'string' && /^\d+分/.test(child));
  if (start < 0) return node;
  return {...node, children: [...node.children.slice(0, start), {
    tag:'span', attrs:{class:'service-price'}, children:node.children.slice(start)
  }]};
}

/** Group the imported content into responsive, independently spaced sections. */
export default function HomeContent({ node, render }) {
  const items = node.children;
  const part = (start, end) => items.slice(start, end).map((item, i) => render(item, `${start}-${i}`));
  const serviceSource = items[27];
  const serviceCards = collect(serviceSource, item => item.children?.some(child => child.tag === 'h3'));
  const serviceImage = collect(serviceSource, item => item.tag === 'figure')[0];
  const maintenanceText = collect(serviceSource, item => item.tag === 'p' && JSON.stringify(item.children).includes('伴走コースを修了された方へ'))[0];
  const maintenanceButton = collect(serviceSource, item => item.attrs?.class?.includes('vk_button ') && JSON.stringify(item).includes('メンテナンスセッション'))[0];
  const voiceCards = collect(items[30], item => item.attrs?.class?.includes('gh-voice-card'));
  return <div className="entry-body home-content">
    <section className="home-hero" aria-label="サロンのご紹介">
      <div className="hero-media">{part(0, 1)}<span className="hero-orbit" aria-hidden="true"/></div>
      <div className="hero-copy">{render({...items[1], tag:'h1'}, 'hero-heading')}{part(3, 4)}{part(5, 6)}</div>
    </section>
    <section className="home-section home-intro" aria-label="サロンについて">{part(4, 5)}{part(6, 7)}</section>
    <section className="home-section home-services" aria-label="サービスのご案内">
      {render(serviceSource.children[0], 'service-heading')}
      <div className="services-introduction">{render(serviceImage, 'service-photo')}{render(serviceSource.children[1], 'service-intro')}</div>
      <div className="service-grid">{serviceCards.map((card, index) => <article className="service-card" key={index}>{card.children.map((child, i) => render(servicePresentation(child), `card-${index}-${i}`))}</article>)}</div>
      <aside className="service-maintenance"><h3>メンテナンスコーチング</h3>{render(maintenanceText, 'maintenance-text')}{render(maintenanceButton, 'maintenance-link')}</aside>
    </section>
    <section className="home-section home-concerns" aria-label="こんなお悩みありませんか">{part(12, 16)}</section>
    <section className="home-section home-message" aria-label="あなたへ">{part(17, 22)}</section>
    <section className="home-section home-salon" aria-label="ご相談について">{part(23, 24)}</section>
    <section className="home-section home-steps" aria-label="ご相談の流れ">{part(24, 26)}</section>
    <section className="home-section home-profile" aria-label="主催者のご紹介">{part(26, 27)}</section>
    <section className="home-section home-voices" aria-label="いただいたお言葉">
      {part(28, 30)}
      <div className="voice-grid">{voiceCards.map((card, index) => {
        const image = collect(card, item => item.tag === 'img')[0];
        const paragraphs = collect(card, item => item.tag === 'p');
        return <article className="voice-card" key={index}>{render(image, 'voice-icon')}<div className="voice-card-body">{paragraphs.map((paragraph, i) => render(paragraph, i))}</div></article>;
      })}</div>
      {part(31, 33)}
    </section>
    <section className="home-section home-news" aria-label="お知らせ">{part(8, 12)}</section>
    <section className="home-section home-faq" aria-label="よくある質問"><h2>よくある質問</h2>{part(34, 41)}</section>
    <section className="home-section home-contact" aria-label="お問い合わせ">{part(41, 44)}</section>
  </div>;
}
