// <pre>…</pre> と <code>…</code> の中身を変換対象から外すための退避マーカー。
// 本文と衝突しないよう NUL 文字で囲む
const skipMark = (index: number) => `\u0000CODE${index}\u0000`;
const SKIP_PATTERN = /\u0000CODE(\d+)\u0000/g;

// 既存のコードブロック / インラインコードはそのまま残す
const EXISTING_CODE = /<pre[\s\S]*?<\/pre>|<code[\s\S]*?<\/code>/gi;
// タグの外側（テキストノード）だけを対象にする
const TEXT_NODE = />([^<]+)</g;
// `code` 形式のインラインコード（改行をまたがない）
const BACKTICK = /`([^`\n]+)`/g;

/**
 * 本文HTML中の `code` 記法を <code>code</code> へ変換する。
 * リッチエディタがバッククォートを素通しした場合でもインラインコードとして表示するため。
 * コードブロック内・既存の<code>内・タグの属性値は変換しない。
 */
export function convertInlineCode(html: string): string {
  const skipped: string[] = [];

  const protectedHtml = html.replace(EXISTING_CODE, (block) => {
    skipped.push(block);
    return skipMark(skipped.length - 1);
  });

  const converted = protectedHtml.replace(
    TEXT_NODE,
    (_, text: string) => `>${text.replace(BACKTICK, "<code>$1</code>")}<`
  );

  return converted.replace(
    SKIP_PATTERN,
    (_, index: string) => skipped[Number(index)]
  );
}
