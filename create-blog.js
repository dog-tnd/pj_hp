#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// シンプルなreadlineインターフェース
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// ファイル名のバリデーション
function validateFilename(filename) {
  if (!filename || filename.trim() === "") {
    return false;
  }
  const invalidChars = /[<>:"/\\|?*]/;
  return !invalidChars.test(filename);
}

// ブログテンプレート
const template = `---
title: ""
description: ""
author: ""
role: ""
authorImage: ""
date: ""
image: ""
tags: []
---

# 見出し1
## 見出し2
### 見出し3
- 箇条書き
**太文字**


---


`;

async function createBlogPost() {
  console.log("🚀 新しいブログ記事を作成します");
  console.log("");
  console.log("ファイル名(URL)は後から変更できます");

  try {
    let filename = "";
    while (!filename) {
      const input = await askQuestion(
        "ファイル名を入力してください（拡張子なし）: "
      );
      if (validateFilename(input.trim())) {
        filename = input.trim();
      } else {
        console.log("❌ 無効なファイル名です。もう一度入力してください。");
      }
    }

    // 出力先のパスを構築
    const outputPath = path.join(
      __dirname,
      "src",
      "content",
      "blog",
      `${filename}.md`
    );

    // ディレクトリが存在しない場合は作成
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // ファイルが既に存在する場合は確認
    if (fs.existsSync(outputPath)) {
      const overwrite = await askQuestion(
        `ファイル "${filename}.md" は既に存在します。上書きしますか？ (y/N): `
      );
      if (
        overwrite.toLowerCase() !== "y" &&
        overwrite.toLowerCase() !== "yes"
      ) {
        console.log("❌ ファイル作成をキャンセルしました");
        rl.close();
        return;
      }
    }

    // ファイルを作成
    fs.writeFileSync(outputPath, template);

    console.log("");
    console.log("✅ ブログのテンプレートが正常に作成されました！");
    console.log(`📁 ファイルパス: ${path.relative(process.cwd(), outputPath)}`);
    console.log("");
    console.log("📝 次のステップ:");
    console.log(
      "1. 作成されたファイルを開いてメタデータとタイトルを設定しましょう"
    );
    console.log("2. 記事を書き始めましょう");
  } catch (error) {
    console.error("❌ エラーが発生しました:", error.message);
  }

  rl.close();
}

createBlogPost();
