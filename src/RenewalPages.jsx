import React from 'react';
import HeadingText from './HeadingText';
import BookingForm from './BookingForm';
import { localUrl } from './paths';
import { faqs } from './site-config';
import { BookingLink, LineLink, PriceSummary, TextLink } from './CallToAction';

export function FAQList({items=faqs}) { return items.map(({q,a})=><details className="faq-item" key={q}><summary>{q}</summary><p>{a}</p></details>); }
export function FirstVisitPage() {
  return <div className="editorial-page first-visit-page"><header className="editorial-intro"><p className="section-kicker">初めてのご相談を、安心して。</p><h2>うまく話せなくても、大丈夫です。</h2><p>「何を話したらよいかわからない」「相談するほどのことなのかな」そんな気持ちのままでも、お越しいただけます。ここでは、初めての方にご利用の流れをご案内します。</p></header>
    <section><h2>どんな方が利用できますか？</h2><p>子育て中のママから、子育てが一段落した女性、家族や親との関係、自分自身のこれからを考える女性まで。大きな悩みがあるときだけでなく、少し立ち止まって気持ちを整理したいときにもご利用いただけます。</p></section>
    <section><h2>ご相談では、どんなことをするの？</h2><p>今気になっていることを、ゆっくりお話しいただく時間です。お話を伺いながら、気持ちや考えを一緒に整理します。あらかじめ話す内容を決めてくる必要はありません。</p><p>詳しいサポート内容は、サービスの詳細ページでご紹介しています。</p><TextLink href="/コーチング/">プライベートコーチング相談の詳細を見る</TextLink></section>
    <section><h2>お申し込みから、ご相談まで</h2><ol className="numbered-flow"><li><h3>ご希望の日時をお知らせください</h3><p>フォームにお名前・メールアドレス・希望日時・ご希望の相談方法をご入力ください。ご相談内容の記入は任意です。</p></li><li><h3>メールで日程を調整します</h3><p>主催者が日程を確認し、メールでご連絡します。ご希望に添えない場合は、別の日程をご提案します。双方で日時が確定したら予約完了です。</p></li><li><h3>ご自身のペースで、お話しください</h3><p>対面は代々木のサロン、オンラインはZoomでお会いします。対面では、ご希望の方にのみハンドマッサージを行います。お話だけのご相談もできます。</p></li></ol><p className="subtle-note">フォームの送信時点では、予約は確定していません。</p></section>
    <section><h2>対面・オンラインの違い</h2><div className="comparison-grid"><article><h3>対面｜渋谷区代々木</h3><p>日常から少し離れ、サロンでゆっくりお話しいただけます。ハンドマッサージは、ご希望の方にのみ行います。詳しい住所は予約確定後に個別にご案内します。</p><TextLink href="/アクセス/">アクセスを見る</TextLink></article><article><h3>オンライン｜Zoom</h3><p>遠方の方や事情のある方は、ご自宅など安心して過ごせる場所からご相談いただけます。ハンドマッサージの提供はありません。</p></article></div></section>
    <section><h2>料金と相談時間</h2><PriceSummary/><p>対面・オンラインともに75分です。対面でご希望の方にのみ行うハンドマッサージの料金も含まれています。</p></section>
    <section><h2>初めての方から、よくいただくご質問</h2><FAQList items={faqs.slice(0,3)}/><TextLink href="/よくある質問/">よくある質問をすべて見る</TextLink></section>
    <section className="gentle-callout"><h2>ご自分のための、小さな一歩から。</h2><p>ご利用前のご質問は、公式LINEでもお受けしています。</p><div className="action-group"><BookingLink/><LineLink/></div></section>
  </div>;
}
export function PrivateSessionPage() {
  return <div className="editorial-page private-session-page"><header className="session-opening"><div><p className="section-kicker">ホッとひと息♡</p><h2><HeadingText>プライベートコーチング相談</HeadingText></h2><p>今感じていることを、ゆっくり言葉にする。<br/>あなただけの時間で、気持ちや考えを一緒に整理します。</p></div><aside className="session-summary"><PriceSummary/><p className="small-note">対面：渋谷区代々木／オンライン：Zoom</p><BookingLink/></aside></header>
    <section><h2>自分の気持ちを、後回しにしていませんか？</h2><p>子育て、夫婦、家族、仕事、自分自身のこと。「ちょっと話を聴いてほしい」そんな気持ちからで大丈夫です。</p><p>お話を伺いながら、コーチングやセラピーの技法を用いて、今の気持ちや考えを整理します。自分でも気づいていなかった本音や、これからどうしたいのかを一緒に見つめていきます。</p></section>
    <section><h2>ご相談で大切にしていること</h2><div className="three-principles"><article><span aria-hidden="true">01</span><h3>安心して話せること</h3><p>話がまとまっていなくても大丈夫。言葉にならない気持ちも含めて、丁寧に伺います。</p></article><article><span aria-hidden="true">02</span><h3>あなただけの時間</h3><p>決まった答えを押しつけず、ご自身が大切にしたいことや、次の一歩を一緒に見つけていきます。</p></article><article><span aria-hidden="true">03</span><h3>お話を大切に扱うこと</h3><p>人には話しにくいことも、ご自身のペースでお話しください。</p></article></div></section>
    <section><h2>対面でご希望の方にのみ、ハンドマッサージも。</h2><p>心と身体をゆるめ、リラックスしてお話しいただけるよう、対面ではご希望の方にのみハンドマッサージを行います。料金は相談料金に含まれています。</p><p>ハンドマッサージを受けず、お話だけのご相談もできます。オンラインではハンドマッサージの提供はありません。</p></section>
    <section><h2>セッション概要</h2><dl className="service-facts"><div><dt>相談時間</dt><dd>75分</dd></div><div><dt>料金</dt><dd>6,000円（税込）<br/>公式LINEからのお申し込みは1,000円OFF、5,000円（税込）</dd></div><div><dt>方法</dt><dd>対面を基本に、遠方の方や事情のある方はオンライン（Zoom）でも対応します。</dd></div><div><dt>対面会場</dt><dd>東京都渋谷区代々木のプライベートサロン<br/>詳しい住所は予約確定後に個別にご案内します。</dd></div><div><dt>ハンドマッサージ</dt><dd>対面でご希望の方にのみ提供します。相談料金に含まれます。</dd></div><div><dt>ご予約</dt><dd>フォームにご希望の日時をご入力ください。主催者とメールで日程を調整し、双方で日時が確定したら予約完了です。</dd></div></dl></section>
    <section className="gentle-callout"><h2>まずは、今のお気持ちから。</h2><p>一度のご相談から、お気軽にどうぞ。継続をご希望の方には、伴走コースをご案内しています。</p><div className="action-group"><BookingLink/><LineLink/></div><TextLink href="/はじめての方へ/">初めての方へ・ご利用の流れ</TextLink></section>
  </div>;
}
export function BookingPage() {
  return <div className="booking-page"><div className="booking-introduction"><p>ご希望の日時をお知らせください。</p><p>日程を確認のうえ、メールにてご連絡いたします。</p><p>ご希望に添えない場合は、別の日程をご提案させていただきます。</p><p className="subtle-note">※お申し込みの送信時点では、予約は確定しておりません。</p><PriceSummary compact/></div><BookingForm/>
  </div>;
}
const inquiryServices = {
  '/bansou-contact/':'継続コーチング伴走コース', '/single-course-contact/':'単発講座',
  '/maintenance-coaching-contact/':'メンテナンスコーチング', '/コーチング＆セラピー講座　お問い合わせ/':'コーチング＆セラピー講座',
};
export function InquiryPage({route}) {
  const service = inquiryServices[route];
  return <div className="booking-page"><div className="booking-introduction">{!service ? <><p>プライベートコーチング相談のお申し込みは、希望日時をご入力いただける専用フォームからお進みください。</p><BookingLink/><hr/><p>講座やコースについてのご質問、ご利用前のご相談は、以下のフォームまたは公式LINEからお寄せください。</p></> : <p>開催日程や内容についてのご質問など、お気軽にお知らせください。</p>}</div><BookingForm inquiry service={service||'その他のお問い合わせ'}/><div className="center-link"><LineLink/></div></div>;
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
    ['プライベートコーチング相談','75分・6,000円（税込）。公式LINEからのお申し込みは5,000円（税込）。','/コーチング/'],
    ['継続コーチング伴走コース','3回・5回・10回のコースで、継続的に自分と向き合う時間を。','/伴走コース/'],
    ['コーチング＆セラピー講座','自分を整え、人を癒す力を学ぶ。初級・中上級コース。','/コーチング＆セラピー講座/'],
    ['単発講座','今の自分に必要なテーマから、気軽に学んでいただけます。','/単発講座/'],
    ['メンテナンスコーチング','伴走コースを修了された方へ。120分・8,800円。','/メンテナンスセッション/'],
  ].map(([title,copy,href])=><article className="service-card" key={href}><h2>{title}</h2><p>{copy}</p><TextLink href={href}>詳細を見る</TextLink></article>)}</div></div>;
}
export function CourseOverview() {
  return <section className="course-overview" aria-label="伴走コースの回数・期間・料金"><div className="course-price-grid">{[['3回','約3か月','39,000'],['5回','約5か月','58,000'],['10回','半年〜1年','98,000']].map(([count,period,price])=><div key={count}><h2>{count}コース</h2><p>{period}</p><strong>{price}<small>円（税込）</small></strong></div>)}</div><p className="small-note">1回90分｜対面・オンライン（Zoom）｜2週間〜1か月に1回を目安に、ご自身のペースで。</p></section>;
}

export function PublicationNews() {
  return <article className="publication-article editorial-page" id="book-publication"><p className="section-kicker">出版予定のお知らせ</p><h2>書籍出版のお知らせ</h2><p><time dateTime="2027-05-02">2027年5月2日</time> 出版予定</p><p>このたび、初めての書籍を出版することになりました。</p><p>子育てに一所懸命だった日々。悩んだり、迷ったりしながら自分自身と向き合ってきたこと。そして、15年以上にわたり、たくさんのママたちと出会う中で気づかせてもらったこと。そんな経験を通じて、私が大切にしてきた想いを一冊の本に込めています。</p><p className="quiet-quote">「あなたはもうすでに幸せです」</p><p>そんなメッセージを必要としている方に届けられたら嬉しいです。</p><p>本の内容や、出版までの歩みも、少しずつお知らせしていきます。どうぞ楽しみにお待ちください。</p><hr/><h2>過去のお知らせ</h2></article>;
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
