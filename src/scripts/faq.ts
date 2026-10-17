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
