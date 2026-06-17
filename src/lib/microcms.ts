import { createClient } from "microcms-js-sdk";

const serviceDomain = import.meta.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = import.meta.env.MICROCMS_API_KEY;

if (!serviceDomain || !apiKey) {
  throw new Error(
    "MICROCMS_SERVICE_DOMAIN と MICROCMS_API_KEY を .env に設定してください。"
  );
}

export const client = createClient({
  serviceDomain,
  apiKey,
});

// microCMS の画像フィールドの型
export type MicroCMSImage = {
  url: string;
  height?: number;
  width?: number;
};

// microCMS が自動付与するフィールド
type MicroCMSBase = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
};

// categories エンドポイント（タグ/カテゴリ）のコンテンツ型
export type Category = MicroCMSBase & {
  name: string;
};

// authorImage は別エンドポイントへのコンテンツ参照。
// 参照先コンテンツ内の image 型フィールド（フィールドID も authorImage）に画像が入る
export type AuthorImageRef = MicroCMSBase & {
  authorImage: MicroCMSImage;
};

// blog エンドポイントのコンテンツ型
export type BlogPost = MicroCMSBase & {
  title: string;
  description: string;
  author: string;
  role: string;
  authorImage?: AuthorImageRef;
  image: MicroCMSImage;
  // tags は categories への複数コンテンツ参照。取得時は Category オブジェクトの配列で返る
  tags: Category[];
  // リッチエディタは HTML 文字列で返る
  body: string;
};

// 著者画像の URL を返す（コンテンツ参照のネストを吸収）。無ければプレースホルダー
export function getAuthorImageUrl(post: BlogPost): string {
  return post.authorImage?.authorImage?.url || '/placeholder.svg';
}

// 公開済み記事を全件取得（GitHub Pages 用の SSG なのでビルド時に全件取得）
export async function getAllPosts(): Promise<BlogPost[]> {
  const data = await client.getList<BlogPost>({
    endpoint: "blog",
    queries: { limit: 100, orders: "-publishedAt" },
  });
  // 下書き（未公開）は publishedAt が付かないため除外する
  return data.contents.filter((post) => Boolean(post.publishedAt));
}

// カテゴリ（タグ）を全件取得
export async function getAllCategories(): Promise<Category[]> {
  const data = await client.getList<Category>({
    endpoint: "categories",
    queries: { limit: 100 },
  });
  return data.contents;
}
