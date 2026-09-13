# サイト共通ヘッダーの土台 tasks

<!-- 1タスク ≒ 1コミット。各タスクの後に pnpm build が通る順番にしてある -->

- [x] 1. spec（requirements / design / tasks）を追加
- [ ] 2. 背景スクロール固定を `src/scripts/scroll-lock.ts` に切り出し、`HeaderMobile` から使う（動作は変えない）
- [ ] 3. `SiteHeader.astro` を作り、幅の切り替えルールを移す。`Layout.astro` を差し替え、幅をまたいだらメニューを閉じる
- [ ] 4. 入会モーダルを `JoinDialog.astro` に切り出し、`SiteHeader` に置く。文言を統一
- [ ] 5. 6ページと `BlogArticleView.astro` から `MenuLayout` を撤去
- [ ] 6. `menu.tsx`・`MenuLayout.astro`・`index.css` を `archive/unused-assets/` に退避し、`tsconfig.json` の対象から `archive` を外す
- [ ] 7. `nav-mobile-2b/report.md` に spec への参照を追記
- [ ] 検証: `pnpm build` がエラー0
- [ ] 検証: 全7ページを 375 / 768 / 1440px でスクリーンショット。撤去前（develop）と見比べ、フォントと本文の崩れがないこと
- [ ] 検証: 受け入れ条件の動作（追従ボタンとメニュー内ボタンからモーダル、スクロール固定、幅をまたいだとき、Escape）
- [ ] 逸脱レポートを作成し、PR #63 の説明文を更新して push
