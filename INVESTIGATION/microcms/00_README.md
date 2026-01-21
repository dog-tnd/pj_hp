# microCMS 導入プロジェクト

**ステータス:** 計画完了・開発準備中

---

## 📋 ブランチ戦略

```
main (GitHub Pages 本番)
  ↑
develop (開発ブランチ)
  ├─ task/1.1-setup-microcms
  ├─ task/1.2-api-schema
  ├─ task/2.1-astro-integration
  └─ ... 各タスク用ブランチ
```

### ブランチルール

1. **開発開始時**

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b task/X.X-taskname
   ```

2. **タスク完了時**

   ```bash
   git add .
   git commit -m "feat/fix: タスク説明"
   git push origin task/X.X-taskname
   # GitHub で PR を開く → develop にマージ
   ```

3. **本番リリース時**
   - すべてのタスクが develop にマージされた後
   - `develop` → `main` へマージ
   - 自動デプロイ（GitHub Pages 更新）

---

## 📚 ドキュメント

### チーム共有向け

- **EXECUTION_PLAN.md** - スケジュール・フェーズ概要・成功基準
- **MIGRATION_PLAN.md** - 詳細なタスク手順書

## 🚀 実行フロー

1. **初回（計画段階）**
   - `EXECUTION_PLAN.md` でスケジュール確認
2. **開発中**
   - `MIGRATION_PLAN.md` で詳細手順確認
   - `task/*` ブランチでタスク実装
   - PR → develop マージ

3. **完了後**
   - develop → main へマージ
   - GitHub Pages 自動更新

---

**Notes:**

- GitHub Pages にテスト環境なし → develop で直接開発
- ドキュメントはこのフォルダで一元管理
