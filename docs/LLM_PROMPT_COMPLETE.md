# Doujin LP Builder テンプレート生成プロンプト（完全版）

このドキュメントをそのまま LLM（ChatGPT/Claude/Gemini）にコピー&ペーストして使用できます。

---

# テンプレート生成依頼

あなたは HTML/CSS/JS テンプレートの専門家です。Doujin LP Builder 用のテンプレートを作成してください。

## 生成するテンプレート

**【ここを編集してください】**

- **テーマ ID**: 作成したテーマの世界観に沿うように決めてほしい（英小文字とハイフン）
- **テーマ名**: 作成したテーマの世界観に沿うように決めてほしい
- **トーン/スタイル**: 和や洋といったスタイルではなく、どんなジャンルにも適合するシンプルなスタイル
- **配色**: 彩度は高くなく、落ち着いた配色
- **フォント**: 選定を任せます、世界観に合うように
- **特徴**: どんな楽曲ジャンルの新譜にも使える、万能選手なモバイルファーストテンプレート。

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

---

## HTML テンプレート構造の厳格な定義（絶対遵守）

**⚠️ 超重要**: 以下の構造と順序は**一切の変更を許可しません**。すべてのテンプレートは必ずこの順序と構造に従ってください。

**🔴 最重要ルール**:
- **`<main>`タグは必ず1つのみ** - 複数の`<main>`タグは絶対禁止
- **simple-serif テーマのHTML構造を基準とする** - すべてのテーマはこの構造に従い、CSSのみで差別化
- **セクション順序は厳守** - Hero → About → Release → Tracks → Credits → Footer

### 全体構造（固定・変更不可）

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <!-- メタ情報、CSS変数定義、外部CSS読み込み -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{siteTitle}}</title>
  <meta name="description" content="{{seoDescription}}">

  <!-- OGP画像（優先順位: ogpImage → heroImage → jacketImage → なし） -->
  {{#if ogpImage}}
  <meta property="og:image" content="{{ogpImage}}">
  {{else}}{{#if heroImage}}
  <meta property="og:image" content="{{heroImage}}">
  {{else}}{{#if jacketImage}}
  <meta property="og:image" content="{{jacketImage}}">
  {{/if}}{{/if}}{{/if}}
  <style>
    :root {
      --primary-color: {{primaryColor}};
      --secondary-color: {{secondaryColor}};
      --accent-color: {{accentColor}};
      --overlay-color: {{overlayColor}};
      --overlay-opacity: calc({{overlayOpacity}} / 100);
      --hero-pos-x: {{heroPositionX}}%;
      --hero-pos-y: {{heroPositionY}}%;
      --hero-pos-x-mobile: {{#if heroPositionX_mobile}}{{heroPositionX_mobile}}{{else}}{{heroPositionX}}{{/if}}%;
      --hero-pos-y-mobile: {{#if heroPositionY_mobile}}{{heroPositionY_mobile}}{{else}}{{heroPositionY}}{{/if}}%;
    }
  </style>
  <link rel="stylesheet" href="style.css">
  <!-- フォント読み込み（Google Fonts可） -->
</head>
<body>

  <!-- ========================================
       1. Hero Section（ヒーローセクション）
       ======================================== -->
  <header class="hero" {{#if heroImage}}style="background-image: url('{{heroImage}}');"{{/if}}>
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <h1 class="hero-title">{{heroTitle}}</h1>
      {{#if heroSubtitle}}
      <p class="hero-subtitle">{{heroSubtitle}}</p>
      {{/if}}
    </div>
  </header>

  <!-- ========================================
       2. Main Content（メインコンテンツ）
       ======================================== -->
  <main>

    <!-- ─────────────────────────────────────
         2-1. About Section（作品説明）
         ───────────────────────────────────── -->
    <div class="container">
      {{#if aboutText}}
      <section id="about" class="section about-section">
        <div class="section-header">
          <h2 class="section-title">{{aboutTitle}}</h2>
          <div class="section-line"></div>
        </div>
        <div class="about-content">
          <p class="about-text">{{aboutText}}</p>
        </div>
      </section>
      {{/if}}
    </div>

    <!-- ─────────────────────────────────────
         2-2. Release Section（リリース情報）
         ※ この位置固定・変更禁止
         ───────────────────────────────────── -->
    <section id="release" class="section release-section">
      <div class="container">
        <div class="release-layout">

          <!-- ジャケット画像エリア（左側） -->
          <div class="jacket-area">
            {{#if jacketImage}}
            <img src="{{jacketImage}}" alt="{{albumTitle}}" class="jacket-img">
            {{else}}
            <div class="jacket-placeholder">
              <span>{{albumTitle}}</span>
            </div>
            {{/if}}
          </div>

          <!-- アルバム情報エリア（右側） -->
          <div class="info-area">
            <div class="info-header">
              <h2 class="album-title">{{albumTitle}}</h2>
              {{#if artistName}}<p class="artist-name">{{artistName}}</p>{{/if}}
            </div>

            {{#if releaseInfo}}
            <dl class="spec-list">
              {{#each releaseInfo}}
              <div class="spec-row">
                <dt>{{label}}</dt>
                <dd>{{value}}</dd>
              </div>
              {{/each}}
            </dl>
            {{/if}}

            {{#if shopLinks}}
            <div class="shop-buttons">
              {{#each shopLinks}}
              <a href="{{url}}" class="btn-shop" target="_blank">{{label}}</a>
              {{/each}}
            </div>
            {{/if}}
          </div>

        </div>
      </div>
    </section>

    <!-- ─────────────────────────────────────
         2-3. Tracklist & Credits（トラック＋クレジット）
         ───────────────────────────────────── -->
    <div class="container">

      <!-- Tracklist -->
      {{#if tracks}}
      <section id="tracks" class="section tracks-section">
        <div class="section-header">
          <h2 class="section-title">Tracklist</h2>
          <div class="section-line"></div>
        </div>
        <div class="track-list-container">
          <table class="track-table">
            {{#each tracks}}
            <tr class="track-row">
              <td class="track-num">{{trackNumber}}</td>
              <td class="track-main">
                <span class="track-name">{{title}}</span>
                {{#if artist}}<span class="track-artist"> / {{artist}}</span>{{/if}}
              </td>
              <td class="track-time">{{duration}}</td>
            </tr>
            {{/each}}
          </table>
        </div>
      </section>
      {{/if}}

      <!-- Credits -->
      {{#if credits}}
      <section id="credits" class="section credits-section">
        <div class="section-header">
          <h2 class="section-title">Credits</h2>
          <div class="section-line"></div>
        </div>
        <div class="credits-grid">
          {{#each credits}}
          <div class="credit-item">
            <span class="credit-role">{{role}}</span>
            <span class="credit-name">{{name}}</span>
            <div class="credit-links">
              {{#if link1Url}}<a href="{{link1Url}}" target="_blank">{{link1Label}}</a>{{/if}}
              {{#if link2Url}}<a href="{{link2Url}}" target="_blank">{{link2Label}}</a>{{/if}}
            </div>
          </div>
          {{/each}}
        </div>
      </section>
      {{/if}}

    </div>

  </main>

  <!-- ========================================
       3. Footer（フッター）
       ======================================== -->
  <footer class="footer">
    <div class="footer-inner">
      {{#if footerLogo}}
      <div class="footer-logo">
        <img src="{{footerLogo}}" alt="Footer Logo">
      </div>
      {{/if}}

      {{#if footerLinks}}
      <div class="footer-nav">
        {{#each footerLinks}}
        <a href="{{url}}" target="_blank">{{label}}</a>
        {{/each}}
      </div>
      {{/if}}

      <p class="copyright">{{footerCopyright}}</p>
    </div>
  </footer>

</body>
</html>
```

---

### 構造の絶対ルール（必ず遵守）

#### ✅ 必須事項

1. **セクション順序は厳守**: Hero → About → Release → Tracks → Credits → Footer
2. **`<main>`タグは1つのみ**:
   - **絶対禁止**: `<main>`タグを複数使用すること
   - すべてのコンテンツセクション（About, Release, Tracks, Credits）を1つの`<main>`で内包
   - `<main>`の開始位置: Hero セクションの直後
   - `<main>`の終了位置: Footer セクションの直前
3. **`<div class="container">`の使用箇所**:
   - **About セクションを囲む**: `<main>` → `<div class="container">` → `<section id="about">`
   - **Release セクション内**: `<section id="release">` → `<div class="container">` → `<div class="release-layout">`
   - **Tracks/Credits セクションを囲む**: `<div class="container">` → `<section id="tracks">` と `<section id="credits">`
4. **Release セクションの構造は固定**:
   - 外側: `<section id="release" class="section release-section">`（`<main>`の直下）
   - 内側: `<div class="container">` → `<div class="release-layout">` → ジャケット/情報エリア
   - **重要**: Release セクションは他のセクションと異なり、`container`が内側に配置される
5. **ジャケット画像とアルバム情報の順序**: ジャケット（左） → 情報（右）の順序固定
6. **必須クラス名の使用**:
   - **Hero**: `hero`, `hero-overlay`, `hero-content`, `hero-title`, `hero-subtitle`
   - **About**: `about-section`, `section-header`, `section-title`, `section-line`, `about-content`, `about-text`
   - **Release**: `release-section`, `release-layout`, `jacket-area`, `jacket-img`, `jacket-placeholder`, `info-area`, `info-header`, `album-title`, `artist-name`
   - **Spec List**: `spec-list`, `spec-row` (各行は`<div class="spec-row">`でラップ)
   - **Shop Buttons**: `shop-buttons`, `btn-shop`
   - **Tracks**: `tracks-section`, `track-list-container`, `track-table`, `track-row`, `track-num`, `track-main`, `track-name`, `track-artist`, `track-time`
   - **Credits**: `credits-section`, `credits-grid`, `credit-item`, `credit-role`, `credit-name`, `credit-links`
   - **Footer**: `footer`, `footer-inner`, `footer-logo`, `footer-nav`, `copyright`

#### ❌ 絶対禁止事項

1. ❌ **`<main>`タグの複数使用** - `<main>`は必ず1つのみ（例: `<main>`を2箇所に書くことは絶対禁止）
2. ❌ **`<main>`タグの省略** - `<main>`を書かないことも禁止
3. ❌ **セクション順序の変更**（例: TracksをReleaseより前に配置）
4. ❌ **Release セクションの位置変更**（About と Tracks の間に必ず配置）
5. ❌ **`<main>`内の構造変更**（例: Releaseセクションを`<main>`の外に出す）
6. ❌ **ジャケット画像とアルバム情報の順序逆転**
7. ❌ **余計なラッパー要素の追加**（例: `<div class="jacket-frame">`で`jacket-area`を囲む）
8. ❌ **必須クラス名の変更・省略**
9. ❌ **CSS変数名の変更**（`:root`内の変数名は厳守）
10. ❌ **トリプルブレース`{{{aboutText}}}`の使用**（セキュリティ上禁止）
11. ❌ **外部CDNへの依存**（Google Fontsを除く）

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

### Release セクションの詳細仕様（厳守）

**⚠️ 重要**: Release セクションはアルバム情報の核となる部分であり、すべてのテーマで統一された構造を保つ必要があります。

#### HTML 構造の詳細

```html
<section id="release" class="section release-section">
  <div class="container">
    <div class="release-layout">

      <!-- 左側: ジャケット画像エリア -->
      <div class="jacket-area">
        {{#if jacketImage}}
        <img src="{{jacketImage}}" alt="{{albumTitle}}" class="jacket-img">
        {{else}}
        <div class="jacket-placeholder">
          <span>{{albumTitle}}</span>
        </div>
        {{/if}}
      </div>

      <!-- 右側: アルバム情報エリア -->
      <div class="info-area">
        <div class="info-header">
          <h2 class="album-title">{{albumTitle}}</h2>
          {{#if artistName}}<p class="artist-name">{{artistName}}</p>{{/if}}
        </div>

        {{#if releaseInfo}}
        <dl class="spec-list">
          {{#each releaseInfo}}
          <div class="spec-row">
            <dt>{{label}}</dt>
            <dd>{{value}}</dd>
          </div>
          {{/each}}
        </dl>
        {{/if}}

        {{#if shopLinks}}
        <div class="shop-buttons">
          {{#each shopLinks}}
          <a href="{{url}}" class="btn-shop" target="_blank">{{label}}</a>
          {{/each}}
        </div>
        {{/if}}
      </div>

    </div>
  </div>
</section>
```

#### 構造の必須ポイント

1. **外側から内側の順序**:
   - `<section id="release" class="section release-section">` - 最外側
   - `<div class="container">` - 幅制限コンテナ
   - `<div class="release-layout">` - Flexboxレイアウト用コンテナ
   - `<div class="jacket-area">` と `<div class="info-area">` - 2カラムの内容

2. **ジャケット画像エリア（jacket-area）**:
   - 画像がある場合: `<img src="{{jacketImage}}" alt="{{albumTitle}}" class="jacket-img">`
   - 画像がない場合: `<div class="jacket-placeholder">` でプレースホルダー表示
   - **必須**: `alt`属性にアルバムタイトルを設定（アクセシビリティ）

3. **アルバム情報エリア（info-area）**:
   - **info-header**: アルバムタイトルとアーティスト名
   - **spec-list**: 頒布情報（リリース日、価格など）を`<dl>`要素で表示
   - **shop-buttons**: ショップリンクボタン

4. **スペックリスト（spec-list）の構造**:
   - `<dl class="spec-list">` - 定義リスト
   - 各項目は `<div class="spec-row">` でラップ
   - `<dt>` にラベル（例: "Release", "Price"）
   - `<dd>` に値（例: "2025.04.27", "¥1,500"）

5. **ショップボタン（shop-buttons）**:
   - 各ボタンは `<a href="{{url}}" class="btn-shop" target="_blank">{{label}}</a>`
   - `target="_blank"` で新しいタブで開く
   - デスクトップ: 横並び（`display: flex; flex-direction: row;`）
   - モバイル: 縦並び（`display: flex; flex-direction: column;`）

#### CSS レイアウトの必須仕様

**デスクトップ・タブレット（768px以上）**:

```css
.release-layout {
  display: flex;
  flex-wrap: wrap; /* 重要: 画面幅に応じて折り返し */
  gap: 4rem;
  align-items: center; /* 垂直中央揃え */
  justify-content: center; /* 水平中央揃え */
}

.jacket-area {
  flex: 1;
  min-width: 300px;
  max-width: 500px; /* デスクトップでの最大幅 */
}

.info-area {
  flex: 1;
  min-width: 300px;
}
```

**タブレット（769px〜1024px）**:

```css
@media (max-width: 1024px) and (min-width: 769px) {
  .jacket-area {
    max-width: 380px; /* タブレットではやや小さめに */
  }
}
```

**モバイル（768px以下）**:

```css
@media (max-width: 768px) {
  .release-layout {
    flex-direction: column; /* 縦並びに変更 */
    gap: 2.5rem;
  }

  .jacket-area,
  .info-area {
    max-width: 100%; /* 幅制限を解除 */
  }

  .info-header {
    text-align: center; /* タイトルを中央揃え */
  }

  /* スペックリストをグリッドレイアウトに */
  .spec-row {
    display: grid;
    grid-template-columns: 100px 1fr;
    gap: 0.5rem;
    text-align: left;
    padding: 0.9rem 0;
  }

  /* ショップボタンを縦並びに */
  .shop-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .btn-shop {
    width: 100%;
    text-align: center;
  }
}
```

#### 必須チェックリスト

- [ ] `release-layout` に `flex-wrap: wrap` が設定されているか
- [ ] `release-layout` に `align-items: center` と `justify-content: center` が設定されているか
- [ ] ジャケット画像に `alt`属性が設定されているか
- [ ] スペックリストが `<dl>` 要素を使用しているか
- [ ] 各スペック項目が `<div class="spec-row">` でラップされているか
- [ ] ショップボタンが `target="_blank"` で新しいタブで開くか
- [ ] モバイルで `flex-direction: column` に変更されているか
- [ ] モバイルで `.spec-row` が `display: grid` になっているか
- [ ] モバイルで `.shop-buttons` が `flex-direction: column` になっているか

---

## デザイン・実装の統一仕様

すべてのテンプレートで以下の仕様に従ってください。これにより、テーマ間の互換性とメンテナンス性が向上します。

### レスポンシブデザインの標準化

#### 標準ブレークポイント

すべてのテンプレートで以下のブレークポイントを使用してください：

```css
/* モバイル: 768px以下 */
@media (max-width: 768px) {
  /* スマートフォン向けスタイル */
}

/* タブレット: 769px〜1024px */
@media (max-width: 1024px) and (min-width: 769px) {
  /* タブレット向けスタイル */
}

/* デスクトップ: 1025px以上 */
/* デフォルトスタイルがデスクトップ向け */
```

#### 各ブレークポイントでの必須対応

**モバイル（768px以下）**:
- Hero背景位置: `var(--hero-pos-x-mobile)` と `var(--hero-pos-y-mobile)` を使用
- Release レイアウト: `flex-direction: column` で縦並び
- セクション余白: `padding: 4rem 0` （デスクトップの6remより小さく）
- コンテナ左右余白: `padding: 0 1.5rem` （デスクトップの2remより小さく）
- フォントサイズ: デスクトップの80-90%程度に縮小
- ボタン: 全幅（`width: 100%`）、縦並び

**タブレット（769px〜1024px）**:
- ジャケット画像: `max-width: 380px` 程度に制限
- フォントサイズ: デスクトップの90-95%程度

### 画像の推奨仕様

#### ヒーロー画像（heroImage）
- **推奨サイズ**: 1920×1080 以上（フルHD）
- **アスペクト比**: 16:9 推奨（横長画像）
- **ファイル形式**: JPEG, PNG, WebP
- **ファイルサイズ**: 500KB以下推奨（パフォーマンス考慮）
- **配置**: `background-position` で調整可能（PC/モバイル別設定可）

#### ジャケット画像（jacketImage）
- **推奨サイズ**: 800×800 以上（正方形）
- **アスペクト比**: 1:1（正方形）
- **ファイル形式**: JPEG, PNG, WebP
- **ファイルサイズ**: 200KB以下推奨
- **表示サイズ**: PC最大500px, タブレット380px, モバイル全幅

#### フッターロゴ（footerLogo）
- **推奨サイズ**: 横幅300px程度、高さ60px程度（横長）
- **アスペクト比**: 自由（レーベルロゴに合わせる）
- **ファイル形式**: PNG（透過推奨）, SVG
- **ファイルサイズ**: 50KB以下推奨

### アクセシビリティ要件

すべてのテンプレートで以下のアクセシビリティ要件を満たしてください：

#### 必須項目

1. **セマンティックHTML**:
   - `<header>` - ヒーローセクション
   - `<main>` - メインコンテンツ（1つのみ）
   - `<section>` - 各コンテンツセクション（About, Release, Tracks, Credits）
   - `<footer>` - フッター

2. **画像の代替テキスト**:
   - すべての `<img>` タグに `alt` 属性を設定
   - ヒーロー画像: `background-image` で設定されるため不要
   - ジャケット画像: `alt="{{albumTitle}}"` （アルバムタイトルを設定）
   - フッターロゴ: `alt="Footer Logo"` または レーベル名

3. **リンクのターゲット**:
   - 外部リンク: `target="_blank"` を使用
   - ショップリンク: `target="_blank"` で新しいタブで開く
   - SNSリンク: `target="_blank"` で新しいタブで開く

4. **見出しの階層**:
   - `<h1>` - ヒーロータイトル（1ページに1つ）
   - `<h2>` - セクションタイトル（About, Tracklist, Credits）、アルバムタイトル
   - `<h3>` - 使用する場合はセクション内のサブタイトル

### タイポグラフィとカラーシステム

#### 基準フォントサイズ

```css
body {
  font-size: 16px; /* 基準サイズ: 1rem = 16px */
  line-height: 1.6-2.0; /* 読みやすさを考慮 */
}
```

#### 見出しのスケーリング

```css
.hero-title {
  font-size: 3.5rem; /* 56px */
}

.section-title,
.album-title {
  font-size: 2rem; /* 32px */
}

/* モバイル: 80-90%に縮小 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem; /* 40px, 約71% */
  }

  .section-title,
  .album-title {
    font-size: 1.6rem; /* 25.6px, 80% */
  }

  body {
    font-size: 15px; /* やや小さめに */
  }
}
```

#### カラー変数の体系

```css
:root {
  --primary-color: /* 背景色（例: #f4f9fc） */
  --secondary-color: /* テキスト色（例: #333333） */
  --accent-color: /* ボタン・リンクの強調色（例: #ff9a9e） */
  --overlay-color: /* ヒーローオーバーレイ色（例: #ffffff） */
  --overlay-opacity: /* オーバーレイの不透明度（例: 0.2） */
  --hero-pos-x: /* ヒーロー背景位置X（例: 50%） */
  --hero-pos-y: /* ヒーロー背景位置Y（例: 50%） */
  --hero-pos-x-mobile: /* モバイル用X位置（例: 50%） */
  --hero-pos-y-mobile: /* モバイル用Y位置（例: 25%） */
}
```

**使い分け**:
- `--primary-color`: ページ全体の背景色、セクションの背景色
- `--secondary-color`: テキストの基本色、見出しの色
- `--accent-color`: ボタンの背景色、リンクのホバー色、装飾要素
- `--overlay-color` + `--overlay-opacity`: ヒーローセクションの背景画像上のオーバーレイ

### スペーシングシステム

#### セクション間の余白

```css
.section {
  padding: 6rem 0; /* デスクトップ: 上下96px */
}

@media (max-width: 768px) {
  .section {
    padding: 4rem 0; /* モバイル: 上下64px */
  }
}
```

#### コンテナの左右余白

```css
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 2rem; /* デスクトップ: 左右32px */
}

@media (max-width: 768px) {
  .container {
    padding: 0 1.5rem; /* モバイル: 左右24px */
  }
}
```

#### 要素間のギャップ

```css
.release-layout {
  gap: 4rem; /* デスクトップ: 64px */
}

@media (max-width: 768px) {
  .release-layout {
    gap: 2.5rem; /* モバイル: 40px */
  }
}
```

### トランジション/アニメーション

すべてのインタラクティブ要素に統一されたトランジションを適用してください：

#### 基本設定

```css
a {
  transition: opacity 0.3s ease, color 0.3s ease;
}

a:hover {
  opacity: 0.7; /* ホバー時: 不透明度70% */
  color: var(--accent-color); /* アクセントカラーに変更 */
}

.btn-shop {
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.btn-shop:hover {
  background-color: /* より濃い色に変更 */;
  transform: translateY(-2px); /* やや浮き上がる効果（任意） */
}
```

#### 推奨値

- **デフォルト時間**: 0.3s（300ms）
- **イージング**: `ease` または `ease-in-out`
- **ホバー不透明度**: 0.7（70%）
- **フォーカス**: キーボードナビゲーション用に `:focus` スタイルも設定

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
  "ogpImage": "",
  "primaryColor": "#f4f9fc",
  "secondaryColor": "#4a90e2",
  "accentColor": "#ff9a9e",
  "heroImage": "",
  "heroPositionX": 50,
  "heroPositionY": 50,
  "heroPositionX_mobile": 50,
  "heroPositionY_mobile": 25,
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

- `ogpImage`: OGP画像（SNS共有用）。未設定時は `heroImage` → `jacketImage` の順で自動選択
- `heroPositionX` / `heroPositionY`: 0〜100（%）で位置指定。左/上=0, 右/下=100
- `heroPositionX_mobile` / `heroPositionY_mobile`: モバイル専用の上書き値。未指定なら PC 値を使用
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
      "type": "slider",
      "label": "背景位置（横: 0=左 / 100=右）",
      "min": 0,
      "max": 100,
      "step": 1,
      "unit": "%",
      "default": 50
    },
    {
      "id": "heroPositionY",
      "type": "slider",
      "label": "背景位置（縦: 0=上 / 100=下）",
      "min": 0,
      "max": 100,
      "step": 1,
      "unit": "%",
      "default": 50
    },
    {
      "id": "heroPositionX_mobile",
      "type": "slider",
      "label": "背景位置（横・モバイル）",
      "description": "未指定ならPC値を使用。横長画像なら中央〜やや左寄せ推奨",
      "min": 0,
      "max": 100,
      "step": 1,
      "unit": "%",
      "default": 50
    },
    {
      "id": "heroPositionY_mobile",
      "type": "slider",
      "label": "背景位置（縦・モバイル）",
      "description": "未指定ならPC値を使用。横長画像は上寄せ気味を推奨",
      "min": 0,
      "max": 100,
      "step": 1,
      "unit": "%",
      "default": 25
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

### 4. style.css（モバイル対応必須部分）

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
  background-position: var(--hero-pos-x, 50%) var(--hero-pos-y, 50%);
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

#### リリースセクションのレスポンシブレイアウト（必須）

```css
/* Release Section Base Layout */
.release-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 4rem;
  align-items: center;
  justify-content: center;
}

.jacket-area {
  flex: 1;
  min-width: 300px;
  max-width: 500px;
}

.jacket-img {
  width: 100%;
  height: auto;
  display: block;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

.jacket-placeholder {
  width: 100%;
  aspect-ratio: 1/1;
  background-color: #f4f4f4;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa;
  border: 1px solid #eee;
}

.info-area {
  flex: 1;
  min-width: 300px;
}
```

**重要なポイント**:

1. **`flex-wrap: wrap`** - 画面サイズに応じて自動的に折り返し
2. **`align-items: center`** - 垂直中央揃え（タブレット/デスクトップ時）
3. **`justify-content: center`** - 水平中央揃え（常に中央配置）
4. **`min-width` と `max-width`** - 適切なサイズ範囲を確保
5. **`aspect-ratio: 1/1`** - プレースホルダーを正方形に（モダンCSS）

#### タブレット対応（推奨）

```css
/* Tablet: ジャケットサイズを制限 */
@media (max-width: 1024px) and (min-width: 769px) {
  .jacket-area {
    max-width: 380px;
  }

  .album-title {
    font-size: 2rem;
  }
}
```

**タブレット対応の理由**:

- デフォルトの `max-width: 500px` ではタブレットで大きすぎる
- `380px` 程度に制限することでバランスの良い表示に

#### モバイル対応メディアクエリ（必須）

```css
/* Mobile: リリースセクションを縦並びに */
@media (max-width: 768px) {
  /* Hero背景位置（必須） */
  .hero {
    background-position: var(--hero-pos-x-mobile, var(--hero-pos-x, 50%)) var(--hero-pos-y-mobile, var(--hero-pos-y, 50%)) !important;
  }

  /* Release Section */
  .release-layout {
    flex-direction: column;
    gap: 2.5rem;
  }

  .jacket-area,
  .info-area {
    max-width: 100%;
  }

  .info-header {
    text-align: center;
  }

  /* スペックリストをグリッドレイアウトに */
  .spec-row {
    display: grid;
    grid-template-columns: 100px 1fr;
    gap: 0.5rem;
    text-align: left;
    padding: 0.9rem 0;
  }

  /* ショップボタンを縦並びに */
  .shop-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .btn-shop {
    width: 100%;
    text-align: center;
  }
}
```

**モバイル対応の重要ポイント**:

1. **`flex-direction: column`** - シンプルに縦並びに変更
2. **`max-width: 100%`** - 幅制限を解除
3. **グリッドレイアウト** - スペックリストは `display: grid` で整列
4. **ボタンの縦並び** - ショップボタンは全幅で縦に配置

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

## 生成完了後の厳格な検証チェックリスト

**⚠️ 重要**: 生成したテンプレートを提出する前に、以下のすべての項目を必ず確認してください。

### 🔴 HTML構造チェック（最重要）

#### セクション順序の確認
- [ ] **セクション順序が厳守されているか**: Hero → About → Release → Tracks → Credits → Footer
- [ ] **`<main>`タグは1つのみか**（2つ以上あれば不合格）
- [ ] **Releaseセクションの位置**: About と Tracks の間に配置されているか

#### コンテナ構造の確認
- [ ] **About**: `<div class="container">` の中に `<section id="about">` があるか
- [ ] **Release**: `<section id="release" class="section release-section">` の中に `<div class="container">` → `<div class="release-layout">` があるか
- [ ] **Tracks/Credits**: `<div class="container">` の中に両セクションがあるか

#### Release セクションの詳細構造
- [ ] **ジャケット画像が左側**: `<div class="jacket-area">` が先に配置されているか
- [ ] **アルバム情報が右側**: `<div class="info-area">` が後に配置されているか
- [ ] **余計なラッパーなし**: `jacket-area` や `info-area` を囲む不要な `<div>` が無いか
- [ ] **`{{#if jacketImage}}`**: ジャケット画像の条件分岐があるか
- [ ] **プレースホルダー**: ジャケット画像がない場合の `<div class="jacket-placeholder">` があるか

### 🟡 必須クラス名チェック

#### Hero Section
- [ ] `hero`, `hero-overlay`, `hero-content`, `hero-title` が使用されているか

#### Release Section
- [ ] `release-section`, `release-layout` が使用されているか
- [ ] `jacket-area`, `jacket-img`, `jacket-placeholder` が使用されているか
- [ ] `info-area`, `info-header`, `album-title`, `artist-name` が使用されているか
- [ ] `spec-list`, `spec-row` が使用されているか
- [ ] `shop-buttons`, `btn-shop` が使用されているか

#### Tracks Section
- [ ] `track-table`, `track-row`, `track-num`, `track-name`, `track-time` が使用されているか

#### Credits Section
- [ ] `credits-grid`, `credit-item`, `credit-role`, `credit-name`, `credit-links` が使用されているか

### 🟢 CSS変数とスタイル

#### CSS変数定義（index.html の `<head>` 内）
- [ ] `--primary-color`, `--secondary-color`, `--accent-color` が定義されているか
- [ ] `--overlay-color`, `--overlay-opacity` が定義されているか
- [ ] `--hero-pos-x`, `--hero-pos-y` が定義されているか
- [ ] `--hero-pos-x-mobile`, `--hero-pos-y-mobile` が正しく定義されているか（`{{#if}}` を使用）

#### スタイルシート（style.css）
- [ ] `.hero` の `background-position` が CSS変数を使用しているか
- [ ] `.about-text { white-space: pre-wrap; }` が定義されているか（改行処理）
- [ ] モバイル用 `@media (max-width: 768px)` で `.hero` の `background-position` を上書きしているか

### 🔵 レスポンシブデザイン

#### Release Section のレスポンシブ
- [ ] `.release-layout` に `flex-wrap: wrap` があるか
- [ ] `.release-layout` に `align-items: center` と `justify-content: center` があるか
- [ ] タブレット用 `@media (max-width: 1024px) and (min-width: 769px)` で `jacket-area` の `max-width` を制限しているか
- [ ] モバイル用 `@media (max-width: 768px)` で `flex-direction: column` に変更しているか
- [ ] モバイルで `spec-row` が `display: grid` と `grid-template-columns: 100px 1fr` になっているか
- [ ] モバイルで `shop-buttons` が `flex-direction: column` になっているか

### 📄 JSON ファイル品質

#### manifest.json
- [ ] `id` フィールドが英小文字とハイフンのみか
- [ ] `name` と `description` が適切に設定されているか
- [ ] コメント無し、末尾カンマ無し、UTF-8エンコーディングか

#### config.default.json
- [ ] `heroPositionX`, `heroPositionY` の初期値が設定されているか（推奨: 50, 50）
- [ ] `heroPositionX_mobile`, `heroPositionY_mobile` の初期値が設定されているか（推奨: 50, 25）
- [ ] `releaseInfo` が配列形式で定義されているか
- [ ] コメント無し、末尾カンマ無し、UTF-8エンコーディングか

#### schema.json
- [ ] `heroPositionX`, `heroPositionY` フィールドが type: "slider", min: 0, max: 100 で定義されているか
- [ ] `heroPositionX_mobile`, `heroPositionY_mobile` フィールドが同様に定義されているか
- [ ] `releaseInfo` フィールドが type: "array" で定義されているか
- [ ] コメント無し、末尾カンマ無し、UTF-8エンコーディングか

### 🟣 アクセシビリティとセマンティクス

#### セマンティックHTML
- [ ] `<header>` タグがヒーローセクションに使用されているか
- [ ] `<main>` タグがメインコンテンツを囲んでいるか（1つのみ）
- [ ] `<section>` タグが各セクションに使用されているか
- [ ] `<footer>` タグがフッターに使用されているか

#### 画像の代替テキスト
- [ ] ジャケット画像に `alt="{{albumTitle}}"` が設定されているか
- [ ] フッターロゴに `alt` 属性が設定されているか

#### リンクのターゲット
- [ ] ショップリンクに `target="_blank"` が設定されているか
- [ ] クレジットのSNSリンクに `target="_blank"` が設定されているか
- [ ] フッターリンクに `target="_blank"` が設定されているか

#### 見出しの階層
- [ ] `<h1>` がヒーロータイトルのみに使用されているか（1ページに1つ）
- [ ] `<h2>` がセクションタイトルとアルバムタイトルに使用されているか

### 🎨 デザイン仕様の準拠

#### タイポグラフィ
- [ ] 基準フォントサイズが 16px (1rem) に設定されているか
- [ ] モバイルでフォントサイズが適切に縮小されているか（80-90%）

#### スペーシング
- [ ] セクション余白が `padding: 6rem 0` （デスクトップ）になっているか
- [ ] セクション余白が `padding: 4rem 0` （モバイル）になっているか
- [ ] コンテナ左右余白が `padding: 0 2rem` （デスクトップ）になっているか
- [ ] コンテナ左右余白が `padding: 0 1.5rem` （モバイル）になっているか

#### トランジション
- [ ] リンクに `transition: opacity 0.3s ease, color 0.3s ease` が設定されているか
- [ ] ホバー時に `opacity: 0.7` または色変更が設定されているか

### ❌ 禁止事項の最終確認

以下の項目が**一つでも該当する場合は不合格**です：

- [ ] ❌ セクション順序が変更されていないか（例: TracksがReleaseより前）
- [ ] ❌ `<main>` タグが2つ以上使用されていないか
- [ ] ❌ `<main>` タグが省略されていないか
- [ ] ❌ Release セクションの位置が変更されていないか
- [ ] ❌ `<main>` 内の構造が変更されていないか（例: Releaseを`<main>`の外に出す）
- [ ] ❌ ジャケット画像とアルバム情報の順序が逆転していないか
- [ ] ❌ 余計なラッパー要素が追加されていないか（例: `<div class="jacket-frame">`）
- [ ] ❌ 必須クラス名が変更・省略されていないか
- [ ] ❌ CSS変数名が変更されていないか
- [ ] ❌ `{{{aboutText}}}` （トリプルブレース）が使用されていないか
- [ ] ❌ 外部CDNに依存していないか（Google Fontsを除く）
- [ ] ❌ JSONファイルにコメントや末尾カンマが含まれていないか

### ✅ 最終確認

- [ ] **すべてのチェック項目をクリア**しているか
- [ ] **禁止事項に該当する項目が無い**か
- [ ] **指定されたテーマとスタイル**に合致しているか
- [ ] **出力形式**（Filename: xxx の形式）で提出しているか

---

## 参考: Handlebars ヘルパー

Builder で使用可能なヘルパー：

- `{{#if variable}}...{{/if}}` - 条件分岐
- `{{#each array}}...{{/each}}` - 配列ループ
- `{{#equals a b}}...{{/equals}}` - 等値比較
- `{{extractYouTubeID url}}` - YouTube ID 抽出

---

**では、上記の仕様に従って、指定されたテーマのテンプレートを生成してください。**
