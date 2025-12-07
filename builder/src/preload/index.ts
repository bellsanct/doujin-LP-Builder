import { contextBridge, ipcRenderer } from 'electron';
import type { ElectronAPI } from '../types/ipc';

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

  selectSavePath: (options?: {
    defaultPath?: string;
    filters?: { name: string; extensions: string[] }[];
  }) => ipcRenderer.invoke('select-save-path', options),
  
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
    outputZipPath: string;
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
    setLogDirectory: () => ipcRenderer.invoke('log-set-directory'),
    getLogLevel: () => ipcRenderer.invoke('log-get-level'),
    setLogLevel: (level: 'DEBUG'|'INFO'|'WARN'|'ERROR') => ipcRenderer.invoke('log-set-level', level),
  },

  // メニューイベントリスナー
  onMenuEvent: (channel: string, callback: (...args: any[]) => void) => {
    const handler = (_event: any, ...args: any[]) => callback(...args);
    ipcRenderer.on(channel, handler);
    // クリーンアップ用の関数を返す
    return () => ipcRenderer.removeListener(channel, handler);
  },
} as ElectronAPI);

console.log('✅ [Preload] Script completed!');
console.log('✅ [Preload] electronAPI exposed to window');

// 型定義をグローバルに追加
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
