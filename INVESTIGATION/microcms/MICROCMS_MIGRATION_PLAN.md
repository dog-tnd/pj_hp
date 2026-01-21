# microCMS 導入プロジェクト - 詳細タスク計画書

**作成日:** 2025年1月21日  
**プロジェクト名:** pj_hp ブログシステム microCMS 移行  
**推奨期間:** 1～2週間  
**優先度:** 高  

---

## 📋 プロジェクト概要

現在のローカルマークダウンベースのブログシステムを、microCMS のヘッドレス CMS に移行します。
これにより、日付管理の自動化、Web UI での記事編集、複数著者対応を実現します。

### 移行スコープ
- **対象:** ブログシステム全体（既存8記事を含む）
- **保持:** Astro フレームワーク、デザイン、タグ、著者情報
- **廃止:** ローカルマークダウンファイル（フロントエンドから）、frontmatter 手動入力

---

## 🎯 成功基準

- [ ] microCMS API から Astro ビルド時にコンテンツを取得できる
- [ ] 既存 8 記事が microCMS に正常に移行されている
- [ ] Web UI でブログ記事の作成・編集・削除ができる
- [ ] `date`、`publishedAt`、`updatedAt` が自動管理されている
- [ ] ビルドと デプロイが正常に実行される
- [ ] 外部ユーザーは変化を感じない（エンドユーザー体験に変化なし）

---

## 📊 全体アーキテクチャ（ビフォー・アフター）

### 現在（マークダウンベース）
```
src/content/blog/*.md
    ↓
Astro (import.meta.glob で読込)
    ↓
静的 HTML 生成
    ↓
ウェブサイト表示
```

### 移行後（microCMS）
```
microCMS Web UI で記事編集
    ↓
microCMS API
    ↓
Astro (ビルド時に API 呼び出し)
    ↓
静的 HTML 生成
    ↓
ウェブサイト表示
```

---

## 🚀 フェーズ別タスク分解

### **フェーズ 1: 準備・検証（1～2日）**

このフェーズでは、microCMS の環境を整え、API の動作を検証します。

---

#### **Task 1.1: microCMS 無料アカウント作成・初期設定**

**内容:**
1. https://app.microcms.io/signup にアクセス
2. メールアドレスでサインアップ（Hobby プラン・無料）
3. ワークスペース名を設定（例: `tnd-blog`）
4. API キーを生成

**成果物:**
- microCMS アカウント
- ワークスペース URL（例: `https://tnd-blog.microcms.io`）
- API キー（`.env.local` に保管）

**チェックリスト:**
- [ ] アカウント作成完了
- [ ] ログイン確認
- [ ] API キー生成完了
- [ ] API キーを安全に記録（Git 非追跡）

---

#### **Task 1.2: microCMS に「ブログ」API を定義**

**内容:**
microCMS の管理画面で、ブログ記事用の API スキーマを定義します。

**API 名:** `blog`  
**API 型:** リスト型（複数記事を管理）

**フィールド定義（順序重要）:**

| フィールド名 | フィールド型 | 必須 | 説明 |
|---|---|---|---|
| `title` | テキスト | ○ | 記事タイトル |
| `description` | テキスト（長い） | ○ | 記事の説明・概要 |
| `body` | リッチエディタ | ○ | 記事本文（HTML対応） |
| `author` | テキスト | ○ | 著者名 |
| `role` | テキスト | × | 著者の役職・肩書 |
| `authorImage` | 画像 | × | 著者プロフィール画像 URL |
| `tags` | 複数選択 | × | タグ（ブログカテゴリ） |
| `image` | 画像 | × | アイキャッチ画像 |
| `slug` | テキスト | ○ | URL スラッグ（例: `new-website-launch`） |

**自動フィールド（microCMS 自動生成）:**
- `id`: 一意の ID
- `createdAt`: 作成日時
- `updatedAt`: 更新日時
- `publishedAt`: 公開日時（手動設定可能）

**タグ管理:**
「タグ」フィールドで以下の選択肢を作成：
- お知らせ
- ウェブサイト
- 新着情報
- 技術
- イベント
- AI
- Web開発

**成果物:**
- API スキーマ定義完了
- API ID（例: `blog`）
- API エンドポイント（例: `https://tnd-blog.microcms.io/api/v1/blog`）

**チェックリスト:**
- [ ] フィールド定義完了
- [ ] タグ選択肢作成完了
- [ ] API エンドポイント URL 確認
- [ ] API キーでアクセス可能確認

---

#### **Task 1.3: microCMS API の動作確認（cURL テスト）**

**内容:**
API が正常に動作するか、ローカルで cURL でテストします。

**実行コマンド:**
```bash
curl -H "X-MICROCMS-API-KEY: YOUR_API_KEY" \
  "https://tnd-blog.microcms.io/api/v1/blog"
```

**期待される応答:**
```json
{
  "contents": [],
  "totalCount": 0,
  "offset": 0,
  "limit": 10
}
```

**成果物:**
- API が応答することの確認
- JSON レスポンス形式の理解

**チェックリスト:**
- [ ] cURL コマンド実行成功
- [ ] 200 OK レスポンス確認
- [ ] JSON フォーマット正常

---

### **フェーズ 2: 既存記事の microCMS への移行（2～3日）**

このフェーズでは、既存の 8 個のマークダウン記事を microCMS に入稿します。

---

#### **Task 2.1: 既存ブログ記事の frontmatter・本文を抽出**

**内容:**
`src/content/blog/` の全 8 記事から、以下の情報を抽出し、スプレッドシートで整理します。

**抽出対象:**
- ファイル名（日付とスラッグ）
- タイトル (`title`)
- 説明 (`description`)
- 著者名 (`author`)
- 著者役職 (`role`)
- 著者画像 (`authorImage`)
- タグ (`tags`)
- アイキャッチ画像 (`image`)
- 本文 (`body`)
- 公開予定日（ファイル名の日付）

**作成物:**
- `INVESTIGATION/MICROCMS_MIGRATION_DATA.csv` または `MIGRATION_DATA.xlsx`

**フォーマット例:**

| filename | title | description | author | role | authorImage | tags | image | slug | body |
|---|---|---|---|---|---|---|---|---|---|
| 2025-03-30-new-website-launch.md | 新ホームページがオープンしました！ | 最新の活動情報やプロジェクトの成果をより分かりやすくお届けします。 | Ryoma | 主宰 | https://avatars.githubusercontent.com/u/131366102?v=4 | お知らせ,ウェブサイト,新着情報 | https://tus-tnd.com/mainCharm.svg | new-website-launch | (本文テキスト) |

**チェックリスト:**
- [ ] 全 8 記事をスキャン
- [ ] 全フィールドを抽出
- [ ] スプレッドシート作成
- [ ] データの正確性確認

---

#### **Task 2.2: 既存記事を microCMS に手動入稿**

**内容:**
microCMS の Web UI から、各記事を以下の手順で入稿します。

**入稿手順（1 記事あたり 5～10 分）:**

1. microCMS 管理画面 → 「ブログ」API を開く
2. 「新規作成」をクリック
3. 以下の情報を入力：
   - **title:** 記事タイトル
   - **description:** 記事説明
   - **body:** 記事本文（マークダウンまたは HTML）
   - **author:** 著者名
   - **role:** 著者役職
   - **authorImage:** 著者画像 URL（またはアップロード）
   - **tags:** タグ選択
   - **image:** アイキャッチ画像 URL（またはアップロード）
   - **slug:** URL スラッグ（例: `new-website-launch`）
   - **publishedAt:** 公開日時（ファイル名の日付を使用）

4. 「保存」をクリック
5. 「公開」をクリック

**重要な注意点:**
- **body フィールド:** マークダウン形式で入力可能（microCMS が HTML に変換）
- **publishedAt:** ファイル名の日付を「ファイル日付 00:00:00」で設定
- **slug:** ファイル名から日付を除いた部分（例: `2025-03-30-new-website-launch.md` → `new-website-launch`）

**順序:**
1. `2025-03-30-new-website-launch.md` → slug: `new-website-launch`
2. `2025-04-15-welcom-party.md` → slug: `welcom-party`
3. `2025-09-19-tex-launch.md` → slug: `tex-launch`
4. `2025-09-24-AIengineering.md` → slug: `AIengineering`
5. `2025-09-25-shignate-mufg.md` → slug: `shignate-mufg`
6. `2025-10-03-web-scraping.md` → slug: `web-scraping`
7. `2025-10-05-AI-recipe-app.md` → slug: `AI-recipe-app`
8. `2025-12-19-TND&WILL-ivent.md` → slug: `TND-WILL-event`

**成果物:**
- 全 8 記事が microCMS に登録
- 各記事の ID (自動生成)
- 公開状態の確認

**チェックリスト:**
- [ ] 全 8 記事入稿完了
- [ ] 各記事の公開確認
- [ ] publishedAt が正しく設定
- [ ] タグが正しく紐付け
- [ ] アイキャッチ画像が表示

---

#### **Task 2.3: microCMS Web UI からの記事取得テスト**

**内容:**
microCMS 管理画面から、入稿したデータを API で取得できるか確認します。

**実行コマンド:**
```bash
curl -H "X-MICROCMS-API-KEY: YOUR_API_KEY" \
  "https://tnd-blog.microcms.io/api/v1/blog?limit=100"
```

**期待される応答:**
```json
{
  "contents": [
    {
      "id": "abc123...",
      "title": "新ホームページがオープンしました！",
      "description": "最新の活動情報やプロジェクトの成果をより分かりやすくお届けします。",
      "author": "Ryoma",
      "role": "主宰",
      "body": "...",
      "tags": ["お知らせ", "ウェブサイト"],
      "slug": "new-website-launch",
      "publishedAt": "2025-03-30T00:00:00.000Z",
      "createdAt": "2025-01-21T10:00:00.000Z",
      "updatedAt": "2025-01-21T10:00:00.000Z"
    },
    ...
  ],
  "totalCount": 8,
  "offset": 0,
  "limit": 100
}
```

**チェックリスト:**
- [ ] API レスポンス確認
- [ ] 全 8 記事の取得確認
- [ ] フィールドが正しく返却
- [ ] publishedAt が日時形式で正しい

---

### **フェーズ 3: Astro 統合実装（3～4日）**

このフェーズでは、Astro プロジェクトに microCMS API 統合コードを実装します。

---

#### **Task 3.1: 環境変数ファイルの作成**

**内容:**
microCMS API キーと エンドポイント URL を環境変数で管理します。

**ファイル:** `pj_hp/.env.local`

```env
# microCMS Configuration
MICROCMS_API_KEY=your_actual_api_key_here
MICROCMS_SERVICE_DOMAIN=tnd-blog
MICROCMS_API_ENDPOINT=https://tnd-blog.microcms.io/api/v1
```

**注意:**
- `.env.local` は `.gitignore` に含める
- 本番環境では GitHub Secrets に登録

**チェックリスト:**
- [ ] `.env.local` ファイル作成
- [ ] API キー記入
- [ ] `.gitignore` で保護確認
- [ ] 読取テスト実行

---

#### **Task 3.2: microCMS SDK のインストール**

**内容:**
microCMS 公式の JavaScript SDK をインストールします。

**実行コマンド:**
```bash
pnpm add microcms-js-sdk
```

**目的:**
- API 呼び出しを簡潔に実装
- 型安全性を確保
- エラーハンドリングを効率化

**チェックリスト:**
- [ ] SDK インストール完了
- [ ] `package.json` に追加確認
- [ ] `pnpm-lock.yaml` 更新確認

---

#### **Task 3.3: microCMS API クライアント モジュール作成**

**内容:**
Astro から microCMS API を呼び出すための専用モジュールを作成します。

**ファイル:** `pj_hp/src/lib/microcms.ts`

```typescript
import { createClient } from 'microcms-js-sdk';

export const client = createClient({
  serviceDomain: import.meta.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: import.meta.env.MICROCMS_API_KEY,
});

export interface BlogPost {
  id: string;
  title: string;
  description: string;
  body: string;
  author: string;
  role?: string;
  authorImage?: string;
  tags?: string[];
  image?: string;
  slug: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export const getBlogPosts = async (): Promise<BlogPost[]> => {
  const data = await client.getList<BlogPost>({
    endpoint: 'blog',
    queries: {
      limit: 100,
      orders: '-publishedAt', // 新しい順
    },
  });
  return data.contents;
};

export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  const data = await client.getList<BlogPost>({
    endpoint: 'blog',
    queries: {
      filters: `slug[equals]${slug}`,
      limit: 1,
    },
  });
  return data.contents[0] || null;
};
```

**成果物:**
- `src/lib/microcms.ts` ファイル
- TypeScript インターフェース
- ヘルパー関数

**チェックリスト:**
- [ ] ファイル作成完了
- [ ] TypeScript インターフェース定義完了
- [ ] 関数実装完了
- [ ] 型チェック確認

---

#### **Task 3.4: ブログ一覧ページの microCMS 対応**

**内容:**
ブログ一覧を表示するページを microCMS データを使用するように修正します。

**対象ファイル:** `pj_hp/src/pages/blog/index.astro` または `pj_hp/src/pages/blog.astro`（既存の確認が必要）

**修正内容:**
1. `getBlogPosts()` を呼び出し
2. マークダウン import ロジックを削除
3. テンプレートを microCMS データ形式に合わせる

**実装例:**

```astro
---
import { getBlogPosts } from '../../lib/microcms';

const posts = await getBlogPosts();
---

<div class="blog-list">
  {posts.map(post => (
    <article class="blog-card">
      <h2>{post.title}</h2>
      <p>{post.description}</p>
      <time datetime={post.publishedAt}>
        {new Date(post.publishedAt).toLocaleDateString('ja-JP')}
      </time>
      <a href={`/blog/${post.slug}`}>{post.title}</a>
    </article>
  ))}
</div>
```

**チェックリスト:**
- [ ] 既存ブログ一覧ページを特定
- [ ] microCMS 呼び出しコード実装
- [ ] マークダウン import 削除
- [ ] ローカルでテスト（dev サーバー起動）
- [ ] 全 8 記事が表示確認

---

#### **Task 3.5: ブログ詳細ページの実装**

**内容:**
個別ブログ記事を表示するページを microCMS に対応させます。

**対象ファイル:** `pj_hp/src/pages/blog/[slug].astro` または `pj_hp/src/pages/blog/[id].astro`（動的ルート）

**実装例:**

```astro
---
import { getBlogPosts, getBlogPostBySlug } from '../../lib/microcms';

export async function getStaticPaths() {
  const posts = await getBlogPosts();
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { slug } = Astro.params;
const post = await getBlogPostBySlug(slug);

if (!post) {
  return Astro.redirect('/404');
}
---

<article class="blog-post">
  <h1>{post.title}</h1>
  <img src={post.image} alt={post.title} />
  
  <div class="meta">
    <time datetime={post.publishedAt}>
      {new Date(post.publishedAt).toLocaleDateString('ja-JP')}
    </time>
    <p class="author">{post.author} {post.role && `(${post.role})`}</p>
  </div>
  
  <div class="tags">
    {post.tags?.map(tag => (
      <span class="tag">{tag}</span>
    ))}
  </div>
  
  <div class="content" set:html={post.body} />
</article>
```

**重要な実装ポイント:**
- **`getStaticPaths()`:** 全記事の静的ルートを事前生成
- **`set:html`:** microCMS から返される HTML を安全にレンダリング
- **日付フォーマット:** ISO 8601 形式を日本語フォーマットに変換

**チェックリスト:**
- [ ] 動的ルートファイル作成
- [ ] `getStaticPaths()` 実装
- [ ] 詳細ページテンプレート実装
- [ ] ローカルでテスト（dev サーバー）
- [ ] 複数記事のリンク確認
- [ ] 404 ページリダイレクト確認

---

#### **Task 3.6: Astro 設定ファイルの確認・更新**

**内容:**
Astro が microCMS API を呼び出せるよう、設定を確認します。

**確認対象ファイル:** `pj_hp/astro.config.mjs`

**確認項目:**
- サーバーサイド実行 (`output: 'static'` の場合は OK）
- 環境変数の読み込み設定
- ビルドオプション

**必要な場合の修正例:**

```javascript
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static', // または 'hybrid'
  integrations: [
    // 既存の integrations
  ],
  env: {
    schema: {
      MICROCMS_API_KEY: getSecret('MICROCMS_API_KEY'),
      MICROCMS_SERVICE_DOMAIN: getSecret('MICROCMS_SERVICE_DOMAIN'),
    },
  },
});
```

**チェックリスト:**
- [ ] 現在の設定確認
- [ ] 環境変数読み込み確認
- [ ] 修正が必要かの判断
- [ ] 修正実施（必要な場合）

---

### **フェーズ 4: テスト・検証（1～2日）**

このフェーズでは、実装したコードが正常に動作することを確認します。

---

#### **Task 4.1: ローカル開発環境でのテスト**

**内容:**
ローカルの dev サーバーで microCMS 統合の動作を確認します。

**実行手順:**

1. 開発サーバー起動：
```bash
pnpm dev
```

2. ブラウザで以下を確認：
   - `http://localhost:3000/blog` → ブログ一覧が表示
   - 全 8 記事がリストに表示
   - 記事タイトル、説明、日付が正しく表示

3. 各記事のリンクをクリック：
   - `http://localhost:3000/blog/new-website-launch` → 詳細ページ表示
   - タイトル、本文、著者情報が表示
   - アイキャッチ画像が表示
   - タグが表示

4. ブラウザの検証ツールで確認：
   - コンソールエラーなし
   - ネットワークタブで microCMS API へのリクエスト確認
   - JSON レスポンスが正常

**テストチェックリスト:**

- [ ] dev サーバー起動成功
- [ ] ブログ一覧ページ表示確認
- [ ] 全 8 記事表示確認
- [ ] 記事詳細ページ表示確認
- [ ] すべての記事が閲覧可能
- [ ] 日付フォーマット正しい
- [ ] 画像表示正常
- [ ] タグ表示正常
- [ ] ブラウザコンソールエラーなし
- [ ] レスポンス速度許容範囲内

---

#### **Task 4.2: ビルドテスト**

**内容:**
本番ビルドプロセスが正常に完了することを確認します。

**実行手順:**

1. ビルド実行：
```bash
pnpm build
```

2. ビルド出力確認：
   - エラーなくビルド完了
   - `dist/` ディレクトリが生成
   - 記事 HTML ファイルが静的生成

3. プレビュー起動：
```bash
pnpm preview
```

4. ブラウザで確認（dev サーバーと同一テスト）

**ビルド成果物確認:**

```bash
# 生成された記事数確認
ls -la dist/blog/ | wc -l
# 期待値: 8 記事分の .html ファイル
```

**テストチェックリスト:**

- [ ] ビルドコマンド実行成功
- [ ] エラー・警告なし
- [ ] `dist/` ディレクトリ生成確認
- [ ] 記事 HTML ファイル生成確認
- [ ] `pnpm preview` 起動成功
- [ ] プレビューで全機能動作確認
- [ ] 本番と同様の表示確認

---

#### **Task 4.3: microCMS API 呼び出しのパフォーマンステスト**

**内容:**
ビルド時の API 呼び出しが遅延しないことを確認します。

**測定方法:**

```bash
# ビルド前時刻記録
time pnpm build
```

**期待値:**
- ビルド時間: 30 秒～1 分以内
- API 呼び出し時間: 1～3 秒

**遅い場合の対処:**
- microCMS API キーの有効性確認
- ネットワーク接続確認
- microCMS ダッシュボードのステータス確認
- キャッシング導入検討（`pnpm build` の 2 回実行で高速化）

**テストチェックリスト:**

- [ ] ビルド時間測定完了
- [ ] 許容時間内に完了確認
- [ ] API 呼び出し成功
- [ ] 遅延原因特定（あれば）

---

#### **Task 4.4: マイグレーション検証 - ローカルマークダウンとの比較**

**内容:**
microCMS データがローカルマークダウンと完全に一致していることを確認します。

**検証項目（全 8 記事）:**

| 項目 | 確認方法 |
|---|---|
| **タイトル** | ローカルファイルの `title` と microCMS の `title` が一致 |
| **説明** | ローカルファイルの `description` と microCMS の `description` が一致 |
| **著者** | ローカルファイルの `author` と microCMS の `author` が一致 |
| **日付** | ローカルファイル名の日付と microCMS の `publishedAt` が一致 |
| **タグ** | ローカルファイルの `tags` と microCMS の `tags` が完全一致 |
| **本文** | ローカルファイルの本文が microCMS に正しく格納 |
| **画像 URL** | `image` と `authorImage` が正しく保存 |

**検証スクリプト例（手動確認用）:**

```bash
# 記事数確認
echo "ローカル記事数:"
ls src/content/blog/*.md | wc -l

echo "microCMS 記事数:"
curl -s -H "X-MICROCMS-API-KEY: $MICROCMS_API_KEY" \
  "https://tnd-blog.microcms.io/api/v1/blog?limit=100" | jq '.totalCount'
```

**チェックリスト:**

- [ ] 全 8 記事の内容確認
- [ ] タイトル一致確認
- [ ] 日付一致確認
- [ ] タグ一致確認
- [ ] 本文が正しく表示
- [ ] 不一致があれば修正

---

### **フェーズ 5: デプロイ・本番化（1日）**

このフェーズでは、変更を本番環境にデプロイします。

---

#### **Task 5.1: GitHub に環境変数を登録**

**内容:**
GitHub Actions が microCMS API キーにアクセスできるよう、GitHub Secrets に登録します。

**実行手順:**

1. GitHub リポジトリを開く：
   - `https://github.com/YOUR_USERNAME/pj_hp`

2. 「Settings」→「Secrets and variables」→「Actions」

3. 「New repository secret」をクリック

4. 以下の 2 つを追加：

   **Secret 1:**
   - **Name:** `MICROCMS_API_KEY`
   - **Value:** (microCMS API キー)

   **Secret 2:**
   - **Name:** `MICROCMS_SERVICE_DOMAIN`
   - **Value:** `tnd-blog`

5. 「Add secret」をクリック

**確認:**
```yaml
# .github/workflows/build.yml（既存があれば修正）
- name: Build
  env:
    MICROCMS_API_KEY: ${{ secrets.MICROCMS_API_KEY }}
    MICROCMS_SERVICE_DOMAIN: ${{ secrets.MICROCMS_SERVICE_DOMAIN }}
  run: pnpm build
```

**チェックリスト:**

- [ ] GitHub Secrets ページにアクセス確認
- [ ] `MICROCMS_API_KEY` 登録完了
- [ ] `MICROCMS_SERVICE_DOMAIN` 登録完了
- [ ] GitHub Actions 設定確認

---

#### **Task 5.2: GitHub Actions ワークフロー確認・更新**

**内容:**
CI/CD ワークフローが microCMS API キーを使ってビルドできるよう設定を確認します。

**対象ファイル:** `.github/workflows/*.yml`（例: `build.yml`, `deploy.yml`）

**確認項目:**

```yaml
name: Build and Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: pnpm install
      
      # 環境変数を設定
      - name: Build
        env:
          MICROCMS_API_KEY: ${{ secrets.MICROCMS_API_KEY }}
          MICROCMS_SERVICE_DOMAIN: ${{ secrets.MICROCMS_SERVICE_DOMAIN }}
        run: pnpm build
      
      # デプロイステップ（既存設定に従う）
      - name: Deploy
        run: # デプロイコマンド
```

**修正が必要な場合:**
- `env:` セクション追加
- `secrets.MICROCMS_API_KEY` 参照追加
- `secrets.MICROCMS_SERVICE_DOMAIN` 参照追加

**チェックリスト:**

- [ ] ワークフローファイル確認
- [ ] 環境変数設定確認
- [ ] Secrets 参照設定確認
- [ ] 修正実施（必要な場合）

---

#### **Task 5.3: ローカルマークダウンファイルの削除**

**内容:**
microCMS に全記事を移行したため、ローカルマークダウンファイルを削除します。

**削除対象:**
```
src/content/blog/*.md  (全8ファイル)
```

**実行コマンド:**
```bash
rm -rf src/content/blog/*
```

または Git で削除：
```bash
git rm src/content/blog/*.md
```

**確認:**
```bash
ls -la src/content/blog/
# 空のディレクトリか、ディレクトリが存在しないことを確認
```

**注意:**
- GitHub では commit 履歴として保持（いつでも復元可能）
- ローカル機では削除後、必要に応じて `git checkout` で復元可能

**チェックリスト:**

- [ ] ローカルマークダウンファイル削除
- [ ] `git status` で削除確認
- [ ] `src/content/blog/` ディレクトリ確認

---

#### **Task 5.4: コードベースをコミット・プッシュ**

**内容:**
すべての変更を GitHub にプッシュします。

**実行手順:**

```bash
# ステータス確認
git status

# 変更をステージング
git add .

# microCMS 移行に関するコミットメッセージ
git commit -m "feat: Migrate blog system from markdown to microCMS

- Add microCMS API client (src/lib/microcms.ts)
- Update blog list page to fetch from microCMS API
- Update blog detail page for dynamic routing
- Migrate existing 8 blog posts to microCMS
- Remove local markdown files
- Add MICROCMS_API_KEY to GitHub Secrets
- Update GitHub Actions workflow to use microCMS credentials"

# プッシュ
git push origin main
```

**コミットメッセージの構成：**
- **1行目:** 変更の概要（feat: ...）
- **空行**
- **説明:** 詳細な変更内容（箇条書き）

**チェックリスト:**

- [ ] コミットメッセージ作成
- [ ] ステージング確認（`git add`）
- [ ] コミット実行
- [ ] GitHub にプッシュ確認

---

#### **Task 5.5: GitHub Actions ワークフロー実行確認**

**内容:**
プッシュ後、GitHub Actions が自動実行されることを確認します。

**実行手順:**

1. GitHub リポジトリを開く：
   - `https://github.com/YOUR_USERNAME/pj_hp`

2. 「Actions」タブをクリック

3. 最新のワークフラン実行を確認：
   - ステータスが「✓ Successful」になるまで待機
   - 赤い ✗ が表示される場合、ログを確認して原因特定

4. ログ確認（エラー時）：
   - 「Build」ステップのログを確認
   - microCMS API キーが正しく参照されているか確認
   - ネットワークエラー確認

**よくあるエラー と対処：**

| エラー | 原因 | 対処 |
|---|---|---|
| `MICROCMS_API_KEY is not defined` | Secrets が設定されていない | Task 5.1 を再実行 |
| `401 Unauthorized` | API キーが無効 | microCMS ダッシュボードで API キー確認 |
| `Connection timeout` | microCMS が応答しない | ネットワーク確認、GitHub Actions 再実行 |
| `404 Not Found` | API エンドポイント間違い | `MICROCMS_SERVICE_DOMAIN` 確認 |

**チェックリスト:**

- [ ] GitHub Actions タブ確認
- [ ] ワークフロー実行開始確認
- [ ] ビルド成功確認
- [ ] デプロイ成功確認（ある場合）
- [ ] エラー時は原因特定・対処

---

#### **Task 5.6: 本番サイトの動作確認**

**内容:**
本番環境にデプロイされたサイトが正常に動作することを確認します。

**確認項目：**

1. **本番 URL にアクセス**
   - ブログ一覧ページが表示
   - 全 8 記事がリスト表示

2. **記事詳細ページ確認**
   - 各記事をクリック
   - 本文、画像、タグ、著者情報が正しく表示

3. **日付表示確認**
   - 記事の公開日付が正しく表示
   - フォーマットが日本語（年月日）

4. **サイト全体の確認**
   - ナビゲーション動作確認
   - リンク切れなし
   - 画像が正常に読み込める

5. **ブラウザコンソール確認**
   - エラーなし
   - 警告なし

**テストチェックリスト:**

- [ ] ブログ一覧ページ表示確認
- [ ] 全 8 記事表示確認
- [ ] 複数記事の詳細ページ確認
- [ ] 日付フォーマット確認
- [ ] 画像表示確認
- [ ] タグ表示確認
- [ ] ブラウザコンソールエラーなし
- [ ] SEO メタデータ（`og:image` など）確認

---

### **フェーズ 6: 運用開始・ドキュメント整備（1日）**

このフェーズでは、チーム内での運用を開始し、ドキュメントを整備します。

---

#### **Task 6.1: microCMS 管理画面の操作ガイド作成**

**内容:**
チームメンバーが microCMS で記事を作成・編集・公開できるよう、操作ガイドを作成します。

**作成物:** `INVESTIGATION/MICROCMS_OPERATION_GUIDE.md`

**ガイド内容:**

```markdown
# microCMS ブログ管理ガイド

## ログイン
1. https://app.microcms.io にアクセス
2. メールアドレスとパスワードを入力
3. ワークスペース「tnd-blog」を選択

## 新規記事作成
1. 左メニューから「ブログ」をクリック
2. 「新規作成」をクリック
3. 以下の項目を入力：
   - **title:** 記事タイトル
   - **description:** 記事の説明（1-2文）
   - **body:** 記事本文（マークダウン対応）
   - **author:** 著者名
   - **role:** 著者の肩書（オプション）
   - **authorImage:** 著者プロフィール画像 URL
   - **tags:** タグを複数選択
   - **image:** アイキャッチ画像 URL
   - **slug:** URL スラッグ（例: `my-first-article`）
4. 「保存」をクリック
5. 「公開」をクリック

## 記事編集
1. 「ブログ」メニューから該当記事をクリック
2. 内容を修正
3. 「保存」をクリック
4. 必要に応じて「公開」をクリック

## 記事削除
1. 「ブログ」メニューから該当記事をクリック
2. 右上の「削除」ボタンをクリック
3. 確認画面で「削除」をクリック

## 公開スケジュール
1. 記事編集画面で「publichedAt」を設定
2. 将来の日時を選択して「保存」
3. 指定時刻に自動公開

## 注意点
- slug は一度公開すると変更できません
- 記事削除は復元不可なため、慎重に
- マークダウン形式で記事を作成すると、自動的に HTML に変換されます
```

**チェックリスト:**

- [ ] ガイドドキュメント作成
- [ ] スクリーンショット追加（必要に応じて）
- [ ] チームメンバーに共有
- [ ] フィードバック反映

---

#### **Task 6.2: microCMS API 統合の実装ドキュメント作成**

**内容:**
今後の保守・拡張を想定した技術ドキュメントを作成します。

**作成物:** `INVESTIGATION/MICROCMS_TECHNICAL_DOCS.md`

**ドキュメント内容:**

```markdown
# microCMS 技術ドキュメント

## アーキテクチャ
- **CMS:** microCMS（ヘッドレス CMS）
- **フロントエンド:** Astro 5.15.1（静的サイトジェネレータ）
- **ビルド:** GitHub Actions 自動ビルド

## API エンドポイント
- **URL:** https://tnd-blog.microcms.io/api/v1/blog
- **認証:** X-MICROCMS-API-KEY ヘッダー
- **メソッド:** GET

## microCMS SDK 使用方法
```typescript
import { client, getBlogPosts, getBlogPostBySlug } from './lib/microcms';

// 全記事取得（ビルド時）
const posts = await getBlogPosts();

// 個別記事取得（URL スラッグ指定）
const post = await getBlogPostBySlug('my-article');
```

## データスキーマ
BlogPost インターフェース:
- id: 記事 ID（自動生成）
- title: 記事タイトル
- description: 記事説明
- body: 本文（HTML）
- author: 著者名
- role: 著者役職
- authorImage: 著者画像 URL
- tags: タグ配列
- image: アイキャッチ画像 URL
- slug: URL スラッグ
- publishedAt: 公開日時（ISO 8601）
- createdAt: 作成日時（自動）
- updatedAt: 更新日時（自動）

## 環境変数
- MICROCMS_API_KEY: API 認証キー（GitHub Secrets）
- MICROCMS_SERVICE_DOMAIN: サービスドメイン（tnd-blog）

## トラブルシューティング
### API が 401 エラーを返す
→ API キーが正しく設定されているか確認

### 記事が表示されない
→ microCMS で「公開」になっているか確認

### ビルドが遅い
→ microCMS API レスポンス時間確認、キャッシング導入検討
```

**チェックリスト:**

- [ ] 技術ドキュメント作成
- [ ] コード例記載
- [ ] トラブルシューティング記載
- [ ] 開発チームに共有

---

#### **Task 6.3: 今後の拡張計画の整理**

**内容:**
microCMS 導入後の今後の拡張案を整理します。

**検討項目:**

- [ ] **複数著者の権限管理:** microCMS メンバー機能の活用
- [ ] **記事カテゴリ分類:** タグの拡充、カテゴリの追加
- [ ] **コメント機能:** 第三者サービス（Disqus など）の連携
- [ ] **検索機能:** microCMS の検索 API や Algolia の統合
- [ ] **SNS シェア機能:** OGP メタデータの最適化
- [ ] **メディアライブラリ:** microCMS メディアAPIの活用
- [ ] **ニュースレター配信:** 記事公開時の自動通知

**チェックリスト:**

- [ ] 拡張案をリストアップ
- [ ] 優先度の仕分け
- [ ] GitHub Issues で課題化（後日対応）

---

#### **Task 6.4: マイグレーション完了レポート作成**

**内容:**
プロジェクト全体のマイグレーション完了をまとめます。

**作成物:** `INVESTIGATION/MICROCMS_MIGRATION_COMPLETE.md`

**レポート内容:**

```markdown
# microCMS 移行プロジェクト 完了レポート

## 概要
- **開始日:** 2025年1月21日
- **完了日:** 2025年1月XX日
- **実装期間:** X日間

## 実施内容
- ✓ microCMS 無料アカウント開設
- ✓ ブログ API スキーマ定義
- ✓ 既存 8 記事を microCMS に移行
- ✓ Astro に microCMS SDK を統合
- ✓ ブログ一覧・詳細ページ実装
- ✓ GitHub Actions ワークフロー更新
- ✓ 本番デプロイ・動作確認

## 成果
- **日付管理の自動化:** publishedAt が自動記録
- **Web UI での記事管理:** マークダウン不要
- **スケーラビリティ:** 複数著者対応可能
- **セキュリティ:** API キーは GitHub Secrets で保護

## 前後の比較

| 項目 | 移行前 | 移行後 |
|---|---|---|
| 記事保存先 | ローカルマークダウン | microCMS |
| 日付管理 | 手動 frontmatter | 自動記録 |
| 管理画面 | なし | Web UI |
| ビルド時間 | 数秒 | 1-3秒（API 呼び出し含む） |
| 複数著者 | 限定的 | 完全対応 |

## 今後の検討項目
- 複数著者権限管理の設定
- カテゴリ分類の拡充
- 検索機能の実装

## 備考
- Hobby プラン無料版で運用中（月 API 無制限、転送 20GB/月）
- 今後記事数が増加した場合、Team プラン移行を検討
```

**チェックリスト:**

- [ ] レポート作成
- [ ] 成果物一覧記載
- [ ] チーム全体に共有

---

#### **Task 6.5: チーム内での運用開始**

**内容:**
実際に microCMS でのブログ管理を開始します。

**実行項目:**

- [ ] チームメンバーに microCMS アクセス権付与
- [ ] 操作ガイドの共有・説明
- [ ] 最初の新規記事を microCMS で作成（テスト）
- [ ] ビルド・デプロイの自動実行確認
- [ ] 本番サイトの表示確認

**チェックリスト:**

- [ ] チームメンバーのアクセス確認
- [ ] テスト記事の作成
- [ ] ビルド自動実行確認
- [ ] 本番反映確認
- [ ] チーム内での質問・フィードバック対応

---

## 🎓 実装時の関連知識

### microCMS API レスポンス形式
```json
{
  "contents": [
    {
      "id": "abc123",
      "title": "タイトル",
      "slug": "title-slug",
      "publishedAt": "2025-01-21T10:00:00.000Z",
      "createdAt": "2025-01-21T09:00:00.000Z",
      "updatedAt": "2025-01-21T10:00:00.000Z",
      ...
    }
  ],
  "totalCount": 8,
  "offset": 0,
  "limit": 10
}
```

### Astro での動的ルート生成
```typescript
// getStaticPaths() は必須
// 事前にすべてのパス (.../blog/slug-1, .../blog/slug-2, ...) を生成
export async function getStaticPaths() {
  const posts = await getBlogPosts();
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post }
  }));
}
```

### 環境変数の安全な管理
- `.env.local` は開発環境用（Git 非追跡）
- GitHub Secrets は CI/CD パイプライン用
- 本番環境では Secrets から注入

---

## 📌 成功のポイント

1. **段階的実装:** フェーズごとにテスト確認
2. **自動化重視:** GitHub Actions の活用
3. **ドキュメント整備:** チーム内の知識共有
4. **バックアップ:** ローカルマークダウンファイルは Git 履歴に保持

---

## 🔗 参考リンク

- **microCMS:** https://microcms.io/
- **microCMS ドキュメント:** https://document.microcms.io/
- **microCMS SDK:** https://github.com/microcmsio/microcms-js-sdk
- **Astro ドキュメント:** https://docs.astro.build/
- **GitHub Actions:** https://docs.github.com/en/actions

---

**このタスク計画に基づいて、段階的に実装を進めてください。**  
**質問や不明な点があれば、各タスクの「成果物」や「チェックリスト」を参照してください。**
