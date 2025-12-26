/**
 * ブロックレジストリ
 * 各ブロックタイプのメタ情報とデフォルト値を管理
 */

import type { BlockType, Block } from '../types/block-system';

export interface BlockDefinition {
  type: BlockType;
  label: string;
  icon: string;
  category: 'layout' | 'media' | 'content' | 'navigation' | 'utility';
  description?: string;

  // デフォルト値
  defaultSettings: any;
  defaultContent: any;
}

export const blockRegistry: Record<BlockType, BlockDefinition> = {
  hero: {
    type: 'hero',
    label: 'ヒーロー',
    icon: '📄',
    category: 'layout',
    description: 'メインビジュアルセクション',
    defaultSettings: {
      backgroundPosition: { x: 50, y: 50 },
      backgroundSize: 'cover',
      height: 'viewport',
      overlay: {
        enabled: true,
        color: '#ffffff',
        opacity: 20,
      },
      alignment: 'center',
    },
    defaultContent: {
      title: 'タイトル',
      subtitle: 'サブタイトル',
    },
  },

  text: {
    type: 'text',
    label: 'テキスト',
    icon: '📝',
    category: 'content',
    description: 'リッチテキストブロック',
    defaultSettings: {
      fontSize: 'medium',
      alignment: 'left',
    },
    defaultContent: {
      html: '<p>テキストを入力...</p>',
    },
  },

  heading: {
    type: 'heading',
    label: '見出し',
    icon: '📌',
    category: 'content',
    description: '見出しブロック',
    defaultSettings: {
      level: 2,
      alignment: 'left',
    },
    defaultContent: {
      text: '見出し',
    },
  },

  image: {
    type: 'image',
    label: '画像',
    icon: '🖼️',
    category: 'media',
    description: '画像ブロック',
    defaultSettings: {
      width: 'content',
      objectFit: 'cover',
      alignment: 'center',
    },
    defaultContent: {
      src: '',
      alt: '',
    },
  },

  gallery: {
    type: 'gallery',
    label: 'ギャラリー',
    icon: '🎨',
    category: 'media',
    description: '画像ギャラリー',
    defaultSettings: {
      layout: 'grid',
      columns: 3,
      gap: 16,
    },
    defaultContent: {
      images: [],
    },
  },

  video: {
    type: 'video',
    label: '動画',
    icon: '🎬',
    category: 'media',
    description: '動画埋め込み',
    defaultSettings: {
      alignment: 'center',
    },
    defaultContent: {
      url: '',
    },
  },

  audio: {
    type: 'audio',
    label: '音声',
    icon: '🎧',
    category: 'media',
    description: '音声プレイヤー',
    defaultSettings: {
      alignment: 'center',
    },
    defaultContent: {
      url: '',
    },
  },

  tracklist: {
    type: 'tracklist',
    label: 'トラックリスト',
    icon: '🎵',
    category: 'content',
    description: '楽曲リスト',
    defaultSettings: {
      showNumbers: true,
      showArtist: true,
      showDuration: true,
      enablePlayback: false,
    },
    defaultContent: {
      tracks: [
        {
          id: '1',
          number: '01',
          title: '曲名',
          artist: 'アーティスト',
          duration: '4:00',
        },
      ],
    },
  },

  credits: {
    type: 'credits',
    label: 'クレジット',
    icon: '👥',
    category: 'content',
    description: 'クレジット表示',
    defaultSettings: {
      layout: 'grid',
      columns: 2,
      gap: 24,
      showAvatars: true,
      showBios: false,
      showLinks: true,
    },
    defaultContent: {
      groups: [
        {
          id: '1',
          title: 'グループ名',
          items: [
            {
              id: '1',
              role: '役割',
              name: '名前',
              links: [],
            },
          ],
        },
      ],
    },
  },

  'shop-links': {
    type: 'shop-links',
    label: 'ショップリンク',
    icon: '🔗',
    category: 'navigation',
    description: 'ショップへのリンク',
    defaultSettings: {
      layout: 'horizontal',
      buttonStyle: 'solid',
      showIcons: true,
      alignment: 'center',
    },
    defaultContent: {
      links: [
        {
          id: '1',
          label: 'BOOTH',
          url: '#',
        },
      ],
    },
  },

  button: {
    type: 'button',
    label: 'ボタン',
    icon: '🔘',
    category: 'navigation',
    description: 'CTAボタン',
    defaultSettings: {
      style: 'solid',
      size: 'medium',
      fullWidth: false,
      openInNewTab: false,
      alignment: 'center',
    },
    defaultContent: {
      text: 'ボタン',
      url: '#',
    },
  },

  divider: {
    type: 'divider',
    label: '区切り線',
    icon: '➖',
    category: 'utility',
    description: '区切り線',
    defaultSettings: {
      style: 'solid',
      thickness: 1,
      width: 100,
      alignment: 'center',
    },
    defaultContent: {},
  },

  spacer: {
    type: 'spacer',
    label: 'スペーサー',
    icon: '📏',
    category: 'utility',
    description: '余白',
    defaultSettings: {
      height: 40,
    },
    defaultContent: {},
  },

  columns: {
    type: 'columns',
    label: 'カラム',
    icon: '▦',
    category: 'layout',
    description: 'カラムレイアウト',
    defaultSettings: {
      columns: 2,
      gap: 24,
      stackOnMobile: true,
    },
    defaultContent: {},
  },

  embed: {
    type: 'embed',
    label: 'カスタムHTML',
    icon: '💻',
    category: 'utility',
    description: 'HTML埋め込み',
    defaultSettings: {
      alignment: 'center',
    },
    defaultContent: {
      html: '',
    },
  },
};

/**
 * 新しいブロックインスタンスを作成
 */
export function createBlock(type: BlockType, order: number = 0): Block {
  const definition = blockRegistry[type];
  if (!definition) {
    throw new Error(`Unknown block type: ${type}`);
  }

  return {
    id: generateBlockId(),
    type,
    order,
    visible: true,
    settings: { ...definition.defaultSettings },
    content: JSON.parse(JSON.stringify(definition.defaultContent)),
  };
}

/**
 * ブロックIDを生成
 */
function generateBlockId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * カテゴリ別にブロックを取得
 */
export function getBlocksByCategory(category: BlockDefinition['category']): BlockDefinition[] {
  return Object.values(blockRegistry).filter((block) => block.category === category);
}

/**
 * すべてのカテゴリを取得
 */
export function getAllCategories(): BlockDefinition['category'][] {
  return ['layout', 'media', 'content', 'navigation', 'utility'];
}
