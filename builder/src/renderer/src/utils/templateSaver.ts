import JSZip from 'jszip';
import Handlebars from 'handlebars';

interface Template {
  filePath: string;
  manifest: any;
  schema: any;
  defaultConfig: any;
  template: string;
  styles: string;
  scripts: string;
  assets: any;
}

export async function saveTemplateWithUserConfig(
  template: Template,
  userConfig: any
): Promise<void> {
  const zip = new JSZip();

  // テンプレートファイルを追加
  zip.file('manifest.json', JSON.stringify(template.manifest, null, 2));
  zip.file('schema.json', JSON.stringify(template.schema, null, 2));
  zip.file('config.default.json', JSON.stringify(template.defaultConfig, null, 2));
  zip.file('index.html', template.template);
  zip.file('style.css', template.styles);

  if (template.scripts) {
    zip.file('script.js', template.scripts);
  }

  // ユーザーの編集内容を保存
  zip.file('config.user.json', JSON.stringify(userConfig, null, 2));

  // メタデータを追加
  const metadata = {
    version: '1.0.0',
    savedAt: new Date().toISOString(),
    builderVersion: '1.0.0',
    templateId: template.manifest.id,
    type: 'work-in-progress'
  };
  zip.file('.dlpt-metadata.json', JSON.stringify(metadata, null, 2));

  // アセットを追加
  template.assets.forEach((data, filename) => {
    zip.file(filename, data);
  });

  // ZIPファイルを生成してダウンロード
  const blob = await zip.generateAsync({ type: 'blob' });

  // ファイル名を生成（テンプレートIDベース）
  const fileName = `${template.manifest.id || 'template'}_draft.dlpt`;

  // ダウンロード
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

// Fallback build: browser-side ZIP of static site (index.html, style.css, script.js, assets)
export async function exportStaticSiteZip(template: Template, config: any): Promise<void> {
  const zip = new JSZip();

  // Compile HTML using Handlebars
  const compiled = Handlebars.compile(template.template);
  const html = compiled(config);

  zip.file('index.html', html);
  zip.file('style.css', template.styles || '');
  if (template.scripts) {
    zip.file('script.js', template.scripts);
  }

  // Write assets for Map / Array / Object
  const addAsset = (filename: string, data: any) => {
    if (!filename) return;
    if (data instanceof Uint8Array || Array.isArray(data)) {
      zip.file(filename, data as any);
    } else if (typeof data === 'string') {
      // Try base64 string
      zip.file(filename, data, { base64: true });
    } else if (typeof Buffer !== 'undefined' && (data as any)?.type === 'Buffer' && Array.isArray((data as any).data)) {
      zip.file(filename, (data as any).data);
    }
  };

  const assets = template.assets;
  try {
    if (assets) {
      if (typeof assets.forEach === 'function' && typeof assets.size === 'number') {
        (assets as Map<string, any>).forEach((data: any, filename: string) => addAsset(filename, data));
      } else if (Array.isArray(assets)) {
        for (const a of assets) addAsset(a.filename, a.data);
      } else if (typeof assets === 'object') {
        for (const k of Object.keys(assets)) addAsset(k, (assets as any)[k]);
      }
    }
  } catch {}

  const blob = await zip.generateAsync({ type: 'blob' });
  const fileName = `${template.manifest?.id || 'lp'}-build.zip`;
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
