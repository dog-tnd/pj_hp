# 「プログラミングサークル」検索での AI による概要対策 フェーズ2 tasks

<!-- 1タスク ≒ 1コミット。各タスクの後に pnpm run build が通る順番にしてある -->

- [x] 1. spec 006（requirements / design / tasks）を追加し、spec 003 を main から取り込む
- [x] 2. `Layout.astro`：JSON-LD を `Organization` + `WebSite` の `@graph` に置き換える（事実は今のもの）
- [x] 3. `Layout.astro`：`og:locale` を足し、Twitter カードを `name` 属性に変え、既定の説明文を直す
- [x] 4. トップ・about・faq・blog 一覧の title / description を設定する
- [x] 5. 記事の `publisher` を `Organization` の `@id` の参照にする
- [x] 6. OG 画像の元の画面（`/dev/og-image`）を作り、`public/og.png` を書き出して既定の画像にする。トップの `image` の指定を外す。README に作り直す手順を書く
- [x] 検証: `pnpm run build` がエラー0
- [x] 検証: JSON-LD がすべてパースでき、記事の `publisher` の `@id` が `Organization` と一致する
- [x] 検証: 変更前後で全ページの `<body>` が一致する
- [x] 検証: description の字数が 70〜120 字で、meta・`Organization` に古い事実の語が残っていない（`FAQPage`・記事の `BlogPosting` は対象外）
- [x] 検証: `public/og.png` が 1200×630 で、キャンバスの案と同じ見た目（スクリーンショットで確認をもらう）
