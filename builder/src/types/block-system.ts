/**
 * ブロックエディターシステムのコア型定義
 * schema不要のシンプルな設計
 */

// ==========================================
// Block Types
// ==========================================

export type BlockType =
  | 'hero'           // ヒーローセクション
  | 'text'           // リッチテキスト
  | 'heading'        // 見出し
  | 'image'          // 画像
  | 'gallery'        // 画像ギャラリー
  | 'video'          // 動画埋め込み
  | 'audio'          // 音声プレイヤー
  | 'release'        // リリース情報（ジャケット+情報+ショップリンク統合）
  | 'tracklist'      // トラックリスト
  | 'credits'        // クレジット
  | 'shop-links'     // ショップリンク（非推奨: releaseブロックを使用）
  | 'button'         // ボタン/CTA
  | 'divider'        // 区切り線
  | 'spacer'         // スペーサー
  | 'columns'        // カラムレイアウト
  | 'embed';         // カスタムHTML埋め込み

// ==========================================
// Block Structure
// ==========================================

export interface Block<T = any, S = any> {
  id: string;
  type: BlockType;
  order: number;
  visible: boolean;

  settings: S;
  content: T;

  // ネストされたブロック（columns等で使用）
  children?: Block[];
}

// ==========================================
// Common Settings
// ==========================================

export interface BaseBlockSettings {
  backgroundColor?: string;
  padding?: SpacingValue;
  margin?: { top: number; bottom: number };
  maxWidth?: number;
  alignment?: 'left' | 'center' | 'right';
  customClass?: string;

  animation?: {
    type: 'fade' | 'slide' | 'zoom' | 'none';
    duration: number;
    delay: number;
  };
}

export interface SpacingValue {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// ==========================================
// Block-Specific Types
// ==========================================

// Hero Block
export interface HeroBlock extends Block<HeroBlockContent, HeroBlockSettings> {
  type: 'hero';
}

export interface HeroBlockContent {
  title?: string;
  subtitle?: string;
  ctaButton?: {
    text: string;
    url: string;
  };
}

export interface HeroBlockSettings extends BaseBlockSettings {
  backgroundImage?: string;
  backgroundPosition: { x: number; y: number };
  backgroundSize: 'cover' | 'contain' | 'auto';
  height: 'viewport' | 'auto' | { value: number; unit: 'px' | 'vh' };
  overlay: {
    enabled: boolean;
    color: string;
    opacity: number;
  };
}

// Text Block
export interface TextBlock extends Block<TextBlockContent, TextBlockSettings> {
  type: 'text';
}

export interface TextBlockContent {
  text: string;  // プレーンテキスト
}

export interface TextBlockSettings extends BaseBlockSettings {
  alignment?: 'left' | 'center' | 'right';
}

// Heading Block
export interface HeadingBlock extends Block<HeadingBlockContent, HeadingBlockSettings> {
  type: 'heading';
}

export interface HeadingBlockContent {
  text: string;
}

export interface HeadingBlockSettings extends BaseBlockSettings {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  fontSize?: number;
}

// Image Block
export interface ImageBlock extends Block<ImageBlockContent, ImageBlockSettings> {
  type: 'image';
}

export interface ImageBlockContent {
  src: string;
  alt?: string;
  caption?: string;
  link?: string;
}

export interface ImageBlockSettings extends BaseBlockSettings {
  width?: 'full' | 'content' | 'custom';
  customWidth?: number;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  borderRadius?: number;
}

// Gallery Block
export interface GalleryBlock extends Block<GalleryBlockContent, GalleryBlockSettings> {
  type: 'gallery';
}

export interface GalleryBlockContent {
  images: {
    id: string;
    src: string;
    alt?: string;
    caption?: string;
  }[];
}

export interface GalleryBlockSettings extends BaseBlockSettings {
  layout: 'grid' | 'masonry' | 'carousel';
  columns?: number;
  gap?: number;
  aspectRatio?: string;
}

// Tracklist Block
export interface TracklistBlock extends Block<TracklistBlockContent, TracklistBlockSettings> {
  type: 'tracklist';
}

export interface TracklistBlockContent {
  tracks: {
    id: string;
    number: string;
    title: string;
    artist?: string;
    duration?: string;
    audioUrl?: string;
  }[];
}

export interface TracklistBlockSettings extends BaseBlockSettings {
  showNumbers: boolean;
  showArtist: boolean;
  showDuration: boolean;
  enablePlayback: boolean;
}

// Credits Block
export interface CreditsBlock extends Block<CreditsBlockContent, CreditsBlockSettings> {
  type: 'credits';
}

export interface CreditsBlockContent {
  groups: CreditsGroup[];
}

export interface CreditsGroup {
  id: string;
  title?: string;
  items: CreditItem[];
}

export interface CreditItem {
  id: string;
  role: string;
  name: string;
  avatar?: string;
  bio?: string;
  links?: {
    id: string;
    label: string;
    url: string;
    /** @deprecated iconフィールドは使用されなくなりました。HTML構造から絵文字を撤廃しました。 */
    icon?: string;
  }[];
}

export interface CreditsBlockSettings extends BaseBlockSettings {
  layout: 'list' | 'grid' | 'masonry';
  columns?: number;
  gap?: number;
  showAvatars: boolean;
  showBios: boolean;
  showLinks: boolean;
}

// Shop Links Block
export interface ShopLinksBlock extends Block<ShopLinksBlockContent, ShopLinksBlockSettings> {
  type: 'shop-links';
}

export interface ShopLinksBlockContent {
  links: {
    id: string;
    label: string;
    url: string;
    /** @deprecated iconフィールドは使用されなくなりました。HTML構造から絵文字を撤廃しました。 */
    icon?: string;
  }[];
}

export interface ShopLinksBlockSettings extends BaseBlockSettings {
  layout: 'horizontal' | 'vertical' | 'grid';
  buttonStyle: 'solid' | 'outline' | 'text';
  showIcons: boolean;
}

// Release Block (Album Info + Jacket + Shop Links)
export interface ReleaseBlock extends Block<ReleaseBlockContent, ReleaseBlockSettings> {
  type: 'release';
}

export interface ReleaseBlockContent {
  jacketImage?: string;
  albumTitle: string;
  artistName?: string;
  releaseInfo: {
    id: string;
    label: string;
    value: string;
  }[];
  shopLinks: {
    id: string;
    label: string;
    url: string;
  }[];
}

export interface ReleaseBlockSettings extends BaseBlockSettings {
  layout: 'side-by-side' | 'stacked';
  jacketPosition: 'left' | 'right';
}

// Button Block
export interface ButtonBlock extends Block<ButtonBlockContent, ButtonBlockSettings> {
  type: 'button';
}

export interface ButtonBlockContent {
  text: string;
  url: string;
}

export interface ButtonBlockSettings extends BaseBlockSettings {
  style: 'solid' | 'outline' | 'text';
  size: 'small' | 'medium' | 'large';
  fullWidth: boolean;
  openInNewTab: boolean;
}

// Divider Block
export interface DividerBlock extends Block<DividerBlockContent, DividerBlockSettings> {
  type: 'divider';
}

export interface DividerBlockContent {
  // 空
}

export interface DividerBlockSettings extends BaseBlockSettings {
  style: 'solid' | 'dashed' | 'dotted';
  thickness: number;
  color?: string;
  width: number;
}

// Spacer Block
export interface SpacerBlock extends Block<SpacerBlockContent, SpacerBlockSettings> {
  type: 'spacer';
}

export interface SpacerBlockContent {
  // 空
}

export interface SpacerBlockSettings extends BaseBlockSettings {
  height: number;
}

// Columns Block
export interface ColumnsBlock extends Block<ColumnsBlockContent, ColumnsBlockSettings> {
  type: 'columns';
}

export interface ColumnsBlockContent {
  // childrenブロックがコンテンツを保持
}

export interface ColumnsBlockSettings extends BaseBlockSettings {
  columns: number;
  gap: number;
  stackOnMobile: boolean;
  columnWidths?: number[];  // カスタム幅配分
}

// Embed Block
export interface EmbedBlock extends Block<EmbedBlockContent, EmbedBlockSettings> {
  type: 'embed';
}

export interface EmbedBlockContent {
  html: string;
}

export interface EmbedBlockSettings extends BaseBlockSettings {
  aspectRatio?: string;
}

// ==========================================
// Project Structure
// ==========================================

export interface Project {
  version: string;
  template: string;
  templateCSS: string;  // テンプレートCSS（.dlptに内包）
  globalSettings: GlobalSettings;
  blocks: Block[];
}

export interface GlobalSettings {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    [key: string]: string;
  };

  typography: {
    headingFont: string;
    bodyFont: string;
    baseSize: number;
    scale: number;
  };

  layout: {
    maxWidth: number;
    gutter: number;
  };

  // テンプレート固有のCSS変数
  cssVars?: Record<string, string>;
}

// ==========================================
// Template Structure
// ==========================================

export interface TemplateManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description?: string;
  thumbnail?: string;
  tags?: string[];

  // このテンプレートで使えるブロックタイプ
  supportedBlocks: BlockType[];

  // デフォルトのグローバル設定
  defaultGlobalSettings: GlobalSettings;

  // プリセット（よく使う組み合わせ）
  presets?: {
    name: string;
    description?: string;
    blocks: Block[];
  }[];
}
