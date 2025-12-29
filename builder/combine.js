/**
 * テンプレート結合スクリプト
 * template.json + style.css → {template-id}.zip
 *
 * Usage:
 *   node combine.js
 *
 * 注意: このスクリプトはまだ実装されていません。
 * 現時点では、LLMが出力したJSONとCSSを手動でZIPファイルにまとめてください。
 */

const fs = require('fs');
const path = require('path');

console.log('⚠️  このスクリプトはまだ実装されていません。\n');
console.log('現在、テンプレートはブロックベース（template.json）ではなく、');
console.log('従来のHandlebars形式（manifest.json, schema.json, config.default.json, index.html, style.css）が必要です。\n');
console.log('ブロックベースのテンプレートローダーが実装されるまで、');
console.log('従来の形式でテンプレートを作成してください。\n');

process.exit(1);
