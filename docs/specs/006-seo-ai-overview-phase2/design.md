# 「プログラミングサークル」検索での AI による概要対策 フェーズ2 design

## 情報構造の追加・変更（OOUX）
- なし（`Organization` は spec 003 で定義したものを develop に移す。新しいデータは持たない）

## UI
- 画面の見た目は変えない（D2）。変えるのは `<head>` の中・記事ページの JSON-LD・OG 画像のファイルだけ
- OG 画像：キャンバス「ホーム刷新」の「OG 画像」（`OgImage.dc.html`）で決定（D5）。非公開のキャンバスなので、見るには Share での共有が要る

## 構造化データ（`src/layouts/Layout.astro`）
spec 003 の design の `@graph`（`Organization` + `WebSite`）をそのまま移し、次の値だけ今の事実に変える。値の持ち方（frontmatter でオブジェクトを組み、`JSON.stringify(...).replace(/</g, "\\u003c")` を `set:html` で出す）も spec 003 と同じ。

| キー | spec 003（main） | このブランチ |
|---|---|---|
| `Organization.description` | …約40名が所属。Web開発・デザイン・データサイエンスの3チームに分かれ、週1回の勉強会やハッカソンで実践的に学んでいる。… | 東京理科大学の学生によるプログラミングサークル。野田キャンパスを拠点に2024年に設立し、約20名が所属。Web開発とデータサイエンスの2つのチームがあり、ハッカソンやチーム開発に取り組んでいる。メンバーの9割は大学からプログラミングを始めた。 |
| `Organization.knowsAbout` | …・UI/UXデザイン・… | プログラミング・Web開発・フロントエンド・バックエンド・データサイエンス・機械学習・AIエージェント・ハッカソン |

- 説明文の各事実の表示箇所：チーム2つ・ハッカソン・チーム開発・AIエージェント → トップ／設立年・約20名・9割 → about（#69 で直した後）
- 「学ぶ」ではなく「取り組む」と書く（`CLAUDE.md`）

## meta（`Layout.astro`）
- `og:locale` = `ja_JP` を足す
- Twitter カード：`property="twitter:*"` → `name="twitter:*"`。`twitter:url` は消す
- `image` の既定値：`/mainCharm.svg` → `/og.png`
- 既定の `description`：
  > TNDは東京理科大学野田キャンパスで活動するプログラミングサークルです。2024年設立、約20名のメンバーがWeb開発とデータサイエンスに、ハッカソンやチーム開発を通して取り組んでいます。

## ページごとの meta
| ページ | title | description |
|---|---|---|
| `/` | 東京理科大学のプログラミングサークル TND \| 初心者歓迎・Web開発・データサイエンス | TNDは東京理科大学野田キャンパスで活動するプログラミングサークルです。Web開発とデータサイエンスの2つのチームで、ハッカソンやチーム開発に取り組んでいます。プログラミング初心者も歓迎しています。 |
| `/about` | （変更なし） | 東京理科大学のプログラミングサークルTNDの紹介です。ハッカソンやチーム開発などの活動、Web開発・データサイエンスの2チーム、会費（年4,000円）、入会の方法（通年で募集）をまとめています。 |
| `/faq` | （変更なし） | プログラミングサークルTND（東京理科大学）へのよくある質問。初心者でも参加できるか、所属している学科、取り組める内容、入会の方法などに答えます。 |
| `/contact` | （変更なし） | （変更なし。「勉強会での登壇」は外部からの登壇依頼の意味なので残す（D9）） |
| `/blog` | （変更なし） | 東京理科大学のプログラミングサークルTNDのテックブログ。メンバーが書いたプログラミングやWeb開発の技術記事、イベントなどの活動報告を掲載しています。 |

- トップの説明文には数字を入れない（D2）。トップに表示されている事実（2つのチーム・ハッカソン・チーム開発・初心者歓迎）で組む。数字は about の説明文と JSON-LD が持つ
- 字数は 70〜120 字。ビルドした HTML から数えて確かめる
- `/faq` の説明文には、microCMS の faq の中身に左右される項目（勉強会の頻度・募集の時期）を書かない
- `/about` の `<Layout>` は PR #69 と1行衝突する。後からマージするほうで解く

## 記事の h1
- 記事ページの h1 は記事のタイトル（`BlogArticleView.astro`）。本文の見出しは h2 から
- microCMS の本文の h1（`9-aPL_QNLQSI`・`2025-09-25-shignate-mufg`）は対策しない（D7）。リポジトリ内の Markdown の記事は使われていなかったので `archive/unused-assets/blog/` に退避した

## ブログ記事（`src/pages/blog/[slug].astro`）
- `publisher` を `{ "@type": "Organization", "@id": "https://tus-tnd.com/#organization", "name": "TND" }` に置き換える。ロゴなどの詳細は `Layout` の `Organization` が持つ（同じページに `@graph` が出ているので参照が解決する）。参照を解決しないツールでも読めるよう、型と名前は残す

## OG 画像
- ファイル：`public/og.png`（1200×630、PNG）
- 元の画面：`src/dev-pages/og-image.astro`（`/dev/og-image`。dev のときだけ）。キャンバスの「OG 画像」を、サイトのフォント（Noto Sans JP・Rubik Doodle Shadow・Inter）と `public/mainCharm.svg` で組む。`Layout` は使わず、1200×630 に固定した単独のページにする（ヘッダー・フッターを入れないため）
  - 単独のページなので、`src/styles/tailwind.css` の import と Google Fonts の `<link>` を自分で持つ
  - 背景のぼかしの色は `src/styles/tailwind.css` のトークン（`tnd-blue` など）と Tailwind の標準色を使う
  - dev のときに画面の下に出る Astro のツールバーが写らないよう、このページだけ `astro-dev-toolbar { display: none }` を当てる
- PNG にする方法：dev サーバーを起動し、リポジトリのルートで Chrome のヘッドレスで撮る。撮ったあと `sips -g pixelWidth -g pixelHeight public/og.png` で 1200×630 か確かめる。README の「確認用ページ」の節に手順を書く
  ```
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --hide-scrollbars --window-size=1200,630 --virtual-time-budget=5000 --screenshot=public/og.png http://localhost:4321/dev/og-image
  ```
  - `--virtual-time-budget` は Web フォントを読み込んでから撮るため
- トップ（`index.astro`）は `image="/mainCharm.svg"` を明示しているので外し、既定の `/og.png` を使う
- 文言：大学名の英字・TND・「東京理科大学 野田キャンパスのプログラミングサークル」・`tus-tnd.com`。人数など変わりうる事実は入れない

## spec 003 の取り込み
- `docs/specs/003-seo-ai-overview/` を main から develop に持ってくる。requirements.md の先頭に「フェーズ2は spec 006。事実は 006 と `CLAUDE.md` を正とする」と1行足す以外は変えない（古い事実を流用されないため）

## 既存コードとの関係
| ファイル | 変更 | 他 PR との関係 |
|---|---|---|
| `src/layouts/Layout.astro` | head の JSON-LD・meta・既定の画像と説明文 | main の #75 と衝突する。リリースの取り込みで develop 側を正にする（D1） |
| `src/pages/index.astro` | `<Layout>` の title・description、`image` の指定を外す | main の #75 と衝突（props だけ） |
| `src/pages/about/index.astro` | `<Layout>` に description を足す | PR #69・main の #75 と1行衝突 |
| `src/pages/faq/index.astro` | description を直す | main の #75 と1行衝突 |
| `src/pages/blog/index.astro` | `<Layout>` に description を足す | main の #75 と1行衝突 |
| `src/pages/blog/[slug].astro` | `publisher` を `@id` の参照に | なし |
| `src/dev-pages/og-image.astro`・`public/og.png`・README | 新規・追記 | なし |

## 検証
- `pnpm run build`（`astro check` を含む）
- `dist/` の全 HTML から JSON-LD を取り出し、`JSON.parse` できること、`publisher` の `@id` が同じページの `Organization` の `@id` と一致することをスクリプトで確かめる
- 変更前後のビルド結果で、全ページの `<body>` が一致すること（`/dev/*` は dist に出ないので対象外）
- `dist/` の全 HTML の `description` の字数（70〜120 字）を確かめる
- 古い事実の語（「デザイン」「週1回」「4〜5月」「4月と5月」「約40名」）が、`meta description`・`og:*`・`twitter:*`・`Organization` の JSON-LD に残っていないことを確かめる。よくある質問の `FAQPage`（microCMS の中身）と記事の `BlogPosting`（記事の文言）は対象外
- `public/og.png` が 1200×630 であること。画像を開き、キャンバスの案と見比べる（スクリーンショットで確認をもらう）
- 公開後（人間）：Google の[リッチリザルト テスト](https://search.google.com/test/rich-results)・[Schema Markup Validator](https://validator.schema.org/)・X の投稿画面でのカードの表示
