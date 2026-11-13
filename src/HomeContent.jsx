import React from 'react';
import SalonPhoto from './SalonPhoto';
import { localUrl } from './paths';
import { faqs } from './site-config';
import { BookingLink, LineLink, PriceSummary, TextLink, ClosingInvitation } from './CallToAction';
export default function HomeContent() {
  return <div className="renewal-home">
    <section className="welcome-hero" aria-labelledby="welcome-title">
      <div className="welcome-copy"><p className="section-kicker">ママと女性のための<br/>こころのプライベートサロン</p>
        <h1 id="welcome-title"><span>こころを整えることを、</span><span>もっと日常に。</span></h1>
        <p className="welcome-message">自分を整えると、<br/><span className="heading-phrase">人との関係も</span><span className="heading-phrase">自然と変わっていく。</span></p>
        <p className="location-note">渋谷区・代々木｜対面・オンライン対応</p>
        <PriceSummary compact/><BookingLink/>
      </div>
      <figure className="welcome-photo"><img src={localUrl('/assets/home-salon-clear-table.jpg')} width="1086" height="1448" alt="自然光が入る代々木のサロンでお話を伺うすみいみゆき" fetchPriority="high"/><figcaption>渋谷区代々木のプライベートサロン</figcaption></figure>
    </section>
    <section className="renewal-section concerns-section" aria-labelledby="concerns-title"><div className="section-heading"><p className="section-kicker">こんなお悩みありませんか？</p><h2 id="concerns-title">毎日頑張っているあなたへ</h2></div>
      <ul className="concern-list">{['子どもに優しくしたいのに、ついイライラしてしまう。','家族を優先して、自分のことはいつも後回し。','心配や不安で、気持ちが落ち着かない。','誰かに話を聴いてほしいけれど、なかなか話せない。','子育てが一段落して、これからの自分の人生を考えたい。','もっと自分らしく、毎日を楽しみたい。'].map(text=><li key={text}>{text}</li>)}</ul>
      <div className="reading-width"><p>そんな気持ちを、ひとりで抱え込んでいませんか？</p><p>うまく話せなくても大丈夫。<br/>何を話したらよいかわからなくても大丈夫。</p><p>まずは、今の自分の気持ちに目を向けるところから始めてみませんか？</p></div>
    </section>
    <section className="renewal-section meaning-section" aria-labelledby="meaning-title"><div className="meaning-photo"><img src={localUrl('/assets/2275638f91285181.jpg')} alt="明るい窓辺のグリーンとお茶" loading="lazy" width="819" height="1024"/></div><div className="meaning-copy"><p className="section-kicker">こころを整えるということ</p><h2 id="meaning-title">自分を整えると、<br/>毎日が少しずつ変わっていく。</h2>
      <p>私たちは、毎日たくさんのことを考え、感じながら過ごしています。</p><p>子どものこと、家族のこと、仕事のこと。いつも誰かのために頑張っていると、自分の気持ちを後回しにしてしまうこともあります。</p><p>でも、自分の気持ちに気づき、大切にすることは、自分勝手なことではありません。</p><p>自分のこころが整ってくると、物事の受け止め方や、人との関わり方にも少しずつ変化が生まれます。</p><p className="quiet-quote">「こうしなきゃ」から「私はどうしたい？」へ。</p><p>自分らしく、心地よく生きていくために。<br/>こころにも、定期的なメンテナンスを。</p>
    </div></section>
    <section className="renewal-section private-highlight" aria-labelledby="private-title"><div className="section-heading"><p className="section-kicker">ホッとひと息♡プライベートコーチング相談</p><h2 id="private-title">まずは、ホッとひと息。<br/>自分のための時間を。</h2></div><div className="private-highlight-grid"><div>
      <SalonPhoto scene="private-dialogue"/>
      <p>「ちょっと話を聴いてほしい」<br/>そんな気持ちからで大丈夫です。</p><p>子育て、夫婦、家族、仕事、自分自身のこと。今感じていることを、ゆっくりお話しください。</p><p>お話を伺いながら、コーチングやセラピーの技法を用いて、気持ちや考えを整理していきます。</p><p>対面でのご相談では、ご希望の方にのみ、心と身体をゆるめるハンドマッサージを行います。</p><p>自分でも気づいていなかった本音や、これからどうしたいのかを一緒に見つめていきましょう。</p>
      </div><aside className="session-summary"><PriceSummary/><dl><div><dt>対面</dt><dd>渋谷区代々木</dd></div><div><dt>オンライン</dt><dd>Zoom対応</dd></div></dl><BookingLink/><TextLink href="/コーチング/">相談内容・詳細を見る</TextLink></aside></div>
    </section>
    <section className="renewal-section onward-section" aria-label="継続コースと学び"><article><SalonPhoto scene="shared-dialogue"/><p className="section-kicker">継続コーチング伴走コース</p><h2>継続的に、<br/>自分と向き合いたい方へ</h2><p>一度のご相談だけでなく、一定期間、自分自身と丁寧に向き合っていきたい方へ。</p><p>一人ひとりの目指したい姿やペースに合わせて、継続的に伴走します。</p><p>自分の思考や感情のパターンに気づき、物事の捉え方を広げながら、日常の変化につなげていきます。</p><TextLink href="/伴走コース/">伴走コースの詳細を見る</TextLink></article>
      <article><SalonPhoto scene="coaching-lesson"/><p className="section-kicker">コーチング＆セラピー講座</p><h2>自分を整え、<br/>人を癒す力を学ぶ。</h2><p>自分自身のこころを整えることから始め、家族や大切な人との関わり方を深く学んでいく講座です。</p><p>自分を知り、感情や思考の仕組みを学び、日常の中で実践することで、自分らしく生きる力を育てていきます。</p><p>自分のために学びたい方も、人との関わりに活かしたい方も。</p><TextLink href="/コーチング＆セラピー講座/">コーチング＆セラピー講座の詳細を見る</TextLink></article>
    </section>
    <section className="renewal-section host-section" aria-labelledby="host-name"><figure><img src={localUrl('/assets/4f5754040abafabe.jpg')} alt="主催者すみいみゆき" width="500" height="332" loading="lazy"/></figure><div><p className="section-kicker">ファミリーシフトコーチ</p><h2 id="host-name">すみいみゆき</h2><p>15年以上にわたり、NPO法人の活動を通じて、子育て中のママや女性の心のサポートに携わってきました。</p><p>たくさんの方のお話を聴く中で大切にしてきたのは、自分自身の気持ちに気づき、自分らしい幸せを見つけていくこと。</p><p>一人ひとりの想いを大切に、温かく丁寧に向き合います。</p><TextLink href="/すみいみゆきについて/">プロフィールを詳しく見る</TextLink></div></section>
    <section className="renewal-section client-voices" aria-labelledby="voices-title"><div className="section-heading"><h2 id="voices-title">ご相談くださった方からのお声</h2></div><div className="voice-grid">
      {[['心が軽くなりました','いつも子どもを優先して自分のことは後回しでした。みゆきさんとお話して自分の気持ちに気づけて心が軽くなりました。','40代・会社員・ママ'],['安心して話せる場所です','どんな話も否定せず聞いてくださるので安心して話せます。セッションの後は前向きな気持ちになれます。','30代・専業主婦・ママ'],['家族との関係が変わりました','自分の心が整うと子どもへの声かけが変わり家族みんなが穏やかに過ごせるようになりました。','40代・パート・ママ']].map(([title,quote,by])=><figure className="testimonial" key={title}><h3>{title}</h3><blockquote>{quote}</blockquote><figcaption>{by}</figcaption></figure>)}
      </div><p className="publication-consent">※ご本人のご了承をいただき、掲載しております。</p><div className="center-link"><TextLink href="/お客様の声/">お客様の声をもっと見る</TextLink></div></section>
    <section className="renewal-section home-faq" aria-labelledby="faq-title"><div className="section-heading"><h2 id="faq-title">よくある質問</h2></div>{faqs.slice(0,5).map(({q,a})=><details className="faq-item" key={q}><summary>{q}</summary><p>{a}</p></details>)}<div className="center-link"><TextLink href="/よくある質問/">よくある質問をもっと見る</TextLink></div></section>
    <aside className="renewal-section publication-note" aria-labelledby="publication-title"><div><p className="section-kicker">お知らせ</p><h2 id="publication-title">書籍出版のお知らせ</h2></div><p><time dateTime="2027-05-02">2027年5月2日</time> 出版予定。これまでの子育てと15年以上の活動を通じて大切にしてきた想いを、一冊の本に込めています。</p><TextLink href="/お知らせ/#book-publication">出版のお知らせを読む</TextLink></aside>
    <ClosingInvitation/>
  </div>;
}
