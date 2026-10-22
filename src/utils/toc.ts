import { decodeEntities } from "./highlight";

export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

// 目次に載せる見出し（h2・h3）。microCMS の見出しは中に <strong> などのタグを含みうる
const HEADING = /<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi;
const ID_ATTR = /\sid\s*=\s*"([^"]*)"/i;
const ALL_IDS = /\sid\s*=\s*"([^"]*)"/gi;
const TAG = /<[^>]*>/g;

/**
 * 本文HTMLから目次の項目を取り出す。
 * id が無い・本文中で重複している見出しには toc-1, toc-2 … を付け、
 * 移動後にフォーカスを当てられるよう tabindex="-1" を付ける。
 * サニタイズ後・コードハイライト前の HTML を渡すこと。
 */
export function buildToc(html: string): { html: string; items: TocItem[] } {
  // 本文中の id の出現回数（見出し以外の要素も含む）
  const idCount = new Map<string, number>();
  for (const [, id] of html.matchAll(ALL_IDS)) {
    idCount.set(id, (idCount.get(id) ?? 0) + 1);
  }

  let seq = 0;
  const newId = () => {
    let id: string;
    do {
      id = `toc-${++seq}`;
    } while (idCount.has(id));
    return id;
  };

  const items: TocItem[] = [];
  const result = html.replace(
    HEADING,
    (full, level: string, attrs: string | undefined, inner: string) => {
      const text = decodeEntities(inner.replace(TAG, ""))
        .replace(/\s+/g, " ")
        .trim();
      // 空の見出し（<h2><br></h2> など）は目次に載せない
      if (!text) return full;

      const current = attrs ? ID_ATTR.exec(attrs)?.[1] : undefined;
      const id = current && idCount.get(current) === 1 ? current : newId();
      const otherAttrs = (attrs ?? "").replace(ID_ATTR, "");

      items.push({ id, text, level: level === "2" ? 2 : 3 });
      return `<h${level} id="${id}" tabindex="-1"${otherAttrs}>${inner}</h${level}>`;
    },
  );

  return { html: result, items };
}
