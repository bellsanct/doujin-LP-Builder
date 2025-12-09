# ビルドガイド

Criclifyアプリケーションのビルド手順を説明します。

## 前提条件

- Node.js 18以上
- npm 9以上
- Git

### プラットフォーム固有の要件

#### Windows向けビルド
- **Windows上**: 追加の要件なし
- **macOS/Linux上**: Wineが必要（クロスプラットフォームビルド）

#### macOS向けビルド
- **macOS上**: Xcode Command Line Toolsが必要
- **Windows/Linux上**: macOS向けビルドは不可（制限事項）

#### Linux向けビルド
- **Linux上**: 追加の要件なし
- **Windows/macOS上**: Dockerを使用（推奨）

## ビルド手順

### 1. 依存関係のインストール

```bash
cd builder
npm install
```

### 2. アプリケーションのビルド

プラットフォーム別にビルドコマンドを実行します。

#### Windows用ビルド（.exe生成）

```bash
npm run package:win
```

**成果物**:
- `builder/dist/Criclify Setup 1.0.0.exe` - NSISインストーラー（推奨）
- `builder/dist/Criclify-1.0.0-portable.exe` - ポータブル版（インストール不要）

#### macOS用ビルド（.app生成）

```bash
npm run package:mac
```

**成果物**:
- `builder/dist/Criclify-1.0.0.dmg` - DMGディスクイメージ（内部に`Criclify.app`）
- `builder/dist/Criclify-1.0.0-mac.zip` - ZIPアーカイブ（内部に`Criclify.app`）

#### Linux用ビルド

```bash
npm run package:linux
```

**成果物**:
- `builder/dist/Criclify-1.0.0.AppImage` - AppImage形式
- `builder/dist/criclify_1.0.0_amd64.deb` - Debian/Ubuntuパッケージ

#### 全プラットフォーム一括ビルド

```bash
npm run package:all
```

**注意**: クロスプラットフォームビルドの制約により、macOS向けビルドはmacOS上でのみ可能です。

### 3. 手動ビルド（詳細制御）

ビルドプロセスを分離して実行したい場合:

```bash
# ステップ1: TypeScriptとReactのビルド
npm run build

# ステップ2: electron-builderでパッケージング
npx electron-builder --win  # Windows
npx electron-builder --mac  # macOS
npx electron-builder --linux # Linux
```

## 出力ディレクトリ

すべてのビルド成果物は `builder/dist/` ディレクトリに出力されます。

```
builder/dist/
├── Criclify Setup 1.0.0.exe          # Windows インストーラー
├── Criclify-1.0.0-portable.exe       # Windows ポータブル版
├── Criclify-1.0.0.dmg                # macOS DMGイメージ
├── Criclify-1.0.0-mac.zip            # macOS ZIPアーカイブ
├── Criclify-1.0.0.AppImage           # Linux AppImage
└── criclify_1.0.0_amd64.deb          # Debian/Ubuntuパッケージ
```

## トラブルシューティング

### ビルドが失敗する場合

#### 1. 依存関係のクリーンインストール

```bash
cd builder
rm -rf node_modules package-lock.json
npm install
```

#### 2. distディレクトリのクリーンアップ

```bash
rm -rf builder/dist
```

#### 3. TypeScriptコンパイルエラー

```bash
# TypeScriptのみをビルドして確認
npm run build:main
npm run build:renderer
```

### Windows: "wine not found"エラー

macOS/Linux上でWindows向けビルドを行う場合、Wineのインストールが必要です:

**macOS**:
```bash
brew install wine-stable
```

**Ubuntu/Debian**:
```bash
sudo apt-get install wine64
```

### macOS: Code signing関連のエラー

開発用ビルドの場合、コード署名をスキップできます:

```bash
export CSC_IDENTITY_AUTO_DISCOVERY=false
npm run package:mac
```

### メモリ不足エラー

大規模なビルドでメモリ不足になる場合:

```bash
export NODE_OPTIONS="--max-old-space-size=4096"
npm run package
```

## electron-builder設定

詳細な設定は `builder/electron-builder.yml` を参照してください。

主要な設定項目:
- `appId`: アプリケーションID
- `productName`: 製品名
- `directories`: ビルドリソースと出力先
- `files`: パッケージに含めるファイル
- `win/mac/linux`: プラットフォーム固有の設定

## アイコンの変更

アプリケーションアイコンを変更する場合:

1. `icon.png` をプロジェクトルートに配置（1024x1024px推奨）
2. `builder/build/icon.png` にコピー
3. 再ビルド

electron-builderが自動的にプラットフォーム固有のアイコン形式に変換します:
- Windows: `.ico`
- macOS: `.icns`
- Linux: `.png`

## 配布

### Windows
- **推奨**: `Criclify Setup 1.0.0.exe`（NSISインストーラー）
- **代替**: `Criclify-1.0.0-portable.exe`（ポータブル版）

### macOS
- **推奨**: `Criclify-1.0.0.dmg`
- **代替**: `Criclify-1.0.0-mac.zip`

### Linux
- **AppImage**: 汎用的で依存関係を含む
- **deb**: Debian/Ubuntu系ディストリビューション向け

## 参考リンク

- [electron-builder公式ドキュメント](https://www.electron.build/)
- [Electronドキュメント](https://www.electronjs.org/docs/latest/)
- [プロジェクトREADME](../README.md)
