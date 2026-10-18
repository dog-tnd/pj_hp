// よくある質問の開閉。回答は hidden="until-found" で閉じる（ページ内検索の対象に残すため）。
// el.hidden = true で閉じると検索の対象から外れるので、必ず属性で切り替える（spec 004）

const toggles = [
  ...document.querySelectorAll<HTMLButtonElement>("[data-faq-toggle]"),
];
// 「すべて開く」は lg 以上（カテゴリの行の右端）と lg 未満（行の下）の2つ。見えるのはどちらか1つ
const toggleAlls = [
  ...document.querySelectorAll<HTMLButtonElement>("[data-faq-toggle-all]"),
];

const panelOf = (button: HTMLButtonElement) =>
  document.getElementById(button.getAttribute("aria-controls") ?? "");

const isOpen = (button: HTMLButtonElement) =>
  button.getAttribute("aria-expanded") === "true";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// 回答の高さと透明度を変えて、開く・閉じるの動きを付ける
const animatePanel = (
  panel: HTMLElement,
  from: { height: number; opacity: number },
  to: { height: number; opacity: number },
) => {
  panel.style.overflow = "hidden";
  const animation = panel.animate(
    [
      { height: `${from.height}px`, opacity: from.opacity },
      { height: `${to.height}px`, opacity: to.opacity },
    ],
    { duration: 200, easing: "ease-out" },
  );
  // cancel は後から非同期に届くので、次の動きが始まっていれば overflow を残す
  const clear = () => {
    if (panel.getAnimations().length === 0)
      panel.style.removeProperty("overflow");
  };
  animation.addEventListener("finish", clear);
  animation.addEventListener("cancel", clear);
  return animation;
};

// animate は質問を1つ押したときだけ true。すべて開く・ハッシュ・ページ内検索ではすぐ切り替える
const setOpen = (button: HTMLButtonElement, open: boolean, animate = false) => {
  const panel = panelOf(button);
  if (!panel) return;
  button.setAttribute("aria-expanded", String(open));
  // 動きの途中で押されたら、今の高さ・透明度から続ける
  const from = panel.hasAttribute("hidden")
    ? { height: 0, opacity: 0 }
    : {
        height: panel.getBoundingClientRect().height,
        opacity: parseFloat(getComputedStyle(panel).opacity),
      };
  for (const animation of panel.getAnimations()) animation.cancel();
  const motion = animate && !reducedMotion.matches;
  if (open) {
    panel.removeAttribute("hidden");
    if (motion)
      animatePanel(panel, from, { height: panel.scrollHeight, opacity: 1 });
  } else if (motion) {
    // 閉じ終わってから hidden を付ける（付けた時点で中身が消えるため）
    animatePanel(panel, from, { height: 0, opacity: 0 }).addEventListener(
      "finish",
      () => panel.setAttribute("hidden", "until-found"),
    );
  } else panel.setAttribute("hidden", "until-found");
};

// 1つでも閉じていれば「すべて開く」
const syncToggleAll = () => {
  const label = toggles.every(isOpen) ? "すべて閉じる" : "すべて開く";
  for (const button of toggleAlls) button.textContent = label;
};

for (const button of toggles) {
  button.addEventListener("click", () => {
    setOpen(button, !isOpen(button), true);
    syncToggleAll();
  });
  // ページ内検索で閉じた回答が見つかると、ブラウザが hidden を外してからこのイベントを出す
  panelOf(button)?.addEventListener("beforematch", () => {
    button.setAttribute("aria-expanded", "true");
    syncToggleAll();
  });
}

for (const toggleAll of toggleAlls) {
  toggleAll.addEventListener("click", () => {
    const open = !toggles.every(isOpen);
    for (const button of toggles) setOpen(button, open);
    syncToggleAll();
  });
}

// ハッシュが質問を指していれば（#q-…）、その回答を開いて質問へ移動し、フォーカスを移す
const openFromHash = () => {
  const id = decodeURIComponent(location.hash.slice(1));
  if (!id.startsWith("q-")) return;
  const button = toggles.find((b) => b.id === id);
  if (!button) return;
  setOpen(button, true);
  syncToggleAll();
  button.scrollIntoView({ block: "start" });
  button.focus({ preventScroll: true });
};

openFromHash();
window.addEventListener("hashchange", openFromHash);

// ---- カテゴリの一覧：今見ているカテゴリの判定と、カテゴリへの移動 ----
// 判定は記事の目次（article-toc.ts）と同じ考え方：判定線より上にある最後のカテゴリ見出しを現在地にする

const catLinks = [
  ...document.querySelectorAll<HTMLAnchorElement>("[data-faq-cat]"),
];
const headings = [
  ...document.querySelectorAll<HTMLElement>("section h2[id^='cat-']"),
];
const bar = document.querySelector<HTMLElement>("[data-faq-bar]");

let currentAnchor: string | null = null;
// カテゴリを選んだあと、移動が終わるまでは判定を止める（なめらかな移動の途中で現在地がちらつくため）
let lockedUntil = 0;

const setCurrent = (anchor: string) => {
  if (anchor === currentAnchor) return;
  currentAnchor = anchor;
  for (const link of catLinks) {
    if (link.dataset.faqCat === anchor)
      link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  }
  // 現在地のピルが見えるよう、カテゴリの行を横にだけスクロールする（ページは縦に動かさない）
  const pill = bar?.querySelector<HTMLElement>(
    `[data-faq-cat="${CSS.escape(anchor)}"]`,
  );
  if (bar && pill && bar.offsetParent !== null) {
    bar.scrollTo({
      left: pill.offsetLeft - (bar.clientWidth - pill.offsetWidth) / 2,
      behavior: reducedMotion.matches ? "auto" : "smooth",
    });
  }
};

// 判定線：見出しの着地位置（scroll-margin-top）＋ 8px
const judgeLine = () =>
  parseFloat(getComputedStyle(headings[0]).scrollMarginTop || "0") + 8;

const updateCurrent = () => {
  if (performance.now() < lockedUntil) return;
  const line = judgeLine();
  let anchor = headings[0].id.slice("cat-".length);
  for (const heading of headings) {
    if (heading.getBoundingClientRect().top - line > 0) break;
    anchor = heading.id.slice("cat-".length);
  }
  // ページの一番下では、最後のほうのカテゴリは判定線まで上がりきらないので、画面に見えている最後のカテゴリにする
  const atBottom =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 2;
  if (atBottom) {
    const visible = headings.filter(
      (heading) => heading.getBoundingClientRect().top < window.innerHeight,
    );
    const last = visible[visible.length - 1];
    if (last) anchor = last.id.slice("cat-".length);
  }
  setCurrent(anchor);
};

let ticking = false;
const onScroll = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    updateCurrent();
  });
};

if (headings.length > 0) {
  updateCurrent();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  window.addEventListener("scrollend", () => {
    lockedUntil = 0;
    updateCurrent();
  });

  // カテゴリを選んだら、見出しへ移動してフォーカスを移し、URL のハッシュを更新する
  for (const link of catLinks) {
    link.addEventListener("click", (event) => {
      const anchor = link.dataset.faqCat;
      const heading = anchor ? document.getElementById(`cat-${anchor}`) : null;
      if (!anchor || !heading) return;
      event.preventDefault();
      setCurrent(anchor);
      lockedUntil = performance.now() + 1000;
      heading.scrollIntoView({
        behavior: reducedMotion.matches ? "auto" : "smooth",
        block: "start",
      });
      heading.focus({ preventScroll: true });
      history.replaceState(null, "", `#cat-${anchor}`);
    });
  }
}
