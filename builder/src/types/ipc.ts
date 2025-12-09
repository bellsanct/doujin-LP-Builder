import type { TemplateArchive, UserConfig } from './template';

export interface BuildRequest {
  template: TemplateArchive;
  config: UserConfig;
  outputZipPath: string;
}

export interface BuildResult {
  success: boolean;
  outputPath?: string;
  error?: string;
}

export interface LoggerAPI {
  debug: (category: string, message: string, data?: unknown) => Promise<void>;
  info: (category: string, message: string, data?: unknown) => Promise<void>;
  warn: (category: string, message: string, data?: unknown) => Promise<void>;
  error: (category: string, message: string, data?: unknown) => Promise<void>;
  getLogPath: () => Promise<string>;
  openLogDirectory: () => Promise<void>;
  setLogDirectory: () => Promise<void>;
  getLogLevel: () => Promise<'DEBUG'|'INFO'|'WARN'|'ERROR'>;
  setLogLevel: (level: 'DEBUG'|'INFO'|'WARN'|'ERROR') => Promise<void>;
}

export interface ElectronAPI {
  openTemplateFile: () => Promise<TemplateArchive | null>;
  getRecentTemplates: () => Promise<string[]>;
  openTemplateFromPath: (filePath: string) => Promise<TemplateArchive>;
  selectFile: (options?: {
    filters?: { name: string; extensions: string[] }[];
    properties?: ('openFile' | 'multiSelections')[];
  }) => Promise<string | null>;
  selectSavePath: (options?: { defaultPath?: string; filters?: { name: string; extensions: string[] }[] }) => Promise<string | null>;
  selectDirectory: () => Promise<string | null>;
  readFile: (filePath: string) => Promise<string>;
  readFileBase64: (filePath: string) => Promise<string>;
  writeFile: (filePath: string, content: string) => Promise<boolean>;
  createDirectory: (dirPath: string) => Promise<boolean>;
  copyFile: (src: string, dest: string) => Promise<boolean>;
  buildLP: (options: BuildRequest) => Promise<BuildResult>;
  log: LoggerAPI;
  onMenuEvent: (channel: string, callback: () => void) => () => void;
}
