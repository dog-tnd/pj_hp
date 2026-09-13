# unused-assets

どこからも参照されていないファイルの退避先です。削除はせず、ここに移動して残しています。
`public/` と `src/` の外なのでビルド成果物には含まれず、配信もされません。`tsconfig.json` の `exclude` で型チェックの対象からも外しています。

| ファイル | サイズ | 退避理由 |
| --- | --- | --- |
| `logo.svg` | 2.7 MB | 2560px の PNG を base64 で埋め込んだだけの SVG。48px 表示には過大なため `public/logo.png`（192px / 62KB）に差し替え |
| `sns-line.png` | 22 KB | 参照なし |
| `x_logo.svg` | 430 B | 参照なし（X のロゴは `public/sns-x.png` を使用中） |
| `menu.tsx` | 11 KB | 旧ナビゲーション（React）。`SiteHeader.astro` に置き換え（`docs/specs/001-site-header`） |
| `MenuLayout.astro` | 680 B | `menu.tsx` を右カラムに置く旧3カラムレイアウト。ヘッダーの上部固定化で不要に |
| `index.css` | 509 B | `menu.tsx` だけが読み込んでいた。フォントは `Layout.astro` の `<link>` で読み込み済み、`font-noto-*` クラスは未使用 |

再び使う場合は、画像は `public/` に、コードは `src/` に戻してください。
