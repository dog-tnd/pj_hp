// 記事の目次。今読んでいる見出し（現在地）の判定と、目次の項目を選んだときの移動を扱う。
// 目次は右の列・目次バー・目次シートの3か所にあり、[data-toc-link] をすべて同時に更新する。

const links = [
  ...document.querySelectorAll<HTMLAnchorElement>("[data-toc-link]"),
];
const ids = [...new Set(links.map((link) => link.dataset.tocLink ?? ""))];
const headings = ids
  .map((id) => document.getElementById(id))
  .filter((heading): heading is HTMLElement => heading !== null);

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let currentId: string | null = null;
// 項目を押したあと、移動が終わるまでは判定を止める（なめらかな移動の途中で現在地がちらつくため）
let lockedUntil = 0;

const setCurrent = (id: string) => {
  if (id === currentId) return;
  currentId = id;

  for (const link of links) {
    if (link.dataset.tocLink === id) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  }

  // 目次バーの1行に今の見出しを出す
  const text = links.find((link) => link.dataset.tocLink === id)?.textContent;
  for (const label of document.querySelectorAll<HTMLElement>(
    "[data-toc-current-label]",
  )) {
    label.textContent = text?.trim() ?? "";
  }
};

// 判定線：その幅の見出しの着地位置（scroll-margin-top）＋ 8px
const judgeLine = () =>
  parseFloat(getComputedStyle(headings[0]).scrollMarginTop || "0") + 8;

// 判定線より上にある最後の見出しを現在地とする。どの見出しより上なら最初の見出し
const update = () => {
  if (performance.now() < lockedUntil) return;
  const line = judgeLine();
  let id = headings[0].id;
  for (const heading of headings) {
    if (heading.getBoundingClientRect().top - line > 0) break;
    id = heading.id;
  }
  setCurrent(id);
};

let ticking = false;
const onScroll = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    update();
  });
};

/** 見出しへ移動し、フォーカスを当て、URL のハッシュを更新する */
const goToHeading = (id: string) => {
  const heading = document.getElementById(id);
  if (!heading) return;

  setCurrent(id);
  lockedUntil = performance.now() + 1000;

  heading.scrollIntoView({
    behavior: reducedMotion.matches ? "auto" : "smooth",
    block: "start",
  });
  heading.focus({ preventScroll: true });
  history.replaceState(null, "", `#${id}`);
};

if (headings.length > 0) {
  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  // 移動が先に終わったら、すぐに判定を再開する
  window.addEventListener("scrollend", () => {
    lockedUntil = 0;
    update();
  });

  for (const link of links) {
    link.addEventListener("click", (event) => {
      const id = link.dataset.tocLink;
      if (!id) return;
      event.preventDefault();
      // 目次バー・シートは、このイベントを受けて閉じてから移動させる
      link.dispatchEvent(new CustomEvent("toc:before-jump", { bubbles: true }));
      goToHeading(id);
    });
  }
}

// ---- 目次バー（md 以上 lg 未満）----
// 背景のスクロールは固定しない（読みながら開閉する軽い操作のため）
const bar = document.querySelector<HTMLElement>("[data-toc-bar]");
const barToggle = bar?.querySelector<HTMLButtonElement>(
  "[data-toc-bar-toggle]",
);
const barPanel = bar?.querySelector<HTMLElement>("[data-toc-bar-panel]");

if (bar && barToggle && barPanel) {
  const isOpen = () => !barPanel.hidden;

  const openBar = () => {
    barPanel.hidden = false;
    barToggle.setAttribute("aria-expanded", "true");
  };

  // returnFocus: フォーカスが目次の中にあれば、バーのボタンへ戻す
  const closeBar = (returnFocus: boolean) => {
    if (!isOpen()) return;
    const focusWasInside = barPanel.contains(document.activeElement);
    barPanel.hidden = true;
    barToggle.setAttribute("aria-expanded", "false");
    if (returnFocus && focusWasInside) barToggle.focus();
  };

  barToggle.addEventListener("click", () => {
    if (isOpen()) closeBar(false);
    else openBar();
  });

  // 項目を選んだら、閉じてから見出しへ移動する（フォーカスは見出しへ移る）
  barPanel.addEventListener("toc:before-jump", () => closeBar(false));

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !isOpen()) return;
    // メニューや入会モーダルが開いているときは、そちらの Escape に任せる
    if (document.querySelector("dialog[open]")) return;
    closeBar(true);
  });

  document.addEventListener("pointerdown", (event) => {
    if (isOpen() && !bar.contains(event.target as Node)) closeBar(false);
  });

  // バーが表示されない幅になったら閉じる。非表示のボタンへはフォーカスを戻さない
  const barRange = window.matchMedia(
    "(min-width: 768px) and (max-width: 1023.98px)",
  );
  barRange.addEventListener("change", (event) => {
    if (!event.matches) closeBar(false);
  });
}
