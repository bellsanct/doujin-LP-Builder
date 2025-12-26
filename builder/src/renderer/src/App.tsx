import React, { useState } from 'react';
import './App.css';
import { BlockEditor } from './components/BlockEditor';
import { Button, Title3 } from '@fluentui/react-components';
import { PaintBrush24Regular, Save24Regular, Play24Regular } from '@fluentui/react-icons';
import type { Project } from '../../types/block-system';
import { I18nProvider } from './components/I18nProvider';
import { useTranslation } from './i18n';

function AppContent() {
  const { t } = useTranslation();

  // デフォルトプロジェクト
  const [project, setProject] = useState<Project>({
    version: '2.0.0',
    template: 'katanegai',
    globalSettings: {
      colors: {
        primary: '#fcfcfc',
        secondary: '#2d2d2d',
        accent: '#a62c2c',
        background: '#ffffff',
        text: '#2d2d2d',
      },
      typography: {
        headingFont: "'Noto Sans JP', sans-serif",
        bodyFont: "'Noto Sans JP', sans-serif",
        baseSize: 16,
        scale: 1.25,
      },
      layout: {
        maxWidth: 1200,
        gutter: 24,
      },
    },
    blocks: [],
  });

  const handleProjectChange = (updatedProject: Project) => {
    setProject(updatedProject);
  };

  const handleSave = () => {
    // TODO: プロジェクトファイル保存
    console.log('Save project:', project);
    alert('プロジェクトを保存しました（未実装）');
  };

  const handleBuild = () => {
    // TODO: 静的サイトビルド
    console.log('Build project:', project);
    alert('サイトをビルドしました（未実装）');
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <Title3>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <PaintBrush24Regular /> 新規プロジェクト
            </span>
          </Title3>
        </div>
        <div className="header-actions">
          <Button appearance="secondary" icon={<Save24Regular />} onClick={handleSave}>
            保存
          </Button>
          <Button appearance="primary" icon={<Play24Regular />} onClick={handleBuild}>
            ビルド
          </Button>
        </div>
      </header>

      <div className="app-content">
        <BlockEditor project={project} onChange={handleProjectChange} />
      </div>
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
