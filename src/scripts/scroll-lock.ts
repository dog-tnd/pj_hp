// 背景スクロールの固定。data-scroll-lock を持つ <dialog> のどれかが開いている間だけ固定する。
// 各コンポーネントは showModal() の直後と、その dialog の close イベントでこれを呼ぶ。
// スクロールバーが消えると画面幅が変わり固定ヘッダーのボタン位置がずれるため、
// 消えた幅を --scrollbar-width として公開し、<html> の右余白でも打ち消す。
export const syncScrollLock = () => {
  const root = document.documentElement;
  const locked =
    document.querySelector("dialog[data-scroll-lock][open]") !== null;

  if (locked && !root.classList.contains("overflow-hidden")) {
    const scrollbarWidth = window.innerWidth - root.clientWidth;
    root.style.setProperty("--scrollbar-width", `${scrollbarWidth}px`);
    root.style.paddingRight = `${scrollbarWidth}px`;
  }
  if (!locked) {
    root.style.removeProperty("--scrollbar-width");
    root.style.paddingRight = "";
  }
  root.classList.toggle("overflow-hidden", locked);
};
