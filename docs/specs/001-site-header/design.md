# サイト共通ヘッダーの土台 design

## 情報構造の追加・変更（OOUX）
なし

## UI

### デザインの有無
- 既存パターンで作る
  - モバイル版：デザイン 2b（実装済みの `HeaderMobile.astro`。経緯は `docs/design/nav-mobile-2b/report.md`）
  - PC版：今回は作らない（差し込み口のみ）
  - 入会モーダル：現行のモバイル版のモーダルをそのまま使う

### 使用コンポーネント
- 既存：`HeaderMobile.astro`（入会モーダルと幅の条件を取り除く）
- 新規：
  - `SiteHeader.astro` … 幅の切り替えルールを持つ親。`Layout.astro` から呼ぶのはこれだけ
  - `JoinDialog.astro` … 入会モーダル。全ページで1つ
  - `src/scripts/scroll-lock.ts` … 背景スクロールの固定（コンポーネントではなく共有スクリプト）

### 構成

```
Layout.astro
└ <SiteHeader />                       ← <body> 直下（overflow-hidden の div の外）
   ├ <div class="contents lg:hidden">   ← モバイル版の枠
   │   └ <HeaderMobile />
   ├ <div class="hidden lg:contents">   ← PC版の差し込み口（今回は空）
   └ <JoinDialog />                     ← 幅に関係なく常に描画
```

- 枠の div は `display: contents` にする。普通の div で包むと、ヘッダーの `position: sticky` が枠の中でしか効かなくなり、スクロールで消えるため
- 枠が `display: none` になると、中の `<dialog>` もトップレイヤーに表示されない。モバイルのメニューが PC 幅で出ないのはこの仕組みによる。入会モーダルは枠の外に置くので、どの幅でも出る

### 状態
- 通常：幅に応じてモバイル版／何もなし
- メニュー展開中：背景スクロール固定
- 入会モーダル展開中：背景スクロール固定（どの幅でも）
- メニュー → 入会モーダル：メニューを即時に閉じ、モーダルを開く。固定は途切れない
- 幅をまたいだとき：1024px 以上になった瞬間にメニューが開いていれば閉じる（見えないまま画面操作を塞ぐのを防ぐ）

### レスポンシブ
- 境界は `lg`（1024px）の1つだけ。未満がモバイル版、以上が PC 版
- 条件を書く場所は `SiteHeader.astro` のみ。`HeaderMobile.astro` の中の `lg:hidden` 2か所（上部バーの `<header>` と追従ボタン）は外す
- 例外：`Layout.astro` の `<main>` の `pb-24 lg:pb-0`（追従ボタンと本文の重なり防止。`<main>` の余白はヘッダー側から付けられないため）

### 動き
- 既存のまま（メニューの開閉フェード）。入会モーダルは動きなし

### 忠実度と意図
| 要素 | 忠実度 | 意図（なぜ） |
|---|---|---|
| モバイル版ヘッダーの見た目・動き | 厳守 | デザイン 2b で確定し、実装・確認済み |
| 入会モーダルの文言 | 厳守 | 本番の文言（旧 `menu.tsx`）に統一すると決めたため |
| 入会モーダルの見た目 | 意図を守れば自由 | 現行のモバイル版を踏襲。見た目の刷新は Non-goal |
| 3カラム撤去後の本文 | 意図を守れば自由 | 右のナビ列を外すだけ。本文の中身は触らない |

- デザインに無い部分の判断基準：既存のモバイル版の実装に合わせる

## データ・API
なし（静的な UI のみ）

### ボタンとモーダルの約束ごと（PC版担当への契約）
- 入会モーダルを開きたいボタンには `data-open-join` 属性を付けるだけ。クリック処理は書かない
- `JoinDialog.astro` がページ内の `[data-open-join]` をすべて拾って開く
- 背景スクロールの固定は `scroll-lock.ts` に集約する。`data-scroll-lock` を持つ `<dialog>` のどれかが開いていれば固定する。スクロールバーの幅の補正（`--scrollbar-width`）もここで行う
  - `scroll-lock.ts` は `syncScrollLock()` を1つだけ公開する
  - 固定したい `<dialog>` には `data-scroll-lock` を付ける（メニューと入会モーダルの2つ）
  - 各コンポーネントは、`showModal()` の直後と、その dialog の `close` イベントで `syncScrollLock()` を呼ぶ。開閉のたびに自分で `overflow` を書き換えない

### メニュー内の「入会申し込み」の分担
- ボタンには `data-open-join` を付ける。モーダルを開くのは `JoinDialog` の担当
- `HeaderMobile` は同じボタンに自分でもクリック処理を付け、メニューを**即時に**閉じる（フェードなし。フォーカスの移動で不具合が出やすいため、現行と同じ）
- 2つのクリック処理はどちらが先に動いても結果が同じになる（メニューが閉じ、モーダルが開き、スクロール固定は途切れない）

## 既存コードとの関係
- `src/layouts/Layout.astro`：`<HeaderMobile />` を `<SiteHeader />` に置き換える。PR #61 向けの古いコメントを削除
- `MenuLayout` の撤去（ラッパーを外し、中身は残す）：
  - `src/pages/index.astro`、`blog/index.astro`（ヒーローだけ包んでいた）
  - `src/pages/about/index.astro`、`faq/index.astro`、`contact/index.astro`、`404.astro`（ページ全体を包んでいた）
  - `src/components/BlogArticleView.astro`（記事ページ）
- `tsconfig.json`：`exclude` に `archive` を足す。`include` の `"**/*.astro"` が src の外にも効くため、退避した `.astro` が型チェックの対象に残り続けるのを防ぐ
- 退避（`git mv` で `archive/unused-assets/` へ。README に理由を追記）：
  - `src/components/menu.tsx`、`src/components/MenuLayout.astro`（`MenuLayout` は `pt-20` の上余白を持っていたので、撤去で本文が 80px 上に詰まる。決定済み）
  - `src/index.css`（`menu.tsx` だけが読み込んでいた。フォントは `Layout.astro` の `<link>` で読み込み済み、定義している `font-noto-*` クラスは未使用）
- `docs/design/nav-mobile-2b/report.md`：入会モーダルの記述が古くなるので、この spec への参照を1行追記する
- PR #61（PC版）とは `Layout.astro` と各ページで衝突する。#61 は閉じて、この PR のマージ後に develop から作り直してもらう方針
