# unused-assets

どこからも参照されていない画像の退避先です。削除はせず、ここに移動して残しています。
`public/` の外なのでビルド成果物には含まれず、配信もされません。

| ファイル | サイズ | 退避理由 |
| --- | --- | --- |
| `logo.svg` | 2.7 MB | 2560px の PNG を base64 で埋め込んだだけの SVG。48px 表示には過大なため `public/logo.png`（192px / 62KB）に差し替え |
| `sns-line.png` | 22 KB | 参照なし |
| `x_logo.svg` | 430 B | 参照なし（X のロゴは `public/sns-x.png` を使用中） |

再び使う場合は `public/` に戻してください。
