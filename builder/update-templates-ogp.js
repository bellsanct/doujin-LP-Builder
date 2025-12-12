/**
 * OGP画像設定を全テンプレートに追加するスクリプト
 */
const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');

const templates = ['clearly-memory', 'gothic', 'minimal', 'miyabi', 'nocturne', 'simple-serif'];
const templatesDir = path.resolve(__dirname, '../templates');

templates.forEach(templateName => {
  const dlptPath = path.join(templatesDir, `${templateName}.dlpt`);

  console.log(`\n📦 Processing: ${templateName}`);

  // ZIPファイルを読み込み
  const zip = new AdmZip(dlptPath);

  // schema.jsonを取得して更新
  const schemaEntry = zip.getEntry('schema.json');
  if (schemaEntry) {
    const schemaData = JSON.parse(schemaEntry.getData().toString('utf8'));

    const metaSection = schemaData.formSchema.sections.find(s => s.id === 'meta');
    if (metaSection) {
      const seoIndex = metaSection.fields.findIndex(f => f.id === 'seoDescription');
      if (seoIndex !== -1 && !metaSection.fields.find(f => f.id === 'ogpImage')) {
        metaSection.fields.splice(seoIndex + 1, 0, {
          id: 'ogpImage',
          type: 'image',
          label: 'OGP画像',
          description: 'SNS共有時に表示される画像（未設定時はヒーロー画像→ジャケット画像の順で自動選択）'
        });
        console.log('  ✅ Added ogpImage field to schema.json');
      }
    }

    zip.updateFile('schema.json', Buffer.from(JSON.stringify(schemaData, null, 2), 'utf8'));
  }

  // config.default.jsonを取得して更新
  const configEntry = zip.getEntry('config.default.json');
  if (configEntry) {
    const configData = JSON.parse(configEntry.getData().toString('utf8'));

    if (!configData.hasOwnProperty('ogpImage')) {
      // seoDescriptionの後に追加
      const keys = Object.keys(configData);
      const seoIndex = keys.indexOf('seoDescription');
      if (seoIndex !== -1) {
        const newConfig = {};
        keys.forEach((key, index) => {
          newConfig[key] = configData[key];
          if (index === seoIndex) {
            newConfig.ogpImage = '';
          }
        });
        zip.updateFile('config.default.json', Buffer.from(JSON.stringify(newConfig, null, 2), 'utf8'));
        console.log('  ✅ Added ogpImage field to config.default.json');
      }
    }
  }

  // index.htmlを取得して更新
  const htmlEntry = zip.getEntry('index.html');
  if (htmlEntry) {
    let htmlContent = htmlEntry.getData().toString('utf8');

    // OGPメタタグがまだ追加されていない場合のみ追加
    if (!htmlContent.includes('property="og:image"')) {
      const ogpMetaTags = `
  <!-- OGP画像（優先順位: ogpImage → heroImage → jacketImage → なし） -->
  {{#if ogpImage}}
  <meta property="og:image" content="{{ogpImage}}">
  {{else}}{{#if heroImage}}
  <meta property="og:image" content="{{heroImage}}">
  {{else}}{{#if jacketImage}}
  <meta property="og:image" content="{{jacketImage}}">
  {{/if}}{{/if}}{{/if}}`;

      // <meta name="description">の後に挿入
      htmlContent = htmlContent.replace(
        /(<meta name="description"[^>]*>)/,
        `$1${ogpMetaTags}`
      );

      zip.updateFile('index.html', Buffer.from(htmlContent, 'utf8'));
      console.log('  ✅ Added OGP meta tags to index.html');
    }
  }

  // 更新したZIPファイルを保存
  zip.writeZip(dlptPath);
  console.log(`✅ Updated: ${templateName}.dlpt`);
});

console.log('\n✅ All templates updated successfully!');
