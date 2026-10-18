// 404 ページのターミナル（spec 007）。1024px 以上で表示されたときに一度だけ始める（D3）。
// 行の文字は入力を含めてすべて textContent で入れる（innerHTML は使わない）
import {
  HINTS,
  INTRO_LINES,
  TRAIN_DONE_LINE,
  normalizeInput,
  runCommand,
  type HintPart,
  type TermLine,
} from "../utils/not-found-commands";

const MAX_LINES = 80;
const PATH_MAX = 40;
const TRAIN_SPEED = 260; // px/秒

const TONE_CLASS: Record<TermLine["tone"], string> = {
  out: "text-gray-200",
  dim: "text-gray-400",
  err: "text-orange-300",
  go: "text-teal-300",
};
const OK_CLASS = "text-green-400";
const NG_CLASS = "text-red-400";
const LINE_CLASS = "min-h-[1.75em] wrap-break-word whitespace-pre-wrap";
const NAVIGATE_DELAY = 600; // ms。「へ移動します…」を読める間を置く
const CODE_CLASS =
  "rounded-[5px] bg-gray-100 px-1.5 font-mono text-[.9em] text-gray-900";
const LINK_CLASS =
  "text-blue-300 underline underline-offset-[3px] hover:text-blue-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 focus-visible:outline-solid";

// 自作の絵（TND の機関車と客車2両）。車輪と煙の違う2枚を入れ替えて走らせる
const TRAIN_FRAMES = [
  [
    "        (  )   ( )    o",
    "     ____||_______        ______________      ______________",
    "    |  []  | TND  |=====| []   []   [] |====| []   []   [] |",
    "    |______|______|     |______________|    |______________|",
    "  ===(O)===(O)===(O)======(O)======(O)========(O)======(O)===",
  ].join("\n"),
  [
    "       ( )   (  )   O",
    "     ____||_______        ______________      ______________",
    "    |  []  | TND  |=====| []   []   [] |====| []   []   [] |",
    "    |______|______|     |______________|    |______________|",
    "  ===(o)===(o)===(o)======(o)======(o)========(o)======(o)===",
  ].join("\n"),
];

const root = document.querySelector<HTMLElement>("[data-terminal]");
if (root) setup(root);

function setup(root: HTMLElement) {
  const find = <T extends HTMLElement>(selector: string) => {
    const el = root.querySelector<T>(selector);
    if (!el) throw new Error(`404 terminal: ${selector} が見つかりません`);
    return el;
  };
  const body = find<HTMLElement>("[data-terminal-body]");
  const log = find<HTMLElement>("[data-terminal-log]");
  const prompt = find<HTMLElement>("[data-terminal-prompt]");
  const dir = find<HTMLElement>("[data-terminal-dir]");
  const typing = find<HTMLElement>("[data-terminal-typing]");
  const typed = find<HTMLElement>("[data-terminal-typed]");
  const form = find<HTMLFormElement>("[data-terminal-form]");
  const chevron = find<HTMLElement>("[data-terminal-chevron]");
  const input = find<HTMLInputElement>("#not-found-cmd");
  const train = find<HTMLElement>("[data-terminal-train]");
  const chips = find<HTMLElement>("[data-terminal-chips]");
  const hints = find<HTMLElement>("[data-terminal-hints]");
  const hintNumber = find<HTMLElement>("[data-terminal-hint-number]");
  const hintText = find<HTMLElement>("[data-terminal-hint-text]");

  let reduced = false;
  // 直前のコマンドが成功したか（❯ の色）
  let lastOk = true;
  const history: string[] = [];
  let historyIndex = 0;
  let trainRunning = false;

  const path = shortPath(currentPath());

  const scrollToEnd = () => {
    body.scrollTop = body.scrollHeight;
  };

  const trim = () => {
    while (log.childElementCount > MAX_LINES) log.firstElementChild?.remove();
  };

  const lineElement = (line: TermLine) => {
    const el = document.createElement("div");
    el.className = `${LINE_CLASS} ${TONE_CLASS[line.tone]}`;
    el.textContent = line.text;
    const links = line.links ?? [];
    for (const link of links) {
      const a = document.createElement("a");
      a.href = link.href;
      // ls のように1行に並べるときだけ間を空ける
      a.className = links.length > 1 ? `mr-[22px] ${LINK_CLASS}` : LINK_CLASS;
      a.textContent = link.label;
      el.append(a);
    }
    if (line.after) {
      const after = document.createElement("span");
      after.className = TONE_CLASS.dim;
      after.textContent = line.after;
      el.append(after);
    }
    return el;
  };

  const pushLines = (lines: TermLine[]) => {
    log.append(...lines.map(lineElement));
    trim();
    scrollToEnd();
  };

  // 実行した行。プロンプトの帯なしの「❯ コマンド」に縮める。❯ は入力したときの色のまま
  const pushCommand = (text: string) => {
    const el = document.createElement("div");
    el.className = `${LINE_CLASS} text-gray-200`;
    if (log.childElementCount > 0) el.classList.add("mt-2.5");
    const mark = document.createElement("span");
    mark.className = `font-semibold ${lastOk ? OK_CLASS : NG_CLASS}`;
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = "❯ ";
    el.append(mark, text);
    log.append(el);
    trim();
    scrollToEnd();
  };

  const setOk = (ok: boolean) => {
    lastOk = ok;
    chevron.classList.toggle(OK_CLASS, ok);
    chevron.classList.toggle(NG_CLASS, !ok);
  };

  const runTrain = () => {
    if (reduced) {
      pushLines([TRAIN_DONE_LINE]);
      return;
    }
    if (trainRunning) return;
    trainRunning = true;
    const from = body.clientWidth;
    train.textContent = TRAIN_FRAMES[0];
    train.style.transform = `translate(${from}px, -50%)`;
    train.hidden = false;
    const width = train.offsetWidth;
    const start = performance.now();
    const step = (now: number) => {
      const t = (now - start) / 1000;
      const x = from - t * TRAIN_SPEED;
      if (x < -width) {
        train.hidden = true;
        trainRunning = false;
        pushLines([TRAIN_DONE_LINE]);
        return;
      }
      train.textContent = TRAIN_FRAMES[Math.floor(t * 6) % 2];
      train.style.transform = `translate(${x}px, -50%)`;
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const execute = (raw: string) => {
    const text = normalizeInput(raw);
    pushCommand(text);
    const result = runCommand(text);
    if (result.ok === null) return;
    history.push(text);
    historyIndex = history.length;
    if (result.effect === "clear") log.replaceChildren();
    pushLines(result.lines);
    if (result.effect === "train") runTrain();
    if (typeof result.effect === "object") {
      const href = result.effect.navigate;
      window.setTimeout(() => location.assign(href), NAVIGATE_DELAY);
    }
    setOk(result.ok);
  };

  // 最初の出力が終わったら、入力欄と「試してみる」を出し、結果の読み上げを始める
  const becomeReady = () => {
    setOk(false); // 最初の open は失敗
    prompt.hidden = false;
    typing.hidden = true;
    form.hidden = false;
    chips.hidden = false;
    showHint(0); // 文字の間の空白をそろえるため、HTML の最初のヒントを入れ直す
    hints.hidden = false;
    log.setAttribute("aria-live", "polite");
    scrollToEnd();
  };

  const playIntro = () => {
    const command = `open ${path}`;
    log.replaceChildren();
    dir.textContent = `~${path}`;
    if (reduced) {
      pushCommand(command);
      pushLines(INTRO_LINES);
      becomeReady();
      return;
    }
    const chars = Array.from(command);
    let count = 0;
    typed.textContent = "";
    prompt.hidden = false;
    typing.hidden = false;
    const tick = () => {
      count += 1;
      typed.textContent = chars.slice(0, count).join("");
      scrollToEnd();
      if (count < chars.length) {
        window.setTimeout(tick, 55 + Math.random() * 60);
        return;
      }
      window.setTimeout(() => {
        prompt.hidden = true;
        pushCommand(command);
        INTRO_LINES.forEach((line, i) =>
          window.setTimeout(() => pushLines([line]), 260 + i * 220),
        );
        window.setTimeout(becomeReady, 260 + INTRO_LINES.length * 220);
      }, 380);
    };
    window.setTimeout(tick, 700);
  };

  // ヒント。左右のボタンで切り替え、端では反対の端へ回る（自動では切り替えない）
  let hintIndex = 0;
  const showHint = (index: number) => {
    hintIndex = (index + HINTS.length) % HINTS.length;
    hintNumber.textContent = `HINT ${hintIndex + 1}/${HINTS.length}`;
    hintText.replaceChildren(...HINTS[hintIndex].map(hintPart));
  };
  hints.addEventListener("click", (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>(
      "[data-terminal-hint-step]",
    );
    if (button) showHint(hintIndex + Number(button.dataset.terminalHintStep));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = input.value;
    input.value = "";
    execute(value);
  });

  input.addEventListener("keydown", (event) => {
    // 日本語の変換中のキーは変換に任せる。Safari は確定の Enter を isComposing なしの 229 で送るので、送信を止める
    if (event.isComposing) return;
    if (event.keyCode === 229) {
      if (event.key === "Enter") event.preventDefault();
      return;
    }
    if (event.key === "ArrowUp" && history.length > 0) {
      event.preventDefault();
      historyIndex = Math.max(0, historyIndex - 1);
      input.value = history[historyIndex];
    } else if (event.key === "ArrowDown" && history.length > 0) {
      event.preventDefault();
      historyIndex = Math.min(history.length, historyIndex + 1);
      input.value = history[historyIndex] ?? "";
    }
  });

  // 「試してみる」。フォーカスはボタンに残す（入力欄に移さない）
  chips.addEventListener("click", (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>(
      "[data-terminal-run]",
    );
    if (button?.dataset.terminalRun) execute(button.dataset.terminalRun);
  });

  // 1024px 以上で表示されたときに一度だけ始める。開いた後に幅を広げたときも始める
  const desktop = window.matchMedia("(min-width: 1024px)");
  const start = () => {
    if (!desktop.matches) return;
    desktop.removeEventListener("change", start);
    reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    playIntro();
  };
  desktop.addEventListener("change", start);
  start();
}

function currentPath() {
  try {
    return decodeURIComponent(location.pathname);
  } catch {
    return location.pathname;
  }
}

// 長いパスは先頭を「…」にして後ろを残す
function shortPath(path: string) {
  const chars = Array.from(path);
  return chars.length > PATH_MAX
    ? `…${chars.slice(-(PATH_MAX - 1)).join("")}`
    : path;
}

function hintPart(part: HintPart) {
  if (!part.code) return document.createTextNode(part.text);
  const code = document.createElement("code");
  code.className = CODE_CLASS;
  code.textContent = part.text;
  return code;
}
