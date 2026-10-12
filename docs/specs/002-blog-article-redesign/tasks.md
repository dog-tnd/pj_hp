# ブログ記事ページの刷新 tasks

<!-- 1タスク ≒ 1コミット。各タスクの後に pnpm build が通る順番にしてある -->

- [x] 1. spec（requirements / design / tasks）を追加
- [x] 2. `src/utils/toc.ts` を追加し（`highlight.ts` の `decodeEntities` を export して使う）、`BlogArticleView` の本文の整形に組み込む（見た目は変えない）
- [x] 3. 検証用の dev ページ `src/dev-pages/blog-article.astro` を追加（見出し 0・1・多数、h3 だけ、h2 より前の h3、`id` の無い見出し、`id` の重複、空の見出し、h1 を含むサンプル）
- [x] 4. `Layout.astro` のラッパを `overflow-clip` に変える
- [x] 5. `[slug].astro` の前後の記事の向きを入れ替える
- [x] 6. `ShareButtons.astro` と `copy-link.ts` を追加し、既存のシェア欄を置き換える（4つ、`canonicalURL` をコピー、結果を `aria-live` で通知）
- [ ] 7. `BlogArticleView` の構成を作り直す（記事ヘッダー・アイキャッチ・本文 720px・本文後のブロック・関連記事の帯。`<main>` の二重を解消。`scroll-behavior` を `prefers-reduced-motion` に対応）
- [ ] 8. `TocList.astro` を追加し、lg 以上の右の列（sticky）に目次・シェア・ページの先頭へを置く。見出しの `scroll-margin-top` を幅ごとに付ける
- [ ] 9. `article-toc.ts` に現在地の判定を追加する（判定線より上の最後の見出し、押した項目を即時に現在地へ）
- [ ] 10. md〜lg の目次バー（開閉・Escape・外側クリック・項目選択後の処理順・幅をまたいだら閉じる）
- [ ] 11. md 未満の目次ボタンと目次シート（`<dialog data-scroll-lock>`、項目選択後の処理順、閉じたらフォーカスを戻す）
- [ ] 検証: `pnpm build` がエラー0
- [ ] 検証: 記事ページを 375 / 768 / 1024 / 1440px でスクリーンショット。キャンバスと見比べる
- [ ] 検証: dev ページのサンプルすべてで、目次の項目・字下げ・`id`・表示/非表示の条件
- [ ] 検証: 受け入れ条件の動作（目次からの移動と着地位置、PC でページの先頭から飛んだときの着地、現在地の表示、長い目次のスクロール、バーとシートの開閉・Escape・フォーカス、スクロール固定、幅をまたいだとき、コピーの内容と通知）
- [ ] 検証: 他の6ページを 375 / 768 / 1440px で develop と見比べ、ラッパの変更で崩れていないこと（右上の装飾の切れ方を含む）
- [ ] 検証: `/blog/preview` の表示
- [ ] 逸脱レポート（`report.md`）を作成
