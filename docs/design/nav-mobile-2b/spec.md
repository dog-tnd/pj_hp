# モバイル/タブレットナビ 2b — 実装仕様

対象：`lg`(1024px) 未満。PC版（`Header.astro` / PR #61）は 1024px 以上のみ描画するため重複しない。

## 方針

- 新規 `src/components/HeaderMobile.astro` を作る。**`Header.astro` は触らない**（PR #61 の修正と衝突させない）
- スタイルは **Tailwind ユーティリティ**。他の `.astro` と同じ書き味に揃える
- `Layout.astro` に `<HeaderMobile />` を `<Header />` の直後（`overflow-hidden` の div の外）に追加
- メニューと入会モーダルは `<dialog>` + `showModal()`。フォーカストラップ・Escape・背景の inert がブラウザ任せになる
- **`sm:` は使えない**（`tailwind.config.cjs` の `screens` が `theme` 直下で上書きされ、`md`/`lg`/`custom-md` のみ）

## 構成（4パート）

```
<header class="lg:hidden sticky top-0 z-50 ...">   ロゴ + ハンバーガー
<dialog data-menu>                                  全画面メニュー
<button class="lg:hidden fixed ...">                追従CTA
<dialog data-join>                                  入会モーダル
```

## 1. ヘッダー（閉じた状態）

| 要素 | 指定 |
| --- | --- |
| 外枠 | `lg:hidden sticky top-0 z-50 h-14 bg-gray-50/85 backdrop-blur-md` |
| 内側 | `flex h-full items-center justify-between pl-4 pr-3 md:pl-8 md:pr-6` |
| ロゴ画像 | `/logo.png` を `w-7 h-7 rounded-full`、`alt=""` |
| ロゴ文字 | `TND` / `font-family:'Rubik Doodle Shadow', system-ui` / `text-2xl leading-none` / `#111827` |
| ロゴ全体 | `<a href="/" aria-label="TND ホーム" class="flex items-center gap-2">` |
| ハンバーガー | `w-11 h-11 rounded-[10px] flex flex-col items-center justify-center gap-1.5` |
| 線3本 | `h-0.5 bg-gray-900 rounded-sm`、幅は `w-[22px] / w-[22px] / w-[14px]`（下段だけ短い） |

**`/logo.svg` は develop に存在しない**（`archive/unused-assets/` へ退避済み）。必ず `/logo.png` を使う。

ボタン属性：`type="button"` `aria-label="メニューを開く"` `aria-expanded="false"` `aria-controls="mobile-menu"` `data-open-menu`

## 2. 全画面メニュー（`<dialog id="mobile-menu" data-menu>`）

dialog の既定スタイルを潰す：`w-screen h-screen max-w-none max-h-none m-0 p-0 border-0 bg-[#111827] text-white`
`open:` バリアントは不要（`showModal()` 済みのみ表示される）。`::backdrop` は全面不透明なので指定不要。

| 要素 | 指定 |
| --- | --- |
| 上部バー | `flex h-14 items-center justify-between pl-4 pr-3 md:pl-8 md:pr-6`（閉じた状態と同位置） |
| ロゴ文字 | 同じだが `text-white` |
| 閉じるボタン | `w-11 h-11` / `×` / `text-white text-2xl` / `aria-label="メニューを閉じる"` / `data-close-menu` |
| リスト外枠 | `px-6 md:px-8 pt-[76px]`（上部バー56px + 76px ＝ デザインの上から132px） |
| リスト | `md:max-w-[520px] md:mx-auto` |
| 行 | `flex h-[72px] items-center gap-4 border-b border-white/10` |
| 番号 | `w-6 font-mono text-xs`。現在地 `#93C5FD` / それ以外 `#9CA3AF` |
| ラベル | `text-[28px] leading-tight`。現在地 `font-bold text-white` / それ以外 `font-medium text-gray-100` |
| 現在地の点 | `ml-auto w-2 h-2 rounded-full bg-[#93C5FD]`（現在地の行のみ） |

リンクは4つ。`01 私たちについて /about` `02 テックブログ /blog` `03 よくある質問 /faq` `04 お問い合わせ /contact`

**現在地判定は `Header.astro` と同じロジックを使う**（`/blog` のみ `startsWith`、他は完全一致＋末尾スラッシュ許容）。現在地の行に `aria-current="page"`。

### メニュー下部のCTA
`absolute inset-x-6 bottom-9 md:max-w-[520px] md:mx-auto md:inset-x-0`
- ボタン：`h-[60px] w-full rounded-[14px] bg-[#F5BF48] text-white text-lg font-bold`
- 注記：`mt-3 text-center text-xs text-gray-400` / 「Discord への案内が開きます」

## 3. 追従CTA

`lg:hidden fixed right-4 bottom-7 z-40 h-13 px-[22px] rounded-full bg-[#F5BF48] text-white text-[15px] font-bold`
※ `h-13` は無いので `h-[52px]`
影：`shadow-[0_4px_8px_rgba(17,24,39,.12),0_12px_28px_rgba(245,191,72,.34)]`

本文と重ならないよう **`Layout.astro` の `<main>` に `pb-24 lg:pb-0`** を付ける（92px確保）。

## 4. 入会モーダル（`<dialog data-join>`）

PC版と同じ見た目を Tailwind で再現する。PC版の dialog は `@media (min-width:1024px)` の中にあり 1024px 未満では機能しないため、**モバイル側は自前で持つ**（将来 `JoinDialog.astro` に統合するのが望ましい。PR #61 と衝突するので今回はやらない）。

- 外枠：`w-[min(440px,calc(100%-48px))] p-0 border-0 rounded-2xl bg-white text-gray-800`
- backdrop：`backdrop:bg-slate-900/50`
- ヘッダー：`flex items-center justify-between px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white`、`h2` は `text-xl font-bold`「Discordに参加しよう！」
- 本文：`p-6 text-center`、`/sns-discord.svg` を `w-16 h-16 mx-auto mb-5`
- 参加ボタン：`block mt-6 py-3 px-[18px] rounded-[10px] bg-indigo-600 text-white font-bold`、`href="https://discord.gg/k3qMBEn3CC"` `target="_blank"` `rel="noopener noreferrer"`
- 閉じるボタン：`aria-label="閉じる"`

## 5. スクリプト

```
開く：  data-open-menu → menu.showModal() + aria-expanded="true"
閉じる：data-close-menu / dialog の close イベント → aria-expanded="false"
入会：  追従CTA と メニュー内CTA の両方 → menu が開いていれば close してから join.showModal()
```

- 背景スクロール固定：どちらかの dialog が開いている間 `document.documentElement.classList.add('overflow-hidden')`、両方閉じたら外す。**個々の open/close で直接書かず、`menu.open || join.open` から導出する**
- dialog の `close` イベントで状態を戻す（Escape で閉じた場合も拾えるため）
- backdrop クリックで閉じる：`dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close() })`
- `<script>` は Astro が自動でバンドル・重複排除するのでそのまま書いてよい

## やらないこと

- `Header.astro` の変更
- `menu.tsx` への言及（PR #61 で削除済み）
- PC版のスタイル方式（素のCSS）に合わせること。こちらは Tailwind で書く
