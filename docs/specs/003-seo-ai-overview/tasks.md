# 「プログラミングサークル」検索での AI による概要対策 tasks

フェーズ1（main・head のみ）。

- [x] 1. `Layout.astro`：JSON-LD を `Organization` + `WebSite` の `@graph` に置き換え（`memberOf` を外す）
- [x] 2. `Layout.astro`：`og:locale` 追加、Twitter カードを `name` 属性に変更、既定の description 更新
- [x] 3. トップ・about・faq・contact・blog 一覧の title / description を設定
- [x] 4. 検証（build・JSON-LD のパース・見た目の前後比較）

`/faq` の `FAQPage` はフェーズ1から外した（D4）。FAQ の改修後に #74 で行う。
