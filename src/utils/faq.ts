// よくある質問のデータ変換。microCMS の形（faq-categories / faq）から、表示用の形にそろえる。
// env に依存しないので、dev ページの固定データもこの関数を通して表示する（spec 004）。

export type FaqItem = {
  id: string;
  question: string;
  // 段落ごとの行の配列。段落内の改行は行として持つ
  paragraphs: string[][];
};

export type FaqSection = {
  slug: string;
  name: string;
  items: FaqItem[];
};

// microCMS から受け取る形（microcms.ts の型はこれを満たす）
export type FaqCategoryInput = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  createdAt: string;
};

export type FaqEntryInput = {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  createdAt: string;
  // 参照先のカテゴリが下書きに戻されると null になりうる
  category: { id: string } | null;
};

const SLUG = /^[a-z0-9-]+$/;

const bySortOrder = (
  a: { sortOrder: number; createdAt: string },
  b: { sortOrder: number; createdAt: string },
) =>
  a.sortOrder - b.sortOrder ||
  Date.parse(a.createdAt) - Date.parse(b.createdAt);

/**
 * 回答のテキストを段落と行に分ける。改行コードをそろえ、空行（空白だけの行も含む）で段落を分ける。
 */
export function toParagraphs(answer: string): string[][] {
  const paragraphs: string[][] = [];
  let current: string[] = [];
  for (const raw of answer.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim();
    if (line === "") {
      if (current.length > 0) paragraphs.push(current);
      current = [];
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) paragraphs.push(current);
  return paragraphs;
}

/**
 * カテゴリと質問を、表示順のセクションにまとめる。
 * データが壊れているとき（質問0件・カテゴリの参照切れ・slug の不正や重複）は例外を投げてビルドを止める。
 * 直前のデプロイが残るので、壊れたページを公開するよりよい。
 */
export function toFaqSections(
  categories: FaqCategoryInput[],
  entries: FaqEntryInput[],
): FaqSection[] {
  if (entries.length === 0) {
    throw new Error(
      "[faq] 公開中の質問が0件です。microCMS の faq を確認してください。",
    );
  }

  const seen = new Set<string>();
  for (const category of categories) {
    if (!SLUG.test(category.slug)) {
      throw new Error(
        `[faq] カテゴリ「${category.name}」の slug「${category.slug}」が不正です（英小文字・数字・ハイフンのみ）。`,
      );
    }
    if (seen.has(category.slug)) {
      throw new Error(
        `[faq] カテゴリの slug「${category.slug}」が重複しています。`,
      );
    }
    seen.add(category.slug);
  }

  const itemsByCategory = new Map<string, FaqEntryInput[]>();
  for (const category of categories) itemsByCategory.set(category.id, []);
  for (const entry of entries) {
    const list = entry.category
      ? itemsByCategory.get(entry.category.id)
      : undefined;
    if (!list) {
      throw new Error(
        `[faq] 質問「${entry.question}」のカテゴリが見つかりません（未設定か、カテゴリが公開されていません）。`,
      );
    }
    list.push(entry);
  }

  return [...categories]
    .sort(bySortOrder)
    .map((category) => ({
      slug: category.slug,
      name: category.name,
      items: [...(itemsByCategory.get(category.id) ?? [])]
        .sort(bySortOrder)
        .map((entry) => ({
          id: entry.id,
          question: entry.question,
          paragraphs: toParagraphs(entry.answer),
        })),
    }))
    .filter((section) => section.items.length > 0);
}

/**
 * 表示と同じセクションから FAQPage の構造化データ（JSON-LD）を作る。
 * 回答は段落を空行、段落内の行を改行でつないだプレーンテキストにする。
 */
export function toFaqPageJsonLd(sections: FaqSection[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: sections.flatMap((section) =>
      section.items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.paragraphs.map((lines) => lines.join("\n")).join("\n\n"),
        },
      })),
    ),
  };
}
