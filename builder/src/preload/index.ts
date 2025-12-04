import { contextBridge, ipcRenderer } from 'electron';

console.log('🚀 [Preload] Script starting...');

// Renderer側で使えるAPIを公開
contextBridge.exposeInMainWorld('electronAPI', {
  // テンプレートファイル関連
  openTemplateFile: () => ipcRenderer.invoke('open-template-file'),
  getRecentTemplates: () => ipcRenderer.invoke('get-recent-templates'),
  
  // ファイル操作
  selectFile: (options?: {
    filters?: { name: string; extensions: string[] }[];
    properties?: ('openFile' | 'multiSelections')[];
  }) => ipcRenderer.invoke('select-file', options),
  
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  
  readFileBase64: (filePath: string) => ipcRenderer.invoke('read-file-base64', filePath),
  
  writeFile: (filePath: string, content: string) => 
    ipcRenderer.invoke('write-file', filePath, content),
  
  createDirectory: (dirPath: string) => ipcRenderer.invoke('create-directory', dirPath),
  
  copyFile: (src: string, dest: string) => ipcRenderer.invoke('copy-file', src, dest),
  
  // ビルド
  buildLP: (options: {
    template: any;
    config: any;
    outputDir: string;
  }) => ipcRenderer.invoke('build-lp', options),

  // ログ機能
  log: {
    debug: (category: string, message: string, data?: any) =>
      ipcRenderer.invoke('log-debug', category, message, data),
    info: (category: string, message: string, data?: any) =>
      ipcRenderer.invoke('log-info', category, message, data),
    warn: (category: string, message: string, data?: any) =>
      ipcRenderer.invoke('log-warn', category, message, data),
    error: (category: string, message: string, data?: any) =>
      ipcRenderer.invoke('log-error', category, message, data),
    getLogPath: () => ipcRenderer.invoke('log-get-path'),
    openLogDirectory: () => ipcRenderer.invoke('log-open-directory'),
  },
});

console.log('✅ [Preload] Script completed!');
console.log('✅ [Preload] electronAPI exposed to window');

// 型定義をグローバルに追加
declare global {
  interface Window {
    electronAPI: {
      openTemplateFile: () => Promise<any | null>;
      getRecentTemplates: () => Promise<string[]>;
      selectFile: (options?: {
        filters?: { name: string; extensions: string[] }[];
        properties?: ('openFile' | 'multiSelections')[];
      }) => Promise<string | null>;
      selectDirectory: () => Promise<string | null>;
      readFile: (filePath: string) => Promise<string>;
      readFileBase64: (filePath: string) => Promise<string>;
      writeFile: (filePath: string, content: string) => Promise<boolean>;
      createDirectory: (dirPath: string) => Promise<boolean>;
      copyFile: (src: string, dest: string) => Promise<boolean>;
      buildLP: (options: {
        template: any;
        config: any;
        outputDir: string;
      }) => Promise<{ success: boolean; outputDir: string }>;
      log: {
        debug: (category: string, message: string, data?: any) => Promise<void>;
        info: (category: string, message: string, data?: any) => Promise<void>;
        warn: (category: string, message: string, data?: any) => Promise<void>;
        error: (category: string, message: string, data?: any) => Promise<void>;
        getLogPath: () => Promise<string>;
        openLogDirectory: () => Promise<void>;
      };
    };
  }
}
