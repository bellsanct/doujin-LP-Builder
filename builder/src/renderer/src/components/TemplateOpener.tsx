import React, { useState, useEffect, useRef } from 'react';
import './TemplateOpener.css';
import { Button, Spinner, Title1, Body1 } from '@fluentui/react-components';
import { PaintBrush24Regular, FolderOpen24Regular, Document24Regular, Warning24Regular, Lightbulb24Regular } from '@fluentui/react-icons';
import { loadTemplateFromBlob } from '../utils/webTemplateLoader';

interface TemplateOpenerProps {
  onTemplateOpen: (template: any) => void;
}

const TemplateOpener: React.FC<TemplateOpenerProps> = ({ onTemplateOpen }) => {
  const [recentFiles, setRecentFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadRecentFiles();
  }, []);

  const loadRecentFiles = async () => {
    try {
      if (!window.electronAPI) {
        console.warn('electronAPI not available');
        return;
      }
      const recent = await window.electronAPI.getRecentTemplates();
      setRecentFiles(recent);
    } catch (error) {
      console.error('Failed to load recent files:', error);
    }
  };

  const handleOpenFile = async () => {
    if (!window.electronAPI) {
      // Web: trigger file input
      fileInputRef.current?.click();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const template = await window.electronAPI.openTemplateFile();
      if (template) {
        console.log('✅ Template loaded:', template.manifest.name);
        onTemplateOpen(template);
        // 最近使ったファイルを再読み込み
        await loadRecentFiles();
      }
    } catch (error) {
      console.error('Failed to open template:', error);
      setError(error instanceof Error ? error.message : 'テンプレートファイルの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const getFileName = (filePath: string) => {
    return filePath.split(/[\\/]/).pop() || filePath;
  };

  return (
    <div className="template-opener">
      <div className="opener-content">
        <div className="opener-header">
          <Title1>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <PaintBrush24Regular /> Doujin LP Builder
            </span>
          </Title1>
          <p className="opener-subtitle">テンプレートファイル (.zip) を開いて、LPを作成しましょう</p>
        </div>

        {error && (
          <div className="error-message">
            <Warning24Regular />
            <Body1>{error}</Body1>
          </div>
        )}

        <div className="open-file-section">
          <Button appearance="primary" size="large" icon={<FolderOpen24Regular />} onClick={handleOpenFile} disabled={isLoading} style={{ width: '100%', height: 48 }}>
            {isLoading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Spinner size="tiny" /> 読み込み中...
              </span>
            ) : (
              'テンプレートファイルを開く'
            )}
          </Button>
          <p className="file-hint">.zip / .dlpt ファイルを選択してください</p>
          {/* Hidden file input for web mode */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip,.dlpt"
            style={{ display: 'none' }}
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setIsLoading(true);
              setError(null);
              try {
                const tpl = await loadTemplateFromBlob(f, f.name);
                onTemplateOpen(tpl);
              } catch (err) {
                console.error(err);
                setError(err instanceof Error ? err.message : '読み込みに失敗しました');
              } finally {
                setIsLoading(false);
                e.currentTarget.value = '';
              }
            }}
          />
        </div>

        {recentFiles.length > 0 && (
          <div className="recent-files">
            <h3>最近使ったファイル</h3>
            <ul className="recent-files-list">
              {recentFiles.map((file, index) => (
                <li
                  key={index}
                  className="recent-file-item"
                  onClick={async () => {
                    setIsLoading(true);
                    setError(null);
                    try {
                      // TODO: 特定のファイルパスからテンプレートを読み込む機能を実装
                      // 現在は再度ダイアログを開く
                      await handleOpenFile();
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                >
                  <span className="file-icon" aria-hidden>
                    <Document24Regular />
                  </span>
                  <span className="file-name">{getFileName(file)}</span>
                  <span className="file-path">{file}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="opener-footer">
          <p className="help-text">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Lightbulb24Regular /> テンプレートファイルは BOOTH などで配布されています
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TemplateOpener;
