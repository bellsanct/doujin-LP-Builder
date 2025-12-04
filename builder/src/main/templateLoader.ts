import AdmZip from 'adm-zip';
import * as path from 'path';

/**
 * ZIPファイルから読み込んだテンプレートデータ
 */
export interface DLPTemplate {
  filePath: string;
  manifest: {
    id: string;
    name: string;
    version: string;
    description: string;
    category: string;
    author?: any;
    [key: string]: any;
  };
  schema: any;
  defaultConfig: any;
  template: string;
  styles: string;
  scripts: string;
  assets: Map<string, Buffer>;
}

/**
 * ZIPファイルからテンプレートを読み込む
 * @param filePath ZIPファイルのパス
 * @returns テンプレートデータ
 */
export async function loadTemplate(filePath: string): Promise<DLPTemplate> {
  console.log('📦 [TemplateLoader] Loading template from:', filePath);

  try {
    const zip = new AdmZip(filePath);
    const zipEntries = zip.getEntries();

    const template: Partial<DLPTemplate> = {
      filePath,
      assets: new Map(),
    };

    // ZIPエントリを処理
    for (const entry of zipEntries) {
      if (entry.isDirectory) continue;

      const fileName = entry.entryName;
      const baseName = path.posix.basename(fileName);
      const content = entry.getData();

      console.log(`  📄 Processing: ${fileName}`);

      // ファイル名に応じて適切なプロパティに格納
      if (baseName === 'template.json' || baseName === 'manifest.json') {
        template.manifest = JSON.parse(content.toString('utf8'));
      } else if (baseName === 'config.schema.json' || baseName === 'schema.json') {
        template.schema = JSON.parse(content.toString('utf8'));
      } else if (baseName === 'config.default.json') {
        template.defaultConfig = JSON.parse(content.toString('utf8'));
      } else if (baseName === 'index.html' || baseName === 'template.html') {
        template.template = content.toString('utf8');
      } else if (baseName === 'style.css') {
        template.styles = content.toString('utf8');
      } else if (baseName === 'script.js') {
        template.scripts = content.toString('utf8');
      } else if (!fileName.endsWith('.md') && !fileName.startsWith('.')) {
        // README.mdや隠しファイル以外はアセットとして保存
        template.assets!.set(fileName, content);
      }
    }

    // 必須フィールドの検証
    if (!template.manifest) {
      throw new Error('manifest.json not found in template file');
    }
    if (!template.schema) {
      throw new Error('config.schema.json not found in template file');
    }
    if (!template.defaultConfig) {
      throw new Error('config.default.json not found in template file');
    }
    if (!template.template) {
      throw new Error('index.html or template.html not found in template file');
    }
    if (!template.styles) {
      throw new Error('style.css not found in template file');
    }

    console.log('✅ [TemplateLoader] Template loaded successfully');
    console.log(`   ID: ${template.manifest.id}`);
    console.log(`   Name: ${template.manifest.name}`);
    console.log(`   Version: ${template.manifest.version}`);

    return template as DLPTemplate;
  } catch (error) {
    console.error('❌ [TemplateLoader] Failed to load template:', error);
    throw new Error(`Failed to load template: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * テンプレートファイルの妥当性を検証
 * @param filePath ZIPファイルのパス
 * @returns 検証結果
 */
export function validateTemplateFile(filePath: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    // ファイルの拡張子チェック
    if (!filePath.endsWith('.zip')) {
      errors.push('File extension must be .zip');
    }

    // ZIPとして開けるかチェック
    const zip = new AdmZip(filePath);
    const entries = zip.getEntries();

    // 必須ファイルの存在チェック
    const fileNames = entries.map(e => e.entryName);

    // manifest.json または template.json
    if (!fileNames.some(name => name.endsWith('/manifest.json') || name.endsWith('/template.json') || name === 'manifest.json' || name === 'template.json')) {
      errors.push('Required file missing: manifest.json or template.json');
    }

    // config.schema.json または schema.json
    if (!fileNames.some(name => name.endsWith('/config.schema.json') || name.endsWith('/schema.json') || name === 'config.schema.json' || name === 'schema.json')) {
      errors.push('Required file missing: config.schema.json or schema.json');
    }

    // config.default.json
    if (!fileNames.some(name => name.endsWith('/config.default.json') || name === 'config.default.json')) {
      errors.push('Required file missing: config.default.json');
    }

    // style.css
    if (!fileNames.some(name => name.endsWith('/style.css') || name === 'style.css')) {
      errors.push('Required file missing: style.css');
    }

    // index.html または template.html
    const htmlFiles = ['index.html', 'template.html'];
    const hasHtml = htmlFiles.some((html: string) => fileNames.some(name => name.endsWith(`/${html}`) || name === html));
    if (!hasHtml) {
      errors.push('Required file missing: index.html or template.html');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  } catch (error) {
    errors.push(`Invalid ZIP file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { valid: false, errors };
  }
}
