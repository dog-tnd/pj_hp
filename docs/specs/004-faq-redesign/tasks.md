# よくある質問ページの刷新 tasks

<!-- 1タスク ≒ 1コミット。各タスクの後に pnpm build が通る順番にしてある -->

- [ ] 0. （人間）microCMS の設定。タスク 6 より前に必須
  - [ ] `faq-categories` と `faq` を作る（design の「microCMS」の表どおり。`slug` に正規表現と重複不可を設定）
  - [ ] 今の12問を登録する（design の「移行する12問」）
  - [ ] API キーの GET 権限を2つの API に付ける（GitHub の Secrets・Vercel・ローカルのキーすべて）
  - [ ] 2つの API に Webhook（`repository_dispatch: microcms-publish`）を、公開・更新・公開終了・削除で設定し、再ビルドが始まることを確かめる
- [x] 1. spec（requirements / design / tasks）を追加
- [ ] 2. `tailwind.config.cjs` に `tnd`・`marshmallow` の色を追加し、`Layout.astro` の背景をぼかし複数個にする
- [ ] 3. `src/utils/faq.ts`（型・変換・異常データの検出）と `FaqView`・子コンポーネント・`faq.ts`（開閉・すべて開く・ハッシュ・`beforematch`）を作り、dev ページ `src/dev-pages/faq.astro` に固定データで表示する（本番の `/faq` はまだ変えない）
  - dev ページのサンプル：今の12問に加え、長い質問、複数段落と段落内の改行がある回答、カテゴリ6つ、質問0件のカテゴリ
- [ ] 4. カテゴリの一覧の追従（sticky）と現在地の判定、カテゴリへの移動とフォーカス、`scroll-margin-top`、`scroll-behavior` を追加する（dev ページで確認）
- [ ] 5. `utils/faq.ts` に `FAQPage` の JSON-LD を作る関数を追加し、dev ページで出力する
- [ ] 6. `microcms.ts` に FAQ の取得を追加し、`/faq` を `FaqView` に差し替える（`description`・`FAQPage` も出力。旧ページのスクリプトとスタイルを消す）
- [ ] 7. README に FAQ の更新手順を追記し、microCMS・Webhook の節を直す
- [ ] 検証: `pnpm build` がエラー0
- [ ] 検証: `/faq` と dev ページを 375 / 768 / 1024 / 1440px でスクリーンショット。キャンバスと見比べる
- [ ] 検証: 旧ページと新ページで、12問の質問・回答の文言が一致すること
- [ ] 検証: 受け入れ条件の動作（開閉と `aria-expanded`、すべて開くの文言、ハッシュ（読み込み時・`hashchange`）からの展開と着地位置・フォーカス、ページ内検索での展開、カテゴリの移動と着地位置・フォーカス、現在地の表示と行の横スクロール、マシュマロのリンク、JavaScript 無しで回答が読めること）
- [ ] 検証: PC でページの先頭からハッシュで飛んだときの着地（ヘッダーが縮む分のずれ）
- [ ] 検証: 異常データ（質問0件・参照切れ・slug 重複）でビルドが失敗し、理由がログに出ること（`utils/faq.ts` に固定データを渡して確かめる）
- [ ] 検証: 背景の変更前後で、全ページ（トップ・about・ブログ一覧・記事・FAQ・お問い合わせ・404）のスクリーンショットを 375 / 768 / 1440px で比べ、ぼかし以外に差分が無く、横スクロールも無いこと
- [ ] 検証: `FAQPage` の JSON-LD が表示と同じ質問・回答になっていること（Rich Results Test の構文チェック）
