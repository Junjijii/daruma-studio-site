# Claude Code ガイド

## プロジェクト状態
- 作業開始前に `PROJECT_STATUS.md` を必ず読むこと
- 作業開始前に GitHub の Issue・PR も確認すること（`gh issue list`、`gh pr list`）
- 作業完了時に `PROJECT_STATUS.md` を更新すること

## コミットルール
- コミットメッセージの末尾に `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>` を付与
- 何を変更したか・なぜ変更したかを明記

## 行き詰まり時
- 同じエラーに対して2回修正を試みて解決しない場合:
  1. `PROJECT_STATUS.md` の「現在の問題」セクションに状況を記録
  2. 試したこと・エラー内容を具体的に書く
  3. ユーザーに「Codexへの引き継ぎを推奨」と伝える

## このプロジェクト固有のガイド
- インスピレーション: Pretext by Cheng Lou（chenglou.me/pretext）
- テキスト主導のレイアウト、DOM測定の最小化
- vanilla TypeScript + Vite（フレームワークなし）
- Spring physicsアニメーション自前実装
