# 404 ページの刷新 design

## 情報構造の追加・変更（OOUX）
- なし（microCMS は使わない。コマンドと結果の文言はコードに書く）

## UI

### デザインの有無
- 新しく作った（Claude Design のキャンバス「404ページ刷新」：https://claude.ai/artifact/1E4wD6CUDAUqBmXMR9LjpU ）
  - 非公開のキャンバスなので、見るには Share での共有が必要
  - 使うのは「案B ターミナルで探す（採用・PC 1440）」と「案B スマホ（390・ターミナルなし）」。PC はターミナルを Play で試せる。案A・案C は比較用で使わない
  - キャンバスの Tweaks の `promptStyle` の `plain`（帯なしの1行）は比較用。実装は `powerline`（帯）だけ
- キャンバスのヘッダー・フッター・入会申し込みのボタンは既存の部品を写したもの。実装では `Layout` が出すものをそのまま使う
- キャンバスと次の点が違う。実装はこの design に従う
  - 上の余白：キャンバスは `pt-14 lg:pt-[88px]`。実装はデザインシステムの「ページの見出し」と同じ `pt-[72px] lg:pt-[104px]`
  - 等幅の書体：キャンバスは JetBrains Mono。実装は Tailwind の `font-mono`（OS の等幅書体）。ほとんど出ないページのために Web フォントを増やさないため
  - リンク：キャンバスでは新しいタブで開く（キャンバスの制約）。実装は同じタブで開き、ヘッダーと同じパス（`/blog` など。末尾のスラッシュなし）を使う
  - キャンバスに残っている 1024px 未満用のターミナルの指定（入力欄 16px、768px 未満でユーザーの帯を隠す）は使わない（D3）

### 使用コンポーネント
- 既存：`Layout.astro`（`noindex` を渡す。ほかは変更なし）
- 新規：
  - `src/utils/not-found-commands.ts` … 入力を受け取り、結果の行を返す。DOM に依存しない
  - `src/components/not-found/NotFoundTerminal.astro` … ターミナルの見た目と、JavaScript が無いときの最初の出力。帯の形とカーソルの点滅はコンポーネントの `<style>` に書く
  - `src/scripts/not-found-terminal.ts` … 自動入力・入力欄・履歴・「試してみる」・汽車・視差効果を減らす設定への対応
- 色：`red` の系統を v3 の値で `@theme` に足す（`❯` の失敗の色。README「スタイル」の決まり）

### 構成

```
Layout.astro（title・noindex）
└ <div>（mx-auto max-w-[1440px] px-6 lg:px-20。2列の grid。<main> は Layout が持つので div）
   ├ 左の列（1024px 未満は1列だけ）
   │  ├ 大学名の英字（デザインシステムの「ページの見出し」）
   │  ├ 英字の大見出し「404」（aria-hidden）
   │  ├ h1「ページが見つかりません」
   │  ├ 説明文
   │  └ <nav aria-label="ほかのページ">：トップへ戻る（枠線のボタン）／文字のリンク4つ（<ul>）
   └ 右の列：NotFoundTerminal（hidden lg:block）
      └ <section aria-label="ターミナル（コマンドでページを探せます）">
         ├ 窓（タイトルの帯＋本文）
         │  ├ 結果の行 <div role="log">
         │  ├ プロンプト（帯＋ ❯ ＋入力欄。JS で出す）
         │  └ 汽車（aria-hidden。sl のときだけ）
         ├ 「試してみる」＋ボタン4つ（JS で出す）
         └ ヒント（JS で出す）
```

### 左の列

| 要素 | クラス・値 |
|---|---|
| 囲み | `grid grid-cols-1 gap-14 pt-[72px] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:pt-[104px]` |
| 大学名・英字の大見出し・h1 | デザインシステムの「ページの見出し」のとおり。英字の大見出しの文字は `404` |
| 説明文 | `mt-5 max-w-[560px] text-[15px] leading-[1.9] text-gray-600 lg:text-lg lg:leading-loose`。文言：お探しのページは、移動したか削除された可能性があります。URLをもう一度確かめるか、下のリンクからお探しください。 |
| ほかのページ `<nav>` | `mt-7` |
| トップへ戻る | `<a href="/">`。デザインシステムの「枠線のボタン」に `focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`。左向きの矢印（aria-hidden、16px） |
| 文字のリンク | `<ul class="mt-3 flex flex-wrap gap-x-6">`。各 `<a>`：`inline-flex min-h-11 items-center text-[15px] font-medium text-blue-600 hover:text-blue-700 hover:underline`（フォーカスはトップへ戻ると同じ）。テックブログ（`/blog`）・私たちについて（`/about`）・よくある質問（`/faq`）・お問い合わせ（`/contact`） |

- デザインシステムの「ページの見出し」との違い：`custom-md`（1280px）以上でも説明文を右の列に置かない。右の列をターミナルが使うため。1024px 未満は「ページの見出し」と同じ並び

### ターミナル（1024px 以上）

#### 窓
| 要素 | クラス・値 |
|---|---|
| 囲み `<section>` | `hidden lg:block` |
| 窓 | `overflow-hidden rounded-[14px] bg-gray-900 shadow-[0_1px_2px_rgba(17,24,39,.08),0_24px_48px_-12px_rgba(17,24,39,.35)]` |
| タイトルの帯 | `flex h-11 items-center gap-2 border-b border-gray-800 px-4`。丸3つ（`size-3 rounded-full bg-gray-700`）と、中央に `guest@tnd — zsh`（`font-mono text-xs text-gray-400`）。どれも aria-hidden |
| 本文 | `relative` の中に `h-[420px] overflow-y-auto overscroll-contain px-5 pb-[22px] pt-3.5 font-mono text-sm leading-[1.75] text-gray-200` |

#### 行の色

| 種類 | 色 | 使う場面 |
|---|---|---|
| ふつう | `text-gray-200` | 結果 |
| 補足 | `text-gray-400` | 案内・ヒント |
| エラー | `text-orange-300` | `HTTP/1.1 404 Not Found`・`command not found` など |
| 移動 | `text-teal-300` | `cd`・`open`・`exit` の「→」 |
| リンク | `text-blue-300 underline underline-offset-[3px] hover:text-blue-200`。フォーカスは `focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300` | ページへのリンク。リンクの間は `mr-[22px]` |
| `❯`（成功・失敗） | `text-green-400`／`text-red-400`、`font-semibold` | プロンプトと、実行した行 |

- 行は `whitespace-pre-wrap wrap-break-word`。実行した行は、2つ目以降の上に `mt-2.5`
- 実行した行の `❯` は、入力したときのプロンプトの色のまま（直前の結果の色）。そのコマンドの結果の色ではない

#### プロンプト（Starship 風。D2）
- 2行。上に `mt-3`
- 1行目：矢印の形でつないだ帯（aria-hidden）。`flex flex-wrap items-center gap-y-1 mb-1`

| 帯 | 中身 | 地・文字（`tnd` の色。D4） |
|---|---|---|
| ユーザー | 人のアイコン＋`guest` | `bg-tnd-blue text-white` |
| パス | フォルダのアイコン＋`~<パス>` | `bg-tnd-violet text-gray-900` |
| ブランチ | ブランチのアイコン＋`main` | `bg-tnd-teal text-gray-900` |
| 時間 | 時計のアイコン＋`404ms` | `bg-tnd-mint text-gray-900` |

  - 帯の形：`inline-flex h-[1.7em] items-center gap-1.5 whitespace-nowrap pl-2.5 pr-4 text-[.92em] font-semibold`。右端を矢印に切る（`clip-path: polygon(0 0, calc(100% - 9px) 0, 100% 50%, calc(100% - 9px) 100%, 0 100%)`）。2つ目からは左端も矢印の形にへこませ（`…, 9px 50%`）、`-ml-[7px] pl-[18px]` で前の帯に重ねる。先頭の帯だけ左を `rounded-l-[5px]`
  - パスの帯は `min-w-0 max-w-full` にし、パスの文字を `truncate` の span に入れる（長い日本語のパスでも本文の幅を超えない）
  - アイコンは 12px の線のアイコン（`stroke-width` 2.4、aria-hidden）
- 2行目：`❯ `（色は直前の結果。aria-hidden）＋入力欄
  - `<form class="flex items-center rounded-sm has-[input:focus-visible]:outline-solid has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-4 has-[input:focus-visible]:outline-blue-300">`
  - 中に、見えないラベル `<label for="not-found-cmd" class="sr-only">コマンドを入力</label>` と `<input id="not-found-cmd" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="go" placeholder="help">`
  - 入力欄：`h-[1.75em] min-w-0 flex-1 bg-transparent p-0 text-gray-50 caret-teal-300 outline-hidden [font:inherit] placeholder:text-gray-400`
- 自動入力の間は、入力欄の代わりに入力中の文字と、点滅するカーソル（`teal-300` の四角。1秒周期、aria-hidden）を出す

#### パスの表示
- `location.pathname` を `decodeURIComponent` したもの（失敗したらそのまま）。クエリとハッシュは含めない。`/404.html` を直接開いたときは、それがそのまま出る
- `open` の行は 40 字を超えたら、先頭を「…」にして後ろの 39 字を出す。帯は CSS で省く（上）

#### 動きの順番
1. 1024px 以上で表示されたら始める（`matchMedia("(min-width: 1024px)")`。開いた後に幅を広げたときも、一度だけ始める）
2. 700ms 待つ
3. `open <パス>` を1文字ずつ入力する（1文字 55〜115ms）
4. 380ms 後に、実行した行（`❯ open <パス>`、`❯` は緑）にして、最初の出力3行を 260ms・480ms・700ms 後に出す
5. 最後の行の後に、入力欄と「試してみる」を出し、結果の行の `aria-live` を `off` から `polite` にする。`❯` は赤（最初の `open` は失敗）
- 視差効果を減らす設定のときは、2〜4 をせず、実行した行と最初の出力をまとめて出してから 5 にする

#### コマンド
- 入力を NFKC でそろえ（全角の英数字と空白を半角に）、前後の空白を除く。最初の語をコマンド、2つ目を引数とし、どちらも小文字にそろえる。引数の先頭の `./`・`/` と末尾の `/` は除く
- 結果に入力を出すとき（`command not found: <語>`・`cd: <引数>`）は、NFKC でそろえた後・小文字にする前の語を出す
- 空の入力：`❯` だけの行を足す（`❯` の色は変えない。履歴にも積まない）

| コマンド | 結果 | ❯ |
|---|---|---|
| `help` | 補足「使えるコマンド」、`  ls          ページの一覧`、`  tree        サイトの地図`、`  cd <名前>   ページへ移動（例: cd blog）`、`  whoami      あなたについて`、`  clear       画面を消す`、`  exit        トップページへ移動`、補足「  ほかにも、隠れたコマンドがあるかも。」 | 緑 |
| `ls` | リンク `about/`・`blog/`・`faq/`・`contact/` を1行に | 緑 |
| `tree` | 1行目：リンク `~`＋補足の色で `    トップページ`。続けて各ページ：補足の色の `├── `（最後は `└── `）＋リンク `about/` など＋補足の色でページ名（`about/` などの後ろを空白で10字にそろえる） | 緑 |
| `cd`・`open`（引数なし・`~`・`..`・`/`） | 移動「→ 」＋リンク「トップページ」（`/`）＋補足の色で「 へ移動します…」。0.6 秒後に移動 | 緑 |
| `cd about`・`open about` など（about・blog・faq・contact） | 移動「→ 」＋そのページの名前のリンク（私たちについて など）＋「 へ移動します…」。0.6 秒後に移動 | 緑 |
| `cd`・`open` そのほか | エラー `<cd または open>: <引数>: そのようなページはありません` | 赤 |
| `whoami` | `guest`、補足「まだ TND のメンバーではないようです。入会申し込みのボタンから、いつでも参加できます。」 | 緑 |
| `exit` | `cd ~` と同じ（トップページへ移動） | 緑 |
| `clear` | 行をすべて消す | 緑 |
| `sl`（help に出さない） | 汽車を走らせ、通り過ぎたら補足「（ls の打ち間違いかもしれません）」。走っている間の `sl` は、実行した行だけを足す | 緑 |
| `sudo`（help に出さない） | エラー `sudo: guest には管理者の権限がありません。`、補足「この件は報告されます。……というのはうそです。」 | 赤 |
| `rm`（help に出さない） | エラー `rm: それは消さないでください。` | 赤 |
| そのほか | エラー `command not found: <語>`。続けて、語がページ名（about・blog・faq・contact）か `top`・`home` なら補足「もしかして: cd <語>」（`top`・`home` は `cd ~`）、それ以外は補足「help と入力すると、使えるコマンドを表示します。」 | 赤 |

- 移動（D5）：「へ移動します…」を出してから 0.6 秒後に `location.assign(href)`。打ったことが分かる間を置くため。リンクも出すので、待たずに押してもよい
- `ls` のリンクの間は `mr-[22px]`。1行にリンクが1つの行（`tree`・移動）は間を空けない
- リンクの `href` は、コードの決まった表（トップ・4つのページ）からだけ取る。入力から作らない
- 行の文字は、入力を含めてすべて `textContent` で入れる（`innerHTML` は使わない）
- `not-found-commands.ts` の形：`runCommand(input: string): { ok: boolean | null; effect?: "clear" | "train" | { navigate: string }; lines: TermLine[] }`。`TermLine = { tone: "out" | "dim" | "err" | "go"; text: string; links?: { href: string; label: string }[]; after?: string }`（`after` はリンクの後ろに補足の色で出す文字）。空の入力は `ok: null`

#### 汽車（`sl`）
- ターミナルの本文に重ねる `<pre>`（`pointer-events-none absolute left-0 top-1/2 bg-gray-900 font-mono text-[13px] leading-tight text-gray-50`、aria-hidden）。位置は `style.transform = "translate(<x>px, -50%)"` で動かす（`-translate-y-1/2` のクラスは使わない。v4 では CSS の `translate` を使うため、`transform` と重なる）
- 本文の右端から左へ、毎秒 260px で動かし、全体が左に抜けたら消す。車輪 `(O)` と `(o)`、煙を約 0.17 秒ごとに入れ替える
- 絵はキャンバスと同じ5行（TND と書いた機関車と客車2両。自作の絵）
- 窓の `overflow-hidden` で切り、ページに横スクロールを出さない
- 視差効果を減らす設定のときは走らせず、補足の行だけを出す

#### 試してみる
- `<div class="mt-3.5 flex flex-wrap items-center gap-2" hidden>`。最初の出力が終わったら `hidden` を外す
- 「試してみる」：`mr-1 text-[13px] text-gray-500`
- ボタン（`help`・`tree`・`whoami`・`sl`）：`<button type="button">`、`inline-flex min-h-11 items-center rounded-full border border-gray-200 bg-white px-4 font-mono text-[13px] text-gray-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700`。フォーカスは「トップへ戻る」と同じ
- 押したら、入力したときと同じように実行し、履歴にも積む。フォーカスはボタンに残す

#### ヒント（D6）
- `<div class="mt-3 flex items-center gap-1 rounded-xl border border-gray-200 bg-white py-1 pr-1 pl-4" hidden>`。最初の出力が終わったら「試してみる」と一緒に `hidden` を外す
- 左：`HINT 1/5`（`font-['Inter'] text-[11px] font-semibold tracking-[0.16em] text-gray-500`、aria-hidden）
- 中：ヒントの文（`<p aria-live="polite" class="ml-2.5 min-w-0 flex-1 text-sm leading-[1.7] text-gray-600">`）。コマンドの部分は `<code class="rounded-[5px] bg-gray-100 px-1.5 font-mono text-[.9em] text-gray-900">`
- 右：「前のヒント」「次のヒント」（`<button type="button" aria-label="前のヒント">`。`inline-flex size-11 items-center justify-center rounded-[10px] text-gray-600 hover:bg-gray-100 hover:text-gray-900`、フォーカスは「トップへ戻る」と同じ。中は 18px の山形の矢印、aria-hidden）
- 端では反対の端へ回る。自動では切り替えない（動きを減らすため、また読んでいる途中で変わらないように）
- ヒントの文（`not-found-commands.ts` に置く。コマンドは `code`）
  1. `tree` で、サイトの地図が見られます。
  2. `cd blog` と打つと、テックブログへ移動します。
  3. `↑` キーで、前に打ったコマンドを呼び出せます。
  4. `whoami` で、あなたのことが分かる……かも。
  5. 隠れたコマンドが 3 つあります。
- 文字は `textContent` で入れる

#### 入力欄のキー
- Enter：実行（`<form>` の submit）
- ↑：履歴を古いほうへ。↓：新しいほうへ。一番新しい次は空にする。打ちかけの文字は残さない
- 日本語の変換中（`isComposing` が true、または `keyCode` が 229）の Enter・↑・↓ は何もしない
- Tab は奪わない（ターミナルの外へ出られる）

#### スクロール・行数
- 行を足したら、本文を `scrollTop = scrollHeight` にする（ページ全体は動かない）
- 行は `TermLine` で数えて最大 80 行。超えたら古い行から消す

### 状態
- 初期：最初の出力を表示中（入力欄なし）→ 入力できる
- 汽車が走っている間も入力できる
- ページを離れたら何も残さない（保存しない）

### JavaScript が無いとき
- `NotFoundTerminal.astro` は、`HTTP/1.1 404 Not Found` と「ページが見つかりませんでした。」の2行を結果の行に入れて出力する（「help と入力すると…」は出さない。入力欄が無いため）。プロンプト・「試してみる」・ヒントは `hidden`
- 結果の行は最初 `aria-live="off"`。スクリプトは、動き始めたら最初の出力を消し、「動きの順番」から始める

### 動き
- 自動入力：上の「動きの順番」。カーソルは1秒周期で点滅（`steps(1)`）
- 汽車：毎秒 260px。車輪と煙は約 0.17 秒ごと
- `prefers-reduced-motion: reduce`：自動入力・汽車・点滅をしない。判定はターミナルを始めるときに一度だけ行う

### アクセシビリティ（ARIA）
- 見出しの順：h1 のみ（ターミナルは見出しを持たない `<section aria-label>`）
- 英字の大見出し・タイトルの帯・プロンプトの帯・`❯`・入力中の文字とカーソル・汽車は `aria-hidden="true"`
- 結果の行は `role="log"`。最初の出力が終わるまで `aria-live="off"`、その後 `polite`（最初の出力を二度読ませない。h1 の読み上げに割り込まない）。実行した行は、コマンドの文字だけが読まれる
- 入力欄は見えないラベル付き
- ページを開いたときにフォーカスを動かさない
- 色だけで成功・失敗を伝えない（`❯` の色は飾り。結果の文言で分かる）
- コントラスト（`bg-gray-900` の上）：`gray-200` 約14:1・`gray-400` 6.9:1・`orange-300` 10.5:1・`blue-300` 9.8:1・`green-400` 10.2:1・`red-400` 6.4:1。帯の文字は aria-hidden の飾りだが、`tnd-blue` の上の白は約 4.5:1、ほかは `gray-900` の文字で 4.5:1 以上

### レスポンシブ
- 境界はデザインシステムどおり（`lg` 1024）
- 1024px 未満：1列（見出しとリンクだけ）。ターミナルは `hidden`、スクリプトも始めない（D3）
- 1024px 以上：2列（左 0.9fr・右 1.1fr、縦は中央そろえ）
- 320px 以上で横スクロールを出さない

### 忠実度と意図
| 要素 | 忠実度 | 意図（なぜ） |
|---|---|---|
| ターミナルで探す仕掛け（自動入力・コマンド・試してみる） | 厳守 | 人間が選んだ案（D1） |
| `cd` で実際に移動する・`tree` | 厳守 | 人間の要望（D5） |
| ヒントを左右のボタンで切り替える | 厳守 | 人間の要望（D6） |
| ヒントの文 | 意図を守れば自由 | 遊び方の手がかりになればよい |
| Starship 風のプロンプト（帯と、結果で色が変わる `❯`） | 厳守 | 人間の要望（D2） |
| スマホ（1024px 未満）にターミナルを出さない | 厳守 | 人間の決定（D3） |
| 見出し・リンクを左の列に置き、ターミナルより先に読ませる | 厳守 | 迷った人を先に助けるため |
| コマンドの文言・隠しコマンド | 意図を守れば自由 | 遊び心が伝わり、サークルの事実（CLAUDE.md）と食い違わなければよい |
| 帯の色（`tnd` の4色） | 厳守 | 人間の決定（D4）。シンボルの色でサークルらしさを出す |
| 余白・文字の大きさ・角丸・汽車の絵 | 意図を守れば自由 | キャンバスの値に寄せ、Tailwind のトークンを使う |

## データ・API
- 変更なし

## 既存コードとの関係
- `src/pages/404.astro`：作り直す。古いアニメーション（`animate-float` など）・コメントアウトされた旧ボタンと「お困りですか？」・`TwoLine` の読み込みを消す
- `TwoLine`：404 では使わなくなる。about・記事・ブログのプレビューで使っているので部品は残す
- `Layout.astro`：変更なし（`noindex` を渡すだけ）。canonical は `https://tus-tnd.com/404` になるが、`noindex` なので直さない
- `src/styles/tailwind.css`：`@theme` に `red` の v3 の値を足す
- `docs/design/README.md`：「適用状況」の表の 404 を `about・記事・404` の行から分け、「独自のデザイン（spec 007）。見出し・ボタン・色・書体はデザインシステムどおり。1280px 以上でも説明文を右の列に置かない（右はターミナル）。ターミナルは独自で、1024px 以上だけ」にする。「色」の `tnd` の行に「404 のターミナルのプロンプトの帯」を書き足す（D4。済）
