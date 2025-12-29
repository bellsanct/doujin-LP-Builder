import AdmZip from 'adm-zip';
import * as path from 'path';
import type { TemplateArchive } from '../types/template';
import type { Project } from '../types/block-system';
import type { Language } from './i18n';

export async function loadTemplate(filePath: string): Promise<TemplateArchive> {
  console.log('[TemplateLoader] Loading template:', filePath);
  const zip = new AdmZip(filePath);
  const entries = zip.getEntries();

  // ZIPの中身をスキャンして形式を判定
  const fileMap = new Map<string, AdmZip.IZipEntry>();
  for (const entry of entries) {
    if (!entry.isDirectory) {
      const base = path.posix.basename(entry.entryName);
      fileMap.set(base, entry);
      console.log('[TemplateLoader] Found file:', base);
    }
  }

  // ブロックベース形式のチェック（template.json + style.css）
  const hasTemplateJson = fileMap.has('template.json');
  const hasStyleCss = fileMap.has('style.css');
  const hasManifestJson = fileMap.has('manifest.json');
  const hasIndexHtml = fileMap.has('index.html') || fileMap.has('template.html');

  console.log('[TemplateLoader] Format detection:', {
    hasTemplateJson,
    hasStyleCss,
    hasManifestJson,
    hasIndexHtml
  });

  // ブロックベース形式として処理
  if (hasTemplateJson && hasStyleCss && !hasManifestJson && !hasIndexHtml) {
    console.log('[TemplateLoader] Loading as block-based template');
    return loadBlockBasedTemplate(zip, fileMap, filePath);
  }

  // Handlebars形式として処理（従来のロジック）
  console.log('[TemplateLoader] Loading as Handlebars template');
  return loadHandlebarsTemplate(zip, entries, filePath);
}

/**
 * ブロックベース形式のテンプレート読み込み
 * LLMドキュメント仕様: template.json + style.css
 */
function loadBlockBasedTemplate(
  zip: AdmZip,
  fileMap: Map<string, AdmZip.IZipEntry>,
  filePath: string
): TemplateArchive {
  console.log('[BlockBasedTemplate] Starting block-based template load');
  const templateEntry = fileMap.get('template.json');
  const cssEntry = fileMap.get('style.css');

  if (!templateEntry || !cssEntry) {
    throw new Error('Block-based template requires template.json and style.css');
  }

  const templateJson = templateEntry.getData().toString('utf8');
  const css = cssEntry.getData().toString('utf8');
  console.log('[BlockBasedTemplate] template.json size:', templateJson.length);
  console.log('[BlockBasedTemplate] style.css size:', css.length);

  const project: Project = JSON.parse(templateJson);
  console.log('[BlockBasedTemplate] Parsed project:', {
    version: project.version,
    template: project.template,
    blocksCount: project.blocks?.length
  });

  // CSSを埋め込み
  project.templateCSS = css;

  // TemplateArchive形式に変換
  const result: TemplateArchive = {
    filePath,
    manifest: {
      id: project.template,
      name: project.template,
      version: project.version,
      description: `Block-based template: ${project.template}`,
      category: 'block-based',
    },
    schema: { formSchema: { sections: [] } }, // ブロックベースはschema不要
    defaultConfig: {}, // globalSettingsから生成可能だが、今は空
    template: '', // ブロックベースではHTMLテンプレート不要
    styles: project.templateCSS,
    scripts: '',
    assets: new Map<string, Buffer>(),
    metadata: {
      blockBased: true,
      project, // Projectデータ全体を保存
    },
  };

  // アセットファイルを収集
  for (const entry of zip.getEntries()) {
    if (entry.isDirectory) continue;
    const fileName = entry.entryName;
    const base = path.posix.basename(fileName);
    if (base !== 'template.json' && base !== 'style.css' && !fileName.startsWith('.')) {
      result.assets.set(fileName, entry.getData());
    }
  }

  return result;
}

/**
 * Handlebars形式のテンプレート読み込み（従来のロジック）
 */
function loadHandlebarsTemplate(
  zip: AdmZip,
  entries: AdmZip.IZipEntry[],
  filePath: string
): TemplateArchive {
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
    // テンプレート(.zip)とプロジェクト(.dlpt)の両方を許可
    if (!lower.endsWith('.dlpt') && !lower.endsWith('.zip')) {
      errors.push(isJa ? '.dlpt または .zip 拡張子のファイルを選択してください' : 'File extension must be .dlpt or .zip');
    }
    const zip = new AdmZip(filePath);
    const names = zip.getEntries().map(e => e.entryName);
    const hasAny = (cands: string[]) => names.some(n => cands.some(c => n.endsWith('/' + c) || n === c));

    // 形式判定
    const hasTemplateJson = hasAny(['template.json']);
    const hasStyleCss = hasAny(['style.css']);
    const hasManifestJson = hasAny(['manifest.json']);
    const hasIndexHtml = hasAny(['index.html', 'template.html']);

    // ブロックベース形式（template.json + style.css）
    if (hasTemplateJson && hasStyleCss && !hasManifestJson && !hasIndexHtml) {
      // ブロックベース形式のバリデーション
      if (!hasTemplateJson) errors.push(missing('template.json'));
      if (!hasStyleCss) errors.push(missing('style.css'));
      return { valid: errors.length === 0, errors };
    }

    // Handlebars形式のバリデーション
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
