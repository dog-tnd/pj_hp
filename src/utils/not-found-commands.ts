// 404 ページのターミナル（spec 007）で受け付けるコマンドと、その結果の行。
// DOM に依存しない。文字はすべて textContent で入れる前提で、HTML を含めない。

export type TermLink = { href: string; label: string };

export type TermLine = {
  tone: "out" | "dim" | "err" | "go";
  text: string;
  links?: TermLink[];
  // リンクの後ろに補足の色で出す文字
  after?: string;
};

export type CommandResult = {
  // 成功は true、失敗は false。空の入力は null（プロンプトの色を変えない）
  ok: boolean | null;
  effect?: "clear" | "train" | { navigate: string };
  lines: TermLine[];
};

// リンクの href はこの表からだけ取る（入力から作らない）
const PAGES: Record<string, TermLink> = {
  about: { href: "/about", label: "私たちについて" },
  blog: { href: "/blog", label: "テックブログ" },
  faq: { href: "/faq", label: "よくある質問" },
  contact: { href: "/contact", label: "お問い合わせ" },
};

const TOP = "/";
const HOME_ARGS = new Set(["", "~", "..", "/"]);
const HINT: TermLine = {
  tone: "dim",
  text: "help と入力すると、使えるコマンドを表示します。",
};

const out = (text: string): TermLine => ({ tone: "out", text });
const dim = (text: string): TermLine => ({ tone: "dim", text });
const err = (text: string): TermLine => ({ tone: "err", text });
const TOP_PAGE: TermLink = { href: TOP, label: "トップページ" };
const NAVIGATE_DELAY_NOTE = " へ移動します…";

// 行き先を出してから、そのページへ移動する（spec 007 D5）
const navigateTo = (page: TermLink): CommandResult => ({
  ok: true,
  effect: { navigate: page.href },
  lines: [
    { tone: "go", text: "→ ", links: [page], after: NAVIGATE_DELAY_NOTE },
  ],
});

/** 全角の英数字・空白を半角にそろえ、前後の空白を除く */
export function normalizeInput(input: string): string {
  return input.normalize("NFKC").trim();
}

/** 入力されたコマンドを実行し、結果の行を返す */
export function runCommand(input: string): CommandResult {
  const s = normalizeInput(input);
  if (!s) return { ok: null, lines: [] };

  const [word, rawArg = ""] = s.split(/\s+/);
  const command = word.toLowerCase();
  // 引数の先頭の ./ と / 、末尾の / を除く（"/" だけのときはそのまま）
  const arg =
    rawArg === "/"
      ? "/"
      : rawArg
          .replace(/^\.?\//, "")
          .replace(/\/$/, "")
          .toLowerCase();

  switch (command) {
    case "help":
      return {
        ok: true,
        lines: [
          dim("使えるコマンド"),
          out("  ls          ページの一覧"),
          out("  tree        サイトの地図"),
          out("  cd <名前>   ページへ移動（例: cd blog）"),
          out("  whoami      あなたについて"),
          out("  clear       画面を消す"),
          out("  exit        トップページへ移動"),
          dim("  ほかにも、隠れたコマンドがあるかも。"),
        ],
      };
    case "ls":
      return {
        ok: true,
        lines: [
          {
            tone: "out",
            text: "",
            links: Object.entries(PAGES).map(([key, page]) => ({
              href: page.href,
              label: `${key}/`,
            })),
          },
        ],
      };
    case "tree":
      return {
        ok: true,
        lines: [
          {
            tone: "dim",
            text: "",
            links: [{ href: TOP, label: "~" }],
            after: "    トップページ",
          },
          ...Object.entries(PAGES).map(([key, page], i, all): TermLine => ({
            tone: "dim",
            text: i === all.length - 1 ? "└── " : "├── ",
            links: [{ href: page.href, label: `${key}/` }],
            after: " ".repeat(Math.max(1, 10 - key.length - 1)) + page.label,
          })),
        ],
      };
    case "cd":
    case "open":
      if (HOME_ARGS.has(arg)) return navigateTo(TOP_PAGE);
      if (Object.hasOwn(PAGES, arg)) return navigateTo(PAGES[arg]);
      return {
        ok: false,
        lines: [err(`${command}: ${rawArg}: そのようなページはありません`)],
      };
    case "whoami":
      return {
        ok: true,
        lines: [
          out("guest"),
          dim(
            "まだ TND のメンバーではないようです。入会申し込みのボタンから、いつでも参加できます。",
          ),
        ],
      };
    case "exit":
      return navigateTo(TOP_PAGE);
    case "clear":
      return { ok: true, effect: "clear", lines: [] };
    // ここから下は help に出さない隠しコマンド
    case "sl":
      return { ok: true, effect: "train", lines: [] };
    case "sudo":
      return {
        ok: false,
        lines: [
          err("sudo: guest には管理者の権限がありません。"),
          dim("この件は報告されます。……というのはうそです。"),
        ],
      };
    case "rm":
      return { ok: false, lines: [err("rm: それは消さないでください。")] };
    default: {
      const lines = [err(`command not found: ${word}`)];
      if (Object.hasOwn(PAGES, command)) {
        lines.push(dim(`もしかして: cd ${command}`));
      } else if (command === "top" || command === "home") {
        lines.push(dim("もしかして: cd ~"));
      } else {
        lines.push(HINT);
      }
      return { ok: false, lines };
    }
  }
}

/** 汽車が通り過ぎた後の行（視差効果を減らす設定のときは、走らせずにこれだけを出す） */
export const TRAIN_DONE_LINE: TermLine =
  dim("（ls の打ち間違いかもしれません）");

/** ページを開いたときの最初の出力。JavaScript が無いときは先頭の2行だけを出す */
export const INTRO_LINES: TermLine[] = [
  err("HTTP/1.1 404 Not Found"),
  out("ページが見つかりませんでした。"),
  HINT,
];

/** 「試してみる」の下に出すヒント。code は等幅の枠で出す（spec 007 D6） */
export type HintPart = { text: string; code?: boolean };

export const HINTS: HintPart[][] = [
  [{ text: "tree", code: true }, { text: " で、サイトの地図が見られます。" }],
  [
    { text: "cd blog", code: true },
    { text: " と打つと、テックブログへ移動します。" },
  ],
  [
    { text: "↑", code: true },
    { text: " キーで、前に打ったコマンドを呼び出せます。" },
  ],
  [
    { text: "whoami", code: true },
    { text: " で、あなたのことが分かる……かも。" },
  ],
  [{ text: "隠れたコマンドが 3 つあります。" }],
];
