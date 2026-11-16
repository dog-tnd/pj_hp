# 外部サイトの記事の混在 design

## 情報構造の追加・変更（OOUX）
- 新しいオブジェクト「外部サイトの記事」を microCMS に足す。自サイトの記事（`blog`）とは別の API（D2）
- 一覧に出すときは、2つを「記事カードの項目」という共通の形にそろえてから並べる（#71 の `BlogCardItem` を引き継ぐ）

### microCMS の API（管理画面での作業。人間）
- API 名「外部サイト」、エンドポイント `external-posts`、リスト形式（D7）
- 一覧での並び順と日付は microCMS の公開日時（`publishedAt`）を使う（D1）。昔の記事を後から登録するときは、公開日時を外部サイトの公開日に変える

| フィールドID | 表示名 | 種類 | 必須 | メモ |
|---|---|---|---|---|
| `url` | 記事のURL（Zenn・Qiitaなど） | テキストフィールド | ✔ | `https://zenn.dev/...`・`https://qiita.com/...` など |
| `site` | サイトの種類 | セレクトフィールド（複数選択なし） | ✔ | 選択肢は `Zenn`・`Qiita`・`その他` |
| `title` | タイトル(32文字) | テキストフィールド | ✔ | 32字以内（文字数制限を付ける） |
| `description` | 記事説明（55文字以内） | テキストエリア | ✔ | 55字以内（文字数制限を付ける）。`blog` と同じ |
| `author` | 筆者名義 | テキストフィールド | ✔ | `blog` と同じ |
| `role` | 筆者役職 | テキストフィールド | | `blog` と同じ |
| `authorImage` | 筆者アイコン | コンテンツ参照（`author_image`） | | `blog` の `authorImage` と同じ参照先 |
| `image` | サムネイル画像 | 画像 | | 空ならサンプル画像 |
| `tags` | タグ | 複数コンテンツ参照（`categories`） | | `blog` と同じタグを使う |

表示名は `blog` に合わせた（2026-10-26 に管理画面で設定済み）。

あわせて：
- API キーが API ごとの権限を使っているなら、`external-posts` に GET の権限を付ける（GitHub Actions・Vercel・各自の `.env` は同じキー）
- `blog` と同じ Webhook（GitHub Actions の `repository_dispatch`、`microcms-publish`）を、公開・更新・公開終了・削除で送るように設定する
- **この API が無いとビルドが失敗する**。一覧への組み込みを develop に入れる前に作る

### 記事カードの項目（`src/utils/post-card.ts`）
microCMS のクライアントを読み込まない（dev ページで固定のデータから使うため）。型だけ `import type` で `microcms.ts` から読む。

```ts
type ExternalSite = "Zenn" | "Qiita" | "その他";

type PostCardItem = {
  id: string;           // microCMS のコンテンツ ID（data 属性・key 用）
  title: string;
  description: string;
  image: string;        // フォールバック済みの URL
  author: string;
  role: string;         // 空文字のこともある
  authorImage: string;  // フォールバック済みの URL
  publishedAt: string;  // ISO 文字列のまま。表示は formatDotDate
  tags: string[];       // カテゴリの name
  url: string;          // 自サイトは /blog/{id}、外部は入力された URL
  external: { site: ExternalSite; label: "Zenn" | "Qiita" | "外部サイト" } | null;
};
```

- `checkExternalUrl(url, site)`：表示してよければ `new URL(url).href`（整えた URL）、いけなければ理由を返す
  - `new URL()` で読めない、`https:` でない → 不可
  - `Zenn` なのに hostname が `zenn.dev` でない、`Qiita` なのに `qiita.com` でない → 不可（hostname を比べるので `zenn.dev@example.com` は弾ける）
  - `その他` は `https:` なら可
- `fromBlogPost(post)`：自サイトの記事を共通の形にする。`publishedAt` が null（下書きのプレビュー）のときは `updatedAt` で代える
- `fromExternalPost(post)`：外部サイトの記事を共通の形にする。`site` が1つだけ選ばれていて、`checkExternalUrl` を通れば項目を、通らなければ理由を返す。`href` には整えた URL を使う
- `toPostCardItems(blogs, externals)`：上の2つで変換し、外した外部サイトの記事は `console.warn` に「外部サイトの記事 <id> を表示しません：<理由>」を出し（ビルドは止めない）、`Date.parse(publishedAt)` の降順で返す。dev ページでも、不正な URL の固定データをこれに通して確かめる

### 取得（`src/lib/microcms.ts`・`src/lib/post-cards.ts`）
- `microcms.ts` に `ExternalPost` 型と `getAllExternalPosts()` を足す（`getAllPosts()` と同じく `getAllContents` で全件、下書きを除く）
- `getImageUrl`・`getAuthorImageUrl` の引数を `BlogPost | ExternalPost` に広げる
- `post-cards.ts`：`getPostCardItems()` は `blog` と `external-posts` を並行して取り、`toPostCardItems` に渡す。`/` と `/blog` の2ページで呼ぶので、取得の Promise をモジュールの中で1つだけ持ち、ビルド中の取得と警告を1回にする

## UI

### デザインの有無
- 新しいデザインは作らない（D4）。ブログ一覧のカードは develop の `NewsCard`、タグの絞り込みも develop のまま。トップの新着記事は spec 005 のまま
- 外部サイトのバッジは、#70 で3案から選んだ見た目（半透明の黒地に白文字）を使い、サイトの名前を3種類に広げる（D5）

### 使用コンポーネント
- 変更：
  - `src/components/NewsCard.tsx` … 任意の `external?: { label: string }` と `ariaLabel?: string` を足す。どちらも無いときは、今と同じ表示と動き（`/blog/preview` は変更不要）
  - `src/pages/blog/index.astro` … 取得を `getPostCardItems()` に替える。マークアップ・クラス・スクリプト・スタイルは develop のまま
  - `src/pages/index.astro` … 取得を `getPostCardItems()` に替え、外部サイトの記事にバッジを付ける
  - `src/dev-pages/news-card.astro` … 外部サイトの記事のサンプルを足す（下記）
- 新規：`src/components/blog/ExternalMark.astro` … トップの新着記事で使う外部サイトの印（`overlay`・`inline`）。`NewsCard` は React なので、同じクラスを TSX の中に書く

### ブログ一覧（`/blog`）
- `getAllPosts()` を `getPostCardItems()` に替える
- タグの集計と、カードの `data-tags` は `item.tags`（カテゴリの名前の配列）から作る。絞り込みのスクリプトは `data-tags` を読むだけなので変えない
- `NewsCard` には、今と同じ props（画像・タイトル・説明・著者・役割・著者アイコン・日付・URL）に加えて、外部サイトの記事だけ `external` と `ariaLabel` を渡す

### `NewsCard` の外部サイトのバッジ
- 画像の囲み（すでに `relative`）の中に `absolute` で重ねる。カードの高さ（`h-[440px]`）は変えず、本文やフッターを押し出さない
- 左上（`left-3 top-3`）にサイトの名前：`rounded-full bg-black/60 px-3 py-1 text-sm font-medium text-white backdrop-blur-xs`
- 右上（`right-3 top-3`）に外部リンクのアイコン：`flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs` の中に 16px（`h-4 w-4`）のアイコン（四角から右上に矢印が出る形）
- 名前とアイコンは `aria-hidden="true"`
- `external` があるとき、`<a>` に `target="_blank" rel="noopener"` と `aria-label`
- #70 の `backdrop-blur-sm`（v3、4px）は v4 では `backdrop-blur-xs`

### トップの「新着記事」（`src/pages/index.astro`）
- `getAllPosts()` を `getPostCardItems()` に変え、先頭4件を使う。`postUrl()` は消して `item.url` を使う
- 大きい1件：画像を `relative` の囲みに入れ、外部サイトなら `ExternalMark overlay` を重ねる
- 一覧3件（画像が小さい）：著者の行の後ろに `ExternalMark inline`（「・Qiita」と 14px のアイコン）
- 外部サイトの記事は「リンクの開き方とラベル」と同じにする
- 役割が空のときは「・役割」を出さない（外部サイトの記事は役割が任意のため）

### リンクの開き方とラベル
- 自サイトの記事：`href="/blog/{id}"`、同じタブ。`aria-label` なし
- 外部サイトの記事：`href`（`checkExternalUrl` で整えた URL）、`target="_blank" rel="noopener"`、`aria-label="<タイトル>（Zenn の記事・新しいタブで開きます）"`（その他は「外部サイトの記事」）
  - `rel` に `noreferrer` を付けない（判断）。書いた人が Zenn・Qiita の側で TND からの流入を見られるようにするため。`noopener` で開いた先からこのページは操作されない

### 確認用ページ（`/dev/news-card`）
- 今のサンプル（タイトル・説明の長さ違い）はそのまま残し、外部サイトの記事の欄を足す
  - Zenn・Qiita・外部サイトの3種類を、明るい画像と暗い画像で出す
  - 不正な URL（`http:`、Zenn なのに `qiita.com`、`zenn.dev@example.com`、種類が空）の固定データを `toPostCardItems` に通し、表示されないこととログの理由を確かめる

### デザインシステム（`docs/design/README.md`）の更新
- 「部品」に「外部サイトの記事の印」を足す（トップとブログ一覧の2ページで使うため）
- 「適用状況」のブログ一覧のメモは「カードとタグのボタンは今のまま。外部サイトの記事には印を付ける（spec 008）」にする

### 忠実度と意図
| 要素 | 忠実度 | 意図（なぜ） |
|---|---|---|
| 既存のカード・タグの絞り込み・トップの形を変えない | 厳守 | 人間の決定（D4） |
| 自サイトと外部サイトの記事を1つの並びにし、公開日時の新しい順にする | 厳守 | 人間の決定（D1・D2・D3） |
| 外部サイトの記事は新しいタブで開き、名前と外部リンクのアイコンで見分けられる | 厳守 | #70 の決定。押す前に外へ出ると分かるように |
| バッジの見た目（半透明の黒、左上に名前・右上にアイコン） | 厳守 | #70 で3案から選んだもの |
| トップの一覧3件では印を文字の行に置く | 意図を守れば自由 | 外部サイトだと分かり、小さな画像を隠さなければよい（判断） |

## 影響範囲
- `/blog`：取得とカードのバッジだけ。見た目は外部サイトの記事が無ければ develop と同じ
- `/`：新着記事の中身とバッジ
- `/blog/preview`：変えない（develop のまま）
- `/blog/[slug]`：変えない（`getAllPosts()` をそのまま使う）
