---
title: "SIGNATE コンペ参戦記録"
description: "「MUFG Data Science Challenge 2025」参戦記録。Public 5位から Private 79位に沈んだ話"
author: "R"
role: "就活大学生"
authorImage: "https://pbs.twimg.com/profile_images/1860328180797833218/CeGWNkcw_400x400.jpg"
date: "2025.09.25"
image: "https://s3.ap-northeast-1.amazonaws.com/production.public.competition.signate.jp/competition/693aed0f148a4bcdb2cfffa85d1588b2/ja/main.png"
tags: ["コンペ", "機械学習", "アンサンブル", "ChatGPT"]
---

# SIGNATE コンペ参戦記録

こんにちは、3CA の R です。
就活の早期化にビビりつつ、インターン特典を狙ってコンペに挑戦したものの、見事に散った話をお届けします。

2025 年夏に開催された MUFG Data Science Challenge 2025 に参加しました。
最終順位は **Public 4 位 → Private 79 位** と悔しい結果に終わりましたが、
学びが多かったのでまとめます。

※ コンペは終了しています

## Public / Private スコアとは

機械学習コンペでは、テストデータが 2 つに分かれています。

- **Public**：コンペ期間中に見えるスコア（テストデータの一部で評価）
- **Private**：最終順位を決めるスコア（残りのテストデータで評価）

Public で良いスコアが出ても、Private で大きく順位が下がることを「**シェイクダウン**」と呼びます。
今回はまさにその典型例でした。

---

## アプローチの全体像

- **ベースライン**

  - CatBoost / LightGBM / XGBoost の 3 本モデルを学習
  - OOF（Out-of-Fold）予測を保存してブレンド・スタッキングに利用

- **工夫した点**

  1. **ロジットブレンド + OOF しきい値最適化**
  2. **スタッキング（Logistic Regression + メタ特徴量 + L1 正則化）**
  3. **複数アンサンブルの多数決提出**

- **失敗した点**
  - CV（交差検証）の分布が Public / Private とズレており、Public に過学習してしまった（CV 弱い問題）

---

## 工夫 1: ロジットブレンド + しきい値最適化

単純平均よりも**ロジット変換して線形結合**が有効でした。
さらに F1 スコアを最大化するしきい値を OOF 上で探索し、Test にはその設定を適用しました。

```python
# ロジット変換
def logit(p, eps=1e-9):
    p = np.clip(p, eps, 1-eps)
    return np.log(p/(1-p))

# F1最適化のしきい値探索
best_thr, best_f1 = best_f1_threshold(y_true, oof_proba)
```

---

## 工夫 2: スタッキング（LR + メタ特徴量 + L1 正則化）

Cat/LGBM/XGB の確率をそのまま使うだけでなく、「確率」「ロジット」「ランク」「統計値」をメタ特徴量として加えました。
さらに Logistic Regression の L1 正則化で不要特徴量を自動で刈り取り、安定性を高めました。

```python
# メタ特徴量の生成
def meta_features(pred_list):
    P = np.vstack(pred_list).T  # 確率
    L = logit(P)                # ロジット
    R = row_ranks(P)            # ランク
    # 統計量（平均、標準偏差、最小・最大値）も追加

# L1正則化でスタッキング
clf = LogisticRegression(penalty="l1", C=2.0, class_weight="balanced")
```

---

## 結果と反省

### 最終スコア

- Public: 0.6616（4 位）
- Private: 0.64 前後（79 位）

### 反省点

- CV の組み方が甘く、Public に最適化しすぎて Private で崩壊
- 特に分布差（train/test, Public/Private）に敏感な F1 評価で痛手

---

## 学び

1. OOF の設計と活用がすべての土台
   → CV 設計を誤ると、Public スコアは当てにならない

2. アンサンブルは「確率 → ロジット」「特徴量の追加」が効く
   → 特に rank 特徴量はシンプルで強力

3. しきい値最適化は必須
   → F1 指標では threshold tuning が最後の仕上げになる

---

## ChatGPT 活用法

今回のコンペでは**ChatGPT を最大限活用**しました。

- **コード自動生成・修正**

  - ロジットブレンド、スタッキング、アルファブレンド、キャリブレーションなどのスクリプトを会話しながら設計・改善
  - エラーが出たときも即座に修正案を提示してもらい、試行サイクルを高速化

- **戦略相談**
  - **次の一手**を ChatGPT に聞きながら、提出回数を無駄にせず進められた
  - ブレンド/スタッキング/キャリブレーションの順序を議論しながら選べた

**所感:**
ChatGPT に手を動かす部分を任せ、自分は意思決定と検証に集中できたのが大きな収穫でした。
特に Kaggle/SIGNATE のように「提出回数制限」がある環境では、効率が段違いに向上します。

---

## まとめ

今回は入賞には届きませんでしたが、

- ロジットブレンド
- スタッキング + メタ特徴量
- OOF ベースのしきい値最適化
- ChatGPT のフル活用

といった工夫で**Public 5 位圏内**を経験できました。

Private 崩壊も含めて、今後の自分や読者にとって貴重な教訓になりました。
次は CV 設計にもっとこだわって挑戦したいと思います。

---

最後まで読んでいただきありがとうございました！
