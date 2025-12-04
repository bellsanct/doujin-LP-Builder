/**
 * 旧形式のテンプレート（ex/）を新しいZIP形式に変換するスクリプト
 */

const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

/**
 * HTMLファイルからCSS、JavaScript、本体HTMLを分離
 */
function parseHTMLTemplate(htmlContent) {
  // <style>タグ内のCSSを抽出
  const styleMatch = htmlContent.match(/<style>([\s\S]*?)<\/style>/);
  const styles = styleMatch ? styleMatch[1].trim() : '';

  // <script>タグ内のJavaScriptを抽出（JSON-LDは除外）
  const scriptMatches = htmlContent.matchAll(/<script(?!\s+type="application\/ld\+json")>([\s\S]*?)<\/script>/g);
  let scripts = '';
  for (const match of scriptMatches) {
    scripts += match[1].trim() + '\n\n';
  }

  // <style>と<script>（JSON-LD以外）を削除したHTMLを生成
  let cleanHtml = htmlContent
    .replace(/<style>[\s\S]*?<\/style>/, '') // CSSを削除
    .replace(/<script(?!\s+type="application\/ld\+json")>[\s\S]*?<\/script>/g, ''); // JSを削除（JSON-LDは残す）

  return {
    template: cleanHtml.trim(),
    styles: styles,
    scripts: scripts.trim(),
  };
}

/**
 * manifest.jsonを生成
 */
function createManifest(templateName, schemaData) {
  const manifestMap = {
    'kawaii': {
      id: 'kawaii-album-v1',
      name: 'Kawaii Album Template',
      description: 'Cute and colorful music album landing page with kawaii aesthetic',
      category: 'music',
    },
    'miyabi': {
      id: 'miyabi-album-v1',
      name: 'Miyabi Album Template',
      description: 'Elegant Japanese-style music album landing page',
      category: 'music',
    },
    'neon-cyber': {
      id: 'neon-cyber-album-v1',
      name: 'Neon Cyber Album Template',
      description: 'Futuristic cyberpunk-style music album landing page',
      category: 'music',
    },
    'pastel-panic': {
      id: 'pastel-panic-album-v1',
      name: 'Pastel Panic Album Template',
      description: 'Vibrant pastel-colored music album landing page',
      category: 'music',
    },
    'structural': {
      id: 'structural-album-v1',
      name: 'Structural Album Template',
      description: 'Modern minimalist music album landing page',
      category: 'music',
    },
    'winter-crystal': {
      id: 'winter-crystal-album-v1',
      name: 'Winter Crystal Album Template',
      description: 'Cool winter-themed music album landing page',
      category: 'music',
    },
  };

  const info = manifestMap[templateName] || {
    id: `${templateName}-v1`,
    name: `${templateName} Template`,
    description: `Music album landing page template`,
    category: 'music',
  };

  return {
    id: info.id,
    name: info.name,
    version: '1.0.0',
    description: info.description,
    category: info.category,
    author: {
      name: 'Doujin LP Project',
    },
    template: {
      engine: 'handlebars',
      version: '4.7.8',
    },
  };
}

/**
 * テンプレートを変換
 */
function convertTemplate(sourceDir, outputFile) {
  console.log(`\n🔄 Converting: ${path.basename(sourceDir)}`);

  const templateName = path.basename(sourceDir);

  // 必須ファイルの読み込み
  const htmlPath = path.join(sourceDir, 'index.html');
  const schemaPath = path.join(sourceDir, 'schema.json');
  const defaultsPath = path.join(sourceDir, 'defaults.json');

  if (!fs.existsSync(htmlPath)) {
    throw new Error(`index.html not found in ${sourceDir}`);
  }
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`schema.json not found in ${sourceDir}`);
  }
  if (!fs.existsSync(defaultsPath)) {
    throw new Error(`defaults.json not found in ${sourceDir}`);
  }

  // ファイルを読み込み
  const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
  const schemaData = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
  const defaultsData = JSON.parse(fs.readFileSync(defaultsPath, 'utf-8'));

  // HTMLを分離
  const { template, styles, scripts } = parseHTMLTemplate(htmlContent);

  // manifest.jsonを生成
  const manifest = createManifest(templateName, schemaData);

  // ZIPファイルを作成
  const zip = new AdmZip();

  // 必須ファイルを追加
  zip.addFile('manifest.json', Buffer.from(JSON.stringify(manifest, null, 2), 'utf-8'));
  zip.addFile('schema.json', Buffer.from(JSON.stringify(schemaData, null, 2), 'utf-8'));
  zip.addFile('config.default.json', Buffer.from(JSON.stringify(defaultsData, null, 2), 'utf-8'));
  zip.addFile('index.html', Buffer.from(template, 'utf-8'));
  zip.addFile('style.css', Buffer.from(styles, 'utf-8'));

  if (scripts) {
    zip.addFile('script.js', Buffer.from(scripts, 'utf-8'));
  }

  // README.mdを追加
  const readme = `# ${manifest.name}

${manifest.description}

## Version
${manifest.version}

## Category
${manifest.category}

## Usage
Open this .dlpt file with Doujin LP Builder.
`;
  zip.addFile('README.md', Buffer.from(readme, 'utf-8'));

  // ZIPファイルを書き込み
  zip.writeZip(outputFile);

  const stats = fs.statSync(outputFile);
  console.log(`✅ Created: ${path.basename(outputFile)} (${(stats.size / 1024).toFixed(2)} KB)`);
  console.log(`   ID: ${manifest.id}`);
  console.log(`   Name: ${manifest.name}`);
}

/**
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node convert-template.js <source-dir> [output-file.dlpt]');
    console.log('   or: node convert-template.js --all');
    console.log('');
    console.log('Examples:');
    console.log('  node convert-template.js ../ex/kawaii');
    console.log('  node convert-template.js ../ex/kawaii ./output/kawaii.dlpt');
    console.log('  node convert-template.js --all');
    process.exit(1);
  }

  // --all オプション: すべてのテンプレートを変換
  if (args[0] === '--all') {
    const exDir = path.join(__dirname, '..', 'ex');
    const outputDir = path.join(__dirname, '..', 'templates');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const templates = fs.readdirSync(exDir).filter(name => {
      const fullPath = path.join(exDir, name);
      return fs.statSync(fullPath).isDirectory();
    });

    console.log(`📦 Converting ${templates.length} templates...`);

    for (const templateName of templates) {
      const sourceDir = path.join(exDir, templateName);
      const outputFile = path.join(outputDir, `${templateName}.dlpt`);

      try {
        convertTemplate(sourceDir, outputFile);
      } catch (error) {
        console.error(`❌ Failed to convert ${templateName}:`, error.message);
      }
    }

    console.log('\n✅ All templates converted!');
    return;
  }

  // 個別のテンプレートを変換
  const sourceDir = path.resolve(args[0]);
  const outputFile = args[1]
    ? path.resolve(args[1])
    : path.join(path.dirname(sourceDir), `${path.basename(sourceDir)}.dlpt`);

  try {
    convertTemplate(sourceDir, outputFile);
  } catch (error) {
    console.error('❌ Conversion failed:', error.message);
    process.exit(1);
  }
}

main();
