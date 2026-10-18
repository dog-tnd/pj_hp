# ホームの刷新とブログ一覧へのデザインシステムの適用 design

## 情報構造の追加・変更（OOUX）
- なし（ホームの新着記事は、今と同じ `getAllPosts()` の先頭4件を使う。データの取得は変えない）

## UI

### デザインの有無
- ホーム：新しく作った（Claude Design のキャンバス「ホーム刷新」：https://claude.ai/artifact/JNrMmJAdD4D6o7b5nEURC9 ）。案A の PC（`Main.dc.html`）とスマホ（`Mobile.dc.html`）。案B・案C は比較用で使わない
  - 非公開のキャンバスなので、見るには Share での共有が必要
  - キャンバスの画像は仮（`[アイキャッチ画像]`）。実装では記事のアイキャッチを使う
- ブログ一覧：新しいデザインは作らない。デザインシステムの「ページの見出し」「項目の見出し（上置き）」をそのまま当てはめる

### デザインシステムへの追加：項目の見出し（上置き）
カードの一覧のように幅の要る中身では、`lg` 以上でも見出しを左の列に置かず、上に置く。

| 要素 | クラス |
|---|---|
| 項目 `<section>` | `grid grid-cols-1 gap-3.5 border-t border-gray-200 py-8 lg:gap-8 lg:py-[52px]` |
| 英字のラベル・h2 | 「項目の見出し」と同じ |

- 見出しと中身の間は、狭い画面ではふつうの項目と同じ `gap-3.5`。`lg` 以上は横に並ばない分、`gap-8` で間を取る
- 最後の項目は下の余白を付けない（ふつうの項目と同じ）

- 理由：左の列 280px と間 56px を取ると、1024〜1279px で中身の幅が 528〜784px になり、3列・2列のカードが約 250px まで細くなる

### デザインシステムへの追加：見出しの改行（D13）
- 共通の決まりに「見出しは意味のまとまりの途中で改行しない」を足す。まとまりごとに `whitespace-nowrap` の span で包む（例：h1「東京理科大学／野田キャンパスの／プログラミングサークル」）
- 「ページの見出しが無いページの最初の項目は上の線なし」（D6）は、新しいホームで使わなくなったので消す

### ホーム（`src/pages/index.astro`）

```
Layout
└ <div>（overflow-x-clip。流れる帯のはみ出しを切る。<main> は Layout が持つので div）
   ├ ヒーロー <section>（relative isolate。mx-auto max-w-[1440px] px-6 lg:px-20、pt-10 lg:pt-[72px]）
   │  ├ 左：大学名の英字／英字 TND（aria-hidden）／h1／説明文／ボタン2つ／X のフォロー
   │  └ シンボル：lg 以上は右の列、lg 未満は右後ろに薄く（-z-10・opacity-25）
   ├ 流れる帯（aria-hidden。bg-gray-900、-rotate-2、横に流れる）
   ├ 活動 <section id="what-we-do" aria-labelledby>（項目の見出し：左に英字 WHAT WE DO・h2「活動」・説明文、右にチームのカード2枚＋活動3つ）
   ├ 新着記事 <section aria-labelledby>（上置き：英字 NEWS・h2「新着記事」と「テックブログを見る」→ 大きい1件＋一覧3件）
   └ 入会の案内 <section aria-labelledby>（白い面にぼかし2つ：英字 JOIN US!・h2・説明文・入会申し込み）
└ <footer>（今のまま）
```

#### ヒーロー
| 要素 | クラス・値 |
|---|---|
| 囲み | `grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center` |
| 大学名 | デザインシステムの「ページの見出し」と同じ |
| 英字 TND | Rubik Doodle Shadow・`text-blue-500`・`leading-[0.9]`。`text-[112px] md:text-[160px] custom-md:text-[208px]` |
| h1 | `text-2xl leading-normal font-bold tracking-[0.02em] lg:text-[32px] custom-md:text-[40px]`。3つのまとまりを `whitespace-nowrap` の span で包み、「野田キャンパスの」の後で `<br>` |
| 説明文 | `text-[15px] leading-[1.9] text-gray-600 lg:text-lg lg:leading-loose`、`max-w-[560px]` |
| 入会申し込み | `<button type="button" data-open-join>`。黄色の pill（`/contact` と同じ見た目）。スマホは幅いっぱい・高さ 52px、lg 以上は 56px |
| 活動を知る | `<a href="#what-we-do">`。枠線の pill（青の枠・白地）。下向きの矢印（aria-hidden） |
| X のフォロー | 「FOLLOW US」（aria-hidden）＋短い線＋`<a href="https://x.com/TokyorikaND" target="_blank" rel="noopener noreferrer" aria-label="@TokyorikaND（X・新しいタブで開きます）">`。文字のリンク（灰色、ホバーで青と下線）。押せる高さ 44px。スマホは中央寄せ |
| シンボル | `<img src="/mainCharm.svg" alt="">`。lg 以上：右の列の中央に幅 330px・-6°。lg 未満：`absolute -right-12 top-6 -z-10 w-[230px] opacity-25 -rotate-[8deg]` |

#### 流れる帯
- 文字：Rubik Doodle Shadow、白。スマホ 28px・lg 以上 40px。区切りは黄色の「✦」
- 同じ並びを2回続けて置き、`translateX(0 → -50%)` を一定の速さで繰り返す（32秒）。`prefers-reduced-motion: reduce` のときは止める
- 帯全体を `-rotate-2` で傾け、幅を少し広げて端が切れて見えないようにする。はみ出しは外側の `overflow-x-clip` で切る
- 中身の言葉は実装に書く（変更の少ない飾りのため。microCMS では管理しない）

#### 活動
- デザインシステムの「項目の見出し」（左 280px・右に中身。lg 未満は縦）。説明文は h2 の下に `text-[15px] leading-[1.9] text-gray-600`
- チームのカード（`md` 以上で2列）：白い面・`border-gray-200`・角丸 16px。チーム名（h3）・説明・技術のタグ（灰色の小さな pill。押せない見た目にするため、枠なし・`bg-gray-100`・12px）
- 活動の3つ（`md` 以上で3列）：`bg-blue-50` の面・角丸 16px。名前（太字）と説明。リストの項目（`<ul>`）で、見出し要素にはしない
- 文言（D9）
  - Web開発チーム：フロントエンドとバックエンドの両面から、Webアプリをつくっています。（HTML/CSS・TypeScript・React/Next.js・Python・Golang）
  - データサイエンスチーム：Kaggle のコンペに参加したり、AI エージェントの設計に取り組んだりしています。（Python・Kaggle・AIエージェント）
  - Discord：ふだんのコミュニケーションは Discord で。メンバー同士でよく話しています。
  - ハッカソン：短い期間で集中してプロダクトをつくります。学外のイベントにも参加。
  - チーム開発：Webアプリやデータ分析など、幅広いテーマのプロジェクトに参加できます。

#### 新着記事
- 見出しの行：英字 NEWS・h2「新着記事」。`md` 以上は右端に「テックブログを見る」（枠線のボタン）。`md` 未満はボタンを一覧の下に幅いっぱいで置く
- 中身：`lg:grid-cols-2 lg:gap-10`
  - 大きい1件：白い面・角丸 16px。画像 `aspect-[2/1] object-cover`、日付（Inter）・タイトル（h3、`text-lg lg:text-[21px]`）・説明・書き手（名前・役職）
  - 一覧3件：`lg:grid lg:grid-rows-3`（左のカードの高さを3等分）。行は画像（スマホ 96px・lg 176px、`aspect-[16/10]`、角丸 10px）と、日付・タイトル（h3、スマホ 14px・lg 17px）・書き手。行の間に線
  - タイトルは `max-w-[16em]`（1行16字×2行。D12）
  - 記事へのリンクは行・カード全体を `<a>` にする。ホバーでタイトルが青
- 画像は `loading="lazy"`・`decoding="async"`、`alt=""`（タイトルがリンクの名前になるため）

#### 入会の案内
- 面：白・`border-blue-100`・角丸 28px（スマホ 24px）。中に青緑と黄色のぼかし（aria-hidden、`-z-10`）
- 左：英字 `JOIN US!`（Rubik Doodle Shadow・青・スマホ 48px・lg 72px）・h2（「メンバーは」「一年中募集しています」を nowrap の span）・説明文
- 右（1024px 未満は下）：「入会申し込み」（`data-open-join`）。シンボルは置かない（D14）。1024px 以上は `lg:grid-cols-[minmax(0,1fr)_auto]` で文字の右に並べる
- 説明文：プログラミング初心者も大歓迎。先輩メンバーがサポートします。入会申し込みから、新入生向けの Discord に参加できます。

#### 消すもの
- `TwoLine`（右上の十字線）・左下の固定の SNS の欄・`NewsCard` の import（ホームでは使わなくなる。ブログ一覧では使い続ける）

### 入会モーダル（`src/components/JoinDialog.astro`。全ページ共通）
- キャンバス「入会モーダル 案1」（PC）・「入会モーダル — スマホ（下から出るシート）」
- `<dialog id="join-dialog" aria-labelledby>` のまま作り直す。開く・閉じる・スクロールの固定（`data-open-join`・`data-close-join`・`syncScrollLock`）の仕組みは変えない
- 形
  - 768px 以上：中央のカード。`w-[min(520px,calc(100%-48px))]`、角丸 28px、`px-11 pb-9 pt-10`
  - 768px 未満：下から出るシート。幅いっぱい・下に付ける（`mb-0 mt-auto`）、上だけ角丸 24px、上につまみ（飾り）
  - どちらも `max-h-[calc(100dvh-24px)]` を超えたらモーダルの中だけスクロール
  - 背景：`backdrop:bg-slate-900/45` ＋ ぼかし。面の中に青緑と黄色のぼかし（aria-hidden）
- 中身（上から）
  - 英字 `JOIN US!`（Rubik Doodle Shadow・青、aria-hidden）＋小さなシンボル（aria-hidden）
  - h2「まずは Discord に参加しよう」（「まずは Discord に」「参加しよう」を nowrap の span）
  - 説明：TND の入口は Discord です。参加すると新歓ロールが付き、TND の仮加入メンバーになります。メンバーは一年中募集しています。
  - 参加したあとの流れ（`<ol>`、番号は aria-hidden の丸）：Discord に参加（下のボタンから）／自己紹介チャンネルで、ひとことあいさつ／雑談チャンネルで、先輩や新入生と話してみる
  - 「Discord サーバーに参加する」：`<a href="https://discord.gg/k3qMBEn3CC" target="_blank" rel="noopener noreferrer" aria-label="Discord サーバーに参加する（新しいタブで開きます）">`。`bg-indigo-600`（白文字 6:1 以上）・高さ 56px（スマホ 52px）の pill
  - 補足：参加には Discord のアカウントが必要です
  - 閉じるボタン：右上・44px・`aria-label="閉じる"`
- 動き：開く 300ms（`cubic-bezier(0.2,0.8,0.2,1)`）、閉じる 220ms（ease-in）。スマホは `translateY(100%)` から、PC は `translateY(16px) scale(0.96)`・透明から。閉じるときは `is-closing` を付けて動きが終わってから `close()`（Esc は `cancel` を止めて同じ処理。`animationend` が届かない環境のため 400ms でも閉じる）
- 文言のうち「新歓ロール」「仮加入メンバー」「自己紹介チャンネル」「雑談チャンネル」は、人間から聞いた内容と今のモーダルの文言から取った

### ブログ一覧（`src/pages/blog/index.astro`）

```
Layout
└ <div>（mx-auto max-w-[1440px] px-6 lg:px-20。<main> は Layout が持つので div）
   ├ ページの見出し（大学名の英字・英字 BLOG（aria-hidden）・h1「テックブログ」・説明文）
   └ <div class="pt-12 lg:pt-24">（お問い合わせと同じく、囲みで間を取る）
      └ <section id="all-posts" aria-labelledby>（項目の見出し・上置き。上の線あり、最後の項目なので pt だけ）
       ├ 英字ラベル ALL POSTS（aria-hidden）＋ h2「すべての記事」
       ├ タグで絞り込み（h3 と今のボタン群。見た目・動きは今のまま）
       └ 記事カードの一覧（今の grid と NewsCard・data-tags のまま）
└ <footer>（今のまま）
```

- `TwoLine` を外す（お問い合わせ・よくある質問と同じ）
- 「すべての記事」の前の絵文字のバッジ（📝）は外す。項目の見出しの形に置き換わるため
- タグの絞り込みを、ページの見出しの中から「すべての記事」の項目の中に移す。絞り込む対象（記事の一覧）のすぐ上に置くため。h1 → h2 → h3 の順になり、見出しの段が飛ばなくなる
  - 十字線を避けるための右の余白（`md:mr-44 custom-md:mr-0`）は、十字線を外すので消す
  - タグのボタンの見た目は今のまま（高さ約 28px。既知の差分。requirements の Non-goals）
- 二重になっていた内側の `container mx-auto px-4` は外す
- `#all-posts`・`.post-card`・`data-tags`・`.tag-filter`・`#remaining-tags`・`#show-all-tags`・`#hide-tags` は今のまま残す（スクリプトが使うため。#71 との競合も減らす）
- 説明文は今の文言をそのまま使う

### 状態
- 変更なし（タグの絞り込みは今のまま）

### アクセシビリティ（ARIA）
- 英字（TND・WHAT WE DO・NEWS・JOIN US!・FOLLOW US）は `aria-hidden="true"`。見出し要素は日本語だけ
- ホーム：h1 → h2「活動」→ h3（チーム名）→ h2「新着記事」→ h3（記事のタイトル）→ h2「メンバーは一年中募集しています」
- ブログ一覧：h1「テックブログ」→ h2「すべての記事」→ h3「タグで絞り込み」
- 項目の `<section>` は `aria-labelledby` で見出しと結ぶ
- 流れる帯・ぼかし・シンボルは `aria-hidden`
- 既知の差分：ブログ一覧の `NewsCard` はカードのタイトルを h2 で出す。`NewsCard` は変えない（#70/#71 で作り直す）

### レスポンシブ
- 境界はデザインシステムどおり（`md` 768・`lg` 1024・`custom-md` 1280）
- ホーム：ヒーロー・活動・新着記事・入会の案内は、`lg` 未満で縦に積む。ボタンはスマホで幅いっぱい
- ブログ一覧：記事カードの一覧の列数は今のまま（1列 → `sm` 2列 → `custom-md` 3列）

### 動き
- 流れる帯：32秒で一周。`prefers-reduced-motion: reduce` で止める
- 記事のホバー：タイトルの色だけ変える

### 忠実度と意図
| 要素 | 忠実度 | 意図（なぜ） |
|---|---|---|
| ヒーローの構成（英字 TND・h1・ボタン2つ・X のフォロー） | 厳守 | 人間と詰めた構成（D7・D8・D10） |
| h1・入会の案内の h2 の改行位置 | 厳守 | 人間の決定（D13） |
| シンボルに飾りを付けない | 厳守 | 人間の決定（D11） |
| 文言（チーム・活動・入会の案内） | 厳守 | サークルの今の事実（D9） |
| 新着記事の「大きい1件＋右に3件」と下に空きを作らないこと | 厳守 | 人間と詰めた構成 |
| 流れる帯の言葉 | 意図を守れば自由 | 取り組んでいる技術が伝わればよい（デザインの技術は入れない） |
| 余白・文字の大きさ・角丸 | 意図を守れば自由 | キャンバスの値に寄せ、Tailwind のトークンを使う |

## データ・API
- 変更なし

## 既存コードとの関係
- `src/pages/index.astro`：作り直す。データ取得（`getAllPosts()` の先頭4件）は今のまま
- `src/pages/blog/index.astro`：見出しまわりと囲みを変え、タグの絞り込みを移す（済）。#71（Zenn 混在）とマージ時に競合しうる（D4）
- `src/components/JoinDialog.astro`：見た目と文言を作り直す（D15）。開く仕組み（`data-open-join`）は変えないので、ヘッダー・お問い合わせ・トップのボタンはそのまま使える
- `docs/design/README.md`：「見出しの改行」を足し、D6 の決まりを消し、適用状況を直す
- `TwoLine`：ホームとブログ一覧で使わなくなる。about・記事などで使っているので部品は残す
- `NewsCard`：ホームでは使わなくなる。ブログ一覧では使い続ける
