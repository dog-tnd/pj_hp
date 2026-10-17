# よくある質問ページの刷新 design

## 情報構造の追加・変更（OOUX）
- 「FAQ のカテゴリ」と「質問」を、microCMS のオブジェクトとして新しく持つ
  - カテゴリ：名前・アンカー用の slug・並び順。質問を複数持つ
  - 質問：質問文・回答・カテゴリ（1つ）・並び順
- サイト内で使う形：`FaqSection = { slug, name, items: FaqItem[] }`、`FaqItem = { id, question, paragraphs: string[][] }`（段落 → 行）

## UI

### デザインの有無
- 新しく作った（Claude Design のキャンバス「FAQページ刷新」：https://claude.ai/artifact/SspDfXH3b8hKP5H2hucqh7 ）
  - 非公開のキャンバスなので、見るには Share での共有が必要
  - 画面：デスクトップ（1440）／モバイル（390）。開閉と「すべて開く」は Play で試せる
- キャンバスのヘッダーは既存の `HeaderDesktop` / `HeaderMobile` を写したもの。実装では既存のものをそのまま使う
- キャンバスでは最初の質問が開いているが、実装の初期状態はすべて閉じる（requirements）

### 使用コンポーネント
- 既存：`Layout.astro`（背景を変更）、`SiteHeader.astro`（変更なし）
- 新規：
  - `src/utils/faq.ts` … 型（`FaqSection`・`FaqItem`）と、microCMS の形からの変換（並べ替え・段落への分割・異常データの検出）。env に依存しない
  - `src/components/faq/FaqView.astro` … ページ本体。`sections` を受け取って描画する（dev ページでも使う）
  - `src/components/faq/FaqCategoryNav.astro` … カテゴリの一覧。`variant="sidebar"`（lg 以上の右の列）／`"bar"`（lg 未満のヘッダー直下）
  - `src/components/faq/FaqItem.astro` … 質問1つ（ボタン＋回答）
  - `src/components/faq/FaqMoreQuestions.astro` … 「ここにない質問は」（マシュマロ・お問い合わせ）
  - `src/scripts/faq.ts` … 開閉、すべて開く、ハッシュからの展開、ページ内検索での展開、今見ているカテゴリの判定
  - `src/dev-pages/faq.astro` … 検証用。固定のサンプルデータを `src/utils/faq.ts` の変換に通して `FaqView` で表示する（dev 限定、microCMS を呼ばない）

### 構成

```
Layout.astro（背景：body の gray-50 ＋ ぼかし）
└ <main>
   └ faq/index.astro … microCMS から取得 → utils/faq.ts で変換 → FaqView に渡す。FAQPage の JSON-LD を head に出す
      ├ FaqView.astro
      │  ├ FaqCategoryNav variant="bar"（lg 未満。ヘッダー直下に sticky、白の不透明な背景）
      │  ├ 見出し（最大 1120px）：飾りの「FAQ」（aria-hidden）・h1「よくある質問」・説明文
      │  └ 2カラム（最大 1120px、lg 以上で横並び、items-start）
      │      ├ 本文（最大 720px）
      │      │   ├「すべて開く」ボタン（右寄せ）
      │      │   ├ <section> × カテゴリ数：h2（名前＋件数）＋白い面に FaqItem × 質問数
      │      │   └ FaqMoreQuestions（h2「ここにない質問は」＋2枚のカード）
      │      └ <aside>（lg 以上のみ。sticky）：FaqCategoryNav variant="sidebar"
      └ <footer>（今のページと同じ）
```

- 質問1つの中身：
  ```html
  <h3><button id="q-{id}" type="button" aria-expanded="false" aria-controls="a-{id}">Q 質問文 ⌄</button></h3>
  <div id="a-{id}" hidden="until-found"><div class="（余白はここ）">段落…</div></div>
  ```
  - `hidden="until-found"` で、閉じていてもページ内検索の対象にする。見つかったときの `beforematch` イベントで `aria-expanded` を true にする
  - **回答の外側の div には display 系のクラス・余白・枠線を付けない**。`until-found` は中身だけを隠し、外側の余白は残るため。また未対応のブラウザで display クラスがあると、閉じても表示されてしまう
  - **開閉は `setAttribute("hidden", "until-found")` と `removeAttribute("hidden")` で行う**。`el.hidden = true` で閉じると、ページ内検索の対象から外れる（TypeScript の型も `hidden` を boolean としか見ない）
  - 未対応のブラウザでは `hidden` と同じ扱いになる（検索では見つからないが、開閉は動く）
  - `role="region"` は付けない。パネルが12個あり、ランドマークが増えすぎるため（WAI-ARIA の実装例集では、6個を超えるときは避けるよう勧めている）
  - JavaScript が動かないときは、すべて閉じたまま開けない。`<noscript>` のスタイルで回答を表示する
- id は microCMS のコンテンツ ID から作る（文言が変わってもリンクが切れない）
  - 質問：`q-{id}`、回答：`a-{id}`、カテゴリの見出し：`cat-{slug}`
- カテゴリの見出し：`<h2 id="cat-{slug}" tabindex="-1">入会について<span>3<span class="sr-only">件</span></span></h2>`
- 回答の段落：`answer` を `\r\n` → `\n` にそろえ、空白だけの行も空行とみなして、空行で段落に分ける。段落内の改行は `<br>` にする。`set:html` は使わない

### 状態
- 初期：すべての回答が閉じている。「すべて開く」の文言
- 質問を押す：その回答だけ開閉する。矢印が上下反転する。ボタンの文言を更新する
- すべて開く／すべて閉じる：全部の開閉を切り替え、文言も入れ替える。1つでも閉じていれば「すべて開く」
- ハッシュが質問を指す（読み込み時・`hashchange` 時）：その回答を開き、その質問へ移動して、質問のボタンにフォーカスする
- ページ内検索で見つかった（`beforematch`）：その回答が開く（`aria-expanded` と文言を更新）
- カテゴリを選ぶ：既定の移動を止め、見出しへ移動して見出し（`tabindex="-1"`）にフォーカス、`history.replaceState` でハッシュを更新。移動を待たずにそのカテゴリを現在地にする
- 今見ているカテゴリ：記事の目次（`article-toc.ts`）と同じ考え方で決める。判定線（そのページの見出しの着地位置 ＋ 8px）より上にある最後のカテゴリ見出しを現在地とし、どれより上でも最初のカテゴリにする。lg 未満では、現在地のピルが見える位置まで、カテゴリの行を `bar.scrollTo({ left })` で横にスクロールする（`scrollIntoView` はページも縦に動くので使わない）

### アクセシビリティ（ARIA）
- 見出し：h1（ページに1つ）→ カテゴリ h2 →「ここにない質問は」h2 → 質問 h3／カードのタイトル h3
- 質問：`<h3>` の中の `<button type="button" aria-expanded aria-controls>`。「Q」の文字と矢印は `aria-hidden="true"`
- カテゴリの一覧：`<nav aria-label="カテゴリ">` の `<ol>`。現在地は `aria-current="location"`。項目の高さは、lg 未満のピルで 44px 以上（行の上下の余白込みで押しやすく）、右の列は 36px 以上
- マシュマロのボタン：`target="_blank" rel="noopener noreferrer"`、`aria-label="マシュマロで質問する（新しいタブで開きます）"`
- アイコンはすべて `aria-hidden="true"`

### レスポンシブ
- 境界は既存の `lg`（1024px）と `md`（768px）
  - `lg` 以上：右の列（280px、sticky `top: 96px`）。本文 720px、間 80px。2カラムの親は `items-start`
  - `lg` 未満：カテゴリの行をヘッダーの直下に固定（sticky `top: 56px`、`z-40`、白の不透明な背景）。行の高さは 48px（ピル 36px ＋ 上下 6px）＋ 下の枠線 1px ＝ 49px。横スクロールのピル
- 見出しと質問の着地位置（`scroll-margin-top`）
  - `lg` 未満：ヘッダー 56px ＋ カテゴリの行 49px ＋ 16px ＝ 121px
  - `lg` 以上：スクロール後のヘッダー 64px ＋ 24px ＝ 88px（ページの先頭から飛ぶと、ヘッダーが 80px から縮む途中のため最大 16px ずれる。隠れはしない）
- 「ここにない質問は」のカード：`md` 以上で2列、`md` 未満は縦に積み、マシュマロを先にする

### 背景（全ページ・`Layout.astro`）
- 地色は今までどおり `<body>` の `bg-gray-50`。ぼかしはラッパの中に `absolute -z-10 pointer-events-none`、`aria-hidden="true"` で置く（今と同じ作り。角丸 40%、`blur-3xl`）
- 今の右上1個を、次の4個（lg 未満は3個）に置き換える

| # | lg 以上：位置・大きさ | lg 未満：位置・大きさ | 色 | 透明度 | 傾き |
|---|---|---|---|---|---|
| 1 | 右 -120px・上 -80px・600px | 右 -140px・上 -40px・340px | `blue-400` → `teal-300` | 0.22 | 12° |
| 2 | 左 -220px・上 640px・540px | 左 -160px・上 900px・320px | `tnd-blue` → `tnd-violet` | 0.16 | -12° |
| 3 | 右 -200px・上 1260px・560px | 右 -150px・上 1800px・330px | `tnd-teal` → `tnd-mint` | 0.16 | 12° |
| 4 | 左 -160px・上 1880px・500px | 表示しない | `blue-400` → `teal-300` | 0.16 | -12° |

- 今の1個（右 0・上 0・透明度 0.20）とは、位置と透明度が少し変わる（キャンバスで合意した値）
- ページの高さより下にあるぼかしは、ラッパの `overflow-clip` で切れる（短いページでは数が減って見える）
- ページごとの見え方
  - トップ・ブログ一覧・FAQ・お問い合わせ・404：地色の上に見える
  - 記事ページ：本文の `bg-white` が全幅を覆うため、ヘッダーの後ろ以外ではほぼ見えない（それでよい）
  - about：`bg-gray-50` の section やグラデーションの帯がコンテナの幅でぼかしを切り、縦の縁が出る。今の右上1個でも起きている現象で、今回は直さない（about の刷新 #69 で扱う）
  - ヘッダーは半透明（スクロール前の PC は透明）なので、ヘッダーの後ろにもぼかしが見える

### 動き
- 開閉：アニメーションなし。矢印の回転だけ 150ms。`prefers-reduced-motion` のときは回転も即時
- カテゴリへの移動：`scroll-behavior: smooth`（`prefers-reduced-motion: reduce` のときは `auto`）。記事ページの設定は記事ページでしか読み込まれないため、FAQ ページにも同じ指定を置く

### 忠実度と意図
| 要素 | 忠実度 | 意図（なぜ） |
|---|---|---|
| カテゴリ別に全部並べる（絞り込まない） | 厳守 | ページ内検索で全部の質問が見つかるようにするため（D1） |
| カテゴリの一覧の位置（lg 以上は右の列、未満はヘッダー直下） | 厳守 | 記事の目次と同じ位置にそろえ、サイト内で迷わないようにするため |
| 背景のぼかし（全ページ・左右交互） | 厳守 | 人間と合意済み（D2・D7） |
| マシュマロのボタンの色と白文字 | 厳守 | 人間の決定（D5） |
| 質問を白い面にまとめる・区切り線 | 意図を守れば自由 | ぼかしの上でも読みやすくするため |
| 余白・角丸・文字サイズ | 意図を守れば自由 | 既存の Tailwind のトークンに寄せる。カードはお問い合わせページと同じ（白、`border-gray-200`、角丸 14px） |
| 文字（英字ラベル） | 意図を守れば自由 | 読み込み済みの Inter と Rubik Doodle Shadow を使う |

### 色のトークン（`tailwind.config.cjs` の `theme.extend.colors` に追加）
- `tnd`：`blue` `#4874CE`／`violet` `#9599E2`／`teal` `#46C4D3`／`mint` `#45FAD6`（メインビジュアルの色）
- `marshmallow`：`DEFAULT` `#E69A9C`／`hover` `#EDBEC0`／`border` `#F3D3D4`／`tint` `#FBEEEE`／`icon` `#B5525A`

## データ・API

### microCMS（管理画面での作業。コード変更なし）
- `faq-categories`（リスト形式）
  | フィールドID | 種類 | 必須 | 用途 |
  |---|---|---|---|
  | `name` | テキスト | ✔ | カテゴリ名（例：入会について） |
  | `slug` | テキスト | ✔ | アンカー用。正規表現 `^[a-z0-9-]+$`、重複を許可しない（例：`joining`） |
  | `sortOrder` | 数値 | ✔ | 並び順（小さいほど上） |
- `faq`（リスト形式）
  | フィールドID | 種類 | 必須 | 用途 |
  |---|---|---|---|
  | `question` | テキスト | ✔ | 質問文 |
  | `answer` | テキストエリア | ✔ | 回答。空行で段落を分ける（Open question 1） |
  | `category` | コンテンツ参照 → `faq-categories` | ✔ | カテゴリ |
  | `sortOrder` | 数値 | ✔ | カテゴリ内の並び順 |
- API キーの GET 権限を、2つの API に付ける（GitHub の Secrets・Vercel・ローカルの `.env` で使っているキーすべて）
- 2つの API にも既存と同じ Webhook（GitHub Actions の `repository_dispatch: microcms-publish`）を、公開・更新・公開終了・削除で設定する
- **2つの API と今の12問の登録を、タスク 4 のマージより前に済ませる**（API が無いとビルドが失敗する）

### 移行する12問（文言は今の `src/pages/faq/index.astro` からそのまま移す）
| カテゴリ（slug・sortOrder） | 質問（sortOrder 順） |
|---|---|
| 一般的な質問（`general`・1） | TNDとは何ですか？／プログラミング初心者でも参加できますか？／どの学科の人が参加していますか？ |
| コース内容（`courses`・2） | Web開発コースでは何を学べますか？／デザインコースではどのようなツールを使いますか？／データサイエンスコースは難しいですか？ |
| 入会について（`joining`・3） | 入会はいつでもできますか？／入会に必要な持ち物はありますか？／複数のコースに参加可能ですか？ |
| 活動内容（`activities`・4） | ハッカソンとは何ですか？／勉強会はどのくらいの頻度で開催されますか？／チーム開発プロジェクトに参加するには？ |

- 「入会はいつでもできますか？」の回答は、今の `<br />` の位置で段落を分ける（空行を入れる）
- ソースの折り返しで入っている改行は消し、表示どおりの文にする（例：「Web アプリ」「Adobe Photoshop」は表示のとおり半角スペース1つ）

### 取得と変換
- `src/lib/microcms.ts`：型 `FaqCategory`・`FaqEntry`（microCMS の形）と、`getAllFaqCategories()`・`getAllFaqEntries()`（`getAllContents` で全件、下書きを除く）を追加する
- `src/utils/faq.ts`：`toFaqSections(categories, entries): FaqSection[]`
  - カテゴリを `sortOrder` 順（同じなら `createdAt` 順）、質問をカテゴリごとに `sortOrder` 順（同じなら `createdAt` 順）にまとめる。質問の無いカテゴリは除く
  - 次のときは例外を投げてビルドを失敗させる：公開中の質問が0件／質問の `category` が null・公開中のカテゴリに無い／`slug` が `^[a-z0-9-]+$` に合わない・重複
  - `answer` を段落と行の配列に変換する（上記「回答の段落」）

### 構造化データ（`FAQPage`）
- `faq/index.astro` で、変換後の `sections` から作り、`<script type="application/ld+json" slot="head" is:inline set:html={…}>` で出す（記事ページの `BlogPosting` と同じ出し方。`<` を `<` にエスケープする）
- `mainEntity` は表示順の `Question`。`acceptedAnswer.text` は回答の段落・行を改行でつないだプレーンテキスト
- 補足（spec 003）：FAQ のリッチリザルトは現在、政府・医療系サイトに限られる。目的は、質問と回答の組を機械に正確に渡すこと

## 既存コードとの関係
- `src/layouts/Layout.astro`：右上のぼかし1個を、4個（lg 未満は3個）に置き換える。全ページに影響する
- `tailwind.config.cjs`：`tnd` と `marshmallow` の色を追加する
- `src/pages/faq/index.astro`：作り直す。データ取得・`FAQPage`・`description`（main の spec 003 と同じ文言。main とのマージ時の衝突を簡単にするため）。今のカテゴリ絞り込み・開閉のスクリプトとスタイルは消す。`TwoLine` の装飾は使わない（お問い合わせページと同じ）
- `src/lib/microcms.ts`：FAQ の型と取得関数を追加する
- `README.md`：次を追記・修正する
  - FAQ の更新手順（microCMS の `faq` に登録する／説明文の根拠になっている事実を消すときは、コード側の説明文も直す）
  - microCMS の説明・キーが無いとビルドできない旨・Webhook の節に、FAQ の2つの API を含める
- `src/scripts/article-toc.ts`：変更しない。現在地の判定は同じ考え方で `faq.ts` に書く（共通化は、3か所目が出たときに検討する）
- #74：「FAQ のデータ化と `FAQPage`」の項目を、この PR のマージ後にチェックする
