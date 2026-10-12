# ブログ記事ページの刷新 design

## 情報構造の追加・変更（OOUX）
- 「目次」を記事に付く派生データとして追加する。microCMS には持たず、ビルド時に本文の h2・h3 から作る
  - 目次の項目：`{ id: string; text: string; level: 2 | 3 }`
- それ以外のオブジェクト（記事・著者・タグ）は変えない。著者は今ある `author`・`role`・`authorImage` だけを使う

## UI

### デザインの有無
- 新しく作った（Claude Design のキャンバス「ブログ個別ページ刷新」：https://claude.ai/artifact/2rEnrtV4MWKjFr1Jcaqtz2 ）
  - 非公開のキャンバスなので、見るには Share での共有が必要
  - 画面：デスクトップ（1440）／モバイル（390）／モバイルで目次シートを開いた状態／タブレット（768、目次バーの開閉を Play で試せる）
- キャンバスのヘッダーは仮の絵。実装では既存の `HeaderDesktop` / `HeaderMobile` をそのまま使う
- キャンバスの読了バーは入れない（requirements の Open question 1）

### 使用コンポーネント
- 既存：
  - `Layout.astro`、`SiteHeader.astro`（変更なし。ただし `Layout.astro` のラッパのクラスを1つ変える。下記）
  - `src/scripts/scroll-lock.ts`（目次シートの背景スクロール固定に使う）
  - `src/utils/sanitize.ts`・`inline-code.ts`・`highlight.ts`（本文の整形。順番に目次の処理を1つ足す）
- 新規：
  - `src/utils/toc.ts` … 本文 HTML から目次の項目を取り出し、`id` の無い見出しに `id` を付ける
  - `src/components/blog/TocList.astro` … 目次のリスト。3つの出し方（右の列・目次バー・シート）で共通に使う
  - `src/components/blog/ShareButtons.astro` … シェアボタン。アイコンだけ（右の列）とラベル付き（本文の後）の2種類
  - `src/scripts/article-toc.ts` … 今読んでいる見出しの判定、目次バーの開閉、目次シートの開閉
  - `src/scripts/copy-link.ts` … リンクのコピーと結果の通知
  - `src/dev-pages/blog-article.astro` … 検証用。見出しの数や形が違うサンプル本文で `BlogArticleView` を表示する（dev 限定）
- 変更：`src/components/BlogArticleView.astro`（構成を作り直す）、`src/pages/blog/[slug].astro`（前後の記事の向き）、`src/utils/highlight.ts`（`decodeEntities` を export する）

### 構成

```
Layout.astro
└ <main>（Layout のもの。BlogArticleView は <main> を持たない）
   └ BlogArticleView.astro … 全体を白背景の <div> で包む
      ├ 記事ヘッダー（最大 1120px）
      │   ├ パンくず（lg 以上）／「← テックブログ」（lg 未満）
      │   ├ タグ・タイトル（h1）・説明文
      │   └ 著者（画像・名前・役割）｜公開日・読了時間
      ├ 目次バー（md 以上 lg 未満。ヘッダーの直下に sticky）
      ├ 2カラム（最大 1120px、lg 以上で横並び）
      │   ├ <article>（最大 720px）
      │   │   ├ アイキャッチ（16:9）
      │   │   ├ 本文（.prose）
      │   │   ├ タグとシェア（ラベル付き：ポスト・リンクをコピー）
      │   │   ├ 書いた人
      │   │   └ 前後の記事（2列、md 未満は縦積み）
      │   └ <aside>（lg 以上のみ。sticky）
      │       ├ 目次（TocList）
      │       ├ シェア（アイコン4つ）
      │       └ ページの先頭へ
      ├ 関連記事の帯（灰色の背景、最大 1120px。md 以上は3列、md 未満は横スクロール）
      ├ 目次ボタン（md 未満。fixed、左下）
      ├ 目次シート（md 未満。<dialog data-scroll-lock>）
      └ コピー結果の通知領域（aria-live="polite"、1つだけ）
```

- `<aside>` が sticky になるよう、2カラムの親は `align-items: flex-start`（伸ばさない）にする
- 目次が無い記事（見出しが2つ未満）では、目次バー・目次ボタン・目次シートを描画しない。右の列はシェアと「ページの先頭へ」だけになる
- 目次が長いとき：右の列の目次は `max-height: calc(100vh - 96px - シェア等の高さ)`、目次バーの展開部分は `max-height: calc(100vh - 104px - 余白)`、シートは画面の 72% まで。どれも中だけ `overflow-y: auto` にする

### 状態
- 通常：画面幅に応じて、右の列／目次バー（閉）／目次ボタンのどれか
- 目次バー展開中（md〜lg）：バーの下に目次を表示。背景のスクロールは固定しない（ページを読みながら開閉する軽い操作のため）
- 目次シート展開中（md 未満）：モーダル。背景のスクロールを固定する
- 今読んでいる見出し（現在地）：
  - 判定：スクロールのたびに（`requestAnimationFrame` で間引く）、「判定線より上にある最後の見出し」を現在地とする。判定線は、その幅の見出しの着地位置（下記の `scroll-margin-top`）＋ 8px
  - どの見出しより上にいるときは最初の見出しを現在地とする
  - 目次の項目を押したときは、移動を待たずにその項目を現在地にする
  - 3つの `TocList`（右の列・目次バーの展開部分・シート）すべての `aria-current` と、目次バーの1行の文言を同時に更新する
  - IntersectionObserver は使わない（見出しが画面に1つも無い長い節で判定が外れるため）
- 項目を選んだときの処理順（目次バーとシートで共通）：既定の移動を止める → 目次を閉じる → シートなら `syncScrollLock()` で固定を解除 → 見出しへ移動 → 見出しにフォーカス（見出しは `tabindex="-1"`）→ URL のハッシュを `history.replaceState` で更新
- コピー成功：押したボタンの表示を2秒だけ「コピーしました」（アイコンだけのボタンはチェックのアイコン）に変え、同じ文言を通知領域に出す
- 幅をまたいだとき：`matchMedia` で `md`・`lg` の境界を監視し、表示されなくなった目次バーの展開部分やシートを閉じる。フォーカスは戻さない

### アクセシビリティ（ARIA）
- 目次ボタン：`<button aria-label="目次を開く" aria-haspopup="dialog" aria-controls="<シートの id>">`
- 目次シート：`<dialog aria-labelledby="<「目次」見出しの id>">`。開いたら閉じるボタンにフォーカス。閉じるボタンは `aria-label="目次を閉じる"`
- 目次バー：`<button aria-expanded aria-controls="<展開部分の id>">`。アクセシブルな名前は「目次：〈今の見出し〉」
- 目次：`<nav aria-label="目次">` の中の `<ol>`。項目の高さは 44px 以上（右の列は 32px 以上でよい。マウス操作が前提の幅のため）
- 目次バーの Escape：ほかのモーダル（メニュー・入会）が開いていないときだけ反応する
- 現在地：`aria-current="location"`、太字、点の3つで表す

### レスポンシブ
- 境界は既存の `md`（768px）と `lg`（1024px）の2つ
  - `lg` 以上：右の列
  - `md` 以上 `lg` 未満：目次バー
  - `md` 未満：目次ボタンと目次シート
- 見出しの着地位置：本文の `<div class="prose">` に Tailwind の `prose-headings:` 修飾子で `scroll-margin-top` を付ける（`<style>` のスコープ付きのルールは `set:html` の本文に当たらないため）
  - `md` 未満：`prose-headings:scroll-mt-[72px]`（ヘッダー 56px ＋ 16px）
  - `md` 以上 `lg` 未満：`md:prose-headings:scroll-mt-[120px]`（ヘッダー 56px ＋ 目次バー 48px ＋ 16px）
  - `lg` 以上：`lg:prose-headings:scroll-mt-[88px]`（スクロール後のヘッダー 64px ＋ 24px）。ページの先頭から飛ぶと、ヘッダーが 80px から縮む途中のため着地が少し上にずれる（隠れはしない）
- 右の列の sticky の `top`：96px（スクロール後のヘッダー 64px ＋ 32px）
- 目次バーの sticky の `top`：56px（モバイルのヘッダーの高さ）
- 重なり順：ヘッダー `z-50` ＞ 目次バー・目次ボタン `z-40`（入会の追従ボタンと同じ）。目次シートは `<dialog>` のトップレイヤー
  - 前提：`BlogArticleView` から `Layout` の `<body>` までの祖先に、stacking context を作るスタイル（`transform`・`filter`・`z-index` 付きの `position` など）を足さない。足すと目次バーの `z-40` がその中に閉じ込められる

### 動き
- 目次シート：下から 200ms でせり上がる。`prefers-reduced-motion` のときは動かさない
- 目次バーの展開：動きなし
- ページ内の移動：今は `BlogArticleView` の `<style>` の `html { scroll-behavior: smooth }` が、記事ページ全体に効いている。作り直したあとも残し、`prefers-reduced-motion: reduce` のときは `auto` にする

### 忠実度と意図
| 要素 | 忠実度 | 意図（なぜ） |
|---|---|---|
| 目次の出し方（右の列／目次バー／左下のボタンとシート） | 厳守 | 画面幅ごとに人間と合意済み。スマホは本文を隠さないことを優先 |
| 目次ボタンの位置（左下、入会ボタンと左右対称） | 厳守 | ヘッダー（2b で確定）を変えずに置ける唯一の場所 |
| 本文の最大幅 720px・アイキャッチを本文と同じ幅 | 厳守 | 「読みやすさ」が今回の目的。アイキャッチが大きすぎるという指摘で決めた |
| 右の列がアイキャッチの上端から始まる | 厳守 | 画像の右の空きを埋めるために決めた |
| 記事ヘッダー・本文後のブロックの並び順 | 意図を守れば自由 | 読み終えた人が次の行動（シェア・次の記事）に移りやすい順 |
| 色・余白・角丸 | 意図を守れば自由 | 既存の Tailwind のトークンに寄せる。アクセント色は `blue-600`（`#2563EB`） |
| 文字（日付・英字ラベル） | 意図を守れば自由 | キャンバスの IBM Plex Mono は使わず、読み込み済みの Inter で代替する（フォントを増やさない） |
| ヘッダー | 対象外 | 既存の `HeaderDesktop` / `HeaderMobile` を使う |

- デザインに無い部分の判断基準：既存の記事ページとヘッダーの実装に合わせる。アクセシビリティを見た目より優先する

## データ・API
- microCMS の API・スキーマは変えない
- `toc.ts` の約束ごと：
  - `buildToc(html: string): { html: string; items: TocItem[] }`
  - 入力はサニタイズ済みの HTML（`sanitize.ts` は h1〜h6 の `id` を残す）。本文の整形の順番は「サニタイズ → インラインコード変換 → 目次 → コードハイライト」
  - 正規表現で h2・h3 を拾う（`highlight.ts` と同じやり方。HTML パーサは足さない）。microCMS の見出しは `<h2 id="h83d64f04d0"><strong>…</strong></h2>` のように、中にタグを含みうる
  - 見出しのテキストは、中のタグを除き、`highlight.ts` の `decodeEntities` で HTML エンティティを戻したもの。空白だけになる見出しは目次から除く
  - `id` が無い、または本文中の他の `id` と重複する場合は `toc-1`, `toc-2` … を付ける。`toc-N` 自体も本文中の既存の `id` とぶつからないことを確かめる
  - 目次に入る見出しには `tabindex="-1"` を付ける（移動後にフォーカスを当てるため）
  - h1 は目次に含めない

## 既存コードとの関係
- `src/layouts/Layout.astro`：ラッパの `overflow-hidden` を `overflow-clip` に変える（sticky を効かせるため。縦横の切り方は今と同じ）。全ページに影響する。Safari 15 以前は `overflow: clip` を解釈しないので、`overflow-hidden` の後に `overflow-clip` を書いて上書きする形にする（解釈しないブラウザでは今と同じ動作になり、目次の追従だけが効かない）
- `src/components/BlogArticleView.astro`：構成を作り直す。`<main>` を `<div>` に変える（`Layout.astro` が `<main>` を持つため、二重になっていた）。`id="copy-link"` と `<script>` は `copy-link.ts` に移し、ボタンは `data-copy-link` 属性で拾う（2か所に置くため `id` は使わない）。コピーするのは `canonicalURL`
- `src/pages/blog/[slug].astro`：前後の記事を「前＝1つ古い（`index + 1`）、次＝1つ新しい（`index - 1`）」に入れ替える。関連記事の選び方は変えない
- `src/blog-preview.astro`：同じ `BlogArticleView` を使う。前後・関連の記事を渡していないので、前後の位置は両方「テックブログ一覧へ」、関連記事の帯は出ない
- `src/utils/highlight.ts`：`decodeEntities` を export する（動作は変えない）
- `tailwind.config.cjs`：変更なし（`md`・`lg` は定義済み。`prose-headings:` 修飾子は `@tailwindcss/typography` が持つ）
