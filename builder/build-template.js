/**
 * テンプレートディレクトリをZIPファイルにパッケージ化するスクリプト
 *
 * Usage:
 *   node build-template.js <template-directory> [output-file]
 *
 * Example:
 *   node build-template.js ./templates/music-album-v1
 *   node build-template.js ./templates/music-album-v1 ./output/music-album-v1.zip
 */

const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');

function packageTemplate(templateDir, outputFile) {
  console.log('📦 Packaging template...');
  console.log(`   Source: ${templateDir}`);
  console.log(`   Output: ${outputFile}`);

  // テンプレートディレクトリの存在確認
  if (!fs.existsSync(templateDir)) {
    console.error(`❌ Error: Template directory not found: ${templateDir}`);
    process.exit(1);
  }

  // 必須ファイルの確認
  const requiredFiles = [
    'template.json',
    'config.schema.json',
    'config.default.json',
    'style.css'
  ];

  const htmlFiles = ['index.html', 'template.html'];
  const hasHtml = htmlFiles.some(file =>
    fs.existsSync(path.join(templateDir, file))
  );

  if (!hasHtml) {
    console.error(`❌ Error: index.html or template.html not found`);
    process.exit(1);
  }

  for (const file of requiredFiles) {
    const filePath = path.join(templateDir, file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Error: Required file not found: ${file}`);
      process.exit(1);
    }
  }

  // ZIPファイルを作成
  const zip = new AdmZip();

  // template.jsonをmanifest.jsonとして追加（互換性のため）
  const templateJsonPath = path.join(templateDir, 'template.json');
  if (fs.existsSync(templateJsonPath)) {
    zip.addLocalFile(templateJsonPath, '', 'manifest.json');
    console.log('  ✅ Added: manifest.json (from template.json)');
  }

  // schema.jsonとして追加（互換性のため）
  const schemaPath = path.join(templateDir, 'config.schema.json');
  if (fs.existsSync(schemaPath)) {
    zip.addLocalFile(schemaPath, '', 'schema.json');
    console.log('  ✅ Added: schema.json (from config.schema.json)');
  }

  // ディレクトリ内のすべてのファイルを追加
  const files = fs.readdirSync(templateDir);

  for (const file of files) {
    const filePath = path.join(templateDir, file);
    const stat = fs.statSync(filePath);

    // ディレクトリや隠しファイルはスキップ
    if (stat.isDirectory() || file.startsWith('.')) {
      continue;
    }

    // 既に追加済みのファイルはスキップ
    if (file === 'template.json') {
      continue; // 既にmanifest.jsonとして追加済み
    }
    if (file === 'config.schema.json') {
      continue; // 既にschema.jsonとして追加済み
    }

    zip.addLocalFile(filePath);
    console.log(`  ✅ Added: ${file}`);
  }

  // 出力ディレクトリを作成
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // ZIPファイルとして保存
  zip.writeZip(outputFile);

  // ファイルサイズを取得
  const stats = fs.statSync(outputFile);
  const fileSizeKB = (stats.size / 1024).toFixed(2);

  console.log('');
  console.log('✅ Template packaged successfully!');
  console.log(`   File: ${outputFile}`);
  console.log(`   Size: ${fileSizeKB} KB`);
  console.log('');
  console.log('💡 You can now distribute this ZIP file.');
  console.log('   Users can open it with Doujin LP Builder.');
}

// コマンドライン引数を処理
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: node build-template.js <template-directory> [output-file]');
  console.log('');
  console.log('Example:');
  console.log('  node build-template.js ./templates/music-album-v1');
  console.log('  node build-template.js ./templates/music-album-v1 ./output/music-album-v1.zip');
  process.exit(0);
}

const templateDir = path.resolve(args[0]);
const templateName = path.basename(templateDir);
const outputFile = args[1]
  ? path.resolve(args[1])
  : path.join(templateDir, '..', `${templateName}.zip`);

try {
  packageTemplate(templateDir, outputFile);
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
