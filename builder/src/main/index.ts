import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';
import { loadTemplate, validateTemplateFile } from './templateLoader';
import { logger } from './logger';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  // 絶対パスでpreloadスクリプトを指定
  const preloadPath = path.resolve(__dirname, '../preload/index.js');

  console.log('🔍 [Main] __dirname:', __dirname);
  console.log('🔍 [Main] Preload script path:', preloadPath);
  console.log('🔍 [Main] Preload exists:', require('fs').existsSync(preloadPath));

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      // 開発時に必要な設定を追加
      sandbox: false,
    },
    title: 'Doujin LP Builder',
    backgroundColor: '#ffffff',
  });

  // 開発モードではローカルサーバーから、本番ではビルドされたファイルから読み込み
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  logger.info('App', 'Application started', {
    version: app.getVersion(),
    platform: process.platform,
    arch: process.arch,
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers

/**
 * テンプレートZIPファイルを開くダイアログを表示
 */
ipcMain.handle('open-template-file', async () => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Template Archive', extensions: ['zip'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      title: 'テンプレートファイルを開く'
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const filePath = result.filePaths[0];
    console.log('📂 [Main] Opening template file:', filePath);

    // ファイルの妥当性を検証
    const validation = validateTemplateFile(filePath);
    if (!validation.valid) {
      console.error('❌ [Main] Invalid template file:', validation.errors);
      throw new Error(`Invalid template file:\n${validation.errors.join('\n')}`);
    }

    // テンプレートを読み込み
    const template = await loadTemplate(filePath);

    // 最近使ったファイルリストに追加
    await addRecentTemplate(filePath);

    // BufferをIPCで送信できる形式に変換
    const serializedTemplate = {
      ...template,
      assets: Array.from(template.assets.entries()).map(([filename, buffer]) => ({
        filename,
        data: Array.from(buffer), // BufferをUint8Arrayに変換
      })),
    };

    return serializedTemplate;
  } catch (error) {
    console.error('❌ [Main] Failed to open template file:', error);
    throw error;
  }
});

/**
 * 最近使ったテンプレートファイルのリストを取得
 */
ipcMain.handle('get-recent-templates', async () => {
  try {
    const userDataPath = app.getPath('userData');
    const recentPath = path.join(userDataPath, 'recent-templates.json');

    const data = await fs.readFile(recentPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // ファイルが存在しない場合は空配列を返す
    return [];
  }
});

/**
 * 最近使ったテンプレートリストに追加（内部関数）
 */
async function addRecentTemplate(filePath: string): Promise<void> {
  try {
    const userDataPath = app.getPath('userData');
    const recentPath = path.join(userDataPath, 'recent-templates.json');

    let recent: string[] = [];
    try {
      const data = await fs.readFile(recentPath, 'utf8');
      recent = JSON.parse(data);
    } catch {
      // ファイルが存在しない場合は空配列から開始
    }

    // 重複を削除し、先頭に追加
    recent = recent.filter(p => p !== filePath);
    recent.unshift(filePath);
    recent = recent.slice(0, 10); // 最大10件

    await fs.writeFile(recentPath, JSON.stringify(recent, null, 2));
  } catch (error) {
    console.error('Failed to save recent template:', error);
  }
}

/**
 * ファイル選択ダイアログを開く
 */
ipcMain.handle('select-file', async (event, options: {
  filters?: { name: string; extensions: string[] }[];
  properties?: ('openFile' | 'multiSelections')[];
}) => {
  const result = await dialog.showOpenDialog({
    properties: options.properties || ['openFile'],
    filters: options.filters || [],
  });
  
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  
  return result.filePaths[0];
});

/**
 * ファイルを読み込む
 */
ipcMain.handle('read-file', async (event, filePath: string) => {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return data;
  } catch (error) {
    console.error('Failed to read file:', error);
    throw error;
  }
});

/**
 * ファイルをBase64で読み込む
 */
ipcMain.handle('read-file-base64', async (event, filePath: string) => {
  try {
    const data = await fs.readFile(filePath);
    return data.toString('base64');
  } catch (error) {
    console.error('Failed to read file as base64:', error);
    throw error;
  }
});

/**
 * ディレクトリ選択ダイアログを開く
 */
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory'],
  });
  
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  
  return result.filePaths[0];
});

/**
 * ファイルを保存
 */
ipcMain.handle('write-file', async (event, filePath: string, content: string) => {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
    return true;
  } catch (error) {
    console.error('Failed to write file:', error);
    throw error;
  }
});

/**
 * ディレクトリを作成
 */
ipcMain.handle('create-directory', async (event, dirPath: string) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    return true;
  } catch (error) {
    console.error('Failed to create directory:', error);
    throw error;
  }
});

/**
 * ファイルをコピー
 */
ipcMain.handle('copy-file', async (event, src: string, dest: string) => {
  try {
    await fs.copyFile(src, dest);
    return true;
  } catch (error) {
    console.error('Failed to copy file:', error);
    throw error;
  }
});

/**
 * LPをビルド
 */
ipcMain.handle('build-lp', async (event, options: {
  template: any;
  config: any;
  outputDir: string;
}) => {
  try {
    const { template, config, outputDir } = options;

    console.log('🔨 [Main] Building LP to:', outputDir);

    // 出力ディレクトリを作成
    await fs.mkdir(outputDir, { recursive: true });

    // Handlebarsをインポート（遅延ロード）
    const Handlebars = require('handlebars');

    // Handlebarsヘルパーを登録
    Handlebars.registerHelper('equals', function(this: any, a: any, b: any, options: any) {
      return a === b ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper('contains', function(this: any, array: any, item: any, options: any) {
      if (Array.isArray(array) && array.includes(item)) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    Handlebars.registerHelper('extractYouTubeID', function(url: string) {
      if (!url) return '';
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : '';
    });

    // Handlebarsでテンプレートをコンパイル＆レンダリング
    const compiledTemplate = Handlebars.compile(template.template);
    const renderedHtml = compiledTemplate(config);

    // HTMLファイルを保存
    await fs.writeFile(path.join(outputDir, 'index.html'), renderedHtml, 'utf-8');
    console.log('  ✅ index.html');

    // CSSファイルを保存
    await fs.writeFile(path.join(outputDir, 'style.css'), template.styles, 'utf-8');
    console.log('  ✅ style.css');

    // JSファイルを保存
    if (template.scripts) {
      await fs.writeFile(path.join(outputDir, 'script.js'), template.scripts, 'utf-8');
      console.log('  ✅ script.js');
    }

    // アセット（画像など）を保存
    if (template.assets && Array.isArray(template.assets) && template.assets.length > 0) {
      for (const asset of template.assets) {
        const assetPath = path.join(outputDir, asset.filename);
        const assetDir = path.dirname(assetPath);

        // サブディレクトリがあれば作成
        await fs.mkdir(assetDir, { recursive: true });

        // Bufferに変換して書き込み
        const buffer = Buffer.from(asset.data);
        await fs.writeFile(assetPath, buffer);
        console.log(`  ✅ ${asset.filename}`);
      }
    }

    console.log('✅ [Main] Build completed successfully');

    return {
      success: true,
      outputDir,
    };
  } catch (error) {
    console.error('❌ [Main] Failed to build LP:', error);
    throw error;
  }
});

// ログ関連のIPCハンドラー
ipcMain.handle('log-debug', async (event, category: string, message: string, data?: any) => {
  logger.debug(category, message, data);
});

ipcMain.handle('log-info', async (event, category: string, message: string, data?: any) => {
  logger.info(category, message, data);
});

ipcMain.handle('log-warn', async (event, category: string, message: string, data?: any) => {
  logger.warn(category, message, data);
});

ipcMain.handle('log-error', async (event, category: string, message: string, data?: any) => {
  logger.error(category, message, data);
});

ipcMain.handle('log-get-path', async () => {
  return logger.getLogFilePath();
});

ipcMain.handle('log-open-directory', async () => {
  const logDir = logger.getLogDirectory();
  await shell.openPath(logDir);
});
