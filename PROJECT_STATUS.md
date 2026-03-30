# プロジェクトステータス

## 概要
ダルマスタジオのデモサイト。Cheng Lou の Pretext（CSSレイアウトに頼らない動的テキスト配置）に着想を得た、テキスト主導の美しいWebサイト。

## 現在のバージョン / 状態
開発中（Phase 2: インタラクティブ実装完了）

## 協業ステータス
- lead: Claude Code
- executor: Codex
- phase: review
- handoff_ready: false
- next_owner: Claude Code
- final_owner: Claude Code
- updated_at: 2026-03-31 08:34 JST

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
| 2026-03-31 | Issue #3-7 完了: Hero / Philosophy / Works / Services / Contact を spring 駆動の動的セクションとして実装。smooth scroll、nav highlight、Intersection Observer、Masonry、Accordion を追加 | Codex |
| 2026-03-31 | Issue #2 完了: `text-measure.ts` `spring.ts` `dom.ts` を追加し、Hero に計測と spring 導入 | Codex |
| 2026-03-31 | Issue #1 完了: Vite + TypeScript 初期化、5セクションのベースページと黒背景スタイルを実装 | Codex |
| 2026-03-31 | プロジェクト作成・設計プラン策定 | Claude Code |

## 次にやること
- [x] Issue #1: プロジェクト初期セットアップ（Vite + TS + 基本構成）
- [x] Issue #2: テキスト計測 + Springアニメーション基盤
- [x] Issue #3: Hero セクション実装
- [x] Issue #4: Philosophy セクション実装
- [x] Issue #5: Works（Masonry）セクション実装
- [x] Issue #6: Services（Accordion）セクション実装
- [x] Issue #7: Contact セクション + 全体仕上げ
- [ ] Vercelデプロイ

## 現在の問題
Vercel デプロイは未実施。ローカルでは `npm run build` と `npm run dev` の確認まで完了。

## 引き継ぎメモ
- from: Codex
- to: Claude Code
- branch: main
- commit: pending final commit for Issue #3-7
- summary: Issue #3-7 を一括実装。Hero の文字分解配置、Philosophy の動的多段フロー、Works の予測高さ Masonry、Services の DOM 非依存 Accordion、Contact の散開 CTA、spring smooth scroll / nav / reveal を追加
- tests: `npm run build` 成功、`npm run dev -- --host 127.0.0.1 --port 4173` で配信確認、`curl http://127.0.0.1:4173/` と `curl http://127.0.0.1:4173/src/main.ts` で応答確認

## ファイル構成
上記「ファイル構成（予定）」参照

## テスト方法
```bash
npm run dev    # 開発サーバー
npm run build  # ビルド確認
```

## デプロイ / リリース方法
Vercel にデプロイ（`vercel --prod`）
