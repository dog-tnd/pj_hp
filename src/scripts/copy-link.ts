// 「リンクをコピー」ボタン。data-copy-link を持つボタンがいくつあっても、ここで一括して扱う。
// コピーするのは data-url（記事の正規の URL）。location.href だと #見出し やプレビューのクエリが付くため使わない。
// 結果は押したボタンの表示（data-copied）と、ページに1つの data-copy-status（aria-live）の両方で伝える。
const COPIED_MS = 2000;

const timers = new WeakMap<HTMLElement, number>();

const announce = (message: string) => {
  const status = document.querySelector<HTMLElement>("[data-copy-status]");
  if (!status) return;
  // 同じ文言が続いても読み上げられるよう、いったん空にしてから入れる
  status.textContent = "";
  window.setTimeout(() => {
    status.textContent = message;
  }, 50);
};

document.addEventListener("click", async (event) => {
  const button = (event.target as Element | null)?.closest<HTMLElement>(
    "[data-copy-link]",
  );
  if (!button) return;

  const url = button.dataset.url;
  if (!url) return;

  try {
    await navigator.clipboard.writeText(url);
  } catch (error) {
    console.error("クリップボードへのコピーに失敗しました:", error);
    announce("リンクをコピーできませんでした");
    return;
  }

  button.dataset.copied = "true";
  announce("リンクをコピーしました");

  window.clearTimeout(timers.get(button));
  timers.set(
    button,
    window.setTimeout(() => {
      delete button.dataset.copied;
    }, COPIED_MS),
  );
});
