# 「プログラミングサークル」検索での AI による概要対策 design

対象はフェーズ1（main・`<head>` のみ）。フェーズ2は requirements.md の方針節を参照。

## UI
画面の見た目は変えない。変更は `<head>` の中（`<title>`・`<meta>`・JSON-LD）だけ。

## 構造化データ（`src/layouts/Layout.astro`）
既存の `Organization` 単体の JSON-LD を、次の `@graph` に置き換える。全ページ共通。

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://tus-tnd.com/#organization",
      "name": "TND",
      "alternateName": [
        "東京理科大学プログラミングサークルTND",
        "TND 東京理科大学プログラミングサークル"
      ],
      "description": "東京理科大学の学生によるプログラミングサークル。野田キャンパスを拠点に2024年に設立し、約40名が所属。Web開発・デザイン・データサイエンスの3チームに分かれ、週1回の勉強会やハッカソンで実践的に学んでいる。メンバーの9割は大学からプログラミングを始めた。",
      "url": "https://tus-tnd.com/",
      "logo": { "@type": "ImageObject", "url": "https://tus-tnd.com/logo.png", "width": 192, "height": 192 },
      "foundingDate": "2024",
      "location": {
        "@type": "Place",
        "name": "東京理科大学 野田キャンパス",
        "address": {
          "@type": "PostalAddress",
          "addressRegion": "千葉県",
          "addressLocality": "野田市",
          "addressCountry": "JP"
        }
      },
      "knowsAbout": ["プログラミング", "Web開発", "フロントエンド", "バックエンド", "UI/UXデザイン", "データサイエンス", "機械学習", "ハッカソン"],
      "sameAs": [
        "https://x.com/TokyorikaND",
        "https://github.com/dog-tnd"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://tus-tnd.com/#website",
      "name": "TND",
      "alternateName": "東京理科大学プログラミングサークルTND",
      "url": "https://tus-tnd.com/",
      "inLanguage": "ja",
      "publisher": { "@id": "https://tus-tnd.com/#organization" }
    }
  ]
}
```

- **非公認（D3）**：`memberOf`（既存）を外す。大学との関係は `location`（活動場所）と説明文の「東京理科大学の学生による」で表す
- **説明文の各事実の表示箇所**：設立年・40名 → トップ／野田キャンパス・3チーム・勉強会・ハッカソン・9割 → about／週1回 → FAQ（FAQ の改修でこの記述が消えたら、説明文からも外す）
- **所在地**：番地は書かない（キャンパスの住所はサークルの連絡先ではないため）。市区町村までにする
- **sameAs**：X と GitHub だけにする。Discord の招待 URL は失効・変更があり、組織のプロフィールとして弱いため外す
- **email は入れない**：お問い合わせページでメールアドレスをわざと崩して表示しているため
- **値の持ち方**：JSON-LD は frontmatter でオブジェクトとして組み、`JSON.stringify(...).replace(/</g, "\\u003c")` を `<script type="application/ld+json" is:inline set:html={...}>` で出力する（`[slug].astro` と同じ方式）。手書き JSON の構文ミスと、文字列中の `</script>` で script が閉じる事故を防ぎ、`siteURL` 定数を使い回すため

## meta（`Layout.astro`）
- `og:locale` = `ja_JP` を追加
- Twitter カード：`property="twitter:*"` → `name="twitter:*"`（X の仕様どおり）。X が定義していない `twitter:url` は削除
- 既定の `description` を次に変更：
  > TNDは東京理科大学野田キャンパスで活動するプログラミングサークルです。2024年設立、約40名のメンバーがWeb開発・デザイン・データサイエンスを勉強会やハッカソンで実践的に学んでいます。

## ページごとの meta
| ページ | title | description |
|---|---|---|
| `/` | 東京理科大学のプログラミングサークル TND \| 初心者歓迎・Web開発・データサイエンス | TNDは東京理科大学野田キャンパスで活動するプログラミングサークルです。2024年設立、メンバーは約40名で、9割が大学からプログラミングを始めました。Web開発・デザイン・データサイエンスを勉強会やハッカソンで実践的に学べます。 |
| `/about` | （変更なし）私たちについて \| プログラミングサークル TND | 東京理科大学のプログラミングサークルTNDの紹介です。勉強会・ハッカソンなどの活動、Web開発・デザイン・データサイエンスの3チーム、会費（年4000円）、入会方法（毎年4〜5月に募集）をまとめています。 |
| `/faq` | （変更なし） | プログラミングサークルTND（東京理科大学）へのよくある質問。初心者でも参加できるか、所属している学科、学べる内容、勉強会の頻度（週1回）、入会の時期（毎年4〜5月）などに答えます。 |
| `/contact` | （変更なし） | 東京理科大学のプログラミングサークルTNDへのお問い合わせ先です。メールまたはX（旧Twitter）で受け付けており、急ぎの連絡はXのDMにお願いしています。 |
| `/blog` | （変更なし） | 東京理科大学のプログラミングサークルTNDのテックブログ。メンバーが書いたプログラミングやWeb開発の技術記事、イベントなどの活動報告を掲載しています。 |

- 説明文の字数は70〜120字。字数を埋めるために事実を足さない
- 人数は「約40名」と書く（D3）。トップ本文の「40名」との表記揺れはフェーズ2で揃える
- トップの title は「プログラミングサークル」を前に寄せる。区切りは他ページと同じ「 | 」。`og:site_name` は既存のまま（「TND - 東京理科大学プログラミングサークル」）

## FAQPage
フェーズ1では出力しない（D4）。FAQ の改修後に、表示と同じデータから生成する（フェーズ2・#74）。
補足：2023年以降、FAQ のリッチリザルトは政府・医療系サイトに限られている。出力する目的はリッチリザルトではなく、質問と答えの組を機械に正確に渡すこと。

## 既存コードとの関係
| ファイル | 変更 | 他 PR との関係 |
|---|---|---|
| `src/layouts/Layout.astro` | head の JSON-LD・meta | develop で大きく整形済み。develop 取り込み時に head 部分の衝突解消が要る |
| `src/pages/index.astro` | `<Layout>` の title・description | develop と衝突（props 部分のみ） |
| `src/pages/about/index.astro` | `<Layout>` に description 追加 | PR #69（develop 向け）と1行衝突 |
| `src/pages/faq/index.astro` | `<Layout>` に description 追加 | develop と1行衝突 |
| `src/pages/contact/index.astro` `src/pages/blog/index.astro` | `<Layout>` に description 追加 | develop と1行衝突 |

衝突は head・props の局所的なものに限る。develop を main に取り込む PR で、本 PR の内容を develop 側に適用し直す。

## 検証
- `pnpm build`（`astro check` 含む）
- `dist/` の全 HTML から JSON-LD を取り出して `JSON.parse` できるかをスクリプトで確認
- 変更前後のビルド結果で全ページの `<body>` を比べ、見た目が変わっていないことを確認（head だけの変更のため、本文の HTML が同じなら見た目も同じ）
- 公開後（人間）：Google の[リッチリザルト テスト](https://search.google.com/test/rich-results)と [Schema Markup Validator](https://validator.schema.org/) でトップを確認
