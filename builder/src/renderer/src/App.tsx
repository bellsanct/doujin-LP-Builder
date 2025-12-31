import React, { useState } from 'react';
import './App.css';
import { BlockEditor } from './components/BlockEditor';
import { Button, Title1, Title3 } from '@fluentui/react-components';
import { PaintBrush24Regular, Save24Regular, Play24Regular, FolderOpen24Regular, DocumentAdd24Regular } from '@fluentui/react-icons';
import type { Project } from '../../types/block-system';
import { I18nProvider } from './components/I18nProvider';
import { useTranslation } from './i18n';

// デフォルトのプロジェクト設定
const DEFAULT_GLOBAL_SETTINGS: Project['globalSettings'] = {
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
};

function AppContent() {
  const { t } = useTranslation();
  const [project, setProject] = useState<Project | null>(null);
  const [projectFilePath, setProjectFilePath] = useState<string | null>(null);

  const handleLoadTemplate = async () => {
    try {
      const result = await window.electronAPI.selectFile({
        filters: [
          { name: 'テンプレートファイル', extensions: ['dlpt', 'zip'] },
          { name: 'すべてのファイル', extensions: ['*'] },
        ],
        properties: ['openFile'],
      });

      if (result) {
        const filePath = result;

        // テンプレートアーカイブを読み込む（ZIPを解凍してProjectデータを取得）
        const templateArchive = await window.electronAPI.openTemplateFromPath(filePath);

        // metadata.projectにブロックベースのProjectデータが含まれている
        if (templateArchive.metadata?.blockBased && templateArchive.metadata?.project) {
          const templateData = templateArchive.metadata.project as Project;

          // テンプレートを基に新規プロジェクトを作成
          const newProject: Project = {
            version: templateData.version || '2.0.0',
            template: templateData.template,
            templateCSS: templateData.templateCSS,
            globalSettings: templateData.globalSettings,
            blocks: templateData.blocks || [],
          };

          setProject(newProject);
          setProjectFilePath(null); // 新規プロジェクトなので保存先はまだない
        } else {
          // Handlebars形式（従来形式）は未対応
          throw new Error('このテンプレート形式は対応していません。ブロックベース形式のテンプレートを使用してください。');
        }
      }
    } catch (error) {
      console.error('[Renderer] Failed to load template:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`テンプレートファイルの読み込みに失敗しました:\n${errorMessage}`);
    }
  };

  const handleOpenProject = async () => {
    try {
      const result = await window.electronAPI.selectFile({
        filters: [
          { name: 'プロジェクトファイル', extensions: ['dlpt', 'zip'] },
          { name: 'すべてのファイル', extensions: ['*'] },
        ],
        properties: ['openFile'],
      });

      if (result) {
        const filePath = result;
        setProjectFilePath(filePath);

        // 保存済みプロジェクトファイルを読み込む
        const content = await window.electronAPI.readFile(filePath);
        const projectData = JSON.parse(content) as Project;
        setProject(projectData);
      }
    } catch (error) {
      console.error('Failed to open project:', error);
      alert('プロジェクトファイルの読み込みに失敗しました');
    }
  };

  const handleProjectChange = (updatedProject: Project) => {
    setProject(updatedProject);
  };

  const handleSave = React.useCallback(async () => {
    if (!project) return;

    try {
      let savePath = projectFilePath;

      if (!savePath) {
        // 新規保存の場合はパスを選択
        const result = await window.electronAPI.selectSavePath({
          defaultPath: 'project.dlpt',
          filters: [
            { name: 'プロジェクトファイル', extensions: ['dlpt'] },
          ],
        });

        if (!result) return; // キャンセルされた
        savePath = result;
      }

      // プロジェクトをJSON形式で保存
      const content = JSON.stringify(project, null, 2);
      await window.electronAPI.writeFile(savePath, content);
      setProjectFilePath(savePath);

      alert('プロジェクトを保存しました');
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('プロジェクトの保存に失敗しました');
    }
  }, [project, projectFilePath]);

  // キーボードショートカット: Ctrl+S / Cmd+S で保存
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (project) {
          handleSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, handleSave]);

  const handleBuild = () => {
    // TODO: 静的サイトビルド
    console.log('Build project:', project);
    alert('サイトをビルドしました（未実装）');
  };

  const handleBackToStart = () => {
    setProject(null);
    setProjectFilePath(null);
  };

  // スタート画面
  if (!project) {
    return (
      <div className="app">
        <div className="start-screen">
          <div className="start-header">
            <PaintBrush24Regular style={{ fontSize: '4rem', color: '#0066cc' }} />
            <Title1>Circlify</Title1>
            <p className="start-subtitle">同人サークルのためのLPビルダー</p>
          </div>
          <div className="start-actions">
            <Button
              appearance="primary"
              size="large"
              icon={<DocumentAdd24Regular />}
              onClick={handleLoadTemplate}
              className="start-button"
            >
              テンプレートを読み込む
            </Button>
            <Button
              appearance="secondary"
              size="large"
              icon={<FolderOpen24Regular />}
              onClick={handleOpenProject}
              className="start-button"
            >
              保存したファイルを開く
            </Button>
          </div>
          <div className="start-info">
            <p>テンプレート: .dlpt / プロジェクト: .dlpt, .zip</p>
          </div>
        </div>
      </div>
    );
  }

  // プロジェクト編集画面
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <Title3>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <PaintBrush24Regular /> Circlify
            </span>
          </Title3>
          {projectFilePath && (
            <span style={{ fontSize: '0.85rem', color: '#666', marginLeft: '1rem' }}>
              {projectFilePath.split(/[\\/]/).pop()}
            </span>
          )}
        </div>
        <div className="header-actions">
          <Button appearance="subtle" onClick={handleBackToStart}>
            戻る
          </Button>
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
