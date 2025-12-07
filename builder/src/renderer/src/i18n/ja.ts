/**
 * 日本語翻訳
 */
export const ja = {
  // Common
  common: {
    save: '保存',
    cancel: 'キャンセル',
    delete: '削除',
    edit: '編集',
    close: '閉じる',
    open: '開く',
    back: '戻る',
    next: '次へ',
    preview: 'プレビュー',
    settings: '設定',
  },

  // Menu
  menu: {
    file: 'ファイル',
    openTemplate: 'テンプレートを開く',
    save: '保存',
    exportHTML: 'HTMLをエクスポート',
    quit: '終了',
    edit: '編集',
    undo: '元に戻す',
    redo: 'やり直す',
    cut: '切り取り',
    copy: 'コピー',
    paste: '貼り付け',
    selectAll: 'すべて選択',
    view: '表示',
    reload: '再読み込み',
    forceReload: '強制再読み込み',
    toggleDevTools: '開発者ツールを開く',
    resetZoom: 'ズームをリセット',
    zoomIn: '拡大',
    zoomOut: '縮小',
    toggleFullscreen: '全画面表示',
    help: 'ヘルプ',
    about: 'バージョン情報',
  },

  // Preview Pane
  preview: {
    toolbar: {
      desktop: 'デスクトップ',
      tablet: 'タブレット',
      mobile: 'モバイル',
    },
    interactive: {
      editLabel: '編集',
      clickToEdit: 'クリックして編集',
    },
  },

  // Config Editor
  editor: {
    search: {
      placeholder: '設定を検索...',
      noResults: '検索結果がありません',
    },
    sections: {
      basic: '基本設定',
      design: 'デザイン',
      content: 'コンテンツ',
      effects: 'エフェクト',
    },
    fields: {
      required: '必須',
      optional: '任意',
    },
    array: {
      add: '項目を追加',
      remove: '削除',
      moveUp: '上へ移動',
      moveDown: '下へ移動',
    },
    image: {
      upload: '画像をアップロード',
      change: '画像を変更',
      remove: '画像を削除',
    },
  },

  // Template Opener
  templateOpener: {
    title: 'テンプレートを選択',
    description: '使用するテンプレートを選択してください',
    openFile: 'ファイルから開く',
    openFileDescription: '.zip または .dlpt ファイルを選択',
    recentTemplates: '最近使用したテンプレート',
    browse: '参照',
  },

  // Header
  header: {
    openAnother: '別のテンプレートを開く',
    build: 'ビルド',
  },

  // Messages
  messages: {
    saveSuccess: '保存しました',
    saveFailed: '保存に失敗しました',
    buildSuccess: 'ビルド完了！\n出力先: {path}',
    buildFailed: 'ビルドに失敗しました',
    confirmSwitchTemplate: '別のテンプレートを開きますか？未保存の変更は失われます。',
    selectTemplate: 'テンプレートと設定を選択してください',
  },

  // Build
  build: {
    selectOutput: '出力先を選択',
    building: 'ビルド中...',
    complete: 'ビルド完了',
  },
} as const;

export type TranslationKey = typeof ja;
