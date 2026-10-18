# TND サイトのデザインシステム

サイト全体のデザインの決まりごと。**デザインの判断ではこのファイルが一番上**で、各ページの spec・キャンバスはこれに従う。

- 決まりを変えるときは、ページの spec より先にこのファイルを直す
- ここに無いことは、各ページの spec・キャンバスで決めてよい。複数のページで使うことになったら、ここに書き足す
- 数値は Tailwind のクラスで書く（`lg:` などは下の「画面幅」）。色・余白は直書きせず、既存のトークンを使う

## 適用状況

| ページ | 見出し（このファイルの「見出し」） | メモ |
|---|---|---|
| お問い合わせ（`/contact`） | 適用済み（基準） | 英字の `aria-hidden` は未対応 |
| よくある質問（`/faq`） | 適用済み（spec 004） | |
| トップ（`/`） | 項目の見出しのみ（spec 005） | ページの見出しは無い（h1 は #74 で扱う）。メインビジュアルはそのまま |
| ブログ一覧（`/blog`） | 適用済み（spec 005） | カードとタグのボタンは今のまま（#70/#71 で作り直す） |
| about・記事・404 | 未適用 | 各ページの刷新のときに合わせる |

## 基本

### 画面幅

| 名前 | 幅 | 主な使い方 |
|---|---|---|
| （なし） | 0〜 | スマホ。左右の余白 `px-6`（24px） |
| `md` | 768px〜 | カードを横に並べる |
| `lg` | 1024px〜 | PC のヘッダーに切り替わる。2列の配置にする。左右の余白 `px-20`（80px） |
| `custom-md` | 1280px〜 | ページの見出しを左右2列にする |

- ページの幅は最大 `max-w-[1440px]`、`mx-auto`
- 320px 以上のどの幅でも、横スクロールを出さない

### 書体

| 用途 | 書体 |
|---|---|
| 本文・日本語の見出し | Noto Sans JP（400 / 500 / 700） |
| 英字の見出し・ロゴ | Rubik Doodle Shadow |
| 数字や「Q」など、小さな欧文 | Inter |

### 色

| 役割 | 値 |
|---|---|
| 地色 | `bg-gray-50`（`<body>`） |
| 面（カード） | `bg-white` ＋ `border-gray-200` |
| 文字 | 見出し `text-gray-900`／本文 `text-gray-600`（回答など長文は `text-gray-700`）／補足 `text-gray-500` |
| 英字の見出し | `text-blue-500` |
| リンク・文字だけのボタン | `text-blue-600`（ホバー `text-blue-700`） |
| 入会申し込み（CTA） | `#F5BF48`（ホバー `#E9AF2E`）。**入会申し込みにだけ使う** |
| 背景のぼかし | `tnd` の色（`tailwind.config.cjs`）。背景のぼかしにだけ使う |
| マシュマロへの導線 | `marshmallow` の色。マシュマロの導線にだけ使う |

### 背景

- `Layout.astro` が全ページに、大きなぼかしを左右交互に置く（PC 4個、`lg` 未満 3個）。ページ側では背景を描かない
- 詳しい位置と色は spec 004 の design「背景」

## 見出し

お問い合わせページの作りを基準にする。**英字（Rubik Doodle Shadow・青）＋ 日本語の見出し**の組み合わせで、ページの見出しと項目の見出しの2段階がある。

### 共通の決まり

- 見出し要素（`h1`・`h2`）にするのは日本語だけ。英字は `<p>` にする
- 英字は日本語の見出しの言い換えで、意味を足さない。読み上げで二重にならないよう `aria-hidden="true"` を付ける
- 英字は大文字で書く（例：`FAQ`、`FOR NEWCOMERS`）

### ページの見出し（ページの先頭に1つ）

上から「大学名の英字 → 英字の大見出し → h1 → 説明文」。

| 要素 | クラス |
|---|---|
| 囲み | `grid grid-cols-1 gap-5 pt-[72px] lg:pt-[104px] custom-md:grid-cols-[minmax(0,1fr)_480px] custom-md:items-end custom-md:gap-16` |
| 大学名 | `text-[11px] font-medium leading-relaxed tracking-[0.2em] text-gray-500 lg:text-sm lg:tracking-[0.22em]`。文言は `TOKYO UNIVERSITY OF SCIENCE / NODA CAMPUS`（`NODA CAMPUS` は `whitespace-nowrap`） |
| 英字の大見出し | `mt-3.5 text-[42px] leading-none text-blue-500 md:text-[64px] lg:mt-5 lg:text-[72px] custom-md:text-[92px]`、Rubik Doodle Shadow |
| h1 | `mt-4 text-[22px] font-bold tracking-[0.04em] text-gray-900 lg:mt-6 lg:text-[30px]` |
| 説明文 | `max-w-[560px] text-[15px] leading-[1.9] text-gray-600 lg:text-lg lg:leading-loose custom-md:max-w-none`。`custom-md` 以上では右の列（480px）に置き、下端をそろえる |

- h1 はページに1つ
- 説明文は無くてもよい

### 項目の見出し（ページの中の大きなまとまりごと）

項目の間は線で区切り、左に見出し、右に中身を置く。`lg` 未満は縦に積む。

| 要素 | クラス |
|---|---|
| 項目 `<section>` | `grid grid-cols-1 gap-3.5 border-t border-gray-200 py-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-14 lg:py-[52px]` |
| 英字のラベル | `text-2xl leading-tight text-blue-500 lg:text-[28px]`、Rubik Doodle Shadow |
| h2 | `mt-2 text-[19px] font-bold lg:mt-2.5 lg:text-2xl` |

- 最後の項目は下の余白を付けない（`pb-0`）。その下はフッターの余白になる
- ページの見出しと最初の項目の間は `pt-12 lg:pt-24`
- ページの見出しが無いページ（トップなど）では、最初の項目に上の線を付けず、上の余白をページの見出しと同じ `pt-[72px] lg:pt-[104px]` にする

#### 上置き（幅の要る中身）

カードの一覧のように幅の要る中身では、`lg` 以上でも見出しを左の列に置かず、上に置く。左の列 280px を取ると、1024〜1279px でカードが約 250px まで細くなるため。

| 要素 | クラス |
|---|---|
| 項目 `<section>` | `grid grid-cols-1 gap-3.5 border-t border-gray-200 py-8 lg:gap-8 lg:py-[52px]` |
| 英字のラベル・h2 | 上と同じ |

- 見出しと中身の間は、狭い画面ではふつうの項目と同じ `gap-3.5`。`lg` 以上は `gap-8`

## 部品

### カード

| 要素 | クラス |
|---|---|
| 面 | `rounded-[14px] border border-gray-200 bg-white px-5 py-[22px] lg:px-7 lg:py-[26px]` |
| 小さな英字のラベル | `text-xs font-medium tracking-[0.16em] text-gray-500 lg:text-sm lg:tracking-[0.18em]` |
| タイトル | `text-[17px] font-bold lg:text-xl` |
| 補足 | `text-[13px] leading-[1.7] text-gray-500 lg:text-sm` |

- カードを並べるときは `md` 以上で横並び（`md:flex-row md:gap-5`）、`md` 未満は縦に積む（`gap-4`）

### ボタン

| 種類 | クラス | 使う場面 |
|---|---|---|
| 入会申し込み | `h-[52px] rounded-full bg-[#F5BF48] px-7 text-base font-bold text-white`（影は `/contact` と同じ） | 入会申し込みだけ |
| 枠線のボタン | `inline-flex h-12 items-center gap-2 rounded-[10px] border border-blue-500 bg-white px-[18px] text-sm font-bold text-blue-700 hover:bg-blue-50 lg:h-11` | カードの中の操作・別ページへの移動 |

- 押せる部分の高さは 44px 以上
- 新しいタブで開くリンクには、そのことを `aria-label` でも伝える

### フッター

- 各ページが持つ（共通部品ではない）。`mt-24 border-t border-gray-200 py-8`、`text-sm text-gray-500` で `© 2026 TND All Rights Reserved.`
