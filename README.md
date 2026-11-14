# こころのプライベートサロン — React

React 19 / Vite 7、Cloudflare Workers Static Assetsで配信するサイトです。
申し込み・問い合わせはWorkers・D1・Turnstile・Resendで受け付けます。

## 公開

現在の公開URL: https://coaching-therapy.jp/

`www` およびHTTPから正式なHTTPS URLへ転送します。workers.devは確認用として残しています。

Cloudflare Workers BuildsをGitHubの `sota0110/coaching_hp` に連携し、`main` へのpushで自動公開します。
GitHub Pagesは公開停止し、Pages用ワークフローも削除しています。
GitHub Actionsはテストと通常ビルドを実行します。公開前のテストはCloudflareのビルドコマンドでも実行します。

Cloudflareの設定:

- 本番ブランチ: `main`
- ビルドコマンド: `pnpm test && pnpm build:production`
- デプロイコマンド: `pnpm db:migrate:remote && pnpm exec wrangler deploy`
- ルートディレクトリ: `/`
- ビルド変数: `NODE_VERSION=24`、本番用 `VITE_TURNSTILE_SITE_KEY`、`SITE_URL=https://coaching-therapy.jp/`
- 本番以外のブランチからの自動公開は無効

Workerの既存Secrets（Turnstile・Resend・送信制限用）はWorkerに保持します。
`.env` と `.dev.vars` はGitに含めません。設定例は `.env.example` と `.dev.vars.example` を参照してください。
独自ドメインの接続状況、通知・DNS・障害対応は [運用手順](docs/cloudflare-production.md) を参照してください。

## ローカル開発と検証

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm build
pnpm preview
```

開発URL: http://127.0.0.1:5173/
ビルド確認URL: http://127.0.0.1:4173/
通常ビルドは公開鍵などの環境設定がなければフォームをデモとして動作させます。
本番は必ず `pnpm build:production` を使い、実受付モードとルート配信を設定します。

手動公開が必要な場合:

```sh
pnpm test
pnpm build:production
pnpm db:migrate:remote
pnpm exec wrangler deploy
```

## 主な構成

- `src/HomeContent.jsx`: トップ画面。サロンの横長画像を全体表示します。
- `src/site-config.js`: ナビゲーション、共通文言、料金、FAQ。
- `src/BookingForm.jsx` / `src/booking-api.js`: 申し込み・問い合わせ。
- `worker/` / `shared/` / `migrations/`: 受付API、検証、D1スキーマ。
- `src/SiteHeader.jsx` / `src/SiteFooter.jsx` / `src/CallToAction.jsx`: 共通ナビゲーションと予約導線。
- `src/design.css` / `src/renewal.css`: デザインとレイアウト。
- `scripts/export-routes.mjs`: 24ページの静的HTML・メタデータ生成。
- `reference/`: 元サイトの参照データ。

本文はビルド時にHTMLへ描画し、Reactでメニューやフォームを有効にします。
写真等の元サイト公開素材の権利は各権利者に帰属します。
