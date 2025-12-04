/**
 * 単一HTMLからテンプレート骨組みを生成するスクリプト
 *
 * Usage:
 *   node scaffold-from-html.js <details-theme-dir> [--name "Theme Name"] [--category cd-release]
 *
 * Example:
 *   node scaffold-from-html.js ../details/kawaii --name "Kawaii" --category cd-release
 */

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = { dir: '', name: '', category: 'cd-release' };
  const list = argv.slice(2);
  if (!list[0]) return args;
  args.dir = path.resolve(list[0]);
  for (let i = 1; i < list.length; i++) {
    const key = list[i];
    if (key === '--name') {
      args.name = list[++i] || '';
    } else if (key === '--category') {
      args.category = list[++i] || 'cd-release';
    }
  }
  return args;
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function readFileSafe(p) {
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : '';
}

function parseHTML(htmlContent) {
  const styleMatches = [...htmlContent.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
  const styles = styleMatches.map(m => m[1].trim()).join('\n\n');

  const scriptMatches = [...htmlContent.matchAll(/<script(?!\s+type=\"application\/ld\+json\")[^>]*>([\s\S]*?)<\/script>/gi)];
  const scripts = scriptMatches.map(m => m[1].trim()).filter(Boolean).join('\n\n');

  let cleanHtml = htmlContent
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script(?!\s+type=\"application\/ld\+json\")[^>]*>[\s\S]*?<\/script>/gi, '');

  return { template: cleanHtml.trim(), styles: styles.trim(), scripts: scripts.trim() };
}

function titleCase(id) {
  return id
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, s => s.toUpperCase());
}

function scaffold(dir, opts) {
  const indexPath = path.join(dir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    throw new Error(`index.html not found at: ${indexPath}`);
  }

  const rawHtml = fs.readFileSync(indexPath, 'utf-8');
  const { template, styles, scripts } = parseHTML(rawHtml);

  const themeId = path.basename(dir);
  const name = opts.name || titleCase(themeId);
  const category = opts.category || 'cd-release';

  // manifest.json（最小）
  const manifest = {
    id: `${themeId}-v1`,
    name,
    version: '1.0.0',
    description: `${name} Landing Page Template`,
    category,
    author: { name: 'Doujin LP Project' },
    template: { engine: 'handlebars', version: '4.7.8' },
  };

  // schema.json / config.default.json（空でOK）
  const schema = { formSchema: { sections: [] } };
  const defaults = {};

  // 上書き出力（idempotent）
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(dir, 'schema.json'), JSON.stringify(schema, null, 2));
  fs.writeFileSync(path.join(dir, 'config.default.json'), JSON.stringify(defaults, null, 2));
  fs.writeFileSync(path.join(dir, 'index.html'), template || rawHtml, 'utf-8');
  fs.writeFileSync(path.join(dir, 'style.css'), styles || readFileSafe(path.join(dir, 'style.css')), 'utf-8');
  if (scripts) fs.writeFileSync(path.join(dir, 'script.js'), scripts, 'utf-8');

  console.log('✅ Scaffold completed');
  console.log('   - manifest.json');
  console.log('   - schema.json');
  console.log('   - config.default.json');
  console.log('   - index.html (cleaned)');
  console.log(`   - style.css (${styles ? 'extracted' : 'existing/empty'})`);
  if (scripts) console.log('   - script.js (extracted)');
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.dir) {
    console.log('Usage: node scaffold-from-html.js <details-theme-dir> [--name "Theme Name"] [--category cd-release]');
    process.exit(1);
  }
  ensureDir(args.dir);
  try {
    scaffold(args.dir, args);
  } catch (e) {
    console.error('❌ Scaffold failed:', e.message);
    process.exit(1);
  }
}

main();

