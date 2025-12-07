import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import { app } from 'electron';

/**
 * ログレベル
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * ログエントリ
 */
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
}

class Logger {
  private logDir: string;
  private logFilePath: string;
  private maxLogSize = 10 * 1024 * 1024; // 10MB
  private maxLogFiles = 5;
  private settingsPath: string;
  private settings: Record<string, any> = {};
  private minLevel: LogLevel = LogLevel.WARN;

  constructor() {
    // ログディレクトリをユーザーデータディレクトリに設定
    this.logDir = path.join(app.getPath('userData'), 'logs');
    this.logFilePath = path.join(this.logDir, 'app.log');
    this.ensureLogDirectory();

    // 設定ファイルを読み込み、保存先が指定されていれば適用
    this.settingsPath = path.join(app.getPath('userData'), 'settings.json');
    this.loadSettingsSync();
    const configured = (this.settings && typeof this.settings.logDir === 'string') ? this.settings.logDir : '';
    if (configured && configured.trim().length > 0 && configured !== this.logDir) {
      this.logDir = configured;
      this.logFilePath = path.join(this.logDir, 'app.log');
      this.ensureLogDirectory();
    }

    // ログレベルの適用（未設定時はWARN）
    const level = this.settings && typeof this.settings.logLevel === 'string' ? this.settings.logLevel as LogLevel : null;
    if (level && LogLevel[level as keyof typeof LogLevel]) {
      this.minLevel = level as LogLevel;
    }
  }

  /**
   * ログディレクトリを作成
   */
  private async ensureLogDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create log directory:', error);
    }
  }

  private loadSettingsSync(): void {
    try {
      if (fsSync.existsSync(this.settingsPath)) {
        const raw = fsSync.readFileSync(this.settingsPath, 'utf-8');
        this.settings = JSON.parse(raw || '{}');
      }
    } catch {
      this.settings = {};
    }
  }

  private async saveSettings(): Promise<void> {
    try {
      const dir = path.dirname(this.settingsPath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(this.settingsPath, JSON.stringify(this.settings, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }

  private levelOrder(level: LogLevel): number {
    switch (level) {
      case LogLevel.DEBUG: return 10;
      case LogLevel.INFO: return 20;
      case LogLevel.WARN: return 30;
      case LogLevel.ERROR: return 40;
      default: return 20;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelOrder(level) >= this.levelOrder(this.minLevel);
  }

  /**
   * ログファイルのローテーション
   */
  private async rotateLogFile(): Promise<void> {
    try {
      const stats = await fs.stat(this.logFilePath);

      if (stats.size > this.maxLogSize) {
        // 既存のログファイルをリネーム
        for (let i = this.maxLogFiles - 1; i > 0; i--) {
          const oldPath = path.join(this.logDir, `app.log.${i}`);
          const newPath = path.join(this.logDir, `app.log.${i + 1}`);

          try {
            await fs.rename(oldPath, newPath);
          } catch {
            // ファイルが存在しない場合は無視
          }
        }

        // 現在のログファイルを .1 にリネーム
        await fs.rename(this.logFilePath, path.join(this.logDir, 'app.log.1'));
      }
    } catch (error) {
      // ファイルが存在しない場合は無視
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error('Failed to rotate log file:', error);
      }
    }
  }

  /**
   * ログエントリをフォーマット
   */
  private formatApacheDate(d: Date): string {
    const dd = String(d.getDate()).padStart(2, '0');
    const mon = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()];
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    const tzMin = d.getTimezoneOffset();
    const tzSign = tzMin > 0 ? '-' : '+';
    const tzAbs = Math.abs(tzMin);
    const tzH = String(Math.floor(tzAbs / 60)).padStart(2, '0');
    const tzM = String(tzAbs % 60).padStart(2, '0');
    return `${dd}/${mon}/${yyyy}:${hh}:${mm}:${ss} ${tzSign}${tzH}${tzM}`;
  }

  private formatLogEntry(entry: LogEntry): string {
    const dataStr = entry.data ? ` ${JSON.stringify(entry.data)}` : '';
    const apacheDate = this.formatApacheDate(new Date(entry.timestamp));
    return `[${apacheDate}] ${entry.level.padEnd(5)} [${entry.category}] ${entry.message}${dataStr}\n`;
  }

  /**
   * ログを書き込み
   */
  private async writeLog(level: LogLevel, category: string, message: string, data?: any): Promise<void> {
    if (!this.shouldLog(level)) return;
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
    };

    const logLine = this.formatLogEntry(entry);

    // コンソールにも出力
    const consoleMethod = level === LogLevel.ERROR ? console.error :
                         level === LogLevel.WARN ? console.warn : console.log;
    consoleMethod(logLine.trim());

    try {
      // ローテーションチェック
      await this.rotateLogFile();

      // ログファイルに追記
      await fs.appendFile(this.logFilePath, logLine, 'utf-8');
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

  /**
   * DEBUGログ
   */
  public debug(category: string, message: string, data?: any): void {
    this.writeLog(LogLevel.DEBUG, category, message, data);
  }

  /**
   * INFOログ
   */
  public info(category: string, message: string, data?: any): void {
    this.writeLog(LogLevel.INFO, category, message, data);
  }

  /**
   * WARNログ
   */
  public warn(category: string, message: string, data?: any): void {
    this.writeLog(LogLevel.WARN, category, message, data);
  }

  /**
   * ERRORログ
   */
  public error(category: string, message: string, data?: any): void {
    this.writeLog(LogLevel.ERROR, category, message, data);
  }

  /**
   * ログディレクトリのパスを取得
   */
  public getLogDirectory(): string {
    return this.logDir;
  }

  /**
   * 現在のログファイルパスを取得
   */
  public getLogFilePath(): string {
    return this.logFilePath;
  }

  /**
   * ログ保存先の変更
   */
  public async setLogDirectory(dir: string): Promise<void> {
    this.logDir = dir;
    this.logFilePath = path.join(this.logDir, 'app.log');
    await this.ensureLogDirectory();
    this.settings = this.settings || {};
    this.settings.logDir = dir;
    await this.saveSettings();
    this.info('Logger', `Log directory changed to: ${dir}`);
  }

  /**
   * ログレベルの取得/設定
   */
  public getLogLevel(): LogLevel {
    return this.minLevel;
  }

  public async setLogLevel(level: LogLevel): Promise<void> {
    this.minLevel = level;
    this.settings = this.settings || {};
    this.settings.logLevel = level;
    await this.saveSettings();
    this.info('Logger', `Log level changed to: ${level}`);
  }

  /**
   * ログファイルの内容を取得
   */
  public async readLogFile(maxLines?: number): Promise<string> {
    try {
      const content = await fs.readFile(this.logFilePath, 'utf-8');

      if (maxLines) {
        const lines = content.split('\n');
        return lines.slice(-maxLines).join('\n');
      }

      return content;
    } catch (error) {
      return '';
    }
  }

  /**
   * 全ログファイルをクリア
   */
  public async clearLogs(): Promise<void> {
    try {
      const files = await fs.readdir(this.logDir);

      for (const file of files) {
        if (file.startsWith('app.log')) {
          await fs.unlink(path.join(this.logDir, file));
        }
      }

      this.info('Logger', 'All log files cleared');
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  }
}

// シングルトンインスタンス
export const logger = new Logger();
