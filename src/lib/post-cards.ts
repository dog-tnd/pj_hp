// 一覧（/blog）とトップの新着記事に出す記事カードの項目を取得する。spec 008
import { getAllExternalPosts, getAllPosts } from "./microcms";
import { toPostCardItems, type PostCardItem } from "../utils/post-card";

// / と /blog の2ページで呼ぶので、ビルド中の取得（とログの警告）を1回にする。
// dev ではページを開くたびに取り直す（microCMS の更新をすぐ見られるように）
let cache: Promise<PostCardItem[]> | undefined;

async function fetchPostCardItems(): Promise<PostCardItem[]> {
  const [blogs, externals] = await Promise.all([
    getAllPosts(),
    getAllExternalPosts(),
  ]);
  return toPostCardItems(blogs, externals);
}

/** 自サイトの記事と外部サイトの記事を、公開日時の新しい順に返す */
export function getPostCardItems(): Promise<PostCardItem[]> {
  if (!import.meta.env.PROD) return fetchPostCardItems();
  cache ??= fetchPostCardItems();
  return cache;
}
