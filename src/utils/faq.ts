// よくある質問のデータ変換。microCMS の faq（API は1つ）から、表示用の形にそろえる。
// microCMS の無料枠の API 数の都合で、カテゴリは faq のセレクトフィールドで持つ（spec 004 D3）。
// env に依存しないので、dev ページの固定データもこの関数を通して表示する。

export type FaqItem = {
  id: string;
  question: string;
  // 段落ごとの行の配列。段落内の改行は行として持つ
  paragraphs: string[][];
};

export type FaqSection = {
  // ページ内リンク用（`cat-{anchor}`）。カテゴリ名の空白をハイフンにしたもの
  anchor: string;
  name: string;
  // 英字ラベル（GENERAL など）。見出しの上に飾りとして出す
  en: string;
  items: FaqItem[];
};

// microCMS から受け取る形（microcms.ts の型はこれを満たす）
export type FaqEntryInput = {
  id: string;
  question: string;
  answer: string;
  // セレクトフィールドは選んだ項目の配列で返る（複数選択なしでも配列）
  category: string[];
  categoryEn: string[];
  sortOrder: number;
  createdAt: string;
};

const bySortOrder = (a: FaqEntryInput, b: FaqEntryInput) =>
  a.sortOrder - b.sortOrder ||
  Date.parse(a.createdAt) - Date.parse(b.createdAt);

const toAnchor = (name: string) => name.trim().replace(/\s+/g, "-");

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
 * 質問をカテゴリごとのセクションにまとめる。
 * 質問は sortOrder（同じなら作成日時）の順に並べ、カテゴリはその中で最初に出てきた順
 * （＝カテゴリ内の最小の sortOrder の順）にする。
 * データが壊れているとき（質問0件・カテゴリや英字ラベルが1つに決まらない・カテゴリと英字ラベルが1対1でない）は
 * 例外を投げてビルドを止める。
 * 直前のデプロイが残るので、壊れたページを公開するよりよい。
 */
export function toFaqSections(entries: FaqEntryInput[]): FaqSection[] {
  if (entries.length === 0) {
    throw new Error(
      "[faq] 公開中の質問が0件です。microCMS の faq を確認してください。",
    );
  }

  const sections = new Map<string, FaqSection>();
  for (const entry of [...entries].sort(bySortOrder)) {
    const name = entry.category?.[0]?.trim();
    if (!name || entry.category.length !== 1) {
      throw new Error(
        `[faq] 質問「${entry.question}」のカテゴリが1つに決まっていません（未設定か、複数選ばれています）。`,
      );
    }
    const en = entry.categoryEn?.[0]?.trim();
    if (!en || entry.categoryEn.length !== 1) {
      throw new Error(
        `[faq] 質問「${entry.question}」のカテゴリの英字ラベルが1つに決まっていません（未設定か、複数選ばれています）。`,
      );
    }
    let section = sections.get(name);
    if (!section) {
      section = { anchor: toAnchor(name), name, en, items: [] };
      sections.set(name, section);
    } else if (section.en !== en) {
      throw new Error(
        `[faq] カテゴリ「${name}」の英字ラベルが質問によって違います（${section.en} と ${en}）。質問「${entry.question}」を確認してください。`,
      );
    }
    section.items.push({
      id: entry.id,
      question: entry.question,
      paragraphs: toParagraphs(entry.answer),
    });
  }
  // カテゴリと英字ラベルは1対1にする。別のカテゴリに同じ英字ラベルが選ばれていたら、どちらかの選び間違い
  const byEn = new Map<string, string>();
  for (const section of sections.values()) {
    const other = byEn.get(section.en);
    if (other) {
      throw new Error(
        `[faq] 英字ラベル「${section.en}」が、カテゴリ「${other}」と「${section.name}」の両方で使われています。`,
      );
    }
    byEn.set(section.en, section.name);
  }
  return [...sections.values()];
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
