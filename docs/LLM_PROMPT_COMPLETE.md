# Doujin LP Builder テンプレート生成プロンプト（完全版）

このドキュメントをそのまま LLM（ChatGPT/Claude/Gemini）にコピー&ペーストして使用できます。

---

# テンプレート生成依頼

あなたは HTML/CSS/JS テンプレートの専門家です。Doujin LP Builder 用のテンプレートを作成してください。

## 生成するテンプレート

**【ここを編集してください】**

- **テーマ ID**: `miyabi`（英小文字とハイフン）
- **テーマ名**: miyabi
- **トーン/スタイル**: 和を基調とした日本スタイル
- **配色**: 和を連想させるカラーを採用
- **フォント**: 選定を任せます、世界観に合うように
- **特徴**: 和風テクノコンピ等での採用を見越したテンプレート。メインタイトルは縦書きにしたい。

---

## 技術仕様（厳守）

### 必須ファイル（5 つ）

1. `manifest.json` - テンプレートメタ情報
2. `schema.json` - フォームスキーマ定義
3. `config.default.json` - デフォルト設定値
4. `index.html` - Handlebars テンプレート
5. `style.css` - スタイルシート

### 重要な制約

- ✅ JSON は厳密に有効（コメント無し、末尾カンマ無し、UTF-8）
- ✅ 外部 CDN 禁止（すべて相対パス参照）
- ✅ Handlebars テンプレートエンジン使用
- ✅ **モバイル対応背景位置設定を必ず実装**
- ❌ ファイル名コメントをコードブロック内に入れない

### テキスト改行処理の統一仕様（厳守）

**必須ルール**: すべてのテンプレートで以下の方式を統一すること

#### HTML 側の記述（必須）

```html
<!-- ✅ 正しい記述 -->
<p class="about-text">{{aboutText}}</p>

<!-- ❌ 禁止：トリプルブレースでHTMLエスケープ無効化 -->
<p class="about-text">{{{aboutText}}}</p>
```

#### CSS 側の記述（必須）

```css
/* ✅ 必須：white-space: pre-wrap で改行を保持 */
.about-text {
  white-space: pre-wrap;
}
```

**理由**:

- ユーザーはテキストエリアで直接改行を入力できる
- `<br>` タグを手動入力する必要がない
- セキュリティ上、HTML エスケープを有効にすべき
- すべてのテンプレートで一貫した動作を保証

**適用対象**:

- `aboutText`（作品説明文）
- その他すべての複数行テキストフィールド

---

## リファレンス実装（clearly-memory テンプレート）

以下のコードを参考に、デザインを変えて新しいテンプレートを作成してください。

### 1. manifest.json

```json
{
  "id": "clearly-memory",
  "name": "Clearly Memory",
  "version": "1.0.0",
  "description": "A refreshing and simple landing page template for youth-themed music releases.",
  "category": "music",
  "author": {
    "name": "Doujin LP Builder AI"
  },
  "template": {
    "engine": "handlebars",
    "version": "4.7.8"
  }
}
```

**生成時の注意**:

- `id` は指定されたテーマ ID に変更
- `name` と `description` はテーマに合わせて変更

---

### 2. config.default.json

```json
{
  "siteTitle": "Album Title - New Release",
  "seoDescription": "青春をテーマにした爽やかなコンセプトアルバム。",
  "primaryColor": "#f4f9fc",
  "secondaryColor": "#4a90e2",
  "accentColor": "#ff9a9e",
  "heroImage": "",
  "heroPositionX": "center",
  "heroPositionY": "center",
  "heroPositionY_mobile": "top",
  "overlayColor": "#ffffff",
  "overlayOpacity": 20,
  "heroBadge": "2025 Spring Release",
  "heroTitle": "Album Title",
  "aboutTitle": "Concept",
  "aboutText": "アルバムのコンセプトや説明文をここに記載します。",
  "jacketImage": "",
  "albumTitle": "Album Title",
  "artistName": "Artist Name",
  "releaseInfo": [
    { "label": "Release", "value": "2025.04.27" },
    { "label": "Price", "value": "¥1,500" }
  ],
  "tracks": [
    {
      "trackNumber": "01",
      "title": "Track Title 1",
      "artist": "Composer A",
      "duration": "3:45"
    },
    {
      "trackNumber": "02",
      "title": "Track Title 2",
      "artist": "Composer B",
      "duration": "4:12"
    }
  ],
  "youtubeUrl": "",
  "credits": [
    {
      "role": "Produce",
      "name": "Producer Name",
      "link1Label": "Twitter",
      "link1Url": "https://twitter.com/producer",
      "link2Label": "",
      "link2Url": "",
      "link3Label": "",
      "link3Url": ""
    },
    {
      "role": "Tr.01 Vocal",
      "name": "Vocalist A",
      "link1Label": "Twitter",
      "link1Url": "https://twitter.com/vocalist_a",
      "link2Label": "YouTube",
      "link2Url": "https://youtube.com/@vocalist_a",
      "link3Label": "",
      "link3Url": ""
    }
  ],
  "shopLinks": [
    { "label": "BOOTH", "url": "#" },
    { "label": "Bandcamp", "url": "#" }
  ],
  "footerLogo": "",
  "footerLinks": [
    { "label": "Label Site", "url": "https://example.com" },
    { "label": "Twitter", "url": "https://twitter.com/label" }
  ],
  "footerCopyright": "© 2025 Artist Name"
}
```

**必須フィールド**:

- `heroPositionY_mobile: "top"` - モバイル専用縦位置（必須）
- `overlayColor` と `overlayOpacity` - オーバーレイ設定
- `releaseInfo` - 配列形式の頒布情報（price/releaseDate の代わり）
- `credits` - クレジット情報（role, name, link1Label ～ link3Label/Url）
- `footerLogo` - フッターロゴ画像（任意）
- `footerLinks` - フッターリンク配列（label, url）

---

### 3. schema.json（重要セクションのみ抜粋）

#### design セクション（モバイル対応必須）

```json
{
  "id": "design",
  "title": "デザイン設定",
  "icon": "🎨",
  "description": "配色はパステル調を推奨",
  "fields": [
    {
      "id": "primaryColor",
      "type": "color",
      "label": "メインカラー (背景など)",
      "default": "#f0f8ff"
    },
    {
      "id": "secondaryColor",
      "type": "color",
      "label": "文字色・アクセント",
      "default": "#5d8aa8"
    },
    {
      "id": "accentColor",
      "type": "color",
      "label": "強調カラー (ボタンなど)",
      "default": "#ffb7b2"
    },
    {
      "id": "heroImage",
      "type": "image",
      "label": "ヒーロー画像 (背景)",
      "description": "トップの大きな背景画像"
    },
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
    },
    {
      "id": "overlayColor",
      "type": "color",
      "label": "オーバーレイ色",
      "default": "#ffffff"
    },
    {
      "id": "overlayOpacity",
      "type": "slider",
      "label": "オーバーレイ濃度",
      "min": 0,
      "max": 100,
      "step": 5,
      "unit": "%",
      "default": 30
    }
  ]
}
```

#### releaseInfo セクション（配列の例）

```json
{
  "id": "release",
  "title": "リリース情報",
  "icon": "💿",
  "description": "ジャケットや頒布情報",
  "fields": [
    {
      "id": "jacketImage",
      "type": "image",
      "label": "ジャケット画像",
      "description": "アルバムジャケット画像（任意）"
    },
    {
      "id": "albumTitle",
      "type": "text",
      "label": "アルバム名",
      "required": true
    },
    {
      "id": "artistName",
      "type": "text",
      "label": "アーティスト名"
    },
    {
      "id": "releaseInfo",
      "type": "array",
      "label": "頒布情報",
      "description": "価格・発売日など自由に追加できます",
      "itemTemplate": {
        "label": "Price",
        "value": "¥1,500"
      }
    }
  ]
}
```

#### tracks セクション（配列の例）

```json
{
  "id": "tracks",
  "title": "トラックリスト",
  "icon": "🎵",
  "description": "収録曲のリスト",
  "fields": [
    {
      "id": "tracks",
      "type": "array",
      "label": "楽曲一覧",
      "itemTemplate": {
        "trackNumber": "01",
        "title": "Track Title",
        "artist": "Artist Name",
        "duration": "3:45"
      }
    }
  ]
}
```

#### credits セクション（配列の例）

```json
{
  "id": "credits",
  "title": "クレジット",
  "icon": "👥",
  "description": "制作スタッフ・参加者のクレジット表記",
  "fields": [
    {
      "id": "credits",
      "type": "array",
      "label": "クレジット一覧",
      "description": "役職・氏名・SNSリンクを自由に追加できます",
      "itemTemplate": {
        "role": "Produce",
        "name": "Artist Name",
        "link1Label": "Twitter",
        "link1Url": "https://twitter.com/username",
        "link2Label": "",
        "link2Url": "",
        "link3Label": "",
        "link3Url": ""
      }
    }
  ]
}
```

#### footer セクション（ロゴ・リンク配列の例）

```json
{
  "id": "footer",
  "title": "フッター",
  "icon": "🦶",
  "description": "コピーライト・ロゴ・リンク",
  "fields": [
    {
      "id": "footerLogo",
      "type": "image",
      "label": "レーベルロゴ",
      "description": "フッター中央に表示されるロゴ画像"
    },
    {
      "id": "footerLinks",
      "type": "array",
      "label": "フッターリンク",
      "description": "レーベルサイトやSNSへのリンク",
      "itemTemplate": {
        "label": "Label Site",
        "url": "https://"
      }
    },
    {
      "id": "footerCopyright",
      "type": "text",
      "label": "コピーライト",
      "default": "© 2025 Artist Name"
    }
  ]
}
```

**完全な schema.json の構造**:

```json
{
  "formSchema": {
    "sections": [
      {
        /* meta セクション */
      },
      {
        /* design セクション - 上記参照 */
      },
      {
        /* hero セクション */
      },
      {
        /* about セクション */
      },
      {
        /* release セクション - releaseInfo配列を含む */
      },
      {
        /* tracks セクション - 上記参照 */
      },
      {
        /* media セクション */
      },
      {
        /* credits セクション - 上記参照 */
      },
      {
        /* links セクション */
      },
      {
        /* footer セクション */
      }
    ]
  }
}
```

---

### 4. index.html（重要部分のみ抜粋）

#### CSS 変数定義（必須）

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

#### ヒーローセクション（背景画像設定）

```html
<header class="hero" {{#if heroImage}}style="background-image: url('{{heroImage}}'); background-position: {{heroPositionX}} {{heroPositionY}};"{{/if}}>
  <div class="hero-overlay"></div>
  <div class="hero-content fade-in-up">
    {{#if heroBadge}}
    <div class="badge-container">
      <span class="hero-badge">{{heroBadge}}</span>
    </div>
    {{/if}}
    <h1 class="hero-title">{{heroTitle}}</h1>
  </div>
</header>
```

#### 作品説明テキスト（改行処理の標準実装）

```html
{{#if aboutText}}
<section id="about" class="section">
  <h2 class="section-title">{{aboutTitle}}</h2>
  <p class="about-text">{{aboutText}}</p>
</section>
{{/if}}
```

**重要**: `{{aboutText}}` はダブルブレースで記述（トリプルブレース `{{{aboutText}}}` は禁止）

#### トラックリスト（配列の展開）

```html
{{#if tracks}}
<section id="tracks" class="section glass-card">
  <h2 class="section-title">Tracklist</h2>
  <ul class="track-list">
    {{#each tracks}}
    <li class="track-item">
      <div class="track-left">
        <span class="track-num">{{trackNumber}}</span>
        <div class="track-info">
          <span class="track-title">{{title}}</span>
          {{#if artist}}<span class="track-artist-sub">{{artist}}</span>{{/if}}
        </div>
      </div>
      <div class="track-right">
        {{#if duration}}<span class="track-time">{{duration}}</span>{{/if}}
      </div>
    </li>
    {{/each}}
  </ul>
</section>
{{/if}}
```

#### リリース情報（ジャケット画像の扱い）

```html
<section id="release" class="section">
  <div class="release-layout">
    <!-- ジャケット画像エリア -->
    <div class="jacket-area">
      {{#if jacketImage}}
      <img src="{{jacketImage}}" alt="{{albumTitle}}" class="jacket-img">
      {{else}}
      <div class="jacket-placeholder">No Image</div>
      {{/if}}
    </div>

    <!-- アルバム情報エリア -->
    <div class="info-area">
      <h2 class="album-title">{{albumTitle}}</h2>
      {{#if artistName}}<p class="artist-name">{{artistName}}</p>{{/if}}

      {{#if releaseInfo}}
      <div class="release-meta">
        {{#each releaseInfo}}
        <div class="meta-item">
          <span class="meta-label">{{label}}</span>
          <span class="meta-value">{{value}}</span>
        </div>
        {{/each}}
      </div>
      {{/if}}
    </div>
  </div>
</section>
```

**重要**: `jacketImage` は任意フィールドのため、必ず `{{#if jacketImage}}` で条件分岐すること

---

### 5. style.css（モバイル対応必須部分）

#### 複数行テキストの改行処理（必須）

```css
/* 作品説明テキストの改行処理 */
.about-text {
  white-space: pre-wrap; /* 必須：改行を保持 */
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}
```

**必須**: すべての複数行テキスト要素に `white-space: pre-wrap` を適用すること

#### ヒーローセクション基本スタイル

```css
.hero {
  position: relative;
  width: 100%;
  height: 90vh;
  min-height: 600px;
  background-size: cover;
  background-position: center;
  background-color: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
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

#### モバイル対応メディアクエリ（必須）

```css
/* Mobile-specific background position */
@media (max-width: 768px) {
  .hero {
    background-position: center var(--hero-position-y-mobile) !important;
  }
}
```

---

## 出力形式

各ファイルを以下の形式で出力してください：

```
Filename: manifest.json
[コードブロック]

Filename: schema.json
[コードブロック]

Filename: config.default.json
[コードブロック]

Filename: index.html
[コードブロック]

Filename: style.css
[コードブロック]
```

---

## チェックリスト

生成前に以下を確認してください：

### 必須実装

- [ ] manifest.json に正しい id, name, description
- [ ] schema.json に heroPositionY_mobile フィールド
- [ ] config.default.json に heroPositionY_mobile: "top"
- [ ] index.html に --hero-position-y-mobile CSS 変数
- [ ] style.css にモバイル用 @media クエリ
- [ ] **改行処理の統一**: aboutText は `{{aboutText}}` で記述（トリプルブレース禁止）
- [ ] **改行処理の統一**: style.css で `.about-text { white-space: pre-wrap; }` を定義

### JSON 品質

- [ ] すべての JSON でコメント無し
- [ ] すべての JSON で末尾カンマ無し
- [ ] UTF-8 エンコーディング

### デザイン

- [ ] 指定されたトーン/スタイルに合致
- [ ] 配色が適切
- [ ] レスポンシブデザイン対応

---

## 参考: Handlebars ヘルパー

Builder で使用可能なヘルパー：

- `{{#if variable}}...{{/if}}` - 条件分岐
- `{{#each array}}...{{/each}}` - 配列ループ
- `{{#equals a b}}...{{/equals}}` - 等値比較
- `{{extractYouTubeID url}}` - YouTube ID 抽出

---

**では、上記の仕様に従って、指定されたテーマのテンプレートを生成してください。**
