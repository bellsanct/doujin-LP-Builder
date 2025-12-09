import AdmZip from 'adm-zip';
import * as path from 'path';
import type { TemplateArchive } from '../types/template';
import type { Language } from './i18n';

export async function loadTemplate(filePath: string): Promise<TemplateArchive> {
  const zip = new AdmZip(filePath);
  const entries = zip.getEntries();

  const result: Partial<TemplateArchive> = {
    filePath,
    assets: new Map<string, Buffer>(),
  } as Partial<TemplateArchive>;

  for (const entry of entries) {
    if (entry.isDirectory) continue;
    const fileName = entry.entryName;
    const base = path.posix.basename(fileName);
    const buf = entry.getData();
    const text = () => buf.toString('utf8');

    if (base === 'manifest.json' || base === 'template.json') {
      result.manifest = JSON.parse(text());
    } else if (base === 'schema.json' || base === 'config.schema.json') {
      result.schema = JSON.parse(text());
    } else if (base === 'config.default.json') {
      result.defaultConfig = JSON.parse(text());
    } else if (base === 'config.user.json') {
      try { (result as any).userConfig = JSON.parse(text()); } catch {}
    } else if (base === '.dlpt-metadata.json') {
      try { (result as any).metadata = JSON.parse(text()); } catch {}
    } else if (base === 'index.html' || base === 'template.html') {
      result.template = text();
    } else if (base === 'style.css') {
      result.styles = text();
    } else if (base === 'script.js') {
      result.scripts = text();
    } else if (!fileName.endsWith('.md') && !fileName.startsWith('.')) {
      (result.assets as Map<string, Buffer>).set(fileName, buf);
    }
  }

  if (!result.manifest) throw new Error('manifest.json not found');
  if (!result.schema) throw new Error('schema.json not found');
  if (!result.defaultConfig) throw new Error('config.default.json not found');
  if (!result.template) throw new Error('index.html not found');
  if (!result.styles) throw new Error('style.css not found');

  return result as TemplateArchive;
}

export function validateTemplateFile(filePath: string, language: Language = 'ja'): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const isJa = language === 'ja';
  const missing = (desc: string) => isJa ? `必須ファイルが見つかりません: ${desc}` : `Required file missing: ${desc}`;
  try {
    const lower = filePath.toLowerCase();
    if (!lower.endsWith('.dlpt')) {
      errors.push(isJa ? '.dlpt拡張子のテンプレートを選択してください' : 'File extension must be .dlpt');
    }
    const zip = new AdmZip(filePath);
    const names = zip.getEntries().map(e => e.entryName);
    const hasAny = (cands: string[]) => names.some(n => cands.some(c => n.endsWith('/' + c) || n === c));
    if (!hasAny(['manifest.json', 'template.json'])) errors.push(missing('manifest.json or template.json'));
    if (!hasAny(['schema.json', 'config.schema.json'])) errors.push(missing('schema.json or config.schema.json'));
    if (!hasAny(['config.default.json'])) errors.push(missing('config.default.json'));
    if (!hasAny(['style.css'])) errors.push(missing('style.css'));
    if (!hasAny(['index.html', 'template.html'])) errors.push(missing('index.html or template.html'));
    return { valid: errors.length === 0, errors };
  } catch (e) {
    return { valid: false, errors: [isJa ? 'テンプレートファイルを読み込めませんでした' : 'Invalid DLPT file'] };
  }
}
