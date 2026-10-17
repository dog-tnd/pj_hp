// よくある質問の開閉。回答は hidden="until-found" で閉じる（ページ内検索の対象に残すため）。
// el.hidden = true で閉じると検索の対象から外れるので、必ず属性で切り替える（spec 004）

const toggles = [
  ...document.querySelectorAll<HTMLButtonElement>("[data-faq-toggle]"),
];
const toggleAll = document.querySelector<HTMLButtonElement>(
  "[data-faq-toggle-all]",
);

const panelOf = (button: HTMLButtonElement) =>
  document.getElementById(button.getAttribute("aria-controls") ?? "");

const isOpen = (button: HTMLButtonElement) =>
  button.getAttribute("aria-expanded") === "true";

const setOpen = (button: HTMLButtonElement, open: boolean) => {
  const panel = panelOf(button);
  if (!panel) return;
  button.setAttribute("aria-expanded", String(open));
  if (open) panel.removeAttribute("hidden");
  else panel.setAttribute("hidden", "until-found");
};

// 1つでも閉じていれば「すべて開く」
const syncToggleAll = () => {
  if (!toggleAll) return;
  toggleAll.textContent = toggles.every(isOpen) ? "すべて閉じる" : "すべて開く";
};

for (const button of toggles) {
  button.addEventListener("click", () => {
    setOpen(button, !isOpen(button));
    syncToggleAll();
  });
  // ページ内検索で閉じた回答が見つかると、ブラウザが hidden を外してからこのイベントを出す
  panelOf(button)?.addEventListener("beforematch", () => {
    button.setAttribute("aria-expanded", "true");
    syncToggleAll();
  });
}

toggleAll?.addEventListener("click", () => {
  const open = !toggles.every(isOpen);
  for (const button of toggles) setOpen(button, open);
  syncToggleAll();
});

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
  ...document.querySelectorAll<HTMLElement>("section > h2[id^='cat-']"),
];
const bar = document.querySelector<HTMLElement>("[data-faq-bar]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let currentSlug: string | null = null;
// カテゴリを選んだあと、移動が終わるまでは判定を止める（なめらかな移動の途中で現在地がちらつくため）
let lockedUntil = 0;

const setCurrent = (slug: string) => {
  if (slug === currentSlug) return;
  currentSlug = slug;
  for (const link of catLinks) {
    if (link.dataset.faqCat === slug)
      link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  }
  // lg 未満：現在地のピルが見えるよう、カテゴリの行を横にだけスクロールする（ページは縦に動かさない）
  const pill = bar?.querySelector<HTMLElement>(`[data-faq-cat="${slug}"]`);
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
  let slug = headings[0].id.slice("cat-".length);
  for (const heading of headings) {
    if (heading.getBoundingClientRect().top - line > 0) break;
    slug = heading.id.slice("cat-".length);
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
    if (last) slug = last.id.slice("cat-".length);
  }
  setCurrent(slug);
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
      const slug = link.dataset.faqCat;
      const heading = slug ? document.getElementById(`cat-${slug}`) : null;
      if (!slug || !heading) return;
      event.preventDefault();
      setCurrent(slug);
      lockedUntil = performance.now() + 1000;
      heading.scrollIntoView({
        behavior: reducedMotion.matches ? "auto" : "smooth",
        block: "start",
      });
      heading.focus({ preventScroll: true });
      history.replaceState(null, "", `#cat-${slug}`);
    });
  }
}
