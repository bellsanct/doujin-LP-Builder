/**
 * simple-serifテンプレートの構造を修正するスクリプト
 */
const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');

const dlptPath = path.resolve(__dirname, '../templates/simple-serif.dlpt');

console.log('📦 Fixing simple-serif.dlpt structure...');

// 既存のZIPを読み込み
const oldZip = new AdmZip(dlptPath);
const entries = oldZip.getEntries();

// 新しいZIPを作成
const newZip = new AdmZip();

// 各エントリをルートに配置
entries.forEach(entry => {
  if (entry.isDirectory) {
    return; // ディレクトリエントリはスキップ
  }

  // simple-serif/ プレフィックスを削除
  const newName = entry.entryName.replace(/^simple-serif\//, '');

  if (newName) {
    console.log(`  ✅ Adding: ${newName}`);
    newZip.addFile(newName, entry.getData());
  }
});

// 新しいZIPファイルを保存
newZip.writeZip(dlptPath);

console.log('✅ Fixed simple-serif.dlpt structure');

// 検証
console.log('\n📋 Verification:');
const verifyZip = new AdmZip(dlptPath);
verifyZip.getEntries().forEach(entry => {
  console.log(`  - ${entry.entryName}`);
});
