# Criclify

同人サークルのためのホームページビルダー

**Criclify**（サークリファイ）は、同人サークルが簡単にプロフェッショナルなランディングページ（LP）を作成できる、デスクトップアプリケーションです。ブロックを組み合わせて自由にレイアウトを構築し、美しいWebサイトが完成します。

## 特徴

- 🧱 **ブロックベースエディタ**: ドラッグ&ドロップで直感的なページ構築
- 🎨 **プロ品質テンプレート**: 2種類のテンプレートを標準搭載（拡張可能）
- 📦 **自己完結型フォーマット**: すべての設定・CSS・コンテンツを1つの.dlptファイルに内包
- 👁️ **リアルタイムプレビュー**: 変更内容を即座に確認
- 🎯 **多様なブロックタイプ**: Hero、Tracklist、Release、Credits など18種類のブロック
- 🌍 **多言語対応**: 日本語/英語のUIをサポート
- 💾 **ワンクリックビルド**: 完成したサイトをZIPファイルとして出力

## アーキテクチャ

### ブロックベースシステム (v2.0.0)

Criclifyは**ブロックベースのテンプレートシステム**を採用しています。各ページは複数のブロックで構成され、ブロックごとに設定とコンテンツを持ちます。

```
Project (.dlpt)
├── version: "2.0.0"
├── template: テンプレートID
├── templateCSS: CSS全体（文字列）
├── globalSettings
│   ├── colors (primary, accent, etc.)
│   ├── typography (fonts, sizes)
│   └── layout (maxWidth, gutter)
└── blocks[]
    ├── Block 1 (hero)
    ├── Block 2 (heading)
    ├── Block 3 (release)
    ├── Block 4 (tracklist)
    └── ...
```

### 利用可能なブロックタイプ

| ブロックタイプ | 説明 | 用途 |
|--------------|------|------|
| `hero` | ヒーローセクション | トップの大きな背景画像付きセクション |
| `heading` | 見出し | セクション見出し |
| `text` | テキスト | プレーンテキストコンテンツ |
| `image` | 画像 | 単一画像表示 |
| `gallery` | ギャラリー | 複数画像のギャラリー表示 |
| `video` | 動画 | YouTube/Vimeo埋め込み |
| `audio` | 音声 | 音声プレイヤー |
| **`release`** | **リリース情報** | **ジャケット+アルバム情報+ショップリンク統合（推奨）** |
| `tracklist` | トラックリスト | アルバム収録曲リスト |
| `credits` | クレジット | 制作スタッフ・参加者クレジット |
| `shop-links` | ショップリンク | BOOTH/Bandcamp等のリンクボタン（⚠️非推奨） |
| `button` | ボタン | CTA/アクションボタン |
| `divider` | 区切り線 | セクション区切り |
| `spacer` | スペーサー | 空白スペース |
| `columns` | カラム | 2カラムレイアウト |
| `embed` | カスタムHTML | 自由なHTML埋め込み |
| `blockquote` | 引用 | 引用ブロック |
| `countdown` | カウントダウン | イベント用カウントダウンタイマー |

**💡 推奨**: アルバムLP用途では、`release`ブロックの使用を強く推奨します。ジャケット画像・アルバム詳細・ショップリンクを一箇所にまとめることで、視覚的に統一感のあるリリース情報セクションを作成できます。

## プロジェクト構成

```
doujin-lp-system/
├── builder/              # LP Builder (Electronアプリ)
│   ├── src/
│   │   ├── main/        # Electronメインプロセス
│   │   │   ├── index.ts
│   │   │   ├── templateLoader.ts
│   │   │   ├── logger.ts
│   │   │   └── i18n.ts
│   │   ├── renderer/    # Reactレンダラープロセス
│   │   │   └── src/
│   │   │       ├── App.tsx
│   │   │       ├── components/
│   │   │       │   ├── TemplateSelector.tsx
│   │   │       │   ├── BlockEditor.tsx       # ブロックエディタ
│   │   │       │   ├── BlockSidebar.tsx      # ブロック設定サイドバー
│   │   │       │   ├── BlockPreview.tsx      # プレビューペイン
│   │   │       │   └── I18nProvider.tsx
│   │   │       ├── blocks/                   # ブロックシステム
│   │   │       │   ├── registry.ts           # ブロックレジストリ
│   │   │       │   └── editors/              # ブロック別エディタ
│   │   │       ├── utils/
│   │   │       │   ├── webTemplateLoader.ts
│   │   │       │   └── templateSaver.ts
│   │   │       └── i18n/
│   │   │           ├── index.ts
│   │   │           ├── ja.ts
│   │   │           └── en.ts
│   │   ├── preload/     # Preloadスクリプト
│   │   │   └── index.ts
│   │   └── types/       # TypeScript型定義
│   │       ├── block-system.ts               # ブロックシステム型定義
│   │       ├── template.ts
│   │       ├── schema.ts
│   │       └── ipc.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── templates/            # LPテンプレート集 (DLPT形式)
│   ├── gothic/
│   │   ├── template.json                     # Project型 (v2.0.0)
│   │   └── README.md
│   ├── etherial_glass/
│   │   ├── template.json
│   │   └── README.md
│   └── ...
│
├── docs/                 # ドキュメント
│   ├── DLPT_FORMAT.md                        # DLPT形式の仕様書
│   ├── LLM_TEMPLATE_GENERATION_GUIDE.md      # テンプレート生成ガイド（ブロックシステム版）
│   ├── QUICKSTART.md                         # クイックスタートガイド
│   ├── README_TEMPLATE_SYSTEM.md             # テンプレートシステムの詳細
│   ├── MOBILE_POSITIONING_SPEC.md            # モバイル対応仕様
│   └── schema-template.json                  # スキーマテンプレート
│
└── output/              # ビルド出力ディレクトリ
```

## 現在の進捗

### ✅ 完了 (Phase 1 & 2)

**LP Builder v2.0 ブロックシステム**:
- [x] Electron + React + TypeScript セットアップ
- [x] ブロックベースエディタ実装 (#27)
  - [x] ブロックレジストリシステム
  - [x] ドラッグ&ドロップによるブロック並び替え
  - [x] ブロック追加/削除/複製機能
  - [x] ブロック別設定エディタ
- [x] 18種類のブロックタイプ実装
- [x] Release ブロック追加（ジャケット+情報+ショップリンク統合）
- [x] リアルタイムプレビュー (BlockPreview)
- [x] 多言語対応 (日本語/英語)
- [x] ZIPビルド機能 (templateSaver)
- [x] Fluent UI 2 + shadcn/ui デザインシステム

**DLPTフォーマット v2.0.0** (#7):
- [x] CSS内包型フォーマット（templateCSSフィールド）
- [x] ブロックベースのデータ構造
- [x] GlobalSettings によるテーマ設定
- [x] 自己完結型 .dlpt ファイル
- [x] DLPTバリデーション機能

**テンプレート** (2種類):
- [x] Gothic (ダークで重厚な雰囲気)
- [x] Etherial Glass (透明感のある洗練されたデザイン)

### 🚧 進行中 (Phase 2)
- [ ] ビルド機能の改善
  - [x] 基本的なZIPエクスポート
  - [ ] アセット最適化
  - [ ] エラーハンドリング強化
- [ ] テンプレート拡充
  - [ ] Minimal (シンプルで洗練されたデザイン)
  - [ ] Miyabi (和風の優雅なデザイン)
  - [ ] Nocturne (夜をイメージした落ち着いた雰囲気)
  - [ ] Simple Serif (読みやすいセリフ体)

### 📋 予定 (Phase 3)
- [ ] ビルダー機能拡張
  - [ ] プロジェクト保存/読み込み
  - [ ] テンプレートプラグインシステム
  - [ ] カスタムブロック追加API
- [ ] 追加テンプレート
  - [ ] Game Template (ゲーム用)
  - [ ] Event Template (イベント用)
- [ ] エコシステム
  - [ ] テンプレートマーケットプレイス
  - [ ] コミュニティギャラリー

## 使い方

### 開発環境でのセットアップ

```bash
# リポジトリをクローン
git clone https://github.com/bellsanct/doujin-LP-Builder.git
cd doujin-lp-system

# ビルダーの依存関係をインストール
cd builder
npm install

# 開発サーバー起動
npm run dev
```

### LP Builderの使い方

#### 1. テンプレートを選択

1. LP Builderを起動
2. テンプレートを選択
   - Gothic: ダークで重厚な雰囲気
   - Etherial Glass: 透明感のある洗練されたデザイン

#### 2. ブロックを編集

ブロックベースエディタでページを構築:

- **ブロック追加**: 左サイドバーから追加したいブロックを選択
- **ブロック編集**: 各ブロックをクリックして設定を編集
- **並び替え**: ドラッグ&ドロップでブロックの順序を変更
- **複製/削除**: ブロックごとの操作メニューから実行

#### 3. グローバル設定

全体のデザイン設定を調整:

- **色設定**: primary、accent、background等のカラーパレット
- **タイポグラフィ**: 見出しフォント、本文フォント、サイズスケール
- **レイアウト**: 最大幅、余白

#### 4. リアルタイムプレビュー

右側のプレビューペインで変更内容をリアルタイムに確認できます。

#### 5. ビルド・公開

1. プレビューで最終確認
2. 「ビルド」ボタンをクリック
3. 保存先を選択してZIPファイルを生成
4. ZIPを解凍してWebサーバーにアップロード

詳細は [docs/QUICKSTART.md](docs/QUICKSTART.md) をご覧ください。

## テンプレート開発

### DLPT形式について

Criclifyは独自の**DLPT (Doujin Landing Page Template)** 形式を使用しています。DLPTファイルは、テンプレートのすべての構成要素（CSS、設定、ブロック）を1つのJSONファイルにまとめたものです。

**v2.0.0の主な特徴**:
- ✅ CSS全体を`templateCSS`フィールドに文字列として内包
- ✅ 外部ファイル依存なし（自己完結型）
- ✅ ブロックベースのコンテンツ構造
- ✅ GlobalSettings によるテーマ設定

詳細は [docs/LLM_TEMPLATE_GENERATION_GUIDE.md](docs/LLM_TEMPLATE_GENERATION_GUIDE.md) をご覧ください。

### 新しいテンプレートを作成

#### Project Interface

```typescript
interface Project {
  version: string;              // "2.0.0"
  template: string;             // テンプレートID
  templateCSS: string;          // CSS全体を文字列として内包
  globalSettings: GlobalSettings;
  blocks: Block[];
}
```

#### ブロックの構造

```typescript
interface Block {
  id: string;           // ブロックID（例: "block-1"）
  type: BlockType;      // ブロックタイプ
  order: number;        // 表示順序（0から開始）
  visible: boolean;     // 表示/非表示
  settings: any;        // ブロック固有の設定
  content: any;         // ブロックコンテンツ
  children?: Block[];   // ネストされたブロック（columns等）
}
```

### LLMによるテンプレート生成

`docs/LLM_TEMPLATE_GENERATION_GUIDE.md` を使用して、ChatGPT/Claude/Gemini等のLLMに新しいテンプレートを生成させることができます。

**生成例**:
```
Filename: template.json

{
  "version": "2.0.0",
  "template": "your-template-id",
  "templateCSS": "/* CSS全体 */",
  "globalSettings": { ... },
  "blocks": [ ... ]
}
```

## ビジネスモデル

- **LP Builder**: 無料配布 (オープンソース)
- **テンプレート**: 個別有料販売 (BOOTH等)
- **価格帯**: ¥300-1,500 / テンプレート

## ライセンス

- LP Builder: MIT License
- Templates: 各テンプレートのライセンスに従う

## 開発

### 技術スタック

**LP Builder**:
- **フレームワーク**: Electron 28 + React 18 + TypeScript 5
- **ビルドツール**: Vite 5
- **UIライブラリ**:
  - Fluent UI 2 (@fluentui/react-components)
  - shadcn/ui (Radix UI + Tailwind CSS)
  - Lucide React (アイコン)
- **状態管理**: Zustand 4
- **ドラッグ&ドロップ**: React DnD (予定)
- **バリデーション**: AJV 8 (JSON Schema validator)
- **ZIPライブラリ**: JSZip, ADM-ZIP

**Templates**:
- HTML + CSS + JavaScript (Vanilla)
- CSS内包型（templateCSSフィールド）

**Schema**:
- JSON Schema Draft-07

### 開発コマンド

```bash
cd builder/

# 依存関係インストール
npm install

# 開発サーバー起動（HMR有効）
npm run dev

# レンダラーのみ開発
npm run dev:renderer

# メインプロセスのみビルド＆起動
npm run dev:main

# プロダクションビルド
npm run build

# Electronアプリをパッケージング
npm run package

# Windows向けパッケージング
npm run package:win

# Mac向けパッケージング
npm run package:mac

# Linux向けパッケージング
npm run package:linux
```

## コントリビューション

プルリクエスト歓迎!

1. Fork
2. Create Feature Branch
3. Commit Changes
4. Push to Branch
5. Create Pull Request

## ロードマップ

### Phase 1: MVP ✅ (完了)
- [x] 基本構造設計
- [x] 初期テンプレート開発
- [x] LP Builder v1.0 基本機能
  - [x] テンプレート選択・読み込み
  - [x] Schema-Driven UI
  - [x] リアルタイムプレビュー
  - [x] ZIPビルド機能
  - [x] 多言語対応 (日本語/英語)

### Phase 2: ブロックシステム移行 🚀 (進行中)
- [x] ブロックベースエディタ実装 (#27)
  - [x] ブロックレジストリシステム
  - [x] 18種類のブロックタイプ
  - [x] Release ブロック追加
  - [x] ドラッグ&ドロップ並び替え
- [x] DLPTフォーマット v2.0.0
  - [x] CSS内包型フォーマット
  - [x] ブロックベースデータ構造
  - [x] テンプレート移行ツール
- [x] 既存テンプレートの移行
  - [x] Gothic → v2.0.0形式
  - [x] Etherial Glass → v2.0.0形式
- [ ] テンプレート拡充 (4種類追加予定)
- [ ] ビルド機能改善
  - [x] 基本的なZIPエクスポート
  - [ ] アセット最適化
  - [ ] エラーハンドリング強化

### Phase 3: エコシステム 📋 (予定)
- [ ] ビルダー機能
  - [ ] プロジェクト保存/読み込み
  - [ ] カスタムブロック追加API
  - [ ] テンプレートプラグインシステム
- [ ] 追加テンプレート
  - [ ] Game Template
  - [ ] Event Template
- [ ] コミュニティ
  - [ ] テンプレートマーケットプレイス
  - [ ] ギャラリー
  - [ ] プラグインシステム拡張

## ドキュメント

- [クイックスタート](docs/QUICKSTART.md)
- [DLPT形式仕様](docs/DLPT_FORMAT.md)
- [テンプレート生成ガイド（ブロックシステム版）](docs/LLM_TEMPLATE_GENERATION_GUIDE.md)
- [テンプレートシステム](docs/README_TEMPLATE_SYSTEM.md)
- [モバイル対応仕様](docs/MOBILE_POSITIONING_SPEC.md)

## サポート

- **GitHub Issues**: [bellsanct/doujin-LP-Builder/issues](https://github.com/bellsanct/doujin-LP-Builder/issues)
- **ドキュメント**: [docs/](docs/)

## 作者

Doujin LP Project Team

---

**Status**: 🚀 Phase 2 In Progress (Block System Migration)
**Version**: 2.0.0
**Last Updated**: 2025-12-30
