/**
 * テンプレートプレビューサーバー
 *
 * Usage:
 *   node preview-server.js
 *   http://localhost:3000/clearly-memory
 *   http://localhost:3000/minimal
 *   http://localhost:3000/gothic
 *   http://localhost:3000/miyabi
 */

const http = require('http');
const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3003;

// Handlebars ヘルパー登録
Handlebars.registerHelper('extractYouTubeID', function(url) {
  if (!url) return '';
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : '';
});

// テンプレート一覧取得
function getTemplates() {
  return fs.readdirSync(path.join(__dirname, '../details'))
    .filter(dir => {
      const stat = fs.statSync(path.join(__dirname, '../details', dir));
      return stat.isDirectory();
    });
}

// テンプレート一覧ページ HTML
function getIndexPage() {
  const templates = getTemplates();

  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Template Preview - Doujin LP System</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    h1 {
      color: #333;
      border-bottom: 3px solid #4a90e2;
      padding-bottom: 10px;
    }
    .template-list {
      list-style: none;
      padding: 0;
    }
    .template-item {
      background: white;
      margin: 15px 0;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }
    .template-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .template-link {
      text-decoration: none;
      color: #4a90e2;
      font-size: 1.2rem;
      font-weight: bold;
    }
    .template-link:hover {
      text-decoration: underline;
    }
    .note {
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 4px;
      padding: 15px;
      margin: 20px 0;
      color: #856404;
    }
  </style>
</head>
<body>
  <h1>📋 Template Preview</h1>
  <div class="note">
    <strong>Note:</strong> これは開発用プレビューサーバーです。各テンプレートのデフォルト設定でレンダリングされます。
  </div>
  <ul class="template-list">
    ${templates.map(name => `
      <li class="template-item">
        <a href="/${name}" class="template-link">${name}</a>
      </li>
    `).join('')}
  </ul>
</body>
</html>
  `;
}

// テンプレートプレビュー HTML 生成
function renderTemplate(templateName) {
  const templateDir = path.join(__dirname, '../details', templateName);

  // テンプレートディレクトリの存在確認
  if (!fs.existsSync(templateDir)) {
    return { error: 404, message: `Template "${templateName}" not found` };
  }

  try {
    // ファイル読み込み
    const indexHtmlPath = path.join(templateDir, 'index.html');
    const styleCssPath = path.join(templateDir, 'style.css');
    const configPath = path.join(templateDir, 'config.default.json');

    if (!fs.existsSync(indexHtmlPath)) {
      return { error: 404, message: `index.html not found in ${templateName}` };
    }

    const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
    const styleCss = fs.existsSync(styleCssPath) ? fs.readFileSync(styleCssPath, 'utf-8') : '';
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    // Handlebars コンパイル
    const template = Handlebars.compile(indexHtml);
    let renderedHtml = template(config);

    // style.css を埋め込み
    if (styleCss) {
      // 既存の <link rel="stylesheet" href="style.css"> を <style> に置換
      renderedHtml = renderedHtml.replace(
        /<link\s+rel="stylesheet"\s+href="style\.css"\s*\/?>/i,
        `<style>${styleCss}</style>`
      );
    }

    return { html: renderedHtml };
  } catch (error) {
    console.error(`Error rendering ${templateName}:`, error);
    return { error: 500, message: `Error: ${error.message}` };
  }
}

// HTTP サーバー作成
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS ヘッダー設定
  res.setHeader('Access-Control-Allow-Origin', '*');

  // ルートパス - サービス紹介LP
  if (pathname === '/') {
    const landingPath = path.join(__dirname, 'landing.html');
    if (fs.existsSync(landingPath)) {
      const landingHtml = fs.readFileSync(landingPath, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(landingHtml);
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(getIndexPage());
    }
    return;
  }

  // テンプレートプレビュー
  const templateName = pathname.substring(1); // 先頭の / を削除
  const result = renderTemplate(templateName);

  if (result.error) {
    res.writeHead(result.error, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(result.message);
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(result.html);
});

server.listen(PORT, () => {
  console.log(`\n🚀 Template Preview Server running at http://localhost:${PORT}`);
  console.log(`\nAvailable templates:`);

  const templates = getTemplates();

  templates.forEach(name => {
    console.log(`   http://localhost:${PORT}/${name}`);
  });

  console.log(`\n📋 Template list: http://localhost:${PORT}\n`);
});
