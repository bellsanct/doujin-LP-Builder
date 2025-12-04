# モバイル対応背景位置設定 - 共通仕様

## 概要

横長画像（16:9等）をモバイル（9:16）で表示する際、大きくクロップされて重要な部分が見えなくなる問題を解決するため、モバイル専用の背景位置設定を実装します。

## 実装要件

### 1. schema.json に追加するフィールド

design セクションに以下のフィールドを追加：

```json
{
  "id": "heroPositionX",
  "type": "select",
  "label": "背景位置（横）",
  "options": [
    { "value": "left", "label": "左寄せ" },
    { "value": "center", "label": "中央" },
    { "value": "right", "label": "右寄せ" }
  ],
  "default": "center"
},
{
  "id": "heroPositionY",
  "type": "select",
  "label": "背景位置（縦）",
  "options": [
    { "value": "top", "label": "上寄せ" },
    { "value": "center", "label": "中央" },
    { "value": "bottom", "label": "下寄せ" }
  ],
  "default": "center"
},
{
  "id": "heroPositionY_mobile",
  "type": "select",
  "label": "背景位置（縦・モバイル）",
  "description": "スマホでの縦位置。横長画像は上寄せ推奨",
  "options": [
    { "value": "top", "label": "上寄せ" },
    { "value": "center", "label": "中央" },
    { "value": "bottom", "label": "下寄せ" }
  ],
  "default": "top"
}
```

**背景画像フィールド名の変更**:
- `heroImage` または `backgroundImage` のいずれかを使用
- 位置フィールドも対応させる（`heroPositionX/Y` または `backgroundPositionX/Y`）

### 2. config.default.json に追加する初期値

```json
{
  "heroImage": "",
  "heroPositionX": "center",
  "heroPositionY": "center",
  "heroPositionY_mobile": "top",
  "overlayColor": "#ffffff",
  "overlayOpacity": 20
}
```

### 3. index.html での実装

#### CSS 変数の定義

```html
<style>
  :root {
    --primary-color: {{primaryColor}};
    --secondary-color: {{secondaryColor}};
    --accent-color: {{accentColor}};
    --overlay-color: {{overlayColor}};
    --overlay-opacity: calc({{overlayOpacity}} / 100);
    --hero-position-y-mobile: {{heroPositionY_mobile}};
  }
</style>
```

#### 背景画像の設定

```html
<header class="hero" {{#if heroImage}}style="background-image: url('{{heroImage}}'); background-position: {{heroPositionX}} {{heroPositionY}};"{{/if}}>
  <div class="hero-overlay"></div>
  <div class="hero-content">
    <h1>{{heroTitle}}</h1>
  </div>
</header>
```

### 4. style.css での実装

#### 基本スタイル

```css
.hero {
  position: relative;
  width: 100%;
  height: 90vh;
  min-height: 600px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    var(--overlay-color) 100%
  );
  opacity: var(--overlay-opacity);
  z-index: 0;
}
```

#### モバイル専用メディアクエリ（必須）

```css
/* Mobile-specific background position */
@media (max-width: 768px) {
  .hero {
    background-position: center var(--hero-position-y-mobile) !important;
  }
}
```

## 動作仕様

### PC/タブレット (width > 768px)
- `background-position: {{heroPositionX}} {{heroPositionY}}` を使用
- インラインスタイルで設定された値が適用される

### モバイル (width ≤ 768px)
- `background-position: center var(--hero-position-y-mobile)` を使用
- メディアクエリで上書き（`!important` 使用）
- X軸は常に `center`（モバイルでは横位置調整は不要なため）
- Y軸のみカスタマイズ可能

## 推奨デフォルト値

- **heroPositionX**: `center`（中央）
- **heroPositionY**: `center`（中央）
- **heroPositionY_mobile**: `top`（上寄せ - 横長画像に最適）

## 使用例

### 横長画像（16:9）の場合
- PC: `center center` - 画像全体が見える
- モバイル: `center top` - 画像上部を表示、重要な要素が見切れない

### 縦長画像（9:16）の場合
- PC: `center center` - 画像全体が見える
- モバイル: `center center` でも問題なし（デフォルト `top` でも可）

### 正方形画像の場合
- PC: `center center` - 画像全体が見える
- モバイル: `center center` または `center top` のどちらでも良好

## 実装チェックリスト

- [ ] schema.json に3つの位置フィールドを追加
- [ ] config.default.json に初期値を設定
- [ ] index.html の `<style>` に CSS 変数を追加
- [ ] index.html のヒーローセクションに背景設定を追加
- [ ] style.css にモバイル用メディアクエリを追加
- [ ] ビルドテスト実施
- [ ] モバイルプレビュー確認

## 参考実装

`templates/clearly-memory.zip` が完全な実装例です。新しいテンプレートを作成する際は、このテンプレートを参考にしてください。
