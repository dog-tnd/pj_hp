# TND 公式サイト

東京理科大学プログラミングサークル TND の公式サイトです。

- **フレームワーク**: Astro 5（静的サイト生成）
- **ブログ記事・よくある質問**: microCMS（ヘッドレス CMS）から取得
- **本番ホスティング**: GitHub Pages
- **下書きプレビュー**: Vercel（`/blog/preview` のみ SSR）

## 前提条件

- Node.js と pnpm がインストールされていること
  - Node.js のバージョンは `.nvmrc` に記載（現在 `22.22.1`）
  - pnpm は以下でインストールできます

```bash
npm install -g pnpm
```

## セットアップ手順

1. リポジトリをクローン

```bash
git clone git@github.com:dog-tnd/pj_hp.git
cd pj_hp
```

2. Node.js のバージョンを合わせる（nvm 利用時）

```bash
nvm use
```

3. 依存関係をインストール

```bash
pnpm install
```

4. 環境変数を設定

`.env.example` をコピーして `.env` を作成し、値を設定します。
ブログ記事とよくある質問は microCMS から取得するため、**microCMS のキーが無いとビルドできません**。

```bash
cp .env.example .env
```

## 開発サーバーの起動

```bash
pnpm dev
```

`http://localhost:4321` で起動します。

### 開発用テストページ（dev 限定）

`http://localhost:4321/dev` に、確認用ページの一覧があります。

- **本番ビルド（GitHub Pages）にも Vercel にも含まれません**（dev のときだけルートが注入されます）
- 例: `/dev/code-sample` … 記事本文の描画（コードブロックのハイライト、インラインコード）を固定データで確認できます
- 例: `/dev/faq` … よくある質問ページを固定データで確認できます
- microCMS を呼ばないページであれば **`.env` 無しでも動作**します

新しい確認用ページを追加したいときは、`src/dev-pages/` に `.astro` を置くだけです。
ファイル名がそのまま URL になります（`src/dev-pages/foo.astro` → `/dev/foo`）。一覧にも自動で並びます。

### 下書きプレビュー

microCMS の下書きを本番と同じ見た目で確認するページです。

```
/blog/preview?contentId=<記事ID>&draftKey=<下書きキー>
```

ローカル（dev）と Vercel でのみ有効で、本番（GitHub Pages）では 404 になります。
URL は microCMS 管理画面の「画面プレビュー」から開けます。

## よくある質問の更新

`/faq` の質問と回答は、microCMS の2つの API で管理しています。コードを変えずに更新できます。

- `faq-categories` … カテゴリ。`name`（表示名）・`slug`（ページ内リンク用。英小文字・数字・ハイフン）・`sortOrder`（小さいほど上）
- `faq` … 質問。`question`・`answer`・`category`（カテゴリを参照）・`sortOrder`（カテゴリ内の並び順）

更新するときの注意:

- 回答（`answer`）は空行で段落が分かれます。段落の中の改行は、そのまま改行として表示されます
- 質問が1件も無いカテゴリは表示されません
- 公開中の質問が0件、カテゴリが未設定・非公開の質問がある、または `slug` が不正・重複しているときは、**ビルドが失敗して公開されません**（直前の公開内容が残ります）。GitHub Actions のログに理由が出ます
- 公開すると Webhook で自動的に再ビルドされます

## ビルド・型チェック

```bash
pnpm build
```

`astro check`（型チェック）と `astro build` をまとめて実行します。型チェックのみ行う場合:

```bash
pnpm astro check
```

## デプロイ

- `main` への push、または **microCMS の Webhook**（ブログ記事・よくある質問の公開・更新・公開終了・削除）で GitHub Actions が走り、GitHub Pages へ自動デプロイされます
- Webhook を取りこぼした場合の保険として、**6 時間ごとの定期リビルド**も設定されています

## プレビュー環境（Vercel）について

`/blog/preview` の SSR プレビューは Vercel でホスティングしており、
**現在は Ryoma0101 が個人アカウントで管理**しています。
本番（GitHub Pages）とは独立しているため、Vercel 側が停止しても本番サイトには影響しません。
