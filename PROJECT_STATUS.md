# プロジェクトステータス

## 概要
ダルマスタジオのデモサイト。Cheng Lou の Pretext（CSSレイアウトに頼らない動的テキスト配置）に着想を得た、テキスト主導の美しいWebサイト。

## 現在のバージョン / 状態
開発準備中（Phase 1: 設計）

## 協業ステータス
- lead: Claude Code
- executor: Codex
- phase: planning
- handoff_ready: false
- next_owner: Codex
- final_owner: Claude Code
- updated_at: 2026-03-31

## 設計プラン

### コンセプト
Pretextのデモが示す「DOM測定なしの動的テキストレイアウト」の思想を、スタジオのブランドサイトとして表現する。テキストそのものが主役のデザイン。

### インスピレーション元（Pretext デモ）
- **Dynamic Layout**: 障害物を避けるテキストフロー → Hero セクション
- **Editorial Engine**: 複数列フロー + アニメーション → About セクション
- **Masonry**: テキストカードの動的配置 → Works セクション
- **Accordion**: DOM測定なしの展開/折畳み → Services セクション
- **Bubbles**: タイトな複数行バブル → Contact/CTA

### ページ構成（シングルページ）

```
1. Hero        — 大きなタイポグラフィが動的に配置されるオープニング
                 "ダルマスタジオ" の文字がスクロールや画面リサイズに反応
2. Philosophy  — 縦書き＋横書きが交差するエディトリアルレイアウト
3. Works       — Masonry グリッドのポートフォリオ
                 ホバーでカードが展開、テキスト情報が流れ込む
4. Services    — Accordion 形式のサービス一覧
                 スムーズなheightアニメーション（spring physics）
5. Contact     — ミニマルなCTAセクション
```

### 技術スタック
- **Vite + TypeScript**（Pretextと同じ精神 — 軽量・フレームワークレス）
- **vanilla DOM操作**（React等は使わない、Pretext流）
- **CSS最小限** — レイアウトはJSで制御、CSSはベース装飾のみ
- **Spring Physics** — 自前の軽量springアニメーション（requestAnimationFrame）
- **Vercelデプロイ**

### ビジュアルスタイル
- 配色: 黒背景 + 白テキスト + 朱色（ダルマの赤）アクセント
- フォント: Noto Sans JP（本文）+ 適切な欧文フォント
- 最小限のグラフィック、テキストが全ての表現を担う

### ファイル構成（予定）
```
daruma-studio-site/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.ts          # エントリポイント
│   ├── style.css         # ベーススタイルのみ
│   ├── sections/
│   │   ├── hero.ts       # 動的タイポグラフィ Hero
│   │   ├── philosophy.ts # エディトリアルレイアウト
│   │   ├── works.ts      # Masonry ポートフォリオ
│   │   ├── services.ts   # Accordion サービス一覧
│   │   └── contact.ts    # CTA
│   ├── layout/
│   │   ├── text-measure.ts  # テキスト計測ユーティリティ
│   │   ├── masonry.ts       # Masonryレイアウト計算
│   │   └── spring.ts        # Springアニメーション
│   └── utils/
│       └── dom.ts         # DOM操作ヘルパー
├── PROJECT_STATUS.md
├── AGENTS.md
├── CLAUDE.md
└── README.md
```

## 直近の変更（最新を上に追記）
| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-03-31 | プロジェクト作成・設計プラン策定 | Claude Code |

## 次にやること
- [ ] Issue #1: プロジェクト初期セットアップ（Vite + TS + 基本構成）
- [ ] Issue #2: テキスト計測 + Springアニメーション基盤
- [ ] Issue #3: Hero セクション実装
- [ ] Issue #4: Philosophy セクション実装
- [ ] Issue #5: Works（Masonry）セクション実装
- [ ] Issue #6: Services（Accordion）セクション実装
- [ ] Issue #7: Contact セクション + 全体仕上げ
- [ ] Vercelデプロイ

## 現在の問題
なし

## 引き継ぎメモ
- from: Claude Code
- to: Codex
- branch: main
- commit: (初期コミット後に記入)
- summary: 設計プラン完了。Codexは Issue #1-2 から着手
- tests: なし（初期段階）

## ファイル構成
上記「ファイル構成（予定）」参照

## テスト方法
```bash
npm run dev    # 開発サーバー
npm run build  # ビルド確認
```

## デプロイ / リリース方法
Vercel にデプロイ（`vercel --prod`）
