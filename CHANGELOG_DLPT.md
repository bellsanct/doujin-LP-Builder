# .dlpt 一時保存機能 - 変更ログ

## 実装日: 2025-12-03

### 概要

`.dlpt` ファイルに編集内容を保存し、後で編集を再開できる一時保存機能を実装しました。

---

## 追加された機能

### 1. 保存機能（ダウンロード）

**UI**: 「保存」ボタンをヘッダーに追加

**動作**:
- 現在の編集内容を `.dlpt` ファイルとしてダウンロード
- ファイル名: `{templateId}_draft.dlpt`
- ユーザーの編集内容が `config.user.json` として含まれる

### 2. 復元機能

**動作**:
- `.dlpt` ファイルを開いた際、`config.user.json` が存在すれば自動で復元
- 存在しない場合は `config.default.json` を使用（従来の動作）

### 3. メタデータ記録

**動作**:
- 保存日時、テンプレートID、Builderバージョンを記録
- `.dlpt-metadata.json` として含まれる

---

## 変更されたファイル

### 新規作成

1. **`builder/src/renderer/src/utils/templateSaver.ts`**
   - 保存機能の実装
   - `saveTemplateWithUserConfig()` 関数

2. **`docs/DLPT_FORMAT.md`**
   - `.dlpt` ファイル形式の完全な仕様書
   - 使用例とトラブルシューティング

### 更新

1. **`builder/src/renderer/src/utils/webTemplateLoader.ts`**
   - `SerializedTemplate` インターフェースに `userConfig` と `metadata` を追加
   - `config.user.json` と `.dlpt-metadata.json` の読み込み処理を追加

2. **`builder/src/renderer/src/App.tsx`**
   - 「保存」ボタンの追加
   - `handleSave()` 関数の実装
   - `handleTemplateOpen()` で `userConfig` を優先的に使用するように変更
   - `Save24Regular` アイコンのインポート

---

## .dlpt ファイル構造

### テンプレート配布用（従来通り）

```
template.dlpt
├── manifest.json
├── schema.json
├── config.default.json
├── index.html
├── style.css
└── assets/
```

### 作業中プロジェクト（新機能）

```
project_draft.dlpt
├── manifest.json
├── schema.json
├── config.default.json
├── config.user.json       ← 追加
├── .dlpt-metadata.json    ← 追加
├── index.html
├── style.css
└── assets/
```

---

## 使用方法

### 保存

1. テンプレートを開いて編集
2. ヘッダーの「保存」ボタンをクリック
3. `{templateId}_draft.dlpt` がダウンロードされる

### 再開

1. 保存した `.dlpt` ファイルを開く
2. 前回の編集状態が自動で復元される
3. 編集を続行

---

## 技術詳細

### 保存処理フロー

```
1. ユーザーが「保存」ボタンをクリック
2. saveTemplateWithUserConfig() が呼ばれる
3. JSZip でテンプレートファイル + config.user.json + metadata を圧縮
4. Blob を生成
5. ダウンロードリンクを作成してクリック
6. {templateId}_draft.dlpt としてダウンロード
```

### 読み込み・復元フロー

```
1. ユーザーが .dlpt ファイルを開く
2. loadTemplateFromBlob() で解凍
3. config.user.json の有無を確認
4. App.tsx の handleTemplateOpen() で判定
   - userConfig 存在 → userConfig を使用
   - userConfig なし → defaultConfig を使用
5. フォームに値を設定
6. プレビュー表示
```

### データ構造

**SerializedTemplate**:
```typescript
interface SerializedTemplate {
  filePath: string;
  manifest: any;
  schema: any;
  defaultConfig: any;
  userConfig?: any;        // 追加
  metadata?: any;          // 追加
  template: string;
  styles: string;
  scripts: string;
  assets: SerializedTemplateAsset[];
}
```

**Metadata**:
```typescript
{
  version: string;         // "1.0.0"
  savedAt: string;         // ISO 8601
  builderVersion: string;  // "1.0.0"
  templateId: string;      // "clearly-memory"
  type: string;            // "work-in-progress"
}
```

---

## 互換性

### 後方互換性

- ✅ 古い `.dlpt` / `.zip` ファイルは引き続き動作
- ✅ `config.user.json` がなければ `config.default.json` を使用
- ✅ `.dlpt-metadata.json` はオプション

### .zip との互換性

- ✅ `.zip` と `.dlpt` は内部構造が同じ
- ✅ 相互にリネームして使用可能

---

## テスト項目

- [ ] 新規テンプレートを開いて保存
- [ ] 保存したファイルを再度開いて編集内容が復元される
- [ ] 古い `.dlpt` ファイルが正常に開ける
- [ ] 保存ボタンがWeb版でもElectron版でも動作
- [ ] ファイル名が正しく生成される
- [ ] 日本語の設定値が正しく保存・復元される
- [ ] アセット（画像）が正しく含まれる

---

## 今後の改善案

- [ ] 自動保存機能（LocalStorage）
- [ ] 保存履歴の管理
- [ ] ファイル名のカスタマイズ
- [ ] 保存前のプレビュー
- [ ] クラウドストレージ連携
