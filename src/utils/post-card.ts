// 記事カードの項目（自サイトの記事と外部サイトの記事を同じ形にそろえたもの）。spec 008
// microCMS のクライアントは読み込まない（dev ページで固定のデータから使うため）。型だけ読む
import type { BlogPost, ExternalPost } from "../lib/microcms";

export const EXTERNAL_SITES = ["Zenn", "Qiita", "その他"] as const;
export type ExternalSite = (typeof EXTERNAL_SITES)[number];

// カードに出すサイトの名前。「その他」は「外部サイト」と出す（spec 008 D5）
const SITE_LABELS = {
  Zenn: "Zenn",
  Qiita: "Qiita",
  その他: "外部サイト",
} as const satisfies Record<ExternalSite, string>;
export type ExternalSiteLabel = (typeof SITE_LABELS)[ExternalSite];

// Zenn・Qiita はこのホストの URL だけを通す
const SITE_HOSTS: Partial<Record<ExternalSite, string>> = {
  Zenn: "zenn.dev",
  Qiita: "qiita.com",
};

export type PostCardItem = {
  id: string;
  title: string;
  description: string;
  image: string;
  author: string;
  // 空文字のこともある
  role: string;
  authorImage: string;
  // ISO 文字列のまま持つ。表示は formatDotDate
  publishedAt: string;
  // カテゴリの name
  tags: string[];
  // 自サイトは /blog/{id}、外部は整えた URL
  url: string;
  external: { site: ExternalSite; label: ExternalSiteLabel } | null;
};

const SAMPLE_IMAGE = "/thumbnail_sample.jpg";
const SAMPLE_AUTHOR_IMAGE = "/icon_sample.jpg";

/**
 * 外部サイトの記事の URL を確かめる。
 * 表示してよければ整えた URL を、いけなければ理由を返す
 */
export function checkExternalUrl(
  url: string,
  site: ExternalSite,
): { ok: true; href: string } | { ok: false; reason: string } {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return { ok: false, reason: `URL として読めません（${url}）` };
  }
  if (parsed.protocol !== "https:") {
    return { ok: false, reason: `https: の URL ではありません（${url}）` };
  }
  const host = SITE_HOSTS[site];
  // hostname で比べるので、zenn.dev@example.com のような URL は通らない
  if (host && parsed.hostname !== host) {
    return {
      ok: false,
      reason: `サイトの種類が ${site} なのに ${host} の URL ではありません（${url}）`,
    };
  }
  return { ok: true, href: parsed.href };
}

/** 自サイトの記事を共通の形にする。下書き（公開日時が無い）のときは更新日時で代える */
export function fromBlogPost(post: BlogPost): PostCardItem {
  return {
    id: post.id,
    title: post.title,
    description: post.description,
    image: post.image?.url || SAMPLE_IMAGE,
    author: post.author,
    role: post.role ?? "",
    authorImage: post.authorImage?.authorImage?.url || SAMPLE_AUTHOR_IMAGE,
    publishedAt: post.publishedAt ?? post.updatedAt,
    tags: (post.tags ?? []).map((tag) => tag.name),
    url: `/blog/${post.id}`,
    external: null,
  };
}

/** 外部サイトの記事を共通の形にする。表示できないときは理由を返す */
export function fromExternalPost(
  post: ExternalPost,
): { ok: true; item: PostCardItem } | { ok: false; reason: string } {
  // セレクトフィールドは、複数選択なしでも配列で返る
  const selected = post.site ?? [];
  if (selected.length !== 1) {
    return { ok: false, reason: "サイトの種類が1つだけ選ばれていません" };
  }
  const site = EXTERNAL_SITES.find((name) => name === selected[0]);
  if (!site) {
    return { ok: false, reason: `知らないサイトの種類です（${selected[0]}）` };
  }
  const checked = checkExternalUrl(post.url ?? "", site);
  if (!checked.ok) return checked;
  if (!post.publishedAt) {
    return { ok: false, reason: "公開日時がありません" };
  }

  return {
    ok: true,
    item: {
      id: post.id,
      title: post.title,
      description: post.description,
      image: post.image?.url || SAMPLE_IMAGE,
      author: post.author,
      role: post.role ?? "",
      authorImage: post.authorImage?.authorImage?.url || SAMPLE_AUTHOR_IMAGE,
      publishedAt: post.publishedAt,
      tags: (post.tags ?? []).map((tag) => tag.name),
      url: checked.href,
      external: { site, label: SITE_LABELS[site] },
    },
  };
}

/**
 * 自サイトの記事と外部サイトの記事を1つの並びにする（公開日時の新しい順）。
 * 表示できない外部サイトの記事は外し、ビルドのログに理由を出す（ビルドは止めない）
 */
export function toPostCardItems(
  blogs: BlogPost[],
  externals: ExternalPost[],
): PostCardItem[] {
  const items = blogs.map(fromBlogPost);
  for (const post of externals) {
    const result = fromExternalPost(post);
    if (result.ok) {
      items.push(result.item);
    } else {
      console.warn(
        `外部サイトの記事 ${post.id} を表示しません：${result.reason}`,
      );
    }
  }
  return items.sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
}

/** 新しいタブで開く外部サイトの記事の読み上げ用ラベル */
export function externalAriaLabel(item: PostCardItem): string | undefined {
  if (!item.external) return undefined;
  const site =
    item.external.label === "外部サイト"
      ? "外部サイト"
      : `${item.external.label} `;
  return `${item.title}（${site}の記事・新しいタブで開きます）`;
}
