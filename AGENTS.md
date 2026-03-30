# Codex ガイド

## プロジェクト状態
- 作業開始前に `PROJECT_STATUS.md` を必ず読むこと
- 作業開始前に GitHub の Issue・PR も確認すること
- 作業完了時に `PROJECT_STATUS.md` を更新すること

## コミットルール
- コミットメッセージの末尾に `Co-Authored-By: OpenAI Codex <noreply@openai.com>` を付与
- 何を変更したか・なぜ変更したかを明記

## 行き詰まり時
- 同じエラーに対して2回修正を試みて解決しない場合:
  1. `PROJECT_STATUS.md` の「現在の問題」セクションに状況を記録
  2. 試したこと・エラー内容を具体的に書く
  3. PRコメントに「Claude Codeへの引き継ぎを推奨」と記載

## テスト
- 変更後は必ず既存テストを実行すること
- テストが存在する場合、全テストがパスすることを確認

## このプロジェクト固有のガイド
- Pretext（chenglou.me/pretext）の思想を参考にする
- CSSレイアウトへの依存を最小限に、JSでテキスト配置を制御
- フレームワーク不使用（vanilla TS）
- Springアニメーションは自前実装（ライブラリ不使用）
