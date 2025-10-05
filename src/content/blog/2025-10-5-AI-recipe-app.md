---
title: "AIレシピアプリを作った話"
description: "Gemini APIを使用してAIが食材をもとにレシピを考案してくれるWebアプリを作成"
author: "KukimiCan"
role: "Webチームメンバー"
authorImage: "https://avatars.githubusercontent.com/u/148322666?v=4"
date: "2025.10.05"
image: "/blog/2025-10-03/thumbnail.jpg"
tags: ["Gemini", "React"]
---

## Gemini APIを利用したら驚くほど簡単にアプリができた話

### 初めまして

こんにちは，今年TNDに参加したIS(情報計算科学科)1年のKukimiCanです．\
この間Geminiの大学生向け無料枠に加入したので，どうせならふんだんに使ってやろうと思い，APIを利用してレシピ考案アプリを作りました．少し紹介させてください．

### Gemini Proが大学生なら無料！？

Googleが，大学生を対象に，Gemini Proが1年間無料で使用できるプランを提供しています（いました）．\
ただ，申込期限が2025/10/6までなのでおそらくこの記事が皆さんの目に留まるころには時すでに遅しでしょう．\
（もともと6/30までだったのが10/6まで延長されたので，もしかしたらまた延長されるのかもしれない...?）

### 概要

親がしばらく家を空け，自分で食事のメニューを考えて作らねばならない期間がありました．自分は料理初心者なので，レシピサイトを見ながら材料を買って帰り，あたふたしながら調理をしていたわけですが，冷蔵庫にある食材や，調味料がかみ合わないときに悲しい思いをしていました．そこで．現在ある食材をもとにAIがレシピを提案してくれるアプリを作ることを思い立ちました．なるべくシンプルで，無駄のないようなデザインを心掛けて，我ながらいいものができたと思います．

制作時間は実に2時間，夕食前にGeminiに手伝ってもらいながら爆速で完成させました．\
サイト制作のフロントエンドにおいて使用したのは

- vite
- React
- TailwindCSS

といったフレームワークであり，これらはTNDのWebチームの活動で触れたものでした．
バックエンドの実装はほぼなく，Gemini APIにプロンプトを直接投げる形をとりました．

APIにリクエストを投げる部分の実装はこのような感じです．（かなり省略）

```js
const apiKey = import.meta.env.VITE_GEMINI_API_KEY; // 環境変数からAPIキーを取得
const genAI = new GoogleGenerativeAI(apiKey); // インスタンスを作成
const selectedModel = genAI.getGenerativeModel({ model }); // モデルを選択

const prompt = カスタマイズされたプロンプト; // 材料，テイスト，出力形式の指定など

// 出力結果の取得
const result = await selectedModel.generateContent(prompt);
const response = await result.response;
```

レスポンシブデザインになっており，スマートフォンでも快適な使用ができます．
実際に動作する様子はこちらです．（スマートフォンの画面）

![スマホでアプリが動いている様子](/blog/2025-10-05/sample.gif)


### おわりに

本当はいろいろな人に使ってもらいたかったのですが，セキュリティが甘々なのでまだ公開はしません．\
良かったら皆さんも便利なAPIを使って自作アプリで生活を豊かにしてみましょう．