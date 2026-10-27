// 外部サイトの記事のページから OGP 画像（og:image）を取り出す（spec 008 D8）。
// microCMS のクライアントを読み込まない（dev ページでも使うため）
import { EXTERNAL_FALLBACK_IMAGE, type PostCardItem } from "../utils/post-card";

const TIMEOUT_MS = 5000;

// 同じ URL は1回だけ取りに行く（/ と /blog で重複させない。dev でもページを開くたびには取らない）
const cache = new Map<string, Promise<OgImageResult>>();

type OgImageResult = { ok: true; url: string } | { ok: false; reason: string };

// HTML の属性値に出てくる文字参照を戻す（og:image の URL に & が入ることがあるため）
function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

// <meta property="og:image" content="..."> を探す（属性の順番は問わない）。
// 無ければ twitter:image を使う
function findImageMeta(html: string): string | null {
  const metas = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const key of ["og:image", "twitter:image"]) {
    for (const meta of metas) {
      const name = meta.match(/\b(?:property|name)\s*=\s*["']([^"']+)["']/i);
      if (name?.[1].toLowerCase() !== key) continue;
      const content = meta.match(/\bcontent\s*=\s*["']([^"']*)["']/i);
      if (content?.[1]) return decodeEntities(content[1].trim());
    }
  }
  return null;
}

async function fetchOgImageOnce(pageUrl: string): Promise<OgImageResult> {
  let html: string;
  try {
    const res = await fetch(pageUrl, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { accept: "text/html" },
    });
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
    const type = res.headers.get("content-type") ?? "";
    if (!type.includes("html")) {
      return { ok: false, reason: `HTML ではありません（${type}）` };
    }
    html = await res.text();
  } catch (error) {
    const reason =
      error instanceof Error && error.name === "TimeoutError"
        ? `${TIMEOUT_MS / 1000}秒で応答がありません`
        : `取得に失敗しました（${String(error)}）`;
    return { ok: false, reason };
  }

  const content = findImageMeta(html);
  if (!content) return { ok: false, reason: "og:image がありません" };
  let image: URL;
  try {
    image = new URL(content, pageUrl);
  } catch {
    return {
      ok: false,
      reason: `og:image を URL として読めません（${content}）`,
    };
  }
  if (image.protocol !== "https:") {
    return {
      ok: false,
      reason: `og:image が https: ではありません（${content}）`,
    };
  }
  return { ok: true, url: image.href };
}

/** 記事のページの OGP 画像の URL を返す。取れなければ理由を返す */
export function fetchOgImage(pageUrl: string): Promise<OgImageResult> {
  let result = cache.get(pageUrl);
  if (!result) {
    result = fetchOgImageOnce(pageUrl);
    cache.set(pageUrl, result);
  }
  return result;
}

/**
 * 外部サイトの記事のうち、microCMS にサムネイルが無いものに OGP 画像を当てる。
 * 取れなければシンボルのまま、ビルドのログに理由を出す（ビルドは止めない）
 */
export async function withOgImages(
  items: PostCardItem[],
): Promise<PostCardItem[]> {
  return Promise.all(
    items.map(async (item) => {
      if (!item.external || item.external.hasOwnImage) return item;
      const result = await fetchOgImage(item.url);
      if (result.ok) return { ...item, image: result.url };
      console.warn(
        `外部サイトの記事 ${item.id} の OGP 画像を使いません：${result.reason}。シンボル（${EXTERNAL_FALLBACK_IMAGE}）を使います`,
      );
      return item;
    }),
  );
}
