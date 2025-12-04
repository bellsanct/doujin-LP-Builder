# テンプレート量産 クイックスタート

## 📝 たった3ステップで新しいテンプレートを生成

### ステップ1: プロンプトを編集

`docs/LLM_PROMPT_COMPLETE.md` を開いて、以下の部分だけ編集：

```markdown
**【ここを編集してください】**

- **テーマ ID**: `winter-frost`（英小文字とハイフン）
- **テーマ名**: Winter Frost
- **カテゴリ**: music
- **トーン/スタイル**: 冬・雪・クリスタル・透明感
- **配色**: 青白いグラデーション + 白 + 淡い青
- **フォント**: サンセリフ + 細めのウェイト
- **特徴**: 冷たくも暖かい冬の雰囲気
```

### ステップ2: LLM に貼り付け

`docs/LLM_PROMPT_COMPLETE.md` の**全文を**コピーして、以下のいずれかに貼り付け：

- ChatGPT (GPT-4)
- Claude (Sonnet/Opus)
- Gemini (Pro/Ultra)

実行すると、5つのファイルが生成されます。

### ステップ3: ビルド

生成されたファイルを保存して、ビルド：

```bash
# 1. ファイルを配置
mkdir templates/temp-winter-frost
# （生成された5ファイルをここに保存）

# 2. エイリアス作成
cd templates/temp-winter-frost
cp manifest.json template.json
cp schema.json config.schema.json

# 3. ビルド
cd ../../builder
node build-template.js ../templates/temp-winter-frost

# 4. リネーム
cd ../templates
mv temp-winter-frost.zip winter-frost.zip
```

完成！ `winter-frost.zip` が Builder で使用できます。

---

## 🎯 編集するポイント

### 最小限の編集（必須）

| 項目 | 説明 | 例 |
|------|------|-----|
| テーマ ID | ファイル名になる | `winter-frost` |
| テーマ名 | UI表示名 | `Winter Frost` |
| トーン/スタイル | デザインの方向性 | `冬・雪・クリスタル` |
| 配色 | 使用する色 | `青白 + 白 + 淡青` |

### 詳細カスタマイズ（任意）

- フォント方針
- モーション・演出
- 特定のセクション構成

---

## ✅ 生成後のチェック

### 1. ファイル確認
```bash
ls templates/temp-<theme-id>/
# manifest.json
# schema.json
# config.default.json
# index.html
# style.css
```

### 2. JSON 検証
```bash
# JSON が有効か確認
cat templates/temp-<theme-id>/manifest.json | jq .
cat templates/temp-<theme-id>/schema.json | jq .
cat templates/temp-<theme-id>/config.default.json | jq .
```

### 3. モバイル対応確認

以下がすべて存在するか確認：

```bash
# schema.json
grep "heroPositionY_mobile" templates/temp-<theme-id>/schema.json

# config.default.json
grep "heroPositionY_mobile" templates/temp-<theme-id>/config.default.json

# index.html
grep "hero-position-y-mobile" templates/temp-<theme-id>/index.html

# style.css
grep "@media (max-width: 768px)" templates/temp-<theme-id>/style.css
```

---

## 🔧 よくある問題

### ビルドエラー

**問題**: `build-template.js` がエラー

**解決**:
```bash
# エイリアスを作成したか確認
ls template.json config.schema.json
```

### JSON エラー

**問題**: JSON が読み込めない

**解決**:
- 末尾カンマを削除
- コメント（`//` や `/* */`）を削除
- UTF-8 エンコーディングで保存

### プレビュー表示崩れ

**問題**: Builder で表示がおかしい

**解決**:
1. `schema.json` の `field.id` と `config.default.json` のキーが一致しているか
2. `index.html` の `{{変数}}` が正しいか
3. デフォルト値がすべて設定されているか

---

## 📚 詳細ドキュメント

さらに詳しい情報は以下を参照：

- **完全なプロンプト**: `docs/LLM_PROMPT_COMPLETE.md`
- **モバイル対応仕様**: `docs/MOBILE_POSITIONING_SPEC.md`
- **技術仕様**: `docs/template-spec-ja.md`
- **システム全体**: `docs/README_TEMPLATE_SYSTEM.md`

---

## 💡 テンプレート例

以下のようなテーマが簡単に作れます：

- **冬・雪**: 青白 + 透明感
- **サイバーパンク**: 黒 + ネオン
- **和風**: 黒 + 金 + 赤
- **パステル**: ピンク + 水色 + 黄
- **ダーク**: 黒 + グレー + 紫
- **ビビッド**: 原色の組み合わせ

プロンプトの「トーン/スタイル」と「配色」を変えるだけで、無限にバリエーションを作れます！
