# Cloudflare無料枠での本番運用

## mainからの自動公開（2026年11月14日）

- Cloudflare Workers Buildsを `sota0110/coaching_hp` のみに連携済み。
- 本番ブランチは `main`。ビルドは有効、プレビュービルドは無効。
- ビルド: `pnpm test && pnpm build:production`。
- デプロイ: `pnpm db:migrate:remote && pnpm exec wrangler deploy`。
- ビルド環境にNode.js 24、公開Turnstile site key、workers.devの `SITE_URL` を設定。
- 既存のWorker SecretsとD1を継続使用する。
- GitHub Pagesは公開停止済み。旧ワークフローを削除し、GitHub Actionsはテスト・通常ビルドのみ実施。
- トップ画像もGit管理し、自動公開の対象に含めた。

## 現在の本番受付と独自ドメイン接続

### 独自ドメイン接続の進捗（2026年11月14日）

- ユーザーの希望により、HPも `coaching-therapy.jp` へ切り替える方針。
- CloudflareにFreeプランのゾーンを追加済み。ユーザーはネームサーバー変更を保存済みと報告。Cloudflare側は反映待ち。
- 指定ネームサーバー: `erin.ns.cloudflare.com` / `major.ns.cloudflare.com`。
- 現在の権威DNSは `ns1.xserver.jp` ～ `ns5.xserver.jp`。親側DSは未検出。
- Cloudflare側には既存A（apex・www・wildcard）、MX、SPF、既存DKIM、Resend DKIMと2つのCNAME、計9レコードを準備した。現時点はすべてDNS onlyで旧配信先を維持。
- Resend DKIMはエックスサーバー側で全文に修正され、公開DNSとResendの全文一致を確認済み。Cloudflare側の準備レコードにも全文を登録済み。
- ResendのVerified / Forge Readyを確認済み。Workerの `MAIL_FROM` を `noreply@coaching-therapy.jp` へ変更・デプロイ済み。
- 認証後の問い合わせテスト1件でD1保存、通知・自動返信の送信成功、Gmail受信トレイへの両メール到着を確認済み。
- ユーザーはドメインのメールを使っておらず、Gmailのみと回答。旧MX等はこの時点では保存してある。
- ネームサーバー切り替え後、ゾーンActiveを確認し、WorkerのCustom Domain、canonical、受付の許可Originを本番ドメインへ設定する。wwwも新サイトへ向くよう扱いを揃える。
- 受付テスト制限は解除済み。現在のworkers.dev URLで一般の申し込み・問い合わせを本番受付できる。既存HPの置換を実行する際は、ユーザーによる旧HPへの影響の懸念を踏まえ、公開方針を確定する。

独自ドメインはDNS反映待ちで、新HPへの差し替えは未実行。 https://coaching-therapy.coaching-therapy-react.workers.dev/ で確認する。
Workerの `TEST_RECIPIENT` とローカルの `VITE_ACCEPTANCE_MODE=test` を削除し、本番ビルド・デプロイ済み。
Resendの送信元は認証済みの `noreply@coaching-therapy.jp`。一般の申込者の受付が可能。
本番受付の実機テストでは、従来の限定アドレスとは異なるGmailのプラスアドレスを使い、D1保存・通知・自動返信と、両メールの受信トレイへの到着を確認した。
24ページの出力HTMLにテスト案内がないこと、フォームに本番送信ボタン・完了画面が表示されることも確認済み。
最新のVersion ID: `e4ae9b63-c09a-4152-84c1-ed2f6c42ec94`。
運営者通知の全項目掲載に変更後、15件の自動テストと本番送信を確認。
Gmailで通知本文を読み、氏名・メール・希望日時2件（日本時間）・相談方法・複数行の相談内容・同意情報が揃い、Reply-Toが申込者宛であることを確認済み。
HPの独自ドメインは必須ではなく、送信元だけ認証したドメインを使い、HPを仮URLのまま運用することも可能。

2026年11月14日の確認結果:

- 自動テスト14件が通過。本番ビルドで24ページを出力。
- 仮URLの相談申し込みを1件送信し、D1保存とResendによる2通の送信受理を確認。
- Gmail上で通知は受信トレイ、自動返信は迷惑メールフォルダーに到着していることを確認。
- 390px幅の講座問い合わせで横のはみ出しがないこと、確認から修正へ戻って入力を保持することを確認。
- 独自ドメインのDNS・既存サイトは未変更。

## 構成

- 公開URL: https://coaching-therapy.jp/
- Workers Static Assetsで24ページを配信。動的処理は `/api/*` だけを通す。
- 受付APIはD1へ申し込みとメール送信待ちを同一トランザクションで保存する。
- Turnstileをサーバーでも検証。送信元、同意、サービス、日時、文字数も検証する。
- Resendで運営者通知と申込者の自動返信を送る。運営者通知には氏名・メール・サービス・講座・希望日時・相談方法・相談本文・同意情報・受付番号と日時を記載。自動返信には相談本文を転載しない。
- メール失敗時も受付は保存済みとして完了画面に受付番号を表示。10分ごとのCronで再試行する。
- 予約はこのAPIでは確定しない。運営者がメールで日程を調整する。

GitHub Pagesは公開停止し、Pages用のワークフローは削除した。Cloudflare Workers Buildsで `main` へのpush時に本番を自動公開する。設定値はREADMEの「公開」を参照。
`.openai/hosting.json` の既存Sitesプロジェクトも今回の公開先には使わない。

## 初回設定

```sh
pnpm install --frozen-lockfile
pnpm exec wrangler login
```

D1は `coaching-therapy-applications`、bindingは `DB`。作成済みIDを `wrangler.jsonc` に記載している。

```sh
pnpm db:migrate:remote
```

Turnstileはmanagedモードで作成し、実際に使うホスト名を許可する。公開site keyは `.env` へ、secret keyはWorker Secretへ登録する。
`.env.example` と `.dev.vars.example` は項目の例。本物の `.env` / `.dev.vars` はGitに含めない。

```sh
pnpm exec wrangler secret put TURNSTILE_SECRET_KEY
pnpm exec wrangler secret put RATE_LIMIT_SALT
pnpm exec wrangler secret put RESEND_API_KEY
```

`RATE_LIMIT_SALT` は十分長いランダムな値。`RESEND_API_KEY` は送信専用で、可能なら送信ドメインに制限する。
秘密鍵を `VITE_*` やGitHubリポジトリ内のファイルへ入れない。`VITE_*` はブラウザーへ公開される。

Resendで `coaching-therapy.jp` を登録し、表示されたDKIM・SPF等のDNSレコードを現在のDNS管理先に追加する。
既存のMXレコードやSPFを不用意に削除・置換しない。Resendの受信用MX設定は今回不要。
送信元は `noreply@coaching-therapy.jp`。送信ドメインの認証が完了するまでは、不特定の申込者へのメール送信は動作しない。

## ビルドと公開

`.env` に公開Turnstile key等を記載する（`.env.example` を参照）。本番ビルドは必ず以下を使用する。

```sh
pnpm test
pnpm build:production
pnpm exec wrangler deploy --dry-run
pnpm exec wrangler deploy
```

`build:production` はルート配信・実送信モード・本番canonicalを設定する。
`pnpm build` は環境変数未設定ならローカル確認用のデモになる。Cloudflareのビルドでは `pnpm test && pnpm build:production`、デプロイでは `pnpm db:migrate:remote && pnpm exec wrangler deploy` を実行する。

初回はworkers.devの確認用URLで検証する。`PREVIEW_ORIGIN` とTurnstileの許可ホスト名に確認用URLを追加する。
独自ドメインは、既存サイトを確認できる状態で移行する。Cloudflare DNSへ移す場合は、A・CNAME・MX・TXT等の既存レコードを確認し、メール設定も引き継ぐ。
確認が済んだらWorkersのCustom Domainとして `coaching-therapy.jp` を接続する。`www` の利用方針とリダイレクトも確認する。

現在のDNS管理先はエックスサーバー。既存のMXは `coaching-therapy.jp` 自体を参照しているため、
将来Web用Aレコードを変更する際は、メール配送先まで変わらないよう管理者と確認する。
メール認証用のResendドメインはDNS追加・認証とも完了済み。

## 公開前の実機確認

1. 相談申し込み、一般問い合わせ、講座問い合わせの入力→確認→修正→送信を確認。
2. 本人の管理するメールアドレスでテスト申し込みする。
3. 完了画面の受付番号とD1の保存レコードが一致することを確認。
4. 通知先と申込者の両方にメールが届くことを確認（迷惑メールフォルダーも確認）。
5. 通知への返信が申込者に向くこと、申し込みの全項目が通知に記載され、自動返信には相談本文が含まれないことを確認。
6. スマートフォン幅、Turnstile失敗時、連続クリック、入力保持を確認。
7. 24ページと日本語URL、canonical、Googleマップ等を確認。

ローカルの自動テストではSQLiteでD1と同じSQLを実行し、外部メール・Turnstile応答を模擬している。
本物の到達性、DNS認証、Workers無料枠のCPU使用時間は実環境で別途確認する。

## 日常の受付確認

通知メールに記載した受付番号をCloudflareダッシュボードのD1コンソールで検索する。
公開の管理APIは作らず、Cloudflareへログインできる運営者だけが内容を確認する。
Cloudflareアカウントには二要素認証を設定する。

```sql
SELECT id, datetime(created_at, 'unixepoch', '+9 hours') AS received_jst, payload
FROM applications ORDER BY created_at DESC LIMIT 30;

SELECT application_id, kind, status, attempts, last_error
FROM mail_outbox WHERE status != 'sent' ORDER BY next_attempt_at;
```

`sent` はResendが送信要求を受理した状態であり、相手の受信箱への到達保証ではない。
バウンスや配信状況はResendのEmails画面で確認する。
運営者は営業日ごとにD1の受付一覧と未送信一覧も確認し、通知メールだけに依存しない。

## 無料枠を守るための上限

このアプリ専用にResend無料アカウントを利用する前提。

- IP由来識別子ごとに15分間10回まで（迷惑送信対策）。生のIPはDBに保存しない。
- 受付はUTC日付で1日40件・月1,400件まで。1件につき2通分を見込む。
- メールAPIへの送信試行は1日90回・月2,900回まで。無料枠100通/日・3,000通/月に余裕を残す。
- 上限時はフォームに公式LINEを案内。予算枠に達したメールは待機する。
- メール送信は通常直後に実行。失敗時はCronが再試行する。
- Providerの重複送信防止キーを使用。同じキーの有効期限を超える重複送信を避けるため、最初の試行から23時間以上の不明な送信は `failed / MANUAL_REVIEW_REQUIRED` にする。
- `PROVIDER_HTTP_4xx`（429除く）は自動再試行しない。キー・送信ドメイン・送信先を確認する。

このアプリ以外からのResend送信や、Resend側での独自制限によっては無料枠を共有する。
メール予算は送信試行回数で保守的に計算するため、実際の成功通数より早く上限になる場合がある。
Workers自体の無料枠超過時にも受付は止まるので、Cloudflareの使用量を確認する。

## メール障害への対応

1. 受付データはD1を確認。申込者に再申し込みを促す前に同じ受付番号を探す。
2. ResendのEmails画面でprovider_idや受付番号の件名を調べ、実送信の有無を確認する。
3. キー・DNS等を修正する。すでに届いたメールを再送しない。
4. 必要なら運営者が通常のメールで個別に返信する。
5. `MANUAL_REVIEW_REQUIRED` は確認なしにSQLでpendingへ戻さない。古いidempotency keyでは二重送信が起きうる。

## 保管期間と削除

受付レコードと送信待ち・送信履歴は受付から365日経過後、Cronで削除する。
短期の送信制限レコードも期限経過後に削除する。D1の復元用バックアップやResendの配信記録は別の保持方針を持つ。
対応メールをGmail等に残した場合は、運営者が対応完了後1年を目安に削除する。
削除依頼時は本人確認を行い、D1・運営者のメール・必要な委託先記録をそれぞれ確認する。
DBの受付期間だけ変更する場合も、公開プライバシーポリシーと共有定数を一致させる。

## ロールバック

```sh
pnpm exec wrangler deployments list
pnpm exec wrangler rollback VERSION_ID
```

コードのロールバックはDBのデータを戻さない。バックアップ復元は最新受付の消失につながるため、必要なレコードを確認してから行う。
