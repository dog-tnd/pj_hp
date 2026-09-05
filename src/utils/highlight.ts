import { createHighlighter, type Highlighter } from "shiki";

// microCMS のリッチエディタで指定され得る言語（js/ts などのエイリアスは Shiki 側が解決する）
const LANGS = [
  "javascript",
  "typescript",
  "jsx",
  "tsx",
  "html",
  "css",
  "scss",
  "json",
  "yaml",
  "markdown",
  "bash",
  "shell",
  "python",
  "java",
  "c",
  "cpp",
  "csharp",
  "go",
  "rust",
  "php",
  "ruby",
  "sql",
  "diff",
  "astro",
  "vue",
];

const THEME = "github-dark";
// 未対応・未指定の言語はハイライト無しで表示する
const FALLBACK_LANG = "plaintext";

// ハイライターの生成は重いので使い回す
let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  highlighterPromise ??= createHighlighter({ themes: [THEME], langs: LANGS });
  return highlighterPromise;
}

// <pre><code class="language-xxx">…</code></pre> 形式のコードブロック
const CODE_BLOCK = /<pre[^>]*>\s*<code([^>]*)>([\s\S]*?)<\/code>\s*<\/pre>/gi;
const LANG_IN_CLASS = /class\s*=\s*["'][^"']*language-([\w+#.-]+)/i;

// HTML エンティティを元のコード文字列へ戻す（&amp; は二重デコードを避けるため最後）
function decodeEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&#x27;/gi, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

/**
 * 本文HTML内のコードブロックをシンタックスハイライト済みのHTMLへ置き換える。
 * Shiki はインラインstyleで色を付けるため、サニタイズ後に呼び出すこと。
 */
export async function highlightCodeBlocks(html: string): Promise<string> {
  const matches = [...html.matchAll(CODE_BLOCK)];
  if (matches.length === 0) return html;

  const highlighter = await getHighlighter();
  const loadedLangs = new Set(highlighter.getLoadedLanguages());

  let result = "";
  let cursor = 0;

  for (const match of matches) {
    const [full, attrs, rawCode] = match;
    const requested = LANG_IN_CLASS.exec(attrs)?.[1]?.toLowerCase() ?? "";
    const lang = loadedLangs.has(requested) ? requested : FALLBACK_LANG;
    const code = decodeEntities(rawCode).replace(/\n+$/, "");

    result +=
      html.slice(cursor, match.index) +
      highlighter.codeToHtml(code, { lang, theme: THEME });
    cursor = match.index + full.length;
  }

  return result + html.slice(cursor);
}
