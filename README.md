# Doujin LP System

同人作品向けランディングページ(LP)制作システム

## プロジェクト構成

```
doujin-lp-system/
├── builder/              # LP Builder (デスクトップアプリ)
│   └── (開発中)
│
├── templates/            # LPテンプレート集
│   └── music-album-v1/  # 音楽アルバム用テンプレート v1
│       ├── template.json
│       ├── config.schema.json
│       ├── config.default.json
│       ├── index.html
│       ├── style.css
│       ├── script.js
│       └── README.md
│
└── output/              # ビルド出力ディレクトリ
```

## 現在の進捗

### ✅ 完了
- [x] プロジェクト基本構造
- [x] Music Album Template v1
  - [x] template.json (マニフェスト)
  - [x] config.schema.json (設定スキーマ)
  - [x] config.default.json (デフォルト設定)
  - [x] index.html (HTMLテンプレート)
  - [x] style.css (スタイルシート)
  - [x] script.js (JavaScript)
  - [x] README.md (ドキュメント)

### 🚧 進行中
- [ ] LP Builder (Electronアプリ)
  - [ ] プロジェクト初期化
  - [ ] UI実装
  - [ ] テンプレートエンジン
  - [ ] ビルド機能

### 📋 予定
- [ ] 追加テンプレート
  - [ ] Doujinshi Template (同人誌用)
  - [ ] Game Template (ゲーム用)
  - [ ] Event Template (イベント用)
- [ ] ビルダー機能拡張
- [ ] ドキュメント整備
- [ ] サンプルサイト公開

## 使い方 (予定)

### 1. LP Builderをインストール

```bash
# Windows
./builder-win-x64.exe

# macOS
./builder-mac.app
```

### 2. テンプレートを選択

1. LP Builderを起動
2. 「新規プロジェクト」をクリック
3. テンプレートを選択 (例: Music Album v1)

### 3. 設定を編集

- 基本設定 (タイトル、説明文、URL等)
- デザイン (色、背景画像等)
- コンテンツ (トラックリスト、スタッフ等)
- エフェクト (3D傾斜等)

### 4. ビルド・公開

1. プレビューで確認
2. 「ビルド」をクリック
3. `output/` フォルダに静的ファイルが生成
4. サーバーにアップロード

## テンプレート開発

### 新しいテンプレートを作成

```bash
cd templates/
cp -r music-album-v1 your-template-name
cd your-template-name
```

必要なファイル:
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
- `array-editor` - 配列編集

## アーキテクチャ

### Schema-Driven UI Generation

```
Template
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
Static Site Output
```

## ビジネスモデル

- **LP Builder**: 無料配布
- **テンプレート**: 個別有料販売 (BOOTH等)
- **価格帯**: ¥300-1,500 / テンプレート

## ライセンス

- LP Builder: MIT License
- Templates: 各テンプレートのライセンスに従う
  - Music Album v1: MIT License

## 開発

### 技術スタック

- **LP Builder**: Electron + React + TypeScript
- **Templates**: HTML + CSS + JavaScript (Vanilla)
- **Schema**: JSON Schema Draft-07

### セットアップ

```bash
# Builder開発環境セットアップ (予定)
cd builder/
npm install
npm run dev
```

## コントリビューション

プルリクエスト歓迎!

1. Fork
2. Create Feature Branch
3. Commit Changes
4. Push to Branch
5. Create Pull Request

## ロードマップ

### Phase 1: MVP (現在)
- [x] 基本構造設計
- [x] Music Album Template v1
- [ ] LP Builder v1.0

### Phase 2: 機能拡張
- [ ] 追加テンプレート (3種類)
- [ ] リアルタイムプレビュー強化
- [ ] エクスポート形式追加

### Phase 3: エコシステム
- [ ] テンプレートマーケットプレイス
- [ ] コミュニティギャラリー
- [ ] プラグインシステム

## サポート

- **ドキュメント**: [準備中]
- **GitHub Issues**: [準備中]
- **Twitter**: [@your_account]

## 作者

Doujin LP Project Team

---

**Status**: 🚧 Prototype Development
**Version**: 0.1.0
**Last Updated**: 2024-12-01
