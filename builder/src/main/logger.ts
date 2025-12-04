import * as fs from 'fs/promises';
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

  constructor() {
    // ログディレクトリをユーザーデータディレクトリに設定
    this.logDir = path.join(app.getPath('userData'), 'logs');
    this.logFilePath = path.join(this.logDir, 'app.log');
    this.ensureLogDirectory();
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
  private formatLogEntry(entry: LogEntry): string {
    const dataStr = entry.data ? ` ${JSON.stringify(entry.data)}` : '';
    return `[${entry.timestamp}] ${entry.level.padEnd(5)} [${entry.category}] ${entry.message}${dataStr}\n`;
  }

  /**
   * ログを書き込み
   */
  private async writeLog(level: LogLevel, category: string, message: string, data?: any): Promise<void> {
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
