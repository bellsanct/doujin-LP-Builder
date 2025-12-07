import type { TemplateSchema } from './schema';

export interface Manifest {
  id: string;
  name: string;
  version: string;
  description: string;
  category: string;
  author?: { name?: string; url?: string } | string;
  [key: string]: unknown;
}

export type AssetMap = Map<string, Uint8Array>;
export interface AssetEntry { filename: string; data: Uint8Array }
export type AssetCollection = AssetMap | AssetEntry[] | Record<string, Uint8Array>;

export type UserConfig = Record<string, unknown>;

export interface TemplateArchive {
  filePath: string;
  manifest: Manifest;
  schema: TemplateSchema;
  defaultConfig: UserConfig;
  userConfig?: UserConfig;
  template: string; // HTML template
  styles: string;   // CSS
  scripts: string;  // JS
  assets: AssetMap;
  metadata?: Record<string, unknown>;
}

