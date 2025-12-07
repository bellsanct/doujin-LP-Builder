import { app, BrowserWindow, ipcMain, dialog, shell, Menu } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';
import AdmZip from 'adm-zip';
import { loadTemplate, validateTemplateFile } from './templateLoader';
import { logger } from './logger';
import type { BuildRequest, BuildResult } from '../types/ipc';
import type { TemplateArchive } from '../types/template';
import { getMainTranslations, Language } from './i18n';

let mainWindow: BrowserWindow | null = null;
let currentLanguage: Language = 'ja';

function createApplicationMenu() {
  const isMac = process.platform === 'darwin';
  const t = getMainTranslations(currentLanguage);
  const template: Electron.MenuItemConstructorOptions[] = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' as const },
        { type: 'separator' as const },
        { role: 'services' as const },
        { type: 'separator' as const },
        { role: 'hide' as const },
        { role: 'hideOthers' as const },
        { role: 'unhide' as const },
        { type: 'separator' as const },
        { role: 'quit' as const }
      ]
    }] : []),
    {
      label: t.menu.file,
      submenu: [
        { label: t.menu.openTemplate, accelerator: 'CmdOrCtrl+O', click: () => mainWindow?.webContents.send('menu-open-template') },
        { label: t.menu.exportHTML, accelerator: 'CmdOrCtrl+S', click: () => mainWindow?.webContents.send('menu-export-html') },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: t.menu.view,
      submenu: [
        { label: t.menu.reload, role: 'reload' },
        { label: t.menu.forceReload, role: 'forceReload' },
        { label: t.menu.toggleDevTools, role: 'toggleDevTools' },
        { type: 'separator' },
        { label: t.menu.resetZoom, role: 'resetZoom' },
        { label: t.menu.zoomIn, role: 'zoomIn' },
        { label: t.menu.zoomOut, role: 'zoomOut' },
        { type: 'separator' },
        { label: t.menu.toggleFullscreen, role: 'togglefullscreen' }
      ]
    },
    {
      label: t.menu.language,
      submenu: [
        {
          label: t.menu.japanese,
          type: 'radio',
          checked: currentLanguage === 'ja',
          click: () => {
            currentLanguage = 'ja';
            mainWindow?.webContents.send('change-language', 'ja');
            createApplicationMenu();
          }
        },
        {
          label: t.menu.english,
          type: 'radio',
          checked: currentLanguage === 'en',
          click: () => {
            currentLanguage = 'en';
            mainWindow?.webContents.send('change-language', 'en');
            createApplicationMenu();
          }
        }
      ]
    },
    {
      label: t.menu.help,
      submenu: [
        { label: t.menu.openDocs, click: async () => { await shell.openExternal('https://github.com/bellsanct/doujin-LP-Builder'); } },
        { label: t.menu.openLogFolder, click: async () => { const logDir = logger.getLogDirectory(); await shell.openPath(logDir); } },
        { type: 'separator' },
        { label: t.menu.about, click: async () => {
          const detail = t.dialogs.aboutDetail
            .replace('{version}', app.getVersion())
            .replace('{electron}', process.versions.electron)
            .replace('{chrome}', process.versions.chrome)
            .replace('{node}', process.versions.node);
          dialog.showMessageBox({
            type: 'info',
            title: t.menu.about,
            message: t.dialogs.aboutMessage,
            detail
          });
        } }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  const t = getMainTranslations(currentLanguage);
  const preloadPath = path.resolve(__dirname, '../preload/index.js');
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
    title: t.dialogs.aboutMessage,
    backgroundColor: '#ffffff',
  });
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
  createApplicationMenu();
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

// IPC
ipcMain.handle('open-template-file', async () => {
  const t = getMainTranslations(currentLanguage);
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Template Archive', extensions: ['zip','dlpt'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    title: t.dialogs.openTemplateTitle
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  const filePath = result.filePaths[0];
  const validation = validateTemplateFile(filePath);
  if (!validation.valid) {
    throw new Error(`Invalid template file:\n${validation.errors.join('\n')}`);
  }
  const template = await loadTemplate(filePath);
  await addRecentTemplate(filePath);
  // serialize assets Map to array of {filename, data:number[]}
  const serialized: any = {
    ...template,
    assets: Array.from(template.assets.entries()).map(([filename, buffer]) => ({ filename, data: Array.from(buffer) })),
  };
  return serialized as TemplateArchive;
});

ipcMain.handle('get-recent-templates', async () => {
  try {
    const recentPath = path.join(app.getPath('userData'), 'recent-templates.json');
    const data = await fs.readFile(recentPath, 'utf8');
    return JSON.parse(data);
  } catch { return []; }
});

async function addRecentTemplate(filePath: string): Promise<void> {
  try {
    const recentPath = path.join(app.getPath('userData'), 'recent-templates.json');
    let recent: string[] = [];
    try { recent = JSON.parse(await fs.readFile(recentPath, 'utf8')); } catch {}
    recent = [filePath, ...recent.filter(p => p !== filePath)].slice(0, 10);
    await fs.writeFile(recentPath, JSON.stringify(recent, null, 2));
  } catch (e) { console.error('Failed to save recent template:', e); }
}

ipcMain.handle('select-file', async (_e, options?: { filters?: { name: string; extensions: string[] }[]; properties?: ('openFile'|'multiSelections')[]; }) => {
  const res = await dialog.showOpenDialog({ properties: options?.properties ?? ['openFile'], filters: options?.filters });
  return res.canceled || res.filePaths.length === 0 ? null : res.filePaths[0];
});

ipcMain.handle('select-save-path', async (_e, options?: { defaultPath?: string; filters?: { name: string; extensions: string[] }[] }) => {
  const res = await dialog.showSaveDialog({
    defaultPath: options?.defaultPath,
    filters: options?.filters ?? [{ name: 'ZIP', extensions: ['zip'] }],
    properties: ['createDirectory', 'showOverwriteConfirmation']
  });
  return res.canceled || !res.filePath ? null : res.filePath;
});

ipcMain.handle('select-directory', async () => {
  const res = await dialog.showOpenDialog({ properties: ['openDirectory','createDirectory'] });
  return res.canceled || res.filePaths.length === 0 ? null : res.filePaths[0];
});

ipcMain.handle('read-file', async (_e, filePath: string) => await fs.readFile(filePath, 'utf8'));
ipcMain.handle('read-file-base64', async (_e, filePath: string) => (await fs.readFile(filePath)).toString('base64'));
ipcMain.handle('write-file', async (_e, filePath: string, content: string) => { await fs.writeFile(filePath, content, 'utf8'); return true; });
ipcMain.handle('create-directory', async (_e, dirPath: string) => { await fs.mkdir(dirPath, { recursive: true }); return true; });
ipcMain.handle('copy-file', async (_e, src: string, dest: string) => { await fs.copyFile(src, dest); return true; });

ipcMain.handle('build-lp', async (_event, options: BuildRequest): Promise<BuildResult> => {
  try {
    if (!options?.outputZipPath) {
      throw new Error('出力先パスが取得できませんでした');
    }
    const { template, config } = options;
    let outputPath = options.outputZipPath;
    if (!outputPath.toLowerCase().endsWith('.zip')) {
      outputPath = `${outputPath}.zip`;
    }
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    const Handlebars = require('handlebars');
    const compiled = Handlebars.compile(template.template);
    const renderedHtml = compiled(config);

    const toAssetEntryPath = (name: string): string => {
      const raw = String(name || '');
      const withoutDrive = raw.replace(/^[a-zA-Z]:/, '');
      const sanitized = withoutDrive.replace(/^[\\/]+/, '').replace(/\\+/g, '/');
      const parts = sanitized.split('/').filter((p: string) => p && p !== '.' && p !== '..');
      const normalized = parts.length > 0 ? parts.join('/') : 'asset';
      return normalized.startsWith('assets/') ? normalized : `assets/${normalized}`;
    };

    const zip = new AdmZip();
    zip.addFile('index.html', Buffer.from(renderedHtml, 'utf-8'));
    zip.addFile('style.css', Buffer.from(template.styles || '', 'utf-8'));
    if (template.scripts) zip.addFile('script.js', Buffer.from(template.scripts, 'utf-8'));

    const assets = (template as any).assets;
    if (Array.isArray(assets)) {
      for (const a of assets as { filename: string; data: number[] }[]) {
        if (!a?.filename) continue;
        try {
          const dataBuffer = Array.isArray(a.data) ? Buffer.from(a.data) : Buffer.from(a.data ?? []);
          const entryPath = toAssetEntryPath(a.filename);
          zip.addFile(entryPath, dataBuffer);
        } catch (e) { console.error('Failed to add asset to zip:', a?.filename, e); }
      }
    } else if (assets && typeof assets === 'object') {
      for (const k of Object.keys(assets)) {
        const data = (assets as any)[k];
        if (!data) continue;
        try {
          const dataBuffer = Array.isArray(data) ? Buffer.from(data) : Buffer.from((data as any).data ?? data);
          const entryPath = toAssetEntryPath(k);
          zip.addFile(entryPath, dataBuffer);
        } catch (e) { console.error('Failed to add asset to zip:', k, e); }
      }
    }

    zip.writeZip(outputPath);
    return { success: true, outputPath };
  } catch (e: any) {
    console.error('Build failed:', e);
    return { success: false, error: e?.message ?? 'unknown error' };
  }
});

// logger IPC
ipcMain.handle('log-debug', async (_e, c: string, m: string, d?: unknown) => { logger.debug(c, m, d); });
ipcMain.handle('log-info', async (_e, c: string, m: string, d?: unknown) => { logger.info(c, m, d); });
ipcMain.handle('log-warn', async (_e, c: string, m: string, d?: unknown) => { logger.warn(c, m, d); });
ipcMain.handle('log-error', async (_e, c: string, m: string, d?: unknown) => { logger.error(c, m, d); });
ipcMain.handle('log-get-path', async () => logger.getLogFilePath());
ipcMain.handle('log-open-directory', async () => { const p = logger.getLogDirectory(); await shell.openPath(p); });
ipcMain.handle('log-set-directory', async () => {
  const res = await dialog.showOpenDialog({ properties: ['openDirectory','createDirectory'] });
  if (!res.canceled && res.filePaths?.[0]) await logger.setLogDirectory(res.filePaths[0]);
});
ipcMain.handle('log-get-level', async () => logger.getLogLevel());
ipcMain.handle('log-set-level', async (_e, level: 'DEBUG'|'INFO'|'WARN'|'ERROR') => { await logger.setLogLevel(level as any); });

