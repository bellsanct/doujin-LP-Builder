import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';

// Hook: mirror console.* to app.log via electronAPI.log
(() => {
  try {
    const anyWin = window as any;
    if (anyWin.__dualLoggerSetup) return;

    const original = {
      log: console.log.bind(console),
      info: console.info?.bind(console) || console.log.bind(console),
      warn: console.warn?.bind(console) || console.log.bind(console),
      error: console.error?.bind(console) || console.log.bind(console),
      debug: console.debug?.bind(console) || console.log.bind(console),
    };

    const stringify = (v: unknown) => {
      if (typeof v === 'string') return v;
      try { return JSON.stringify(v); } catch { return String(v); }
    };

    const buildPayload = (args: any[]) => {
      const text = args.map(stringify).join(' ');
      const m = text.match(/\[([^\]]+)\]/); // extract [Category]
      const category = m?.[1] || 'Renderer';
      return { category, message: text, data: undefined as any };
    };

    // ログレベルに応じた出力制御 + 簡易デュープ抑制
    let minLevel: 'DEBUG'|'INFO'|'WARN'|'ERROR' = 'INFO';
    (async () => {
      try {
        const level = await (window as any).electronAPI?.log?.getLogLevel?.();
        if (level) minLevel = level;
      } catch {}
    })();

    const order = { DEBUG: 10, INFO: 20, WARN: 30, ERROR: 40 } as const;
    const allow = (lvl: 'debug'|'info'|'warn'|'error') => {
      const l = lvl.toUpperCase() as 'DEBUG'|'INFO'|'WARN'|'ERROR';
      return order[l] >= order[minLevel];
    };

    const lastSent = new Map<string, number>();
    const suppressMs = 2000; // 同一メッセージ2秒以内は抑制

    const send = (level: 'debug'|'info'|'warn'|'error', payload: {category:string;message:string;data?:any}) => {
      if (!allow(level)) return;
      const now = Date.now();
      const key = level + '|' + payload.category + '|' + payload.message;
      const prev = lastSent.get(key) || 0;
      if (now - prev < suppressMs) return;
      lastSent.set(key, now);
      const api = (window as any).electronAPI?.log;
      const fn = api?.[level];
      try { fn?.(payload.category, payload.message, payload.data); } catch { /* noop */ }
    };

    console.log = (...args: any[]) => {
      const payload = buildPayload(args);
      original.log(...args);
      send('info', payload);
    };
    console.info = (...args: any[]) => {
      const payload = buildPayload(args);
      original.info(...args);
      send('info', payload);
    };
    console.warn = (...args: any[]) => {
      const payload = buildPayload(args);
      original.warn(...args);
      send('warn', payload);
    };
    console.error = (...args: any[]) => {
      const payload = buildPayload(args);
      original.error(...args);
      send('error', payload);
    };
    console.debug = (...args: any[]) => { const payload = buildPayload(args); original.debug(...args); send('debug', payload); };

    anyWin.__dualLoggerSetup = true;
  } catch {
    // Ignore hooking errors
  }
})();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FluentProvider theme={webLightTheme}>
      <App />
    </FluentProvider>
  </React.StrictMode>
);
