import React, { useState } from 'react';
import './App.css';
import TemplateOpener from './components/TemplateOpener';
import ConfigEditor from './components/ConfigEditor';
import PreviewPane from './components/PreviewPane';
import { Button, Title3 } from '@fluentui/react-components';
import { PaintBrush24Regular, FolderOpen24Regular, Play24Regular, Save24Regular } from '@fluentui/react-icons';
import { saveTemplateWithUserConfig } from './utils/templateSaver';

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
  assets: Map<string, Buffer>;
}

function App() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [config, setConfig] = useState<any>(null);

  const handleTemplateOpen = (templateData: any) => {
    console.log('📂 [App] Template opened:', templateData.manifest.name);

    // シリアライズされたアセットをMap形式に戻す
    const assets = new Map<string, Uint8Array>();
    if (Array.isArray(templateData.assets)) {
      templateData.assets.forEach((asset: { filename: string; data: number[] }) => {
        assets.set(asset.filename, new Uint8Array(asset.data));
      });
    }

    const template: Template = {
      ...templateData,
      assets,
    };

    setSelectedTemplate(template);
    
    // userConfigが存在する場合はそれを使用、なければdefaultConfigを使用
    const initialConfig = template.userConfig || template.defaultConfig;
    setConfig(initialConfig);
    
    // 復元された場合はログ出力
    if (template.userConfig) {
      console.log('✅ [App] User config restored from .dlpt file');
    }
  };

  const handleConfigChange = (newConfig: any) => {
    console.log('🔄 [App] Config changed:', newConfig);
    setConfig(newConfig);
  };

  const handleSave = async () => {
    if (!selectedTemplate || !config) {
      alert('テンプレートと設定を選択してください');
      return;
    }

    try {
      await saveTemplateWithUserConfig(selectedTemplate, config);
      alert('編集内容を .dlpt ファイルとして保存しました');
    } catch (error) {
      console.error('Save failed:', error);
      alert('保存に失敗しました');
    }
  };

  const handleBuild = async () => {
    if (!selectedTemplate || !config) {
      alert('テンプレートと設定を選択してください');
      return;
    }

    try {
      const outputDir = await window.electronAPI.selectDirectory();
      if (!outputDir) return;

      const result = await window.electronAPI.buildLP({
        template: selectedTemplate,
        config,
        outputDir,
      });

      if (result.success) {
        alert(`ビルド完了!\n出力先: ${result.outputDir}`);
      }
    } catch (error) {
      console.error('Build failed:', error);
      alert('ビルドに失敗しました');
    }
  };

  return (
    <div className="app">
      {!selectedTemplate ? (
        <TemplateOpener onTemplateOpen={handleTemplateOpen} />
      ) : (
        <>
          <header className="app-header">
            <div className="header-left">
              <Title3>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <PaintBrush24Regular /> {selectedTemplate.manifest.name}
                </span>
              </Title3>
              <Button appearance="secondary" size="small" icon={<FolderOpen24Regular />} onClick={() => setSelectedTemplate(null)}>
                別のテンプレートを開く
              </Button>
            </div>
            <div className="header-actions">
              <Button appearance="secondary" icon={<Save24Regular />} onClick={handleSave}>
                保存
              </Button>
              {typeof window !== 'undefined' && (window as any).electronAPI && (
                <Button appearance="primary" icon={<Play24Regular />} onClick={handleBuild}>
                  ビルド
                </Button>
              )}
            </div>
          </header>

          <div className="app-content">
            <div className="editor-screen">
              <ConfigEditor
                schema={selectedTemplate.schema}
                config={config}
                onChange={handleConfigChange}
              />

              <div className="editor-preview">
                <PreviewPane
                  template={selectedTemplate}
                  config={config}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
