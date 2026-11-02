# Coaching Therapy — React

https://coaching-therapy.jp/ の公開ページを React 19 / Vite 7 で再現したプロジェクトです。ローカル開発とGitHub Pagesへの公開に対応しています。

## 起動

```sh
pnpm install
pnpm dev
```

開くURL: http://127.0.0.1:5173/

## ビルド

```sh
pnpm build
pnpm preview
```

ビルド後の確認URL: http://127.0.0.1:4173/coaching_hp/

## GitHub Pages

公開先: https://sota0110.github.io/coaching_hp/

GitHubのSettings → PagesでSourceをGitHub Actionsに設定すると、mainへのpushで `.github/workflows/pages.yml` が全22ページをビルド・公開します。非公開リポジトリのPages利用には対応するGitHubプランが必要です。

ローカル開発は `/`、ビルド・previewは `/coaching_hp/` を使用します。別のパスへ公開する場合は、`BASE_PATH=/別のパス/ pnpm build` で変更できます。

`dist/` には22ページ分の `index.html` を出力します。トップページ以外も、元サイトと同じパスで直接開けます。

## 再現したページ

固定ページ19件（ホーム、はじめての方へ、コーチング相談、プロフィール、お客様の声、各サービス、各お問い合わせフォーム、予約カレンダー、アクセス、メニュー、お知らせ）と、記事1件・月別アーカイブ・カテゴリー一覧の計22ページです。ページ一覧は `reference/manifest.json` に記録しています。

- サイト内リンクはローカルページへ接続します。LINE・Instagram・note・Ameba等の外部リンクは元のリンク先です。
- 写真・動画・フォントは `public/assets/` に保存しています。アクセスページの地図はGoogle Maps埋め込みのためオンライン接続が必要です。
- メニュー・スライダー・FAQ・カレンダーの月送りが動作します。
- フォームは必須入力・メール形式の検証、入力内容の確認・修正に対応しています。入力内容の保存・外部送信、予約の確定、リアルタイムの空き状況取得は実装していません。
- 決済・メール配信・WordPress管理画面・ログイン機能は含みません。

## 構成

- `src/pages/`: 各ページのサニタイズ済みコンテンツ。必要なページだけ読み込みます。
- `src/page-manifest.json`: URLとページデータの対応表。
- `src/main.jsx`: 共通描画、メニュー、スライダー。
- `src/HomeContent.jsx`: トップページのセクション・カード構成。
- `src/LocalInteractions.jsx`: 送信しない確認用フォームとカレンダー。
- `src/layout.css`: 余白・グリッド・高さ・画面幅ごとの共通調整。
- `src/reference.css`: 元サイトから取り込んだスタイル。
- `scripts/export-routes.mjs`: ビルド時に全ページのエントリーを生成。
- `scripts/import-site.py`: 公開ページと素材の再取得用。ネットワーク接続が必要です。
- `reference/`: 参照HTML、記事データ、ページ一覧。

## 確認

22ページを320px・390px・768px・1280pxの画面幅で表示し、横のはみ出しがないことを確認しました。フォームの確認・修正とカレンダーの月送りも確認しています。

元サイトで本文が空だった「メニュー」「コーチング＆セラピー講座 お問い合わせ」は、既存のサービス情報と確認用フォームで案内を補完しています。

元サイトの公開素材を再現用に使用しています。素材の権利は各権利者に帰属します。
