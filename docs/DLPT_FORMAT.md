# .dlpt ファイル形式仕様

## 概要

`.dlpt` (Doujin LP Template) ファイルは、Doujin LP Builder で使用されるテンプレートファイル形式です。

## 2つの用途

### 1. テンプレート配布用 (.zip / .dlpt)

配布用のテンプレートファイル。ユーザーが新規にプロジェクトを開始する際に使用します。

**含まれるファイル**:
```
template.dlpt (または .zip)
├── manifest.json          # テンプレートメタ情報
├── schema.json            # フォームスキーマ
├── config.default.json    # デフォルト設定
├── index.html             # HTMLテンプレート
├── style.css              # スタイルシート
├── script.js              # JavaScript（任意）
└── assets/                # 画像などのアセット
```

### 2. 作業中プロジェクト保存用 (.dlpt)

ユーザーが編集中の状態を保存するためのファイル。後で編集を再開できます。

**含まれるファイル**:
```
project_draft.dlpt
├── manifest.json          # テンプレートメタ情報
├── schema.json            # フォームスキーマ
├── config.default.json    # デフォルト設定
├── config.user.json       # ★ユーザーの編集内容（追加）
├── .dlpt-metadata.json    # ★保存メタ情報（追加）
├── index.html
├── style.css
├── script.js
└── assets/
```

## 新規ファイルの仕様

### config.user.json

ユーザーが編集した設定値を保存します。

**形式**: JSON
**エンコーディング**: UTF-8

**例**:
```json
{
  "siteTitle": "My Custom Album",
  "heroTitle": "ユーザーが編集したタイトル",
  "primaryColor": "#ff5733",
  "tracks": [
    {
      "trackNumber": "01",
      "title": "カスタム曲名1",
      "artist": "アーティスト1",
      "duration": "3:45"
    },
    {
      "trackNumber": "02",
      "title": "カスタム曲名2",
      "artist": "アーティスト2",
      "duration": "4:20"
    }
  ],
  "shopLinks": [
    {
      "label": "BOOTH",
      "url": "https://example.booth.pm"
    }
  ]
}
```

### .dlpt-metadata.json

保存に関するメタ情報を記録します。

**形式**: JSON
**エンコーディング**: UTF-8

**フィールド**:
- `version`: メタデータフォーマットバージョン（現在は "1.0.0"）
- `savedAt`: 保存日時（ISO 8601形式）
- `builderVersion`: Builder のバージョン
- `templateId`: 使用しているテンプレートのID
- `type`: ファイルタイプ（"work-in-progress" または "template"）

**例**:
```json
{
  "version": "1.0.0",
  "savedAt": "2025-12-03T14:30:00Z",
  "builderVersion": "1.0.0",
  "templateId": "clearly-memory",
  "type": "work-in-progress"
}
```

## 読み込み動作

### テンプレート配布用 .dlpt の読み込み

1. `.dlpt` / `.zip` ファイルを読み込み
2. 必須ファイルの存在確認
3. `config.default.json` の値をフォームに読み込み
4. プレビューを表示

### 作業中プロジェクト .dlpt の読み込み

1. `.dlpt` ファイルを読み込み
2. 必須ファイルの存在確認
3. **`config.user.json` の存在を確認**
4. **存在する場合**: `config.user.json` の値をフォームに復元
5. **存在しない場合**: `config.default.json` の値を使用
6. プレビューを表示

## 保存動作

### 「保存」ボタンをクリック時

1. 現在のテンプレートファイルを取得
2. 現在のフォーム入力値を `config.user.json` として追加
3. メタデータを生成して `.dlpt-metadata.json` として追加
4. すべてのファイルを ZIP 形式で圧縮
5. `{templateId}_draft.dlpt` としてダウンロード

## ファイル命名規則

### テンプレート配布用
- `{templateId}.zip` または `{templateId}.dlpt`
- 例: `clearly-memory.zip`, `winter-frost.dlpt`

### 作業中プロジェクト
- `{templateId}_draft.dlpt`
- 例: `clearly-memory_draft.dlpt`, `minimal_draft.dlpt`

## 互換性

### .zip と .dlpt の互換性

`.zip` と `.dlpt` は内部構造が同じため、相互に互換性があります：

- `.zip` ファイルを `.dlpt` にリネームして読み込み可能
- `.dlpt` ファイルを `.zip` にリネームして解凍可能

### バージョン間の互換性

- `config.user.json` がない `.dlpt` ファイルは通常のテンプレートとして動作
- 新しいフィールドが追加されても、既存のフィールドは維持される
- `.dlpt-metadata.json` はオプションで、なくても動作する

## 実装詳細

### 保存処理

実装ファイル: `builder/src/renderer/src/utils/templateSaver.ts`

**処理フロー**:
1. JSZip インスタンスを作成
2. テンプレートファイルを追加（manifest, schema, config.default, HTML, CSS, JS）
3. `config.user.json` を追加
4. `.dlpt-metadata.json` を生成して追加
5. アセットを追加
6. ZIP を生成してダウンロード

### 読み込み処理

実装ファイル: `builder/src/renderer/src/utils/webTemplateLoader.ts`

**処理フロー**:
1. JSZip で `.dlpt` ファイルを解凍
2. 各ファイルを識別して読み込み
   - `config.user.json` → `userConfig` プロパティに格納
   - `.dlpt-metadata.json` → `metadata` プロパティに格納
3. 必須ファイルの存在確認
4. SerializedTemplate オブジェクトを返す

### 復元処理

実装ファイル: `builder/src/renderer/src/App.tsx`

**処理フロー**:
1. テンプレートを読み込み
2. `userConfig` の存在を確認
3. **存在する場合**: `userConfig` を初期値として使用
4. **存在しない場合**: `defaultConfig` を初期値として使用
5. フォームとプレビューを初期化

## 使用例

### ケース1: 新規テンプレートを開く

```
1. ユーザーが clearly-memory.zip を開く
2. config.default.json の値がフォームに読み込まれる
3. ユーザーが編集を開始
4. 「保存」ボタンをクリック
5. clearly-memory_draft.dlpt がダウンロードされる
```

### ケース2: 保存したプロジェクトを再開

```
1. ユーザーが clearly-memory_draft.dlpt を開く
2. config.user.json が検出される
3. 前回の編集内容がフォームに復元される
4. ユーザーが編集を続行
5. 再度「保存」をクリック
6. 新しい clearly-memory_draft.dlpt がダウンロードされる
```

### ケース3: 配布用テンプレートとして保存

```
1. ユーザーがテンプレートを完成させる
2. 「保存」でプロジェクトを保存
3. ファイルを .zip にリネーム
4. config.user.json を config.default.json にリネーム
5. .dlpt-metadata.json を削除
6. 配布用テンプレート完成
```

## トラブルシューティング

### 編集内容が復元されない

**原因**: `config.user.json` が含まれていない

**確認方法**:
```bash
unzip -l project_draft.dlpt | grep config.user.json
```

**解決策**: 「保存」機能を使って保存したファイルを使用

### .dlpt ファイルが開けない

**原因**: ZIP形式が破損している

**確認方法**:
```bash
unzip -t project_draft.dlpt
```

**解決策**: 正常に保存されたファイルを使用

### 古いフィールドが表示される

**原因**: schema.json が更新されていない

**解決策**: 新しいテンプレートを使用するか、schema.json を手動で更新
