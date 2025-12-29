# Doujin LP Builder - テンプレート生成ガイド（ブロックシステム版）

**Version**: 2.0.0
**Date**: 2025-12-27
**Architecture**: CSS内包型 Block-Based Template System

このドキュメントをLLM（ChatGPT/Claude/Gemini）にコピー&ペーストして、新しいテンプレートを生成できます。

---

## 概要

Doujin LP Builderは、HTMLブロックベースのテンプレートシステムです。すべての設定・CSS・ブロックデータは**単一の.dlptファイル**に内包されます。

### 新アーキテクチャの特徴

✅ **自己完結型**: 1つの.dlptファイルにすべて含まれる
✅ **外部依存なし**: 外部CSSファイルやHTMLテンプレート不要
✅ **配布容易**: ファイル1つで配布可能
✅ **型安全**: すべてTypeScriptで型定義済み

### ⚠️ 重要な変更点（v2.0.0以降）

- **絵文字の撤廃**: HTML構造に`<span>`で埋め込まれていた絵文字アイコンを完全に撤廃しました
  - `shop-links`ブロックの`link.icon`フィールドは使用されません
  - `credits`ブロックの`link.icon`フィールドは使用されません
  - テンプレート生成時は`icon`フィールドを含めないでください

- **Release ブロックの追加**: ジャケット画像、アルバム情報、ショップリンクを統合した`release`ブロックを追加
  - `shop-links`ブロックは非推奨となりました（`release`ブロックを使用してください）
  - アルバムリリース情報は`release`ブロックで一元管理することを推奨

---

## テンプレート生成依頼

あなたはDoujin LP Builder用のテンプレートを作成するエキスパートです。以下の仕様に従って、ブロックベースのテンプレートを生成してください。

### 生成するテンプレート

**【ここを編集してください】**

- **テンプレートID**: `your-template-id` （英小文字とハイフンのみ）
- **テンプレート名**: あなたのテンプレート名
- **テーマ**: 同人音楽・アルバムLP向けのテーマ
- **配色**: 落ち着いた配色（彩度高すぎない）
- **フォント**: テーマに合うフォント選定
- **特徴**: どんな楽曲ジャンルにも使える、モバイルファーストデザイン

---

## .dlpt ファイル構造

### Project Interface

```typescript
interface Project {
  version: string;              // "2.0.0"
  template: string;             // テンプレートID
  templateCSS: string;          // CSS全体を文字列として内包
  globalSettings: GlobalSettings;
  blocks: Block[];
}
```

### GlobalSettings Interface

```typescript
interface GlobalSettings {
  colors: {
    primary: string;      // 背景色（例: "#161625"）
    secondary: string;    // サブカラー（例: "#f0f0f0"）
    accent: string;       // アクセントカラー（例: "#c5a059"）
    background: string;   // ページ背景色
    text: string;         // テキスト色
  };

  typography: {
    headingFont: string;  // 見出しフォント（例: "'Cinzel', 'Noto Serif JP', serif"）
    bodyFont: string;     // 本文フォント（例: "'Noto Sans JP', sans-serif"）
    baseSize: number;     // 基準フォントサイズ（例: 16）
    scale: number;        // スケール比率（例: 1.25）
  };

  layout: {
    maxWidth: number;     // 最大幅（例: 1100）
    gutter: number;       // 余白（例: 24）
  };
}
```

---

## ブロックシステム

### 利用可能なブロックタイプ

Doujin LP Builderは以下のブロックタイプをサポートしています:

| Block Type | 説明 | 用途 |
|-----------|------|------|
| `hero` | ヒーローセクション | トップの大きな背景画像付きセクション |
| `heading` | 見出し | セクション見出し |
| `text` | テキスト | プレーンテキストコンテンツ（alignment設定可） |
| `image` | 画像 | 単一画像表示 |
| `gallery` | ギャラリー | 複数画像のギャラリー表示 |
| `video` | 動画 | YouTube/Vimeo埋め込み |
| `audio` | 音声 | 音声プレイヤー |
| `release` | **リリース情報** | **ジャケット+アルバム情報+ショップリンク統合（推奨）** |
| `tracklist` | トラックリスト | アルバム収録曲リスト |
| `credits` | クレジット | 制作スタッフ・参加者クレジット |
| `shop-links` | ショップリンク（非推奨） | BOOTH/Bandcamp等のリンクボタン（releaseブロック推奨） |
| `button` | ボタン | CTA/アクションボタン |
| `divider` | 区切り線 | セクション区切り |
| `spacer` | スペーサー | 空白スペース |
| `columns` | カラム | 2カラムレイアウト |
| `embed` | カスタムHTML | 自由なHTML埋め込み |

### Block Interface

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

---

## ブロック別HTMLレンダリング

BlockPreview.tsxの`blockToHTML()`関数は、各ブロックを以下のHTMLに変換します:

### 1. Hero Block

```typescript
{
  "id": "block-hero",
  "type": "hero",
  "order": 0,
  "visible": true,
  "settings": {
    "backgroundImage": "assets/hero.jpg",
    "backgroundPosition": { "x": 50, "y": 50 },
    "backgroundSize": "cover",
    "height": "viewport",
    "overlay": {
      "enabled": true,
      "color": "#000000",
      "opacity": 0.3
    }
  },
  "content": {
    "title": "Album Title",
    "subtitle": "New Release 2025"
  }
}
```

**HTML出力**:
```html
<section class="block block-hero" data-block-id="block-hero"
         style="background-image: url('assets/hero.jpg');">
  <div class="hero-overlay"></div>
  <div class="hero-content">
    <h1 class="hero-title">Album Title</h1>
    <p class="hero-subtitle">New Release 2025</p>
  </div>
</section>
```

**CSS例**:
```css
.block-hero {
  position: relative;
  width: 100%;
  height: 100vh;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
}

.hero-title {
  font-family: var(--font-heading);
  font-size: 3.5rem;
  margin-bottom: 1rem;
}
```

---

### 2. Heading Block

```typescript
{
  "id": "block-heading-1",
  "type": "heading",
  "order": 1,
  "visible": true,
  "settings": {
    "level": 2
  },
  "content": {
    "text": "Tracklist"
  }
}
```

**HTML出力**:
```html
<section class="block block-heading" data-block-id="block-heading-1">
  <div class="block-container">
    <h2 class="heading-text">Tracklist</h2>
    <div class="heading-line"></div>
  </div>
</section>
```

**CSS例**:
```css
.block-heading {
  padding: 2rem 0;
}

.heading-text {
  font-family: var(--font-heading);
  font-size: 2rem;
  text-align: center;
  margin-bottom: 0.5rem;
}

.heading-line {
  width: 60px;
  height: 2px;
  background: var(--accent-color);
  margin: 0 auto;
}
```

---

### 3. Tracklist Block

```typescript
{
  "id": "block-tracklist",
  "type": "tracklist",
  "order": 2,
  "visible": true,
  "settings": {
    "showNumbers": true,
    "showArtist": true,
    "showDuration": true,
    "enablePlayback": false
  },
  "content": {
    "tracks": [
      {
        "id": "track-1",
        "number": "01",
        "title": "Track Title 1",
        "artist": "Composer A",
        "duration": "3:45",
        "audioUrl": ""
      },
      {
        "id": "track-2",
        "number": "02",
        "title": "Track Title 2",
        "artist": "Composer B",
        "duration": "4:12",
        "audioUrl": ""
      }
    ]
  }
}
```

**HTML出力**:
```html
<section class="block block-tracklist" data-block-id="block-tracklist">
  <div class="block-container">
    <table class="track-table">
      <tr class="track-row">
        <td class="track-num">01</td>
        <td class="track-main">
          <span class="track-name">Track Title 1</span>
          <span class="track-artist"> / Composer A</span>
        </td>
        <td class="track-time">3:45</td>
      </tr>
      <tr class="track-row">
        <td class="track-num">02</td>
        <td class="track-main">
          <span class="track-name">Track Title 2</span>
          <span class="track-artist"> / Composer B</span>
        </td>
        <td class="track-time">4:12</td>
      </tr>
    </table>
  </div>
</section>
```

**CSS例**:
```css
.block-tracklist {
  padding: 2rem 0;
}

.track-table {
  width: 100%;
  border-collapse: collapse;
}

.track-row {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.track-num {
  width: 50px;
  text-align: center;
  color: var(--accent-color);
  font-weight: bold;
}

.track-main {
  padding: 1rem 0;
}

.track-name {
  font-weight: 500;
}

.track-artist {
  opacity: 0.7;
  font-size: 0.9rem;
}

.track-time {
  width: 80px;
  text-align: right;
  opacity: 0.7;
}
```

---

### 4. Credits Block

```typescript
{
  "id": "block-credits",
  "type": "credits",
  "order": 3,
  "visible": true,
  "settings": {
    "layout": "list",
    "showAvatars": false,
    "showBios": false,
    "showLinks": true
  },
  "content": {
    "groups": [
      {
        "id": "group-1",
        "title": "Main Credits",
        "items": [
          {
            "id": "credit-1",
            "role": "Produce",
            "name": "Producer Name",
            "avatar": "",
            "bio": "",
            "links": [
              {
                "id": "link-1",
                "label": "Twitter",
                "url": "https://twitter.com/producer"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

**HTML出力**:
```html
<section class="block block-credits" data-block-id="block-credits">
  <div class="block-container">
    <div class="credits-group">
      <h3 class="credits-group-title">Main Credits</h3>
      <div class="credits-grid">
        <div class="credit-item">
          <span class="credit-role">Produce</span>
          <span class="credit-name">Producer Name</span>
          <div class="credit-links">
            <a href="https://twitter.com/producer" target="_blank" rel="noopener noreferrer">
              <span>🐦</span>
              Twitter
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

**CSS例**:
```css
.block-credits {
  padding: 2rem 0;
}

.credits-group-title {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.credits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.credit-item {
  text-align: center;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.credit-role {
  display: block;
  font-size: 0.85rem;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
}

.credit-name {
  display: block;
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.credit-links a {
  display: inline-block;
  margin: 0.25rem 0.5rem;
  color: var(--accent-color);
  text-decoration: none;
  transition: opacity 0.3s;
}

.credit-links a:hover {
  opacity: 0.7;
}
```

---

### 5. Release Block（推奨）

ジャケット画像、アルバム情報、ショップリンクを統合したブロックです。アルバムLP用途では、このブロックの使用を強く推奨します。

```typescript
{
  "id": "block-release-main",
  "type": "release",
  "order": 3,
  "visible": true,
  "settings": {
    "layout": "side-by-side",  // または "stacked"
    "jacketPosition": "left"   // または "right"
  },
  "content": {
    "jacketImage": "assets/jacket.jpg",
    "albumTitle": "Album Title",
    "artistName": "Artist Name",
    "releaseInfo": [
      {
        "id": "r1",
        "label": "Release",
        "value": "2025.12.31"
      },
      {
        "id": "r2",
        "label": "Price",
        "value": "¥1,000"
      },
      {
        "id": "r3",
        "label": "Genre",
        "value": "Hardcore"
      }
    ],
    "shopLinks": [
      {
        "id": "s1",
        "label": "BOOTH",
        "url": "https://example.booth.pm"
      },
      {
        "id": "s2",
        "label": "Bandcamp",
        "url": "https://example.bandcamp.com"
      }
    ]
  }
}
```

**HTML出力**:
```html
<section class="block block-release" data-block-id="block-release-main">
  <div class="block-container">
    <div class="release-layout">
      <div class="jacket-area">
        <img src="assets/jacket.jpg" alt="Album Title" class="jacket-img">
      </div>
      <div class="info-area">
        <div class="info-header">
          <h2 class="album-title">Album Title</h2>
          <p class="artist-name">Artist Name</p>
        </div>
        <dl class="spec-list">
          <div class="spec-row">
            <dt>Release</dt>
            <dd>2025.12.31</dd>
          </div>
          <div class="spec-row">
            <dt>Price</dt>
            <dd>¥1,000</dd>
          </div>
          <div class="spec-row">
            <dt>Genre</dt>
            <dd>Hardcore</dd>
          </div>
        </dl>
        <div class="shop-buttons">
          <a href="https://example.booth.pm" class="btn-shop" target="_blank" rel="noopener noreferrer">
            BOOTH
          </a>
          <a href="https://example.bandcamp.com" class="btn-shop" target="_blank" rel="noopener noreferrer">
            Bandcamp
          </a>
        </div>
      </div>
    </div>
  </div>
</section>
```

**CSS例**:
```css
.block-release {
  padding: 4rem 0;
}

.release-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

.release-layout.stacked {
  grid-template-columns: 1fr;
  text-align: center;
}

.release-layout.jacket-right {
  direction: rtl;
}

.release-layout.jacket-right > * {
  direction: ltr;
}

.jacket-area {
  width: 100%;
}

.jacket-img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 4px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.jacket-placeholder {
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.info-area {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.album-title {
  font-family: var(--font-heading);
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
}

.artist-name {
  font-size: 1.2rem;
  opacity: 0.8;
  margin: 0;
}

.spec-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 0;
}

.spec-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.spec-row dt {
  font-weight: 600;
  opacity: 0.7;
}

.spec-row dd {
  margin: 0;
}

.shop-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-shop {
  flex: 1;
  min-width: 150px;
  padding: 1rem 2rem;
  background: var(--accent-color);
  color: white;
  text-decoration: none;
  text-align: center;
  border-radius: 4px;
  font-weight: 600;
  transition: transform 0.2s, opacity 0.3s;
}

.btn-shop:hover {
  transform: translateY(-2px);
  opacity: 0.9;
}

@media (max-width: 768px) {
  .release-layout {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .spec-row {
    grid-template-columns: 100px 1fr;
  }

  .shop-buttons {
    flex-direction: column;
  }

  .btn-shop {
    width: 100%;
  }
}
```

---

### 6. Shop Links Block（非推奨）

**⚠️ 注意**: このブロックは非推奨です。新しいテンプレートでは`release`ブロックを使用してください。

```typescript
{
  "id": "block-shop-links",
  "type": "shop-links",
  "order": 4,
  "visible": true,
  "settings": {
    "layout": "horizontal",
    "buttonStyle": "solid",
    "showIcons": true
  },
  "content": {
    "links": [
      {
        "id": "shop-1",
        "label": "BOOTH",
        "url": "https://example.booth.pm"
      },
      {
        "id": "shop-2",
        "label": "Bandcamp",
        "url": "https://example.bandcamp.com"
      }
    ]
  }
}
```

**HTML出力**:
```html
<section class="block block-shop-links" data-block-id="block-shop-links">
  <div class="block-container">
    <div class="shop-buttons">
      <a href="https://example.booth.pm" class="btn-shop" target="_blank" rel="noopener noreferrer">
        BOOTH
      </a>
      <a href="https://example.bandcamp.com" class="btn-shop" target="_blank" rel="noopener noreferrer">
        Bandcamp
      </a>
    </div>
  </div>
</section>
```

**CSS例**:
```css
.block-shop-links {
  padding: 3rem 0;
  background: rgba(0, 0, 0, 0.05);
}

.shop-buttons {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.btn-shop {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: var(--accent-color);
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 600;
  transition: transform 0.2s, opacity 0.3s;
}

.btn-shop:hover {
  transform: translateY(-2px);
  opacity: 0.9;
}

@media (max-width: 768px) {
  .shop-buttons {
    flex-direction: column;
  }

  .btn-shop {
    width: 100%;
    justify-content: center;
  }
}
```

---

## CSS仕様

### 必須クラス名と変数

すべてのテンプレートCSSは以下の構造に従ってください:

```css
/**
 * {template-name} テンプレート - ブロックベーススタイル
 * {テーマ説明}
 */

/* テンプレート固有のCSS変数 */
.template-{template-id} {
  --font-heading: 'Font Name', serif;
  --font-body: 'Font Name', sans-serif;
  --transition-speed: 0.3s;
}

/* ページ全体の基本スタイル */
.template-{template-id} body {
  margin: 0;
  padding: 0;
  background-color: var(--background-color);
  color: var(--text-color);
  font-family: var(--font-body);
  font-size: var(--font-size-base);
  line-height: 1.6;
}

/* コンテナ */
.block-container {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 var(--gutter);
}

/* 各ブロックタイプのスタイル */
.block-hero { /* ... */ }
.block-heading { /* ... */ }
.block-text { /* ... */ }
.block-release { /* ... */ } /* 推奨: ジャケット+情報+ショップリンク統合 */
.block-tracklist { /* ... */ }
.block-credits { /* ... */ }
.block-shop-links { /* ... */ } /* 非推奨: releaseブロック推奨 */
/* ... 他のブロックタイプ ... */

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .template-{template-id} body {
    font-size: 14px;
  }

  .block-container {
    padding: 0 1rem;
  }

  /* モバイル用スタイル調整 */
}
```

### CSS変数の活用

テンプレートCSSは、globalSettingsから注入されるCSS変数を使用します:

```css
/* 自動的に注入される変数 */
:root {
  --primary-color: #161625;
  --secondary-color: #f0f0f0;
  --accent-color: #c5a059;
  --background-color: #161625;
  --text-color: #f0f0f0;
  --font-heading: 'Cinzel', 'Noto Serif JP', serif;
  --font-body: 'Noto Sans JP', sans-serif;
  --font-size-base: 16px;
  --font-scale: 1.25;
  --max-width: 1100px;
  --gutter: 24px;
}
```

---

## 出力形式（重要）

LLMは.dlpt（ZIP）を直接出力できないため、以下の**2ファイルを分けて出力**してください:

### ⚠️ 命名規則（必須）

**ファイル名は固定です（すべてのテンプレートで同じ名前）:**

- ✅ **ファイル名**: `template.json`, `style.css`（固定）
- ❌ **誤り**: `gothic-ver2-base.json`のようなテンプレート名を含める

**テンプレートIDの命名規則（JSON内の`template`フィールド）:**

- ✅ **正しい例**: `gothic-ver2`, `neon-cyber`, `pastel-dream`
- ❌ **誤った例**: `gothic_ver2`, `NeonCyber`, `pastelDream`
- 英小文字のみ使用、単語の区切りはハイフン(`-`)のみ

### ファイル1: template.json

```
Filename: template.json（固定）
```

```json
{
  "version": "2.0.0",
  "template": "your-template-id",
  "globalSettings": {
    "colors": {
      "primary": "#hex-color",
      "secondary": "#hex-color",
      "accent": "#hex-color",
      "background": "#hex-color",
      "text": "#hex-color"
    },
    "typography": {
      "headingFont": "'Font Name', serif",
      "bodyFont": "'Font Name', sans-serif",
      "baseSize": 16,
      "scale": 1.25
    },
    "layout": {
      "maxWidth": 1100,
      "gutter": 24
    }
  },
  "blocks": [
    {
      "id": "block-hero",
      "type": "hero",
      "order": 0,
      "visible": true,
      "settings": { /* ... */ },
      "content": { /* ... */ }
    },
    {
      "id": "block-heading-1",
      "type": "heading",
      "order": 1,
      "visible": true,
      "settings": { "level": 2 },
      "content": { "text": "Tracklist" }
    }
    // ... 他のブロック ...
  ]
}
```

### ファイル2: style.css

```
Filename: style.css（固定）
```

```css
/**
 * {template-name} テンプレート
 * {説明}
 */

.template-{template-id} {
  --font-heading: 'Font Name', serif;
  --font-body: 'Font Name', sans-serif;
  --transition-speed: 0.3s;
}

.template-{template-id} body {
  margin: 0;
  padding: 0;
  background-color: var(--background-color);
  color: var(--text-color);
  font-family: var(--font-body);
  font-size: var(--font-size-base);
  line-height: 1.6;
}

/* 全CSSをここに記述 */

.block-hero { /* ... */ }
.block-heading { /* ... */ }
.block-text { /* ... */ }
.block-tracklist { /* ... */ }
.block-credits { /* ... */ }
.block-shop-links { /* ... */ }

/* レスポンシブ */
@media (max-width: 768px) {
  /* ... */
}
```

---

## 手動での.dlpt作成手順

LLMが出力した2ファイル（`template.json` + `style.css`）から.dlptを作成する手順:

### 方法1: 手動でJSONに埋め込み

1. `template.json`をテキストエディタで開く
2. `style.css`の内容を全てコピー
3. JSONの`"templateCSS"`フィールドに、CSS全体を**エスケープした文字列**として貼り付け
4. ファイル名を`{template-id}.dlpt`に変更して保存

### 方法2: Node.jsスクリプト使用（推奨）

```javascript
// combine.js
const fs = require('fs');

// 固定ファイル名から読み込み
const template = JSON.parse(fs.readFileSync('template.json', 'utf8'));
const css = fs.readFileSync('style.css', 'utf8');

// CSSを埋め込み
template.templateCSS = css;

// テンプレートIDから出力ファイル名を決定
const outputFile = `${template.template}.dlpt`;
fs.writeFileSync(outputFile, JSON.stringify(template, null, 2), 'utf8');

console.log(`✅ Created ${outputFile}`);
```

実行:
```bash
node combine.js
```

### 方法3: Pythonスクリプト使用

```python
# combine.py
import json

# 固定ファイル名から読み込み
with open('template.json', 'r', encoding='utf-8') as f:
    template = json.load(f)

with open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# CSSを埋め込み
template['templateCSS'] = css

# テンプレートIDから出力ファイル名を決定
output_file = f"{template['template']}.dlpt"
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(template, f, ensure_ascii=False, indent=2)

print(f'✅ Created {output_file}')
```

実行:
```bash
python combine.py
```

---

## 推奨ブロック構成

同人音楽アルバムLP用のテンプレートには、以下のブロック構成を推奨します:

### パターンA: Release ブロック使用（推奨）

1. **Hero** (order: 0) - アルバムタイトルとビジュアル
2. **Heading** (order: 1) - "Concept" セクション見出し
3. **Text** (order: 2) - アルバムコンセプト説明
4. **Release** (order: 3) - **ジャケット画像+アルバム情報+ショップリンク統合**
5. **Heading** (order: 4) - "Tracklist" セクション見出し
6. **Tracklist** (order: 5) - 収録曲リスト
7. **Heading** (order: 6) - "Credits" セクション見出し
8. **Credits** (order: 7) - 制作スタッフクレジット
9. **Text** (order: 8) - フッター情報（コピーライト等）

### パターンB: 従来型（非推奨）

1. **Hero** (order: 0) - アルバムタイトルとビジュアル
2. **Heading** (order: 1) - "About" セクション見出し
3. **Text** (order: 2) - アルバムコンセプト説明
4. **Image** (order: 3) - ジャケット画像（大きく表示）
5. **Heading** (order: 4) - "Tracklist" セクション見出し
6. **Tracklist** (order: 5) - 収録曲リスト
7. **Heading** (order: 6) - "Purchase" セクション見出し
8. **Shop Links** (order: 7) - 購入リンクボタン（⚠️ 非推奨）
9. **Heading** (order: 8) - "Credits" セクション見出し
10. **Credits** (order: 9) - 制作スタッフクレジット
11. **Divider** (order: 10) - セクション区切り
12. **Text** (order: 11) - フッター情報（コピーライト等）

**💡 ポイント**: パターンAの`release`ブロックは、ジャケット画像・アルバム詳細・ショップリンクを一箇所にまとめることで、視覚的に統一感のあるリリース情報セクションを作成できます。

---

## デザインガイドライン

### 配色

- **primary**: ページ全体の背景色
- **secondary**: サブカラー、補助的な要素の色
- **accent**: ボタン、リンク、強調色
- **background**: コンテンツ背景色
- **text**: テキスト色

落ち着いた配色を推奨（彩度60%以下）:
```
淡い配色例: primary=#f4f9fc, accent=#ff9a9e
ダーク配色例: primary=#161625, accent=#c5a059
```

### タイポグラフィ

- **見出しフォント**: セリフ体やディスプレイフォント
- **本文フォント**: サンセリフ体やゴシック体
- **基準サイズ**: 16px
- **スケール比**: 1.2〜1.3

Google Fonts使用例:
```
headingFont: "'Playfair Display', 'Noto Serif JP', serif"
bodyFont: "'Inter', 'Noto Sans JP', sans-serif"
```

### レスポンシブ対応

モバイル（768px以下）で以下を調整:
- フォントサイズ: 14-15px
- パディング: より小さく
- 横並び要素: 縦並びに変更
- ボタン: 全幅表示

---

## 検証チェックリスト

生成したテンプレートが以下の要件を満たすか確認してください:

### 必須項目
- [ ] `{template-id}-base.json` を出力
- [ ] `{template-id}-style.css` を出力
- [ ] `version` が "2.0.0"
- [ ] `template` がユニークなID（英小文字とハイフンのみ）
- [ ] `globalSettings` の全フィールドが設定済み
- [ ] `blocks` が配列で、最低5つ以上のブロック

### CSS要件
- [ ] `.template-{id}` クラスでスコープされている
- [ ] CSS変数（`var(--primary-color)` 等）を使用
- [ ] すべての主要ブロックタイプにスタイル定義
- [ ] モバイル用メディアクエリ（`@media (max-width: 768px)`）
- [ ] フォントファミリーがGoogleFontsまたはシステムフォント

### ブロック要件
- [ ] Hero ブロックが order: 0
- [ ] 各ブロックにユニークな `id`
- [ ] `order` が連番（0, 1, 2, ...）
- [ ] `visible` が true
- [ ] `settings` と `content` が適切に設定

### デザイン要件
- [ ] 配色が落ち着いている（彩度60%以下推奨）
- [ ] コントラスト比が十分（WCAG AA準拠）
- [ ] フォントが読みやすい
- [ ] モバイルでも適切に表示

---

## サンプルテンプレート（nocturne）

参考として、実装済みのnocturneテンプレートの構造:

**nocturne-base.json**:
```json
{
  "version": "2.0.0",
  "template": "nocturne",
  "globalSettings": {
    "colors": {
      "primary": "#161625",
      "secondary": "#f0f0f0",
      "accent": "#c5a059",
      "background": "#161625",
      "text": "#f0f0f0"
    },
    "typography": {
      "headingFont": "'Cinzel', 'Noto Serif JP', serif",
      "bodyFont": "'Noto Sans JP', sans-serif",
      "baseSize": 16,
      "scale": 1.25
    },
    "layout": {
      "maxWidth": 1100,
      "gutter": 24
    }
  },
  "blocks": [
    /* 16ブロック */
  ]
}
```

**nocturne-style.css**: 約13,360文字

**最終的な nocturne.dlpt**: 約21KB

---

## 生成開始

**では、上記の仕様に従って、指定されたテーマの2ファイルを生成してください。**

### ⚠️ 再確認

**ファイル名は固定です:**
- `template.json` と `style.css`（すべてのテンプレートで同じ）

**テンプレートID（JSON内の`template`フィールド）はケバブケースで:**
- ✅ `gothic-ver2`, `neon-cyber`, `winter-crystal`
- ❌ `gothic_ver2`, `NeonCyber`, `winterCrystal`

必ず以下の形式で出力してください:

```
Filename: template.json

[JSON コードブロック]
```

```
Filename: style.css

[CSS コードブロック]
```
