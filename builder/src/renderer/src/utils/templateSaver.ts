import JSZip from 'jszip';

interface Template {
  filePath: string;
  manifest: any;
  schema: any;
  defaultConfig: any;
  template: string;
  styles: string;
  scripts: string;
  assets: Map<string, Buffer | Uint8Array>;
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
