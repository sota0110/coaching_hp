export const siteName = 'こころのプライベートサロン';
export const bookingPath = '/trial-session-booking/';
export const bookingLabel = 'プライベートコーチング相談を申し込む';
export const lineUrl = 'https://line.me/R/ti/p/@615ytuyo';
export const socialLinks = [
  { label: 'Instagram', account: '@miyuki_sumii', href: 'https://www.instagram.com/miyuki_sumii/' },
  { label: '公式LINE', account: '@615ytuyo', href: lineUrl },
  { label: 'note', account: 'familyshiftcoach', href: 'https://note.com/familyshiftcoach' },
  { label: 'アメブロ', account: 'kosodate-oyasodati', href: 'https://ameblo.jp/kosodate-oyasodati/' },
];
export const sessionPricing = { minutes: 75, regular: 6000, line: 5000 };
export const maintenancePricing = { minutes: 120, regular: 8800 };
export const formatPrice = amount => `${amount.toLocaleString('ja-JP')}円（税込）`;
export const therapyInquiryPath = '/コーチング＆セラピー講座　お問い合わせ/';
export const workshopInquiryPath = '/single-course-contact/';
export const courseAnnouncementUrl = 'https://ameblo.jp/kosodate-oyasodati/entry-12983383581.html';
export const inquiryTopics = {
  'コーチング＆セラピー講座': { beginner: '初級コース', advanced: '中上級コース' },
  '単発講座': { mama: 'コーチングママ知る講座', couples: 'コーチング仲良し夫婦講座' },
};
export const navigation = [
  ['ホーム', '/'],
  ['はじめての方へ', '/はじめての方へ/'],
  ['プライベートコーチング相談', '/コーチング/'],
  ['継続コーチング伴走コース', '/伴走コース/'],
  ['コーチング＆セラピー講座', '/コーチング＆セラピー講座/'],
  ['主催者・すみいみゆきについて', '/すみいみゆきについて/'],
  ['お客様の声', '/お客様の声/'],
  ['アクセス', '/アクセス/'],
  ['お問い合わせ・予約', '/contact/'],
];
export const extraPages = {
  '/よくある質問/': { title: 'よくある質問', description: '初めてのご相談、対面・オンライン、ハンドマッサージ、講座についてのよくある質問です。' },
  '/プライバシーポリシー/': { title: 'プライバシーポリシー', description: 'お申し込み・お問い合わせに関する個人情報の取り扱いについて。' },
};
export const pageTitles = {
  '/trial-session-booking/': 'プライベートコーチング相談のお申し込み',
  '/coaching-course-contact/': 'プライベートコーチング相談のお申し込み',
  '/伴走コース/': '継続コーチング伴走コース',
  '/すみいみゆきについて/': '主催者・すみいみゆきについて',
  '/お客様の声/': 'お客様の声',
  '/category/uncategorized/': 'お知らせの記事一覧',
  '/contact/': 'お問い合わせ・予約',
};
export const customPageTitles = {
  '/': siteName, '/はじめての方へ/':'はじめての方へ', '/コーチング/':'プライベートコーチング相談',
  '/trial-session-booking/':'プライベートコーチング相談のお申し込み',
  '/coaching-course-contact/':'プライベートコーチング相談のお申し込み',
  '/contact/':'お問い合わせ・予約', '/bansou-contact/':'継続コーチング伴走コースのお問い合わせ',
  '/single-course-contact/':'単発講座のお問い合わせ', '/maintenance-coaching-contact/':'メンテナンスコーチングのお問い合わせ',
  '/コーチング＆セラピー講座　お問い合わせ/':'コーチング＆セラピー講座のお問い合わせ', '/メニュー/':'サービスのご案内',
};
export const formRoutes = new Set([
  '/trial-session-booking/', '/coaching-course-contact/', '/contact/', '/bansou-contact/',
  '/single-course-contact/', '/maintenance-coaching-contact/', '/コーチング＆セラピー講座　お問い合わせ/',
]);
export const faqs = [
  { q: '何を話していいかわかりません。', a: 'あらかじめ話すことを決めてくる必要はありません。「何となくモヤモヤしている」「自分でも何に悩んでいるかわからない」そんな状態でも大丈夫です。今感じていることから、ゆっくりお話しください。', group: 'ご相談について' },
  { q: '話すことが苦手なのですが、大丈夫ですか？', a: 'もちろん大丈夫です。上手に話す必要はありません。言葉がまとまらなくても、途中で止まってしまっても大丈夫。思いつくままにお話しいただきながら、一緒にこころを整理していきます。', group: 'ご相談について' },
  { q: '悩みがそれほど大きくなくても相談できますか？', a: 'もちろんです。「ちょっと疲れた」「誰かに聴いてほしい」「今の自分を整理したい」そんなときにも、お気軽にいらしてください。美容室や整体に行くように、こころのメンテナンスとしてご利用いただけます。', group: 'ご相談について' },
  { q: 'ハンドマッサージは必ず受けるのですか？', a: 'いいえ。対面でのご相談の際、ご希望の方にのみ行っています。ハンドマッサージの料金は相談料金に含まれています。マッサージをせずに、お話だけのご相談もできます。', group: 'ご相談について' },
  { q: '一度だけ相談することもできますか？', a: 'はい。一度のご相談から、お気軽にどうぞ。その後も継続して相談したい場合には、伴走コースなどをご案内しています。無理に継続をおすすめすることはありません。', group: 'ご相談について' },
  { q: 'どこで相談できますか？', a: '東京都渋谷区代々木のプライベートサロンで、対面のご相談を行っています。最寄り駅は代々木八幡駅・代々木公園駅です。詳しい住所は予約確定後に個別にご案内します。遠方の方や事情のある方には、Zoomでのオンライン相談にも対応しています。', group: 'お申し込み・ご利用方法' },
  { q: '申し込みを送った時点で予約は確定しますか？', a: '送信時点では予約は確定していません。ご希望の日時を確認し、主催者からメールでご連絡します。双方で日時が確定したら予約完了です。ご希望に添えない場合は、別の日程をご提案します。', group: 'お申し込み・ご利用方法' },
  { q: '以前相談したことがあります。久しぶりでも大丈夫ですか？', a: 'もちろんです。「また話したい」「一度立ち止まって、自分を整えたい」そんなタイミングで、お気軽にご相談ください。伴走コースを修了された方にはメンテナンスコーチングもご案内しています。', group: 'お申し込み・ご利用方法' },
  { q: '初級コースだけ受講することはできますか？', a: 'はい。初級コースのみのご受講も歓迎しています。まずは自分自身を知り、整えることから学んでいただけます。さらに深く学びたい方には、中上級コースをご案内しています。', group: '講座について' },
  { q: 'どのサービスを選べばいいのかわかりません。', a: '今の状況やお気持ちを伺いながら、あなたに合った方法を一緒に考えます。迷われるときは、公式LINEやお問い合わせフォームからお気軽にご質問ください。', group: '講座について' },
];
