/**
 * Main Process i18n (Internationalization)
 * Menu and dialog translations for Electron main process
 */

export type Language = 'ja' | 'en';

export interface MainTranslations {
  menu: {
    file: string;
    openTemplate: string;
    exportHTML: string;
    close: string;
    quit: string;
    view: string;
    reload: string;
    forceReload: string;
    toggleDevTools: string;
    resetZoom: string;
    zoomIn: string;
    zoomOut: string;
    toggleFullscreen: string;
    language: string;
    japanese: string;
    english: string;
    help: string;
    openDocs: string;
    openLogFolder: string;
    about: string;
  };
  dialogs: {
    openTemplateTitle: string;
    aboutMessage: string;
    aboutDetail: string;
  };
}

const ja: MainTranslations = {
  menu: {
    file: 'ファイル',
    openTemplate: 'テンプレートを開く...',
    exportHTML: 'HTMLをエクスポート...',
    close: '閉じる',
    quit: '終了',
    view: '表示',
    reload: '再読み込み',
    forceReload: '強制再読み込み',
    toggleDevTools: '開発者ツールを開く',
    resetZoom: 'ズームをリセット',
    zoomIn: '拡大',
    zoomOut: '縮小',
    toggleFullscreen: '全画面表示',
    language: '言語',
    japanese: '日本語',
    english: 'English',
    help: 'ヘルプ',
    openDocs: 'ドキュメントを開く',
    openLogFolder: 'ログフォルダを開く',
    about: 'バージョン情報',
  },
  dialogs: {
    openTemplateTitle: 'テンプレートファイルを開く',
    aboutMessage: 'Criclify : 同人サークルのためのホームページビルダー',
    aboutDetail: 'バージョン: {version}\nElectron: {electron}\nChrome: {chrome}\nNode.js: {node}',
  },
};

const en: MainTranslations = {
  menu: {
    file: 'File',
    openTemplate: 'Open Template...',
    exportHTML: 'Export HTML...',
    close: 'Close',
    quit: 'Quit',
    view: 'View',
    reload: 'Reload',
    forceReload: 'Force Reload',
    toggleDevTools: 'Toggle Developer Tools',
    resetZoom: 'Reset Zoom',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    toggleFullscreen: 'Toggle Fullscreen',
    language: 'Language',
    japanese: '日本語',
    english: 'English',
    help: 'Help',
    openDocs: 'Open Documentation',
    openLogFolder: 'Open Log Folder',
    about: 'About',
  },
  dialogs: {
    openTemplateTitle: 'Open Template File',
    aboutMessage: 'Criclify : Homepage Builder for Doujin Circles',
    aboutDetail: 'Version: {version}\nElectron: {electron}\nChrome: {chrome}\nNode.js: {node}',
  },
};

const translations: Record<Language, MainTranslations> = {
  ja,
  en,
};

export function getMainTranslations(language: Language): MainTranslations {
  return translations[language] || translations.ja;
}
