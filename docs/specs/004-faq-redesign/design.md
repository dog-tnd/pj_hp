# よくある質問ページの刷新 design

## 情報構造の追加・変更（OOUX）
- 「質問」を microCMS のオブジェクトとして新しく持つ。質問文・回答・カテゴリ（セレクトの1つ）・並び順
  - 「カテゴリ」は独立したオブジェクトにせず、質問の属性として持つ（API 数の制約。requirements の D3）
- サイト内で使う形：`FaqSection = { anchor, name, items: FaqItem[] }`、`FaqItem = { id, question, paragraphs: string[][] }`（段落 → 行）

## UI

### デザインの有無
- 新しく作った（Claude Design のキャンバス「FAQページ刷新」：https://claude.ai/artifact/SspDfXH3b8hKP5H2hucqh7 ）
  - 非公開のキャンバスなので、見るには Share での共有が必要
  - 画面：デスクトップ（1440）／モバイル（390）。開閉と「すべて開く」は Play で試せる
  - 2026-10-18 版：見出し・項目・カードを、お問い合わせページの作り（デザインシステム `docs/design/README.md`）に合わせて描き直した（D9）
- 見出し・項目の見出し・カード・ボタン・フッターの寸法は、デザインシステムのクラスをそのまま使う
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
      │  ├ ページの見出し（デザインシステム）：大学名の英字・英字の大見出し「FAQ」（aria-hidden）・h1「よくある質問」・説明文
      │  └ 2カラム（最大 1120px、lg 以上で横並び、items-start）
      │      ├ 本文（最大 720px）
      │      │   ├「すべて開く」ボタン（右寄せ）
      │      │   ├ <section> × カテゴリ数（項目の見出し）：英字ラベル（aria-hidden）＋ h2（名前＋件数）／白い面に FaqItem × 質問数
      │      │   └ FaqMoreQuestions（項目の見出し：英字ラベル「ASK US」＋ h2「ここにない質問は」／2枚のカード）
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
  - 質問：`q-{id}`、回答：`a-{id}`、カテゴリの見出し：`cat-{anchor}`（anchor はカテゴリ名の空白をハイフンにしたもの。例：`cat-入会について`）
- カテゴリの見出し：`<h2 id="cat-{anchor}" tabindex="-1">入会について<span>3<span class="sr-only">件</span></span></h2>`
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
- 開閉：質問を1つ押したときだけ、回答の高さと透明度を 200ms（ease-out）で変える。動きの途中で押されたら、今の高さから逆向きに動く。閉じるときは動き終わってから `hidden="until-found"` を付ける
  - 「すべて開く／閉じる」・ハッシュ・ページ内検索では動かさない。`prefers-reduced-motion: reduce` のときも動かさない
  - 矢印の回転は 150ms。`prefers-reduced-motion` のときは即時
- カテゴリへの移動：`scroll-behavior: smooth`（`prefers-reduced-motion: reduce` のときは `auto`）。記事ページの設定は記事ページでしか読み込まれないため、FAQ ページにも同じ指定を置く

### 忠実度と意図
| 要素 | 忠実度 | 意図（なぜ） |
|---|---|---|
| カテゴリ別に全部並べる（絞り込まない） | 厳守 | ページ内検索で全部の質問が見つかるようにするため（D1） |
| カテゴリの一覧の位置（lg 以上は右の列、未満はヘッダー直下） | 厳守（Open question 1 で見直し中） | 記事の目次と同じ位置にそろえ、サイト内で迷わないようにするため |
| ページの見出し・項目の見出し・カードの形 | 厳守 | サイト共通のデザインシステムに従うため（D9） |
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
- `faq`（リスト形式。API はこれ1つ）
  | フィールドID | 種類 | 必須 | 用途 |
  |---|---|---|---|
  | `question` | テキストフィールド | ✔ | 質問文 |
  | `answer` | テキストエリア | ✔ | 回答。空行で段落を分ける |
  | `category` | セレクトフィールド（複数選択なし） | ✔ | カテゴリ。選択肢：一般的な質問／コース内容／入会について／活動内容 |
  | `sortOrder` | 数字 | ✔ | 並び順。カテゴリをまたいだ通し番号（一般的な質問 10番台、コース内容 20番台…） |
  | `categoryEn` | セレクトフィールド（複数選択なし） | ✔ | カテゴリの英字ラベル（D10）。選択肢：GENERAL／COURSES／JOINING／ACTIVITIES。同じカテゴリの質問には同じものを選ぶ |
- コンテンツ ID は意味のある英字にする（`tnd`・`beginner` など）。質問へのリンク（`/faq#q-beginner`）が読める形になるため
- カテゴリを増やすときは、`category` と `categoryEn` の両方に選択肢を足す（コードの変更は要らない）
- `categoryEn` は、カテゴリと別のセレクトにする。カテゴリの選択肢に英字を混ぜると、日本語名を取り出す処理が要り、入力の誤りも見つけにくいため。食い違いはビルド時に検出する
- API キーの GET 権限を `faq` に付ける（GitHub の Secrets・Vercel・ローカルの `.env` で使っているキーすべて）
- `faq` には Webhook を設定しない（D8）。公開した内容は、6時間ごとの定期リビルドで反映する（最大6時間かかる。急ぐときは GitHub Actions を手動で実行する）
- **`faq` の作成と今の12問の登録を、`/faq` の差し替え（タスク 6）のマージより前に済ませる**（API が無いとビルドが失敗する）

### 移行する12問（文言は今の `src/pages/faq/index.astro` からそのまま移す。2026-10-18 登録済み）
| カテゴリ | 質問（コンテンツ ID・sortOrder） |
|---|---|
| 一般的な質問 | TNDとは何ですか？（`tnd`・11）／プログラミング初心者でも参加できますか？（`beginner`・12）／どの学科の人が参加していますか？（`department`・13） |
| コース内容 | Web開発コースでは何を学べますか？（`web`・21）／デザインコースではどのようなツールを使いますか？（`design`・22）／データサイエンスコースは難しいですか？（`ds`・23） |
| 入会について | 入会はいつでもできますか？（`when`・31）／入会に必要な持ち物はありますか？（`bring`・32）／複数のコースに参加可能ですか？（`multi`・33） |
| 活動内容 | ハッカソンとは何ですか？（`hackathon`・41）／勉強会はどのくらいの頻度で開催されますか？（`study`・42）／チーム開発プロジェクトに参加するには？（`project`・43） |

- 「入会はいつでもできますか？」の回答は、今の `<br />` の位置で段落を分ける（空行を入れる）
- ソースの折り返しで入っている改行は消し、表示どおりの文にする（例：「Web アプリ」「Adobe Photoshop」は表示のとおり半角スペース1つ）

### 取得と変換
- `src/lib/microcms.ts`：型 `FaqEntry`（microCMS の形）と `getAllFaqEntries()`（`getAllContents` で全件、下書きを除く）を追加する
- `src/utils/faq.ts`：`toFaqSections(entries): FaqSection[]`
  - 質問を `sortOrder` 順（同じなら `createdAt` 順）に並べ、カテゴリはその中で最初に出てきた順にまとめる（＝カテゴリ内の最小の `sortOrder` の順）
  - セレクトフィールドの値は配列で返るので、1つ目をカテゴリ名にする
  - 次のときは例外を投げてビルドを失敗させる：公開中の質問が0件／`category` が空・複数／`categoryEn` が空・複数／同じカテゴリで `categoryEn` が食い違う
  - `FaqSection` に英字ラベル `en` を足す
  - `answer` を段落と行の配列に変換する（上記「回答の段落」）

### 構造化データ（`FAQPage`）
- `faq/index.astro` で、変換後の `sections` から作り、`<script type="application/ld+json" slot="head" is:inline set:html={…}>` で出す（記事ページの `BlogPosting` と同じ出し方。`<` を `\u003c` にエスケープする）
- `mainEntity` は表示順の `Question`。`acceptedAnswer.text` は回答の段落・行を改行でつないだプレーンテキスト
- 補足（spec 003）：FAQ のリッチリザルトは現在、政府・医療系サイトに限られる。目的は、質問と回答の組を機械に正確に渡すこと

## 既存コードとの関係
- `src/layouts/Layout.astro`：右上のぼかし1個を、4個（lg 未満は3個）に置き換える。全ページに影響する
- `tailwind.config.cjs`：`tnd` と `marshmallow` の色を追加する
- `src/pages/faq/index.astro`：作り直す。データ取得・`FAQPage`・`description`（main の spec 003 と同じ文言。main とのマージ時の衝突を簡単にするため）。今のカテゴリ絞り込み・開閉のスクリプトとスタイルは消す。`TwoLine` の装飾は使わない（お問い合わせページと同じ）
- `src/lib/microcms.ts`：FAQ の型と取得関数を追加する
- `README.md`：次を追記・修正する
  - FAQ の更新手順（microCMS の `faq` に登録する）。説明文との対応ルールはサークル内で未確定のため書かない
  - microCMS の説明・キーが無いとビルドできない旨・デプロイの節に、FAQ の API と反映のタイミング（定期リビルド）を含める
- `src/scripts/article-toc.ts`：変更しない。現在地の判定は同じ考え方で `faq.ts` に書く（共通化は、3か所目が出たときに検討する）
- #74：「FAQ のデータ化と `FAQPage`」の項目を、この PR のマージ後にチェックする
