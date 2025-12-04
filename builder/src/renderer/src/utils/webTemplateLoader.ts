import JSZip from 'jszip';

export interface SerializedTemplateAsset {
  filename: string;
  data: number[];
}

export interface SerializedTemplate {
  filePath: string;
  manifest: any;
  schema: any;
  defaultConfig: any;
  userConfig?: any;
  metadata?: any;
  template: string;
  styles: string;
  scripts: string;
  assets: SerializedTemplateAsset[];
}

export async function loadTemplateFromBlob(file: File | Blob, fileName?: string): Promise<SerializedTemplate> {
  const zip = await JSZip.loadAsync(file);

  const template: Partial<SerializedTemplate> = {
    filePath: fileName || (file as any).name || 'web-upload',
    assets: [],
  };

  const files = Object.keys(zip.files);
  for (const key of files) {
    const entry = zip.files[key];
    if (entry.dir) continue;

    const baseName = key.split('/').pop() || key;

    if (baseName === 'manifest.json' || baseName === 'template.json') {
      const text = await entry.async('string');
      template.manifest = JSON.parse(text);
    } else if (baseName === 'schema.json' || baseName === 'config.schema.json') {
      const text = await entry.async('string');
      template.schema = JSON.parse(text);
    } else if (baseName === 'config.default.json') {
      const text = await entry.async('string');
      template.defaultConfig = JSON.parse(text);
    } else if (baseName === 'config.user.json') {
      const text = await entry.async('string');
      template.userConfig = JSON.parse(text);
    } else if (baseName === '.dlpt-metadata.json') {
      const text = await entry.async('string');
      template.metadata = JSON.parse(text);
    } else if (baseName === 'index.html' || baseName === 'template.html') {
      template.template = await entry.async('string');
    } else if (baseName === 'style.css') {
      template.styles = await entry.async('string');
    } else if (baseName === 'script.js') {
      template.scripts = await entry.async('string');
    } else if (!baseName.endsWith('.md') && !baseName.startsWith('.')) {
      const buffer = await entry.async('uint8array');
      (template.assets as SerializedTemplateAsset[])!.push({
        filename: key,
        data: Array.from(buffer),
      });
    }
  }

  if (!template.manifest) throw new Error('manifest.json not found');
  if (!template.schema) throw new Error('schema.json not found');
  if (!template.defaultConfig) throw new Error('config.default.json not found');
  if (!template.template) throw new Error('index.html not found');
  if (!template.styles) throw new Error('style.css not found');

  return template as SerializedTemplate;
}
