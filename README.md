# Criclify

同人サークルのためのホームページビルダー

**Criclify**（サークリファイ）は、同人サークルが簡単にプロフェッショナルなランディングページ（LP）を作成できる、デスクトップアプリケーションです。テンプレートを選んで設定を変更するだけで、美しいWebサイトが完成します。

## 特徴

- 🎨 **テンプレート選択**: 6種類のプロ品質なテンプレートを標準搭載
- ⚙️ **直感的な設定UI**: Schema-Driven UIで自動生成される設定フォーム
- 👁️ **リアルタイムプレビュー**: 変更内容を即座に確認
- 📦 **ワンクリックビルド**: 完成したサイトをZIPファイルとして出力
- 🌍 **多言語対応**: 日本語/英語のUIをサポート
- 🎯 **DLPT形式**: 独自のDoujin Landing Page Templateフォーマット

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
│   │   │       │   ├── TemplateOpener.tsx
│   │   │       │   ├── ConfigEditor.tsx
│   │   │       │   ├── PreviewPane.tsx
│   │   │       │   └── I18nProvider.tsx
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
│   │       ├── template.ts
│   │       ├── schema.ts
│   │       └── ipc.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── templates/            # LPテンプレート集 (DLPT形式)
│   ├── clearly-memory.dlpt  # クリアメモリー（透明感のあるデザイン）
│   ├── gothic.dlpt          # ゴシック（ダークで重厚な雰囲気）
│   ├── minimal.dlpt         # ミニマル（シンプルで洗練されたデザイン）
│   ├── miyabi.dlpt          # 雅（和風の優雅なデザイン）
│   ├── nocturne.dlpt        # ノクターン（夜をイメージした落ち着いた雰囲気）
│   └── simple-serif.dlpt    # シンプルセリフ（読みやすいセリフ体）
│
├── docs/                 # ドキュメント
│   ├── DLPT_FORMAT.md            # DLPT形式の仕様書
│   ├── QUICKSTART.md             # クイックスタートガイド
│   ├── README_TEMPLATE_SYSTEM.md # テンプレートシステムの詳細
│   ├── MOBILE_POSITIONING_SPEC.md # モバイル対応仕様
│   ├── LLM_PROMPT_COMPLETE.md    # LLMプロンプト完全版
│   └── schema-template.json      # スキーマテンプレート
│
└── output/              # ビルド出力ディレクトリ
```

## 現在の進捗

### ✅ 完了 (Phase 1 & 2)

**LP Builder v1.0 基本機能**:
- [x] Electron + React + TypeScript セットアップ
- [x] テンプレート選択UI (TemplateSelector)
- [x] 既存テンプレート読み込み (TemplateOpener)
- [x] 設定編集UI (ConfigEditor)
- [x] リアルタイムプレビュー (PreviewPane)
- [x] 多言語対応 (日本語/英語)
- [x] ZIPビルド機能 (templateSaver)
- [x] Fluent UI 2 デザインシステム

**DLPTフォーマット** (#7):
- [x] DLPT形式のサポート
- [x] テンプレートの.dlpt形式への移行
- [x] DLPTバリデーション機能
- [x] エラーメッセージの日本語化

**Hero画像フォーカル調整機能** (#9, #10):
- [x] Hero画像のフォーカルポイント調整スライダー
- [x] X/Y軸の独立制御
- [x] リセットボタン
- [x] 全テンプレートへの適用

**テンプレート** (6種類):
- [x] Clearly Memory (透明感のあるデザイン)
- [x] Gothic (ダークで重厚な雰囲気)
- [x] Minimal (シンプルで洗練されたデザイン)
- [x] Miyabi (和風の優雅なデザイン)
- [x] Nocturne (夜をイメージした落ち着いた雰囲気)
- [x] Simple Serif (読みやすいセリフ体)

### 🚧 進行中 (Phase 2)
- [ ] ビルド機能の改善
  - [x] 基本的なZIPエクスポート
  - [ ] アセット最適化
  - [ ] エラーハンドリング強化

### 📋 予定 (Phase 3)
- [ ] ビルダー機能拡張
  - [ ] テンプレートプラグインシステム
  - [ ] カスタムウィジェット追加
  - [ ] プロジェクト保存/読み込み
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
cd doujin-LP-Builder

# ビルダーの依存関係をインストール
cd builder
npm install

# 開発サーバー起動
npm run dev
```

### LP Builderの使い方

#### 1. テンプレートを選択

1. LP Builderを起動
2. 「新規プロジェクト」タブでテンプレートを選択
   - Clearly Memory: 透明感のあるデザイン
   - Gothic: ダークで重厚な雰囲気
   - Minimal: シンプルで洗練されたデザイン
   - Miyabi: 和風の優雅なデザイン
   - Nocturne: 夜をイメージした落ち着いた雰囲気
   - Simple Serif: 読みやすいセリフ体
3. または「テンプレート読み込み」タブで既存のDLPTファイルを読み込み

#### 2. 設定を編集

Schema-Driven UIにより、テンプレートの設定スキーマに基づいて自動生成されたフォームで編集:

- **基本設定**: タイトル、説明文、URL等
- **デザイン**: 色、背景画像、フォント等
- **Hero画像**: フォーカルポイント調整 (X/Y軸スライダー)
- **コンテンツ**: トラックリスト、作品情報、スタッフ等
- **エフェクト**: 3D傾斜等

#### 3. リアルタイムプレビュー

右側のプレビューペインで変更内容をリアルタイムに確認できます。

#### 4. ビルド・公開

1. プレビューで最終確認
2. 「ビルド」ボタンをクリック
3. 保存先を選択してZIPファイルを生成
4. ZIPを解凍してWebサーバーにアップロード

詳細は [docs/QUICKSTART.md](docs/QUICKSTART.md) をご覧ください。

## テンプレート開発

### DLPT形式について

Criclifyは独自の**DLPT (Doujin Landing Page Template)** 形式を使用しています。DLPTファイルは、テンプレートのすべての構成要素を1つのZIPアーカイブにまとめたものです。

詳細は [docs/DLPT_FORMAT.md](docs/DLPT_FORMAT.md) をご覧ください。

### 新しいテンプレートを作成

DLPTファイルに必要な構成要素:

- `template.json` - テンプレート情報
- `config.schema.json` - 設定スキーマ (JSON Schema)
- `config.default.json` - デフォルト設定
- `index.html` - HTMLテンプレート (Handlebars記法)
- `style.css` - スタイルシート
- `script.js` - JavaScript (オプション)
- `README.md` - ドキュメント

### Schema-Driven UI

テンプレートの設定項目は `config.schema.json` で定義します。
LP Builderは自動的にUIを生成します。

```json
{
  "properties": {
    "yourSetting": {
      "type": "string",
      "title": "あなたの設定",
      "ui:widget": "text",
      "ui:group": "content",
      "ui:order": 10
    }
  }
}
```

対応ウィジェット:
- `text` - テキスト入力
- `textarea` - 複数行テキスト
- `number` - 数値入力
- `switch` - ON/OFF
- `color-picker` - 色選択
- `image-upload` - 画像アップロード
- `date` - 日付選択
- `select` - ドロップダウン
- `radio` - ラジオボタン
- `slider` - スライダー
- `focal-slider` - フォーカルポイント調整スライダー (Hero画像用)
- `array-editor` - 配列編集

詳細は [docs/README_TEMPLATE_SYSTEM.md](docs/README_TEMPLATE_SYSTEM.md) をご覧ください。

## アーキテクチャ

### Schema-Driven UI Generation

```
DLPT Template
  └── config.schema.json
        ↓
LP Builder
  └── Schema Parser
        ↓
  └── UI Generator
        ↓
Dynamic Form UI
```

### Build Process

```
Template + Config
  ↓
Template Engine (Handlebars)
  ↓
HTML Generation
  ↓
CSS Optimization
  ↓
Asset Copy
  ↓
Static Site Output (ZIP)
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
- **UIライブラリ**: Fluent UI 2 (@fluentui/react-components)
- **状態管理**: Zustand 4
- **テンプレートエンジン**: Handlebars 4
- **バリデーション**: AJV 8 (JSON Schema validator)
- **ZIPライブラリ**: JSZip, ADM-ZIP

**Templates**:
- HTML + CSS + JavaScript (Vanilla)
- Handlebars記法

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

### Phase 2: 機能拡張 🚀 (進行中)
- [x] DLPTフォーマット (#7)
  - [x] DLPT形式のサポート
  - [x] テンプレート移行
  - [x] バリデーション機能
- [x] Hero画像フォーカル調整 (#9, #10)
  - [x] X/Y軸スライダー
  - [x] リセット機能
  - [x] 全テンプレート対応
- [x] テンプレート拡充 (6種類)
- [ ] ビルド機能改善
  - [x] 基本的なZIPエクスポート
  - [ ] アセット最適化
  - [ ] エラーハンドリング強化

### Phase 3: エコシステム 📋 (予定)
- [ ] ビルダー機能
  - [ ] プロジェクト保存/読み込み
  - [ ] テンプレートプラグインシステム
  - [ ] カスタムウィジェット
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
- [テンプレートシステム](docs/README_TEMPLATE_SYSTEM.md)
- [モバイル対応仕様](docs/MOBILE_POSITIONING_SPEC.md)
- [LLMプロンプト](docs/LLM_PROMPT_COMPLETE.md)

## サポート

- **GitHub Issues**: [bellsanct/doujin-LP-Builder/issues](https://github.com/bellsanct/doujin-LP-Builder/issues)
- **ドキュメント**: [docs/](docs/)

## 作者

Doujin LP Project Team

---

**Status**: 🚀 Phase 2 In Progress
**Version**: 1.0.0
**Last Updated**: 2025-12-09
