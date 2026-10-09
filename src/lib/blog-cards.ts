
import {
  getAllPosts,
  getAllZennPosts,
  getImageUrl,
  getAuthorImageUrl,
  type BlogPost,
  type ZennPost,
} from "./microcms";

export type BlogCardItem = {
  title: string;
  description: string;
  image: string;
  author: string;
  role: string;
  authorImage: string;
  publishedAt: string;
  tags: string[];
  url: string;
  external: boolean;
};

export function convertBlogPost(post: BlogPost): BlogCardItem {
  return {
    title: post.title,
    description: post.description,
    image: getImageUrl(post),
    author: post.author,
    role: post.role,
    authorImage: getAuthorImageUrl(post),
    publishedAt: post.publishedAt!,
    tags: post.tags.map((tag) => tag.name),
    url: `/blog/${post.id}/`,
    external: false,
  };
}

export function convertZennPost(post: ZennPost): BlogCardItem {
  return {
    title: post.title,
    description: post.description,
    image: getImageUrl(post),
    author: post.author,
    role: post.role,
    authorImage: getAuthorImageUrl(post),
    publishedAt: post.zennPublishedAt,
    tags: post.tags.map((tag) => tag.name),
    url: post.url,
    external: true,
  };
}

export async function getBlogCardItems(): Promise<BlogCardItem[]> {
  const [posts, zennPosts] = await Promise.all([
    getAllPosts(),
    getAllZennPosts(),
  ]);

  const items: BlogCardItem[] = [
    ...posts.map(convertBlogPost),
    ...zennPosts.map(convertZennPost),
  ];

  return items.sort(
    (a, b) =>
      Date.parse(b.publishedAt) - Date.parse(a.publishedAt)
  );
}
