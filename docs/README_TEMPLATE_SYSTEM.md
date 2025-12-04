# テンプレート量産システム - 完全ガイド

このドキュメントは、Doujin LP Builder 用のテンプレートを効率的に量産するためのシステムについて説明します。

## システム概要

clearly-memoryテンプレートをベースとした標準仕様により、プロンプトからテンプレートを量産できます。

## 重要なドキュメント

### 1. 技術仕様書
**`template-spec-ja.md`** - テンプレートの技術要件
- 必須ファイル構成
- manifest.json / schema.json / config.default.json 仕様
- Handlebars テンプレート規約
- CSS変数の使用方法

### 2. モバイル対応仕様
**`MOBILE_POSITIONING_SPEC.md`** - モバイル背景位置設定（必須実装）
- 横長画像のモバイル表示問題の解決
- heroPositionY_mobile フィールドの実装方法
- CSS メディアクエリの実装例
- 完全なコード例とチェックリスト

### 3. プロンプト指示書
**`prompt-instructions-ja.md`** - LLM へのテンプレート生成依頼方法
- ChatGPT / Gemini / Claude 対応
- Design Brief の書き方
- 出力要件とチェックリスト
- セクション設計ガイド

### 4. スキーマテンプレート
**`schema-template.json`** - clearly-memory ベースの標準スキーマ
- すべての推奨フィールドを含む
- モバイル対応実装済み
- 新規テンプレート作成時の参考用

## ベーステンプレート

**`templates/clearly-memory.zip`** がリファレンス実装です。

特徴:
- モバイル対応背景位置設定の完全実装
- オーバーレイ色・濃度のカスタマイズ対応
- 同人音楽LP向けの標準的なセクション構成
- プロンプト量産に最適化された設計

## テンプレート作成フロー

### 1. LLM にプロンプトを送信

`prompt-instructions-ja.md` の LLM 依頼テンプレートを使用：

```
あなたは HTML/CSS/JS テンプレートの専門家です。Doujin LP Builder 用テンプレートを作成します。

技術仕様:
- template-spec-ja.md に準拠
- MOBILE_POSITIONING_SPEC.md に準拠（必須）
- リファレンス: docs/schema-template.json

【Design Brief】
- テーマ ID: winter-frost
- テーマ名: Winter Frost
- トーン/スタイル: 冬・雪・クリスタル
- キービジュアル/配色: 青白いグラデーション + 白
...
```

### 2. 出力ファイルを配置

```bash
templates/temp-winter-frost/
  ├── manifest.json
  ├── schema.json
  ├── config.default.json
  ├── index.html
  └── style.css
```

### 3. ビルド前の準備

```bash
cd templates/temp-winter-frost
cp manifest.json template.json
cp schema.json config.schema.json
```

### 4. ビルド

```bash
cd ../../builder
node build-template.js ../templates/temp-winter-frost
```

### 5. リネーム

```bash
cd ../templates
mv temp-winter-frost.zip winter-frost.zip
```

### 6. 検証

- Builder で読み込み
- デフォルト設定でプレビュー確認
- モバイルプレビューで背景位置確認
- 各設定項目の動作確認

## チェックリスト

### 必須実装
- [ ] 5つの必須ファイルが存在
- [ ] schema.json に heroPositionY_mobile フィールド
- [ ] config.default.json に heroPositionY_mobile: "top"
- [ ] index.html に --hero-position-y-mobile CSS変数
- [ ] style.css にモバイル用メディアクエリ
- [ ] JSON が厳密に有効（コメント無し、末尾カンマ無し）

### 品質確認
- [ ] デフォルト設定だけで破綻なく表示
- [ ] 相対パス参照のみ（外部CDN無し）
- [ ] schema の field.id と default のキーが一致
- [ ] index.html の参照と field.id が一致
- [ ] モバイルで背景位置が正しく表示

## 既存テンプレートの更新

既存テンプレートにモバイル対応を追加する場合:

1. テンプレートを解凍
2. `MOBILE_POSITIONING_SPEC.md` に従って4つのファイルを更新
3. ビルドして再パッケージ
4. 動作確認

## トラブルシューティング

### ビルドエラー
- template.json と config.schema.json のエイリアスが作成されているか確認
- JSON の構文エラーをチェック（末尾カンマ、コメント等）

### プレビュー表示崩れ
- schema.json の field.id と config.default.json のキーが一致しているか確認
- index.html の {{変数}} 参照が正しいか確認

### モバイルで背景位置がおかしい
- CSS変数 --hero-position-y-mobile が定義されているか確認
- メディアクエリに !important が付いているか確認
- config.default.json に heroPositionY_mobile が存在するか確認

## 参考リソース

- Handlebars 公式: https://handlebarsjs.com/
- clearly-memory テンプレート: `templates/clearly-memory.zip`
- スキーマ例: `docs/schema-template.json`
- モバイル対応仕様: `docs/MOBILE_POSITIONING_SPEC.md`
