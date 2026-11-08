import React from 'react';
import BookingForm, { DemoNotice } from './BookingForm';
import { localUrl } from './paths';
import { courseAnnouncementUrl, faqs, formatPrice, inquiryTopics, lineUrl, maintenancePricing, sessionPricing, therapyInquiryPath, workshopInquiryPath } from './site-config';
import { BookingLink, LineLink, PriceSummary, TextLink } from './CallToAction';

export function FAQList({items=faqs}) { return items.map(({q,a})=><details className="faq-item" key={q}><summary>{q}</summary><p>{a}</p></details>); }
export function FirstVisitPage() {
  return <div className="editorial-page first-visit-page">
    <header className="editorial-intro">
      <h2>うまく話せなくても、大丈夫です。</h2>
      <p>「何を話したらよいかわからない」「相談するほどのことなのかな」。そんな気持ちのままでも、お越しいただけます。</p>
      <PriceSummary compact/>
    </header>
    <section>
      <h2>どんな方が利用できますか？</h2>
      <p>子育て中のママから、子育てが一段落した女性、家族や親との関係、自分自身のこれからを考える女性まで。少し立ち止まって気持ちを整理したいときにもご利用いただけます。</p>
    </section>
    <section>
      <h2>ご相談では、どんなことをするの？</h2>
      <p>今気になっていることをゆっくりお話しいただき、気持ちや考えを一緒に整理します。あらかじめ話す内容を決めてくる必要はありません。</p>
      <TextLink href="/コーチング/">プライベートコーチング相談の詳細を見る</TextLink>
    </section>
    <section>
      <h2>お申し込みから、ご相談まで</h2>
      <ol className="numbered-flow">
        <li><h3>希望日時を入力する</h3><p>お名前・メールアドレス・希望日時と、対面かオンラインかをフォームに入力してください。ご相談内容の記入は任意です。</p></li>
        <li><h3>メールで日程を調整する</h3><p>主催者からメールでご連絡します。ご希望に添えない場合は、別の日程をご提案します。双方で日時を確認したら予約完了です。</p></li>
        <li><h3>ご予約の日時に相談する</h3><p>対面はご案内したサロンへお越しください。オンラインはZoomでお話しします。</p></li>
      </ol>
    </section>
    <section>
      <h2>対面・オンラインの違い</h2>
      <div className="comparison-grid">
        <article><h3>対面｜渋谷区代々木</h3><p>サロンでゆっくりお話しいただけます。ハンドマッサージはご希望の方にのみ行い、料金は相談料に含まれます。詳しい住所は予約確定後にご案内します。</p><TextLink href="/アクセス/">アクセスを見る</TextLink></article>
        <article><h3>オンライン｜Zoom</h3><p>遠方の方や事情のある方は、ご自宅など落ち着ける場所からZoomでご相談いただけます。</p></article>
      </div>
    </section>
    <section><h2>初めての方から、よくいただくご質問</h2><FAQList items={faqs.slice(0,3)}/><TextLink href="/よくある質問/">よくある質問をすべて見る</TextLink></section>
    <section className="gentle-callout"><h2>ご自分のための、小さな一歩から。</h2><p>ご利用前のご質問は、公式LINEでもお受けしています。</p><div className="action-group"><BookingLink/><LineLink/></div></section>
  </div>;
}

export function PrivateSessionPage() {
  return <div className="editorial-page private-session-page">
    <header className="session-opening">
      <div className="session-intro">
        <p className="section-kicker">ホッとひと息♡</p>
        <p>今の気持ちを、ゆっくり言葉に。</p>
      </div>
      <div className="session-summary">
        <PriceSummary compact/>
        <p className="small-note">対面：渋谷区代々木／オンライン：Zoom</p>
        <BookingLink/>
      </div>
    </header>
    <section>
      <h2>はじめての方も安心してご利用いただける、マンツーマンのプライベート相談です。</h2>
      <p>子育てのこと、家族や人間関係のこと、自分自身のこと。</p>
      <p>日々の暮らしの中で感じている悩みやモヤモヤを、安心できる空間でじっくりお話ししてみませんか？</p>
      <p>15年以上にわたる子育て支援の経験と、心理学・コーチング・セラピーの学びを生かし、今の気持ちや考えを一緒に整理していきます。</p>
      <p>うまく言葉にできなくても大丈夫。<br/>話したいことがまとまっていなくても大丈夫です。</p>
      <p>自分では気づいていなかった本音や、本当に大切にしたいことに気づき、これからの自分に必要な一歩を見つけていく時間です。</p>
      <p>対面でのご相談では、ご希望に応じてハンドマッサージも行っています。心と身体をゆるめ、ほっとリラックスした時間から始めましょう。</p>
      <p>一度のご相談からお気軽にご利用いただけます。</p>
    </section>
    <section>
      <h2>セッションの流れ</h2>
      <ol className="numbered-flow session-flow">
        <li>
          <h3><span className="session-step">STEP 1</span>心と気持ちをゆるめる</h3>
          <p>事前に簡単なアンケートをお送りします。<br/>今感じていることや気になっていることを、思いつくままに書いてみてください。</p>
          <p>当日は、リラックスした雰囲気の中でお話を始めます。</p>
        </li>
        <li>
          <h3><span className="session-step">STEP 2</span>自分の本音や気持ちに気づく</h3>
          <p>お話を伺いながら、コーチングやセラピーの技法を用いて、気持ちや考えを一緒に整理していきます。</p>
          <p>必要に応じてワークなども取り入れながら、さまざまな角度から自分自身を見つめていきます。</p>
        </li>
        <li>
          <h3><span className="session-step">STEP 3</span>新たな気づきを、これからの一歩へ</h3>
          <p>セッションでの気づきをもとに、これからどうしていきたいのかを一緒に考えていきます。</p>
          <p>必要に応じて、心理学やコーチングの視点からヒントをお伝えしたり、お話を通じて感じたことをメッセージとしてお届けしたりします。</p>
          <p>新たな視点や気づきを、これからの日々の暮らしや行動につなげていきましょう。</p>
        </li>
      </ol>
    </section>
    <section>
      <h2>ご相談で大切にしていること</h2>
      <div className="three-principles">
        <article><span aria-hidden="true">01</span><h3>安心して話せること</h3><p>話がまとまっていなくても大丈夫。言葉にならない気持ちも含めて、丁寧に伺います。</p></article>
        <article><span aria-hidden="true">02</span><h3>あなただけの時間</h3><p>決まった答えを押しつけず、ご自身が大切にしたいことや、次の一歩を一緒に見つけていきます。</p></article>
        <article><span aria-hidden="true">03</span><h3>お話を大切に扱うこと</h3><p>人には話しにくいことも、ご自身のペースでお話しください。</p></article>
      </div>
    </section>
    <section>
      <h2>対面でのご相談</h2>
      <dl className="service-facts">
        <div><dt>対面</dt><dd>渋谷区代々木のプライベートサロンで行います。詳しい住所は予約確定後に個別にご案内します。<br/><TextLink href="/アクセス/">最寄り駅とアクセスを見る</TextLink></dd></div>
        <div><dt>ハンドマッサージ</dt><dd>対面でご希望の方にのみ、心と身体をゆるめるハンドマッサージを行います。料金は相談料に含まれます。お話だけのご相談もできます。</dd></div>
      </dl>
    </section>
    <section>
      <h2>オンラインでのご相談も可能です</h2>
      <p>Zoomを利用したオンライン相談にも対応しています。</p>
      <p>オンラインでは、ハンドマッサージを除き、対話を中心に進めていきます。</p>
    </section>
    <section className="gentle-callout"><h2>まずは、今のお気持ちから。</h2><p>一度のご相談から、お気軽にどうぞ。継続をご希望の方には、伴走コースをご案内しています。</p><div className="action-group"><BookingLink/><LineLink/></div><TextLink href="/はじめての方へ/">初めての方へ・ご利用の流れ</TextLink></section>
    <section>
      <h2>03　メンテナンスセッション</h2>
      <h3>伴走コースを終えた後も、自分を整える時間を大切にしたい方へ</h3>
      <p>プライベートコーチング伴走コースを修了された方を対象とした、継続サポートのためのセッションです。</p>
      <p>伴走コースを通じて気づいたことや身につけてきたことを、日々の暮らしの中で生かし続けていくために。</p>
      <p>定期的に立ち止まり、今の自分の状態や気持ちを振り返りながら、これまでの変化や成長を確認していきます。</p>
      <p>新たに出てきた悩みや課題についても、一緒に整理しながら、これからの自分に必要な気づきや一歩を見つけていきましょう。</p>
      <p>伴走コースを終えた後も、安心して自分を整えられる場所としてご利用ください。</p>
      <dl className="service-facts">
        <div><dt>ご利用対象</dt><dd>プライベートコーチング伴走コースを修了された方</dd></div>
        <div>
          <dt>ご利用について</dt>
          <dd>
            <ul className="maintenance-facts">
              <li>時間：{maintenancePricing.minutes}分</li>
              <li>料金：{formatPrice(maintenancePricing.regular)}</li>
              <li>対面またはオンライン（Zoom）</li>
            </ul>
          </dd>
        </div>
      </dl>
      <TextLink href="/メンテナンスセッション/">メンテナンスセッションの詳細を見る</TextLink>
    </section>
  </div>;
}

export function BookingPage() {
  return <div className="booking-page">
    <DemoNotice/>
    <div className="booking-introduction">
      <p>ご希望の日時をお知らせください。日程を確認のうえ、メールにてご連絡いたします。ご希望に添えない場合は、別の日程をご提案させていただきます。</p>
      <p className="small-note">※お申し込みの送信時点では、予約は確定しておりません。</p>
    </div>
    <BookingForm/>
    <p className="booking-rate">{sessionPricing.minutes}分・{formatPrice(sessionPricing.regular)} <a href={lineUrl}>公式LINEで申し込む（{formatPrice(sessionPricing.line)}）</a></p>
  </div>;
}

const inquiryServices = {
  '/bansou-contact/': '継続コーチング伴走コース',
  [workshopInquiryPath]: '単発講座',
  '/maintenance-coaching-contact/': 'メンテナンスコーチング',
  [therapyInquiryPath]: 'コーチング＆セラピー講座',
};

export function InquiryPage({route}) {
  const service = inquiryServices[route];
  const courseKey = new URLSearchParams(window.location.search).get('course');
  const courses = inquiryTopics[service] ?? {};
  const initialCourse = Object.hasOwn(courses, courseKey) ? courses[courseKey] : '';
  return <div className="booking-page">
    <div className="booking-introduction">
      {service ? <p>開催日程や内容について、お気軽にご質問ください。</p> : <>
        <p>プライベートコーチング相談の希望日時は、専用フォームでお知らせください。</p>
        <div className="action-group"><BookingLink/><LineLink/></div>
      </>}
    </div>
    <DemoNotice/>
    <BookingForm inquiry service={service || 'その他のお問い合わせ'} initialCourse={initialCourse}/>
    {service && <div className="center-link"><LineLink/></div>}
  </div>;
}
export function FAQPage() {
  return <div className="editorial-page"><p className="intro-paragraph">初めてのご相談からお申し込み、講座について。安心してご利用いただけるよう、よくいただくご質問をまとめました。</p><nav className="topic-links" aria-label="質問のテーマ">{['ご相談について','お申し込み・ご利用方法','講座について'].map((group,i)=><a href={`#faq-group-${i}`} key={group}>{group}</a>)}</nav>{['ご相談について','お申し込み・ご利用方法','講座について'].map((group,i)=><section id={`faq-group-${i}`} key={group}><h2>{group}</h2><FAQList items={faqs.filter(f=>f.group===group)}/></section>)}<div className="action-group"><BookingLink/><LineLink/></div></div>;
}
export function PrivacyPage() {
  return <article className="editorial-page privacy-page"><p className="demo-notice"><strong>デモサイト用の仮設定です。</strong>運営者情報・連絡先・本番の受付方法は、実運用を始める前に確定し、本ページを更新します。</p><p>こころのプライベートサロンは、お申し込み・お問い合わせの際にお預かりする情報を大切に取り扱います。</p>
    <section><h2>現在のデモフォームについて</h2><p>フォームに入力した内容は、この画面の入力確認とデモ完了表示のためだけに利用します。メール送信、サーバーへの送信・保存は行いません。主催者に申し込み内容は届かず、予約も確定しません。</p><p>入力情報をブラウザーのストレージに保存することもありません。ページを再読み込みすると、画面で保持していた入力内容は破棄されます。</p></section>
    <section><h2>本番でお預かりする予定の情報と利用目的</h2><p>お名前、メールアドレス、希望日時、ご希望の相談方法、ご相談内容を、お申し込みへの対応、日程調整、お問い合わせへの回答に利用する予定です。ご相談内容の記入は任意とします。</p><p>受付システムの運用開始前に、情報の保管先、保存期間、削除方法、外部サービスへの委託の有無を確定し、本ページに掲載します。</p></section>
    <section><h2>外部サービスへのリンク・地図</h2><p>公式LINEやSNSへの移動、アクセスページのGoogleマップ表示では、それぞれのサービスのプライバシーポリシーが適用されます。</p></section>
    <section><h2>運営者・お問い合わせ窓口（仮設定）</h2><dl className="service-facts"><div><dt>サロン名</dt><dd>こころのプライベートサロン</dd></div><div><dt>運営者</dt><dd>すみいみゆき</dd></div><div><dt>メールアドレス</dt><dd>contact@example.invalid<br/><span className="small-note">仮のアドレスです。メールは届きません。本番運用前に変更します。</span></dd></div></dl><p>デモサイトについてのお問い合わせは、<a href={localUrl('/contact/')}>お問い合わせページ</a>から受付方法をご確認ください。</p></section>
  </article>;
}
export function ServiceDirectory() {
  return <div className="editorial-page"><p>今のあなたに合った方法で、こころを整える時間を。</p><div className="service-grid">{[
    ['プライベートコーチング相談',`${sessionPricing.minutes}分・${formatPrice(sessionPricing.regular)}。公式LINEからのお申し込みは${formatPrice(sessionPricing.line)}。`,'/コーチング/'],
    ['継続コーチング伴走コース','3回・5回・10回のコースで、継続的に自分と向き合う時間を。','/伴走コース/'],
    ['コーチング＆セラピー講座','自分を整え、人を癒す力を学ぶ。初級・中上級コース。','/コーチング＆セラピー講座/'],
    ['単発講座','今の自分に必要なテーマから、気軽に学んでいただけます。','/単発講座/'],
    ['メンテナンスコーチング',`伴走コースを修了された方へ。${maintenancePricing.minutes}分・${formatPrice(maintenancePricing.regular)}。`,'/メンテナンスセッション/'],
  ].map(([title,copy,href])=><article className="service-card" key={href}><h2>{title}</h2><p>{copy}</p><TextLink href={href}>詳細を見る</TextLink></article>)}</div></div>;
}
export function CourseOverview() {
  return <section className="course-overview" aria-labelledby="continuing-course-rates">
    <h2 id="continuing-course-rates">コースの回数・期間・料金</h2>
    <div className="course-price-grid">
      {[[3, '約3か月', 39000], [5, '約5か月', 58000], [10, '半年〜1年', 98000]].map(([count, period, price]) => (
        <div key={count}><h3>{count}回コース</h3><p>{period}</p><strong>{price.toLocaleString('ja-JP')}<small>円（税込）</small></strong></div>
      ))}
    </div>
    <p className="small-note">1回90分。対面またはZoomで、2週間〜1か月に1回を目安に進めます。</p>
    <TextLink href="/bansou-contact/">伴走コースについて問い合わせる</TextLink>
  </section>;
}

export function CourseSchedule() {
  return <section className="course-availability" aria-labelledby="course-schedule">
    <h2 id="course-schedule">開催・募集のご案内</h2>
    <p>主催者は、<time dateTime="2026-11-22">2026年11月22日</time>から公式LINEで先行募集を行う予定と案内しています。開催日程や募集状況は、最新の案内をご確認ください。</p>
    <div className="course-schedule-links">
      <TextLink href="#course-levels">初級・中上級の違いを見る</TextLink>
      <TextLink href={courseAnnouncementUrl}>主催者の募集案内を読む</TextLink>
    </div>
    <div className="action-group"><LineLink>公式LINEで募集案内を見る</LineLink><a className="action-button secondary-button" href={localUrl(therapyInquiryPath)}>講座について問い合わせる</a></div>
  </section>;
}

export function AccessPage({mapSrc}) {
  return <div className="editorial-page access-page">
    <p className="intro-paragraph">対面のご相談は、東京都渋谷区代々木のプライベートサロンで行います。住所と当日の行き方は、予約確定後に個別にお知らせします。</p>
    <section>
      <h2>最寄り駅</h2>
      <div className="comparison-grid">
        <article><p className="section-kicker">小田急小田原線</p><h3>代々木八幡駅</h3><TextLink href="https://www.odakyu.jp/station/yoyogi_hachiman/">代々木八幡駅の公式案内</TextLink></article>
        <article><p className="section-kicker">東京メトロ千代田線</p><h3>代々木公園駅</h3><TextLink href="https://www.tokyometro.jp/station/yoyogi-koen/index.html">代々木公園駅の公式案内</TextLink></article>
      </div>
      {mapSrc && <figure className="station-map">
        <iframe src={mapSrc} title="代々木八幡駅周辺の地図" loading="lazy" width="800" height="380" referrerPolicy="strict-origin-when-cross-origin"/>
        <figcaption>地図のマーカーは最寄りの代々木八幡駅を示しています。</figcaption>
      </figure>}
    </section>
    <section className="gentle-callout">
      <h2>オンラインでのご相談</h2>
      <p>遠方の方やご事情のある方は、Zoomでもご利用いただけます。お申し込み時にご希望の方法をお選びください。</p>
      <div className="action-group"><BookingLink/><LineLink/></div>
    </section>
  </div>;
}

export const launchNewsPath = '/2026/09/21/ホームページ完成しました！/';
export const launchNewsSummary = 'こころのプライベートサロンのホームページを開設しました。ご相談や講座の内容、最新のお知らせをご覧いただけます。';

export function LaunchNewsArticle() {
  return <article className="editorial-page launch-news">
    <p className="section-kicker"><time dateTime="2026-09-21">2026年9月21日</time></p>
    <p>{launchNewsSummary}</p>
    <p>プライベートコーチング相談をご検討の方は、専用フォームでお申し込みの流れをご確認いただけます。ご質問は公式LINEからお気軽にお寄せください。</p>
    <p className="subtle-note">2027年から、スイミーサロンのホームページでのプライベートコーチングの予約受付は終了します。今後は、こちらのサイトでご案内します。</p>
    <div className="action-group"><BookingLink/><LineLink/></div>
    <TextLink href="/お知らせ/#past-news">お知らせ一覧に戻る</TextLink>
  </article>;
}

export function PublicationNews() {
  return <article className="publication-article editorial-page" id="book-publication"><p className="section-kicker">出版予定のお知らせ</p><h2>書籍出版のお知らせ</h2><p><time dateTime="2027-05-02">2027年5月2日</time> 出版予定</p><p>このたび、初めての書籍を出版することになりました。</p><p>子育てに一所懸命だった日々。悩んだり、迷ったりしながら自分自身と向き合ってきたこと。そして、15年以上にわたり、たくさんのママたちと出会う中で気づかせてもらったこと。そんな経験を通じて、私が大切にしてきた想いを一冊の本に込めています。</p><p className="quiet-quote">「あなたはもうすでに幸せです」</p><p>そんなメッセージを必要としている方に届けられたら嬉しいです。</p><p>本の内容や、出版までの歩みも、少しずつお知らせしていきます。どうぞ楽しみにお待ちください。</p></article>;
}

function mergeStoryParagraphs(nodes) {
  const output=[];let children=[],length=0;
  const content = n=>typeof n==='string'?n:(n.children||[]).map(content).join('');
  const flush=()=>{if(children.length){output.push({tag:'p',attrs:{},children});children=[];length=0;}};
  nodes.forEach(n=>{if(typeof n==='string')return;if(n.tag!=='p'){flush();output.push(n);return;}if(length&&length+content(n).length>180)flush();children.push(...n.children);length+=content(n).length;});flush();return output;
}
export function ProfilePage({node,render}) {
  const nodes=node.children;
  const nextSection=nodes.findIndex((n,i)=>i>1 && n?.tag==='h2');
  const introEnd=nextSection<0?nodes.length:nextSection;
  const sections=[];let current=[];
  for(const n of nodes.slice(introEnd)) {
    if(typeof n!=='string'&&['h2','h3'].includes(n.tag)&&current.length){sections.push(current);current=[];}
    current.push(n);
  }
  if(current.length)sections.push(current);
  return <div className="editorial-page profile-detail"><header className="profile-opening"><div>{render({...nodes[0],tag:'p',attrs:{class:'section-kicker'}},'kicker')}{render(nodes[1],'heading')}{mergeStoryParagraphs(nodes.slice(2,introEnd)).map((n,i)=>render(n,i))}</div><figure><img src={localUrl('/assets/4f5754040abafabe.jpg')} width="500" height="332" alt="ファミリーシフトコーチ・すみいみゆき"/><figcaption>ファミリーシフトコーチ　すみいみゆき</figcaption></figure></header>{sections.map((section,i)=><section key={i}>{mergeStoryParagraphs(section).map((n,j)=>render(n.tag==='h3'?{...n,tag:'h2'}:n,j))}</section>)}</div>;
}
