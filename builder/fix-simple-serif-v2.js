/**
 * simple-serifテンプレートの構造を修正するスクリプト（v2）
 * 安全にデータを読み込んで再パッケージング
 */
const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');

const dlptPath = path.resolve(__dirname, '../templates/simple-serif.dlpt');
const backupPath = path.resolve(__dirname, '../templates/simple-serif.dlpt.bak');

console.log('📦 Fixing simple-serif.dlpt structure (v2)...');

// バックアップを作成
fs.copyFileSync(dlptPath, backupPath);
console.log('  ✅ Created backup: simple-serif.dlpt.bak');

// 既存のZIPを読み込み
const oldZip = new AdmZip(dlptPath);
const entries = oldZip.getEntries();

// 新しいZIPを作成
const newZip = new AdmZip();

// 必要なファイルのみを抽出してルートに配置
const requiredFiles = ['config.default.json', 'index.html', 'manifest.json', 'schema.json', 'style.css'];

entries.forEach(entry => {
  if (entry.isDirectory) {
    return;
  }

  // ファイル名を取得（パスを除去）
  const fileName = path.basename(entry.entryName);

  if (requiredFiles.includes(fileName)) {
    try {
      // データを文字列として読み込み
      const data = entry.getData();
      console.log(`  ✅ Adding: ${fileName} (${data.length} bytes)`);
      newZip.addFile(fileName, data);
    } catch (err) {
      console.error(`  ❌ Error reading ${fileName}:`, err.message);
    }
  }
});

// 新しいZIPファイルを保存
newZip.writeZip(dlptPath);
console.log('✅ Fixed simple-serif.dlpt structure');

// 検証
console.log('\n📋 Verification:');
const verifyZip = new AdmZip(dlptPath);
verifyZip.getEntries().forEach(entry => {
  console.log(`  - ${entry.entryName} (${entry.header.size} bytes)`);
});

console.log('\n💡 Backup saved as: simple-serif.dlpt.bak');
