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

  const toAssetEntryPath = (name: string): string => {
    const raw = String(name || '');
    const withoutDrive = raw.replace(/^[a-zA-Z]:/, '');
    const sanitized = withoutDrive.replace(/^[\\/]+/, '').replace(/\\+/g, '/');
    const parts = sanitized.split('/').filter((p: string) => p && p !== '.' && p !== '..');
    const normalized = parts.length > 0 ? parts.join('/') : 'asset';
    return normalized.startsWith('assets/') ? normalized : `assets/${normalized}`;
  };

  const toUint8Array = (data: any): Uint8Array | null => {
    try {
      if (data instanceof Uint8Array) return data;
      if (Array.isArray(data)) return new Uint8Array(data);
      if (typeof data === 'string') {
        // base64 string
        if (typeof Buffer !== 'undefined') return Uint8Array.from(Buffer.from(data, 'base64'));
        const bin = atob(data);
        const arr = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i += 1) arr[i] = bin.charCodeAt(i);
        return arr;
      }
      if ((data as any)?.type === 'Buffer' && Array.isArray((data as any).data)) {
        return new Uint8Array((data as any).data);
      }
    } catch {}
    return null;
  };

  const assetBufferMap = new Map<string, { filename: string; buffer: Uint8Array }>();
  const recordAssetBuffer = (filename: string, buf: Uint8Array) => {
    try {
      // Simple hash for dedup
      let hash = 0;
      for (let i = 0; i < buf.length; i += 1) {
        hash = (hash * 31 + buf[i]) >>> 0;
      }
      assetBufferMap.set(String(hash), { filename, buffer: buf });
    } catch {}
  };

  const mimeExtMap: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'image/webp': 'webp',
    'image/x-icon': 'ico'
  };

  const preloadExistingAssets = (assets: any) => {
    try {
      if (typeof assets?.forEach === 'function' && typeof assets.size === 'number') {
        (assets as Map<string, any>).forEach((data: any, filename: string) => {
          const arr = toUint8Array(data);
          if (!arr) return;
          recordAssetBuffer(toAssetEntryPath(filename), arr);
        });
      } else if (Array.isArray(assets)) {
        for (const a of assets) {
          const arr = toUint8Array(a?.data);
          if (!a?.filename || !arr) continue;
          recordAssetBuffer(toAssetEntryPath(a.filename), arr);
        }
      } else if (assets && typeof assets === 'object') {
        for (const k of Object.keys(assets)) {
          const arr = toUint8Array((assets as any)[k]);
          if (!arr) continue;
          recordAssetBuffer(toAssetEntryPath(k), arr);
        }
      }
    } catch {}
  };

  const extractedAssets: { filename: string; buffer: Uint8Array }[] = [];
  let inlineAssetCounter = 0;
  const seenInline = new Map<string, string>();
  const extractDataUrls = (content: string, kind: 'html' | 'css'): string => {
    if (!content) return content;
    const dataUrlRegex = /data:([^;]+);base64,([A-Za-z0-9+/=\\s]+?)(?=[\"'\\)\\s]|$)/g;
    return content.replace(dataUrlRegex, (_m, mime, base64) => {
      const mimeLower = String(mime || '').toLowerCase().trim();
      const normalizedBase64 = String(base64 || '').replace(/\s+/g, '');
      if (!normalizedBase64) return _m;

      const key = `${mimeLower}:${normalizedBase64.substring(0, 32)}`;
      const existing = seenInline.get(key);
      if (existing) return existing;

      let buffer: Uint8Array | null = null;
      try {
        if (typeof Buffer !== 'undefined') {
          buffer = Uint8Array.from(Buffer.from(normalizedBase64, 'base64'));
        } else {
          const bin = atob(normalizedBase64);
          const arr = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i += 1) arr[i] = bin.charCodeAt(i);
          buffer = arr;
        }
      } catch {}

      if (!buffer) return _m;

      // Reuse existing asset name if content matches
      let filename = '';
      try {
        let hash = 0;
        for (let i = 0; i < buffer.length; i += 1) hash = (hash * 31 + buffer[i]) >>> 0;
        const match = assetBufferMap.get(String(hash));
        if (match) {
          filename = toAssetEntryPath(match.filename);
        }
      } catch {}

      if (!filename) {
        inlineAssetCounter += 1;
        const ext = mimeExtMap[mimeLower] || 'bin';
        filename = `assets/inline-${kind}-${inlineAssetCounter}.${ext}`;
        extractedAssets.push({ filename, buffer });
      }

      seenInline.set(key, filename);
      return filename;
    });
  };

  preloadExistingAssets(template.assets);
  let renderedHtml = extractDataUrls(html, 'html');
  const stylesContent = extractDataUrls(template.styles || '', 'css');

  zip.file('index.html', renderedHtml);
  zip.file('style.css', stylesContent || '');
  if (template.scripts) {
    zip.file('script.js', template.scripts);
  }

  // Write assets for Map / Array / Object
  const addAsset = (filename: string, data: any) => {
    if (!filename) return;
    const arr = toUint8Array(data);
    if (!arr) return;
    const entryPath = toAssetEntryPath(filename);
    zip.file(entryPath, arr as any);
    recordAssetBuffer(entryPath, arr);
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

  // Add extracted inline assets
  extractedAssets.forEach(({ filename, buffer }) => {
    const entryPath = toAssetEntryPath(filename);
    zip.file(entryPath, buffer as any);
    recordAssetBuffer(entryPath, buffer);
  });

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
