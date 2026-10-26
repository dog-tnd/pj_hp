# TND 公式サイト

東京理科大学プログラミングサークル TND の公式サイトです。

- **フレームワーク**: Astro 7（静的サイト生成）
- **スタイル**: Tailwind CSS 4（`@tailwindcss/vite`）と `@tailwindcss/typography`。詳しくは下の「スタイル（Tailwind CSS 4）」
- **ブログ記事・外部サイトの記事・よくある質問**: microCMS（ヘッドレス CMS）から取得
- **本番ホスティング**: GitHub Pages
- **下書きプレビュー**: Vercel（`/blog/preview` のみ SSR）

## 前提条件

- Node.js と pnpm がインストールされていること
  - Node.js のバージョンは `.nvmrc` に記載（現在 `24.22.1`）
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

#### OG 画像（`public/og.png`）を作り直す

SNS で共有したときの画像（1200×630）は、`/dev/og-image`（`src/dev-pages/og-image.astro`）を撮って作ります。

1. `pnpm dev` を起動する（確認用ページのルートは起動したときに作られるので、ページを足したあとは起動し直す）
2. リポジトリのルートで、Chrome のヘッドレスで撮る

   ```bash
   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --hide-scrollbars --window-size=1200,630 --virtual-time-budget=5000 --screenshot=public/og.png http://localhost:4321/dev/og-image
   ```

3. 寸法が 1200×630 か確かめる：`sips -g pixelWidth -g pixelHeight public/og.png`

人数など変わりうる事実は、画像に入れません（spec 006）。

### 下書きプレビュー

microCMS の下書きを本番と同じ見た目で確認するページです。

```
/blog/preview?contentId=<記事ID>&draftKey=<下書きキー>
```

ローカル（dev）と Vercel でのみ有効で、本番（GitHub Pages）では 404 になります。
URL は microCMS 管理画面の「画面プレビュー」から開けます。

## よくある質問の更新

`/faq` の質問と回答は、microCMS の `faq` API で管理しています。コードを変えずに更新できます。

- `question`（質問）・`answer`（回答）・`category`（カテゴリ。セレクトフィールド）・`sortOrder`（並び順）
- カテゴリの選択肢は `一般的な質問｜GENERAL` のように「名前｜英字ラベル」の形です。英字ラベルは見出しの上の飾り文字になります（区切りは全角の `｜`）
- `sortOrder` はカテゴリをまたいだ通し番号です（一般的な質問 10番台、コース内容 20番台…）。カテゴリの並びは、そのカテゴリの中で一番小さい番号の順になります
- カテゴリを増やすときは、API 設定の `category` に「名前｜英字ラベル」の形で選択肢を足します
- コンテンツ ID は英字の短い名前にしてください（`/faq#q-<コンテンツID>` で質問へのリンクになります）

更新するときの注意:

- 回答（`answer`）は空行で段落が分かれます。段落の中の改行は、そのまま改行として表示されます
- 質問が1件も無いカテゴリは表示されません
- 公開中の質問が0件、カテゴリが未選択・複数選ばれている質問がある、カテゴリの選択肢が「名前｜英字ラベル」の形でない、または同じ英字ラベルが2つのカテゴリにあるときは、**ビルドが失敗して公開されません**（直前の公開内容が残ります）。GitHub Actions のログに理由が出ます
- よくある質問には Webhook を設定していないため、公開した内容は **6 時間ごとの定期リビルドで反映されます**（最大 6 時間かかります）。すぐに反映したいときは、GitHub Actions の「Deploy Astro site to GitHub Pages (Organization)」を手動で実行（Run workflow）してください

## 外部サイトの記事の載せ方

Zenn・Qiita などに書いた記事は、microCMS の「外部サイト」API（エンドポイント `external-posts`）に登録すると、`/blog` の一覧とトップの新着記事に、自サイトの記事と混ざって並びます（spec 008）。押すと新しいタブで外部サイトが開きます。

- `url`（記事の URL）・`site`（サイトの種類：Zenn／Qiita／その他）・`title`（32字以内）・`description`（55字以内）・`author`（著者名）は必須です
- `role`（役割）・`authorImage`（著者アイコン。ブログと同じ画像を選べます）・`image`（サムネイル）・`tags`（タグ。ブログと同じタグ）は任意です。サムネイルと著者アイコンが空のときは、サンプル画像が出ます
- 並び順と日付は、microCMS の**公開日時**です。昔の記事を後から登録するときは、公開日時を外部サイトで公開した日に変えてください
- 外部サイトの記事は、自サイトの記事ページ（`/blog/<id>`）を作らず、記事ページの「関連記事」「前後の記事」にも出ません

次の記事は表示されません（ビルドは止まらず、GitHub Actions のログに理由が出ます）:

- URL が `https://` で始まらない
- サイトの種類が Zenn なのに `zenn.dev`、Qiita なのに `qiita.com` の URL でない
- サイトの種類が選ばれていない

## スタイル（Tailwind CSS 4）

Tailwind CSS 4 を Vite プラグイン（`@tailwindcss/vite`、`astro.config.mjs` で読み込み）で使っています。人が書くときも AI に書かせるときも、以下に従ってください。

- **設定は `src/styles/tailwind.css` に CSS で書く**。色・画面幅は `@theme`、typography は `@plugin` とその下の上書き。`tailwind.config.cjs`・`postcss.config.mjs` はありません（作らない）
- **画面幅は `md`（768px）・`lg`（1024px）・`custom-md`（1280px）だけ**。Tailwind の既定の `sm`・`xl`・`2xl` は消してあり、使えません
- **色は v3 の値に戻してある**。使っている系統（gray・blue・indigo など）は `@theme` に v3 の値を書いてあり、見た目は v3 のときと同じです。ほかの系統（red など）を使うときは、v3 の値を `@theme` に足してから使います
- **クラス名は v4 の名前で書く**。例：`shadow-xs`（v3 の `shadow-sm`）、`shadow-sm`（v3 の `shadow`）、`rounded-xs`・`rounded-sm`、`outline-hidden`（v3 の `outline-none`）、`bg-linear-to-r`（v3 の `bg-gradient-to-r`）、`shrink-0`・`grow`。グラデーションは v3 と同じ混ざり方にするため `/srgb` を付けます（`bg-linear-to-br/srgb`）
- **`lg:text-lg` のような名前付きの文字サイズを画面幅で切り替えるときは、行間も同じ幅で書く**（例：`leading-[1.9] lg:text-lg lg:leading-7`）。v4 では `text-*` が `leading-*` を上書きしないため、書かないと行間が変わります
- **同じ要素に、同じプロパティのクラスを2つ書かない**（例：`overflow-hidden overflow-clip`）。v4 は CSS の出力順が v3 と違い、どちらが効くかがクラスの並びでは決まりません
- **非表示の子を含む並びには `space-y-*` ではなく `flex flex-col gap-*` を使う**。v4 の `space-y-*` は「最後以外の子の下」に余白を付けるため、後ろの子を `hidden` にすると余白が残ります
- `hover:` は v3 と同じく、タップした端末でも効くようにしてあります（`@custom-variant hover`）。`button` は `cursor: pointer` を土台の CSS で付けてあります
- 対応ブラウザは Safari 16.4・Chrome 111・Firefox 128 以降です（Tailwind CSS 4 の対応範囲）
- CSS の圧縮は `astro.config.mjs` で esbuild にしています。Vite 8 の既定（Lightning CSS）だと、ヘッダーの `animation` と `animation-timeline` が一つにまとめられ、スクロール連動が効かなくなるためです

## ビルド・型チェック

```bash
pnpm build
```

`astro check`（型チェック）と `astro build` をまとめて実行します。型チェックのみ行う場合:

```bash
pnpm astro check
```

## デプロイ

- `main` への push、または **microCMS の Webhook**（ブログ記事・外部サイトの記事の公開・更新・公開終了・削除）で GitHub Actions が走り、GitHub Pages へ自動デプロイされます
- Webhook を取りこぼした場合の保険として、**6 時間ごとの定期リビルド**も設定されています。よくある質問は Webhook を使わず、この定期リビルドで反映します

## プレビュー環境（Vercel）について

`/blog/preview` の SSR プレビューは Vercel でホスティングしており、
**現在は Ryoma0101 が個人アカウントで管理**しています。
本番（GitHub Pages）とは独立しているため、Vercel 側が停止しても本番サイトには影響しません。
