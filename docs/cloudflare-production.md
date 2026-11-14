# Cloudflare無料枠での本番運用

## mainからの自動公開（2026年11月14日）

- Cloudflare Workers Buildsを `sota0110/coaching_hp` のみに連携済み。
- 本番ブランチは `main`。ビルドは有効、プレビュービルドは無効。
- ビルド: `pnpm test && pnpm build:production`。
- デプロイ: `pnpm db:migrate:remote && pnpm exec wrangler deploy`。
- ビルド環境にNode.js 24、公開Turnstile site key、`SITE_URL=https://coaching-therapy.jp/` を設定。
- 既存のWorker SecretsとD1を継続使用する。
- GitHub Pagesは公開停止済み。旧ワークフローを削除し、GitHub Actionsはテスト・通常ビルドのみ実施。
- トップ画像もGit管理し、自動公開の対象に含めた。

## 現在の本番受付と独自ドメイン接続

- 正式URL: https://coaching-therapy.jp/
- Cloudflare FreeのDNS・プロキシとWorkers Routesで配信する。
- `coaching-therapy.jp/*` と `www.coaching-therapy.jp/*` を `coaching-therapy` に接続済み。
- apexとwwwの既存Aレコードは `85.131.221.187` を保持し、両方Proxiedへ変更。旧サーバーのファイルは削除していない。Web配信はWorkerのStatic Assetsが担当し、旧サーバーには転送しない。
- ネームサーバーは `erin.ns.cloudflare.com` / `major.ns.cloudflare.com`。
- Redirect Rule `WWW to coaching-therapy.jp` でwwwをHTTPSのapexへ301転送。パス・クエリを保持。
- Redirect Rule `HTTPS for coaching-therapy.jp` でapexのHTTPをHTTPSへ301転送。パス・クエリを保持。
- `SITE_ORIGIN` とcanonical・OGP・sitemapの正式URLは `https://coaching-therapy.jp`。
- workers.devは確認用URLとして残し、`PREVIEW_ORIGIN` に明示。検索向けのcanonicalは正式ドメインに統一。
- ResendはVerified / Ready。送信元は `noreply@coaching-therapy.jp`。受付テスト制限は解除済み。
- ユーザーは独自ドメインのメールを利用せずGmailのみを使用。旧MX・SPF・既存DKIM等は保持している。
- 本番Version ID: `bea8905f-bbd9-4b79-aee7-0ff824b51985`（手動切り替え時）。

2026年11月14日の確認結果:

- 自動テスト15件が通過。本番ビルドで24ページを出力。
- 独自ドメインの全24ページをHTTPで確認し、すべて200・新HPのHTML・テスト表示なし。
- HTTPSのトップ・フォーム、HTTPからHTTPS、HTTP/HTTPSのwwwからapexの転送を確認。クエリも保持。
- robots.txtとsitemap.xmlが200で配信されることを確認。
- 独自ドメインの相談フォームでTurnstile、入力確認、受付完了を実機確認。
- 通知・自動返信ともGmail受信トレイへ到着。通知に氏名・希望日時2件・相談内容が入り、Reply-Toが申込者宛であることを確認。

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
現在は既存DNSレコードを保持するWorkers Routes方式を使用している。`wrangler.jsonc` のroutesとCloudflare DNSのProxied設定、および上記Redirect Rulesを維持する。

DNS管理先はCloudflareへ移行済み。既存のMXは `coaching-therapy.jp` 自体を参照している。現在は独自ドメインのメールを使用していない。将来ドメインメールを導入するときは、Web配信先とは別に正しいメール配送先を設定する。
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
