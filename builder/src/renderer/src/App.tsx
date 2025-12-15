import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import TemplateOpener, { TemplateOpenerRef } from './components/TemplateOpener';
import ConfigEditor, { ConfigEditorRef } from './components/ConfigEditor';
import PreviewPane from './components/PreviewPane';
import { SettingsModal } from './components/SettingsModal';
import { Button, Title3 } from '@fluentui/react-components';
import { PaintBrush24Regular, FolderOpen24Regular, Play24Regular, Save24Regular } from '@fluentui/react-icons';
import { saveTemplateWithUserConfig, exportStaticSiteZip } from './utils/templateSaver';
import type { TemplateArchive, UserConfig } from '../../types/template';
import { I18nProvider } from './components/I18nProvider';
import { useTranslation } from './i18n';

interface Template {
  filePath: string;
  manifest: any;
  schema: any;
  defaultConfig: any;
  userConfig?: any;
  metadata?: any;
  template: string;
  styles: string;
  scripts: string;
  assets: Map<string, Uint8Array> | Map<string, Buffer> | Array<{ filename: string; data: any }> | Record<string, any>;
}

function AppContent() {
  const { t, setLanguage } = useTranslation();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateArchive | null>(null);
  const [config, setConfig] = useState<UserConfig | null>(null);
  const [focusedFieldId, setFocusedFieldId] = useState<string | null>(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const templateOpenerRef = useRef<TemplateOpenerRef>(null);
  const configEditorRef = useRef<ConfigEditorRef | null>(null);

  const cacheDataUrlToVirtualPath = async (dataUrl: string, hintExt?: string): Promise<string> => {
    if (!dataUrl?.startsWith('data:')) return dataUrl;
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return dataUrl;
    const mime = match[1];
    const base64 = match[2];
    try {
      const bin = atob(base64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
      if ((window as any)?.electronAPI?.cacheAssetBuffer) {
        const cached = await (window as any).electronAPI.cacheAssetBuffer({
          filename: hintExt ? `inline.${hintExt}` : undefined,
          data: Array.from(bytes),
          mime,
        });
        return cached?.virtualPath || dataUrl;
      }
      return dataUrl;
    } catch (e) {
      console.error('Failed to cache data URL', e);
      return dataUrl;
    }
  };

  const normalizeConfigAssets = async (value: any): Promise<any> => {
    if (typeof value === 'string') {
      if (value.startsWith('data:')) {
        const ext = value.split(';')[0].split('/').pop();
        return cacheDataUrlToVirtualPath(value, ext);
      }
      return value;
    }
    if (Array.isArray(value)) {
      return Promise.all(value.map((v) => normalizeConfigAssets(v)));
    }
    if (value && typeof value === 'object') {
      const entries = await Promise.all(Object.entries(value).map(async ([k, v]) => [k, await normalizeConfigAssets(v)]));
      return Object.fromEntries(entries);
    }
    return value;
  };

  const handleTemplateOpen = async (templateData: TemplateArchive) => {
    console.log('🗂️ [App] Template opened:', templateData?.manifest?.name);

    // Normalize assets to Map<string, Uint8Array>
    let assets: Map<string, Uint8Array> = new Map();
    try {
      if (templateData.assets instanceof Map) {
        assets = new Map(templateData.assets);
      } else if (Array.isArray(templateData.assets)) {
        const m = new Map<string, Uint8Array>();
        templateData.assets.forEach((asset: { filename: string; data: number[] | Uint8Array }) => {
          m.set(asset.filename, asset.data instanceof Uint8Array ? asset.data : new Uint8Array(asset.data));
        });
        assets = m;
      } else if (templateData.assets && typeof templateData.assets === 'object') {
        const m = new Map<string, Uint8Array>();
        Object.keys(templateData.assets).forEach((k) => {
          const v = templateData.assets[k];
          if (v instanceof Uint8Array) m.set(k, v);
        });
        assets = m;
      }
    } catch {}

    const template: TemplateArchive = {
      ...templateData,
      assets,
    };

    const initialConfig = template.userConfig || template.defaultConfig;
    const normalized = await normalizeConfigAssets(initialConfig);

    setSelectedTemplate(template);
    setConfig(normalized);
  };

  const handleConfigChange = (newConfig: any) => {
    setConfig(newConfig);
  };

  const handleFieldFocus = (fieldId: string) => {
    setFocusedFieldId(fieldId);
    if (configEditorRef.current?.scrollToField) {
      configEditorRef.current.scrollToField(fieldId);
    }
  };

  const handleSave = async () => {
    if (!selectedTemplate || !config) {
      alert(t.messages.selectTemplate);
      return;
    }
    try {
      await saveTemplateWithUserConfig(selectedTemplate as any, config);
      alert(t.messages.saveSuccess);
    } catch (error) {
      console.error('Save failed:', error);
      alert(t.messages.saveFailed);
    }
  };

  const handleBuild = async () => {
    if (!selectedTemplate || !config) {
      alert(t.messages.selectTemplate);
      return;
    }
    // data URL をビルド前にキャッシュ化してパス参照へ
    const normalizedConfig = await normalizeConfigAssets(config);
    setConfig(normalizedConfig);

    const serializeAssets = (assets: any): { filename: string; data: number[] }[] => {
      const serialized: { filename: string; data: number[] }[] = [];
      try {
        if (assets instanceof Map) {
          assets.forEach((data, filename) => serialized.push({ filename, data: Array.from(data as any) }));
        } else if (Array.isArray(assets)) {
          assets.forEach((a) => {
            if (!a) return;
            const filename = a.filename ?? a.path ?? '';
            if (!filename) return;
            const data = Array.isArray(a.data) ? a.data : Array.from(a.data || []);
            serialized.push({ filename, data });
          });
        } else if (assets && typeof assets === 'object') {
          Object.keys(assets).forEach((k) => {
            const v = (assets as any)[k];
            if (!v) return;
            const data = Array.isArray(v) ? v : Array.from(v.data ?? v);
            serialized.push({ filename: k, data });
          });
        }
      } catch {}
      return serialized;
    };

    if ((window as any)?.electronAPI?.selectSavePath && (window as any)?.electronAPI?.buildLP) {
      try {
        const ensureZipPath = (filePath: string) => (filePath?.toLowerCase().endsWith('.zip') ? filePath : `${filePath}.zip`);
        const safeId = `${selectedTemplate.manifest?.id || 'lp'}`.replace(/[\\/:*?"<>|]/g, '_');
        const defaultName = `${safeId}-build.zip`;
        const outputZipPath = await (window as any).electronAPI.selectSavePath({
          defaultPath: defaultName,
          filters: [{ name: 'ZIP', extensions: ['zip'] }],
        });
        if (!outputZipPath) return;
        const templateForBuild = { ...selectedTemplate, assets: serializeAssets((selectedTemplate as any).assets) };
        const result = await (window as any).electronAPI.buildLP({
          template: templateForBuild,
          config: normalizedConfig,
          outputZipPath: ensureZipPath(outputZipPath),
        });
        if (result?.success) {
          alert(t.messages.buildSuccess.replace('{path}', result.outputPath));
        } else {
          const reason = result?.error ? `\n${result.error}` : '';
          alert(t.messages.buildFailed + reason);
        }
      } catch (e) {
        console.error('Build failed:', e);
        alert(t.messages.buildFailed);
      }
    } else {
      // Fallback: ZIP download
      try {
        await exportStaticSiteZip(selectedTemplate as any, config);
        alert(t.messages.buildSuccess.replace('{path}', 'download'));
      } catch (e) {
        console.error('Export zip failed:', e);
        alert(t.messages.buildFailed);
      }
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !(window as any).electronAPI) return;
    const handleMenuOpenTemplate = () => {
      if (selectedTemplate) {
        const confirmSwitch = window.confirm(t.messages.confirmSwitchTemplate);
        if (!confirmSwitch) return;
      }
      templateOpenerRef.current?.triggerOpenTemplate();
    };
    const handleMenuExportHTML = () => {
      handleBuild();
    };
    const handleChangeLanguage = (lang: 'ja' | 'en') => {
      setLanguage(lang);
    };
    const handleMenuOpenSettings = () => {
      setSettingsModalOpen(true);
    };
    const removeMenuOpenListener = (window as any).electronAPI.onMenuEvent?.('menu-open-template', handleMenuOpenTemplate);
    const removeMenuExportListener = (window as any).electronAPI.onMenuEvent?.('menu-export-html', handleMenuExportHTML);
    const removeLanguageListener = (window as any).electronAPI.onMenuEvent?.('change-language', handleChangeLanguage);
    const removeSettingsListener = (window as any).electronAPI.onMenuEvent?.('menu-open-settings', handleMenuOpenSettings);
    return () => {
      removeMenuOpenListener?.();
      removeMenuExportListener?.();
      removeLanguageListener?.();
      removeSettingsListener?.();
    };
  }, [selectedTemplate, config, t, setLanguage]);

  return (
    <div className="app">
      {!selectedTemplate ? (
        <TemplateOpener ref={templateOpenerRef} onTemplateOpen={handleTemplateOpen} />
      ) : (
        <>
          <header className="app-header">
            <div className="header-left">
              <Title3>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <PaintBrush24Regular /> {selectedTemplate.manifest?.name}
                </span>
              </Title3>
              <Button appearance="secondary" size="small" icon={<FolderOpen24Regular />} onClick={() => setSelectedTemplate(null)}>
                {t.header.openAnother}
              </Button>
            </div>
            <div className="header-actions">
              <Button appearance="secondary" icon={<Save24Regular />} onClick={handleSave}>
                {t.common.save}
              </Button>
              <Button appearance="primary" icon={<Play24Regular />} onClick={handleBuild}>
                {t.header.build}
              </Button>
            </div>
          </header>

          <div className="app-content">
            <div className="editor-screen">
              <ConfigEditor
                ref={configEditorRef}
                schema={selectedTemplate.schema}
                config={config}
                onChange={handleConfigChange}
                focusedFieldId={focusedFieldId}
              />

              <div className="editor-preview">
                <PreviewPane template={selectedTemplate} config={config} onFieldFocus={handleFieldFocus} />
              </div>
            </div>
          </div>
        </>
      )}
      <SettingsModal open={settingsModalOpen} onOpenChange={setSettingsModalOpen} />
    </div>
  );
}

function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}

export default App;
