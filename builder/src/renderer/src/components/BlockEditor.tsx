import React, { useState, useRef, useCallback } from 'react';
import './BlockEditor.css';
import type { Block, BlockType, Project } from '../../../types/block-system';
import { blockRegistry, createBlock, getAllCategories, getBlocksByCategory } from '../../../blocks/registry';
import { BlockPreview } from './BlockPreview';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BlockEditorProps {
  project: Project;
  onChange: (project: Project) => void;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({ project, onChange }) => {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['layout', 'content'])
  );
  const [settingsView, setSettingsView] = useState<'block' | 'global'>('block');
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  // キーボードショートカット
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+D または Cmd+D: ブロック複製
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedBlockId) {
        e.preventDefault();
        const selectedBlock = project.blocks.find((b) => b.id === selectedBlockId);
        if (selectedBlock) {
          const newBlock = {
            ...selectedBlock,
            id: `block-${Date.now()}`,
          };
          const selectedIndex = project.blocks.findIndex((b) => b.id === selectedBlockId);
          const updatedBlocks = [...project.blocks];
          updatedBlocks.splice(selectedIndex + 1, 0, newBlock);
          onChange({ ...project, blocks: updatedBlocks });
          setSelectedBlockId(newBlock.id);
        }
      }
      // Delete: ブロック削除
      else if (e.key === 'Delete' && selectedBlockId) {
        handleDeleteBlock(selectedBlockId);
      }
      // Escape: 選択解除
      else if (e.key === 'Escape') {
        setSelectedBlockId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBlockId, project, onChange]);

  // Note: テンプレートCSSはBlockPreviewのiframe内で読み込まれる

  // 選択中のブロックを取得
  const selectedBlock = project.blocks.find((b) => b.id === selectedBlockId);

  // ブロック追加
  const handleAddBlock = (type: BlockType) => {
    const newBlock = createBlock(type, project.blocks.length);
    const updatedProject = {
      ...project,
      blocks: [...project.blocks, newBlock],
    };
    onChange(updatedProject);
    setSelectedBlockId(newBlock.id);
  };

  // ブロック削除
  const handleDeleteBlock = (blockId: string) => {
    const updatedProject = {
      ...project,
      blocks: project.blocks.filter((b) => b.id !== blockId),
    };
    onChange(updatedProject);
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  };

  // ブロック移動
  const handleMoveBlock = (blockId: string, direction: 'up' | 'down') => {
    const blocks = [...project.blocks];
    const index = blocks.findIndex((b) => b.id === blockId);

    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [blocks[index], blocks[newIndex]] = [blocks[newIndex], blocks[index]];

    // orderプロパティを更新
    blocks.forEach((block, i) => {
      block.order = i;
    });

    onChange({ ...project, blocks });
  };

  // ブロック更新
  const handleUpdateBlock = (blockId: string, updates: Partial<Block>) => {
    const updatedProject = {
      ...project,
      blocks: project.blocks.map((b) =>
        b.id === blockId ? { ...b, ...updates } : b
      ),
    };
    onChange(updatedProject);
  };

  // カテゴリ展開トグル
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const categoryLabels: Record<string, string> = {
    layout: 'レイアウト',
    media: 'メディア',
    content: 'コンテンツ',
    navigation: 'ナビゲーション',
    utility: 'ユーティリティ',
  };

  return (
    <div className={`block-editor ${leftPanelCollapsed ? 'left-collapsed' : ''} ${rightPanelCollapsed ? 'right-collapsed' : ''}`}>
      {/* 左パネル: ブロックパレット */}
      <div className={`block-palette ${leftPanelCollapsed ? 'collapsed' : ''}`}>
        <div className="palette-header">
          {leftPanelCollapsed ? (
            <button
              className="panel-toggle expand"
              onClick={() => setLeftPanelCollapsed(false)}
              title="展開"
            >
              ▶
            </button>
          ) : (
            <>
              <h3>ブロック</h3>
              <button
                className="panel-toggle"
                onClick={(e) => {
                  e.stopPropagation();
                  setLeftPanelCollapsed(true);
                }}
                title="折りたたむ"
              >
                ◀
              </button>
            </>
          )}
        </div>
        <div className="palette-content">
          {getAllCategories().map((category) => {
            const blocks = getBlocksByCategory(category);
            const isExpanded = expandedCategories.has(category);

            return (
              <div key={category} className="palette-category">
                <button
                  className="category-header"
                  onClick={() => toggleCategory(category)}
                  aria-expanded={isExpanded}
                  aria-label={`${categoryLabels[category]}カテゴリー${isExpanded ? '閉じる' : '開く'}`}
                >
                  <span className="category-icon" aria-hidden="true">
                    {isExpanded ? '▼' : '▶'}
                  </span>
                  <span className="category-label">
                    {categoryLabels[category]}
                  </span>
                </button>

                {isExpanded && (
                  <div className="category-blocks">
                    {blocks.map((blockDef) => (
                      <button
                        key={blockDef.type}
                        className="block-item"
                        onClick={() => handleAddBlock(blockDef.type)}
                        title={blockDef.description}
                        aria-label={`${blockDef.label}ブロックを追加`}
                        role="button"
                      >
                        <span className="block-icon" aria-hidden="true">{blockDef.icon}</span>
                        <span className="block-label">{blockDef.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 中央: キャンバス */}
      <div className="block-canvas">
        <div className="canvas-header">
          <h3>プレビュー</h3>
          {selectedBlock && (
            <div className="canvas-header-controls">
              <span className="selected-block-label">
                {blockRegistry[selectedBlock.type].icon}{' '}
                {blockRegistry[selectedBlock.type].label}
              </span>
              <button
                className="btn-move-header"
                onClick={() => handleMoveBlock(selectedBlock.id, 'up')}
                disabled={project.blocks.findIndex(b => b.id === selectedBlock.id) === 0}
                title="上に移動"
                aria-label="ブロックを上に移動"
              >
                ↑
              </button>
              <button
                className="btn-move-header"
                onClick={() => handleMoveBlock(selectedBlock.id, 'down')}
                disabled={project.blocks.findIndex(b => b.id === selectedBlock.id) === project.blocks.length - 1}
                title="下に移動"
                aria-label="ブロックを下に移動"
              >
                ↓
              </button>
              <button
                className="btn-delete-header"
                onClick={() => handleDeleteBlock(selectedBlock.id)}
                title="削除"
                aria-label="ブロックを削除"
              >
                ✕
              </button>
            </div>
          )}
        </div>
        <div className="canvas-content">
          {project.blocks.length === 0 ? (
            <div className="canvas-empty">
              <p>左のパレットからブロックを追加してください</p>
            </div>
          ) : (
            <BlockPreview
              project={project}
              selectedBlockId={selectedBlockId}
              onBlockSelect={setSelectedBlockId}
            />
          )}
        </div>
      </div>

      {/* 右パネル: 設定パネル */}
      <div className={`block-settings ${rightPanelCollapsed ? 'collapsed' : ''}`}>
        <div className="settings-header">
          <div className="settings-header-top">
            {rightPanelCollapsed ? (
              <button
                className="panel-toggle expand"
                onClick={() => setRightPanelCollapsed(false)}
                title="展開"
              >
                ◀
              </button>
            ) : (
              <>
                <button
                  className="panel-toggle"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRightPanelCollapsed(true);
                  }}
                  title="折りたたむ"
                >
                  ▶
                </button>
                <h3>設定</h3>
              </>
            )}
          </div>
          <div className="settings-toggle">
            <button
              className={settingsView === 'block' ? 'active' : ''}
              onClick={() => setSettingsView('block')}
            >
              ブロック
            </button>
            <button
              className={settingsView === 'global' ? 'active' : ''}
              onClick={() => setSettingsView('global')}
            >
              共通
            </button>
          </div>
        </div>
        <div className="settings-content">
          {settingsView === 'global' ? (
            <GlobalSettings
              globalSettings={project.globalSettings}
              onUpdate={(updates) => onChange({ ...project, globalSettings: updates })}
            />
          ) : selectedBlock ? (
            <BlockSettings
              block={selectedBlock}
              onUpdate={(updates) =>
                handleUpdateBlock(selectedBlock.id, updates)
              }
            />
          ) : (
            <div className="settings-empty">
              <p>ブロックを選択してください</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ブロック設定パネル
interface BlockSettingsProps {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
}

const BlockSettings: React.FC<BlockSettingsProps> = ({ block, onUpdate }) => {
  const blockDef = blockRegistry[block.type];
  const content = block.content as any;
  const settings = block.settings as any;

  // アコーディオンセクションの状態管理
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['content', 'style'])
  );

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // デバウンス用のタイマー参照
  const debounceTimerRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const updateContent = (updates: any) => {
    onUpdate({ content: { ...content, ...updates } });
  };

  const updateSettings = (updates: any) => {
    onUpdate({ settings: { ...settings, ...updates } });
  };

  // デバウンス付き更新関数（カラーピッカー、スライダー用）
  const updateContentDebounced = useCallback((updates: any, delay: number = 100) => {
    const key = JSON.stringify(Object.keys(updates));

    // 既存のタイマーをクリア
    const existingTimer = debounceTimerRef.current.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // 新しいタイマーをセット
    const timer = setTimeout(() => {
      onUpdate({ content: { ...content, ...updates } });
      debounceTimerRef.current.delete(key);
    }, delay);

    debounceTimerRef.current.set(key, timer);
  }, [content, onUpdate]);

  const updateSettingsDebounced = useCallback((updates: any, delay: number = 100) => {
    const key = JSON.stringify(Object.keys(updates));

    // 既存のタイマーをクリア
    const existingTimer = debounceTimerRef.current.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // 新しいタイマーをセット
    const timer = setTimeout(() => {
      onUpdate({ settings: { ...settings, ...updates } });
      debounceTimerRef.current.delete(key);
    }, delay);

    debounceTimerRef.current.set(key, timer);
  }, [settings, onUpdate]);

  // アコーディオンセクションのヘルパーコンポーネント
  const AccordionSection: React.FC<{
    id: string;
    title: string;
    icon: string;
    children: React.ReactNode;
  }> = ({ id, title, icon, children }) => {
    const isExpanded = expandedSections.has(id);
    return (
      <div className="settings-accordion-section">
        <button
          className={`accordion-header ${isExpanded ? 'expanded' : ''}`}
          onClick={() => toggleSection(id)}
          aria-expanded={isExpanded}
          aria-label={`${title}セクション${isExpanded ? '閉じる' : '開く'}`}
        >
          <span className="accordion-header-title">
            <span aria-hidden="true">{icon}</span>
            <span>{title}</span>
          </span>
          <span className={`accordion-icon ${isExpanded ? 'expanded' : ''}`} aria-hidden="true">
            ▶
          </span>
        </button>
        <div className={`accordion-content ${isExpanded ? 'expanded' : ''}`}>
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="block-settings-form">
      <h4>
        {blockDef.icon} {blockDef.label}
      </h4>

      {/* 共通設定: 表示/非表示 */}
      <div className="setting-field">
        <label>
          <input
            type="checkbox"
            checked={block.visible}
            onChange={(e) => onUpdate({ visible: e.target.checked })}
          />
          <span>表示</span>
        </label>
      </div>

      {/* ブロックタイプ別の設定UI */}
      {block.type === 'hero' && (
        <>
          <div className="setting-section space-y-4">
            <h5 className="text-sm font-semibold">コンテンツ</h5>
            <div className="space-y-2">
              <Label htmlFor="hero-title">タイトル</Label>
              <Input
                id="hero-title"
                type="text"
                value={content.title || ''}
                onChange={(e) => updateContent({ title: e.target.value })}
                placeholder="メインタイトル"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hero-subtitle">サブタイトル</Label>
              <Input
                id="hero-subtitle"
                type="text"
                value={content.subtitle || ''}
                onChange={(e) => updateContent({ subtitle: e.target.value })}
                placeholder="サブタイトル"
              />
            </div>
            <div className="space-y-2">
              <Label>背景画像</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={async () => {
                  const filePath = await window.electronAPI.selectFile({
                    filters: [
                      { name: '画像ファイル', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'] },
                      { name: 'すべてのファイル', extensions: ['*'] }
                    ]
                  });
                  if (filePath) {
                    try {
                      const data = await window.electronAPI.readFileBase64(filePath);
                      const ext = filePath.split('.').pop()?.toLowerCase() || 'jpg';
                      const mimeMap: Record<string, string> = {
                        jpg: 'image/jpeg',
                        jpeg: 'image/jpeg',
                        png: 'image/png',
                        gif: 'image/gif',
                        webp: 'image/webp',
                        svg: 'image/svg+xml'
                      };
                      const dataUrl = `data:${mimeMap[ext] || 'image/jpeg'};base64,${data}`;

                      const buffer = Uint8Array.from(atob(data), c => c.charCodeAt(0));
                      await window.electronAPI.cacheAssetBuffer({
                        filename: filePath.split(/[/\\]/).pop(),
                        data: Array.from(buffer),
                        mime: mimeMap[ext] || 'image/jpeg'
                      });

                      updateContent({ backgroundImage: dataUrl });
                    } catch (error) {
                      console.error('Failed to upload background image:', error);
                      alert('背景画像のアップロードに失敗しました');
                    }
                  }
                }}
              >
                📁 画像を選択
              </Button>
              {content.backgroundImage && (
                <div className="mt-2 rounded-md overflow-hidden border">
                  <img src={content.backgroundImage} alt="背景プレビュー" className="w-full h-auto max-h-[150px] object-cover" />
                </div>
              )}
            </div>
          </div>
          <div className="setting-section space-y-4">
            <h5 className="text-sm font-semibold">設定</h5>
            <div className="space-y-2">
              <Label htmlFor="hero-height">高さ (vh)</Label>
              <Input
                id="hero-height"
                type="number"
                value={settings.height || 100}
                onChange={(e) => updateSettings({ height: parseInt(e.target.value) })}
                min="20"
                max="100"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="hero-overlay"
                checked={settings.overlay?.enabled ?? true}
                onCheckedChange={(checked) => updateSettings({
                  overlay: {
                    ...settings.overlay,
                    enabled: checked
                  }
                })}
              />
              <Label htmlFor="hero-overlay" className="cursor-pointer">オーバーレイを表示</Label>
            </div>
            {settings.overlay?.enabled !== false && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="hero-overlay-color">オーバーレイ色</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="hero-overlay-color"
                      type="color"
                      value={settings.overlay?.color || '#000000'}
                      onChange={(e) => updateSettingsDebounced({
                        overlay: {
                          ...settings.overlay,
                          color: e.target.value
                        }
                      })}
                      className="w-16 h-9 p-1"
                    />
                    <span className="text-sm text-muted-foreground">{settings.overlay?.color || '#000000'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hero-overlay-opacity">透明度: {settings.overlay?.opacity ?? 50}%</Label>
                  <Slider
                    id="hero-overlay-opacity"
                    value={[settings.overlay?.opacity ?? 50]}
                    onValueChange={([value]) => updateSettingsDebounced({
                      overlay: {
                        ...settings.overlay,
                        opacity: value
                      }
                    }, 50)}
                    max={100}
                    step={1}
                  />
                </div>
              </>
            )}
          </div>
        </>
      )}

      {block.type === 'text' && (
        <div className="space-y-4">
          <div className="space-y-4">
            <h5 className="text-sm font-semibold">コンテンツ</h5>
            <div className="space-y-2">
              <Label htmlFor="text-content">テキスト</Label>
              <Textarea
                id="text-content"
                value={content.text || ''}
                onChange={(e) => updateContent({ text: e.target.value })}
                placeholder="テキストを入力..."
                rows={8}
              />
            </div>
          </div>
          <div className="space-y-4">
            <h5 className="text-sm font-semibold">設定</h5>
            <div className="space-y-2">
              <Label htmlFor="text-alignment">配置</Label>
              <Select
                value={settings.alignment || 'left'}
                onValueChange={(value) => updateSettings({ alignment: value })}
              >
                <SelectTrigger id="text-alignment">
                  <SelectValue placeholder="配置を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">左寄せ</SelectItem>
                  <SelectItem value="center">中央</SelectItem>
                  <SelectItem value="right">右寄せ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {block.type === 'heading' && (
        <div className="space-y-4">
          <div className="space-y-4">
            <h5 className="text-sm font-semibold">コンテンツ</h5>
            <div className="space-y-2">
              <Label htmlFor="heading-text">見出しテキスト</Label>
              <Input
                id="heading-text"
                type="text"
                value={content.text || ''}
                onChange={(e) => updateContent({ text: e.target.value })}
                placeholder="見出しを入力..."
              />
            </div>
          </div>
          <div className="space-y-4">
            <h5 className="text-sm font-semibold">設定</h5>
            <div className="space-y-2">
              <Label htmlFor="heading-level">見出しレベル</Label>
              <Select
                value={(settings.level || 2).toString()}
                onValueChange={(value) => updateSettings({ level: parseInt(value) })}
              >
                <SelectTrigger id="heading-level">
                  <SelectValue placeholder="レベルを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">H1</SelectItem>
                  <SelectItem value="2">H2</SelectItem>
                  <SelectItem value="3">H3</SelectItem>
                  <SelectItem value="4">H4</SelectItem>
                  <SelectItem value="5">H5</SelectItem>
                  <SelectItem value="6">H6</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {block.type === 'image' && (
        <div className="space-y-4">
          <h5 className="text-sm font-semibold">コンテンツ</h5>
          <div className="space-y-2">
            <Label htmlFor="image-upload">画像</Label>
            <Button
              id="image-upload"
              variant="outline"
              onClick={async () => {
                const filePath = await window.electronAPI.selectFile({
                  filters: [
                    { name: '画像ファイル', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'] },
                    { name: 'すべてのファイル', extensions: ['*'] }
                  ]
                });
                if (filePath) {
                  try {
                    const data = await window.electronAPI.readFileBase64(filePath);
                    const ext = filePath.split('.').pop()?.toLowerCase() || 'jpg';
                    const mimeMap: Record<string, string> = {
                      jpg: 'image/jpeg',
                      jpeg: 'image/jpeg',
                      png: 'image/png',
                      gif: 'image/gif',
                      webp: 'image/webp',
                      svg: 'image/svg+xml'
                    };
                    const dataUrl = `data:${mimeMap[ext] || 'image/jpeg'};base64,${data}`;

                    const buffer = Uint8Array.from(atob(data), c => c.charCodeAt(0));
                    await window.electronAPI.cacheAssetBuffer({
                      filename: filePath.split(/[/\\]/).pop(),
                      data: Array.from(buffer),
                      mime: mimeMap[ext] || 'image/jpeg'
                    });

                    updateContent({ src: dataUrl });
                  } catch (error) {
                    console.error('Failed to upload image:', error);
                    alert('画像のアップロードに失敗しました');
                  }
                }
              }}
            >
              📁 画像を選択
            </Button>
            {content.src && (
              <div className="rounded border p-2">
                <img src={content.src} alt="プレビュー" className="w-full" style={{ maxHeight: '200px', objectFit: 'contain' }} />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="image-alt">代替テキスト</Label>
            <Input
              id="image-alt"
              type="text"
              value={content.alt || ''}
              onChange={(e) => updateContent({ alt: e.target.value })}
              placeholder="画像の説明"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image-caption">キャプション</Label>
            <Input
              id="image-caption"
              type="text"
              value={content.caption || ''}
              onChange={(e) => updateContent({ caption: e.target.value })}
              placeholder="キャプション（任意）"
            />
          </div>
        </div>
      )}

      {block.type === 'button' && (
        <div className="space-y-4">
          <div className="space-y-4">
            <h5 className="text-sm font-semibold">コンテンツ</h5>
            <div className="space-y-2">
              <Label htmlFor="button-text">ボタンテキスト</Label>
              <Input
                id="button-text"
                type="text"
                value={content.text || ''}
                onChange={(e) => updateContent({ text: e.target.value })}
                placeholder="クリックしてください"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="button-url">リンクURL</Label>
              <Input
                id="button-url"
                type="text"
                value={content.url || ''}
                onChange={(e) => updateContent({ url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="space-y-4">
            <h5 className="text-sm font-semibold">設定</h5>
            <div className="space-y-2">
              <Label htmlFor="button-style">スタイル</Label>
              <Select
                value={settings.style || 'primary'}
                onValueChange={(value) => updateSettings({ style: value })}
              >
                <SelectTrigger id="button-style">
                  <SelectValue placeholder="スタイルを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">プライマリ</SelectItem>
                  <SelectItem value="secondary">セカンダリ</SelectItem>
                  <SelectItem value="outline">アウトライン</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="button-new-tab"
                checked={settings.openInNewTab || false}
                onCheckedChange={(checked) => updateSettings({ openInNewTab: checked })}
              />
              <Label htmlFor="button-new-tab" className="cursor-pointer">新しいタブで開く</Label>
            </div>
          </div>
        </div>
      )}

      {block.type === 'divider' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            このブロックには追加の設定はありません。
          </p>
        </div>
      )}

      {block.type === 'spacer' && (
        <div className="space-y-4">
          <h5 className="text-sm font-semibold">設定</h5>
          <div className="space-y-2">
            <Label htmlFor="spacer-height">高さ (px)</Label>
            <Input
              id="spacer-height"
              type="number"
              value={settings.height || 40}
              onChange={(e) => updateSettings({ height: parseInt(e.target.value) })}
              min="10"
              max="500"
            />
          </div>
        </div>
      )}

      {block.type === 'video' && (
        <div className="space-y-4">
          <h5 className="text-sm font-semibold">コンテンツ</h5>
          <div className="space-y-2">
            <Label htmlFor="video-url">動画URL（YouTube、Vimeoなどの埋め込みURL）</Label>
            <Input
              id="video-url"
              type="text"
              value={content.url || ''}
              onChange={(e) => updateContent({ url: e.target.value })}
              placeholder="https://www.youtube.com/embed/..."
            />
          </div>
        </div>
      )}

      {block.type === 'audio' && (
        <div className="space-y-4">
          <h5 className="text-sm font-semibold">コンテンツ</h5>
          <div className="space-y-2">
            <Label htmlFor="audio-url">音声ファイルURL</Label>
            <Input
              id="audio-url"
              type="text"
              value={content.url || ''}
              onChange={(e) => updateContent({ url: e.target.value })}
              placeholder="https://..."
            />
          </div>
        </div>
      )}

      {block.type === 'embed' && (
        <div className="space-y-4">
          <h5 className="text-sm font-semibold">コンテンツ</h5>
          <div className="space-y-2">
            <Label htmlFor="embed-html">埋め込みHTML</Label>
            <Textarea
              id="embed-html"
              value={content.html || ''}
              onChange={(e) => updateContent({ html: e.target.value })}
              placeholder="<iframe>...</iframe>"
              rows={6}
            />
          </div>
        </div>
      )}

      {block.type === 'gallery' && (
        <div className="space-y-4">
          <h5 className="text-sm font-semibold">画像リスト</h5>
          <div className="space-y-3">
            {(content.images || []).map((img: any, index: number) => (
              <div key={img.id} className="rounded border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">画像 {index + 1}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      const newImages = content.images.filter((_: any, i: number) => i !== index);
                      updateContent({ images: newImages });
                    }}
                  >
                    削除
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`gallery-img-${index}-src`}>画像URL</Label>
                  <Input
                    id={`gallery-img-${index}-src`}
                    type="text"
                    value={img.src || ''}
                    onChange={(e) => {
                      const newImages = [...content.images];
                      newImages[index] = { ...img, src: e.target.value };
                      updateContent({ images: newImages });
                    }}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`gallery-img-${index}-alt`}>代替テキスト</Label>
                  <Input
                    id={`gallery-img-${index}-alt`}
                    type="text"
                    value={img.alt || ''}
                    onChange={(e) => {
                      const newImages = [...content.images];
                      newImages[index] = { ...img, alt: e.target.value };
                      updateContent({ images: newImages });
                    }}
                    placeholder="画像の説明"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`gallery-img-${index}-caption`}>キャプション</Label>
                  <Input
                    id={`gallery-img-${index}-caption`}
                    type="text"
                    value={img.caption || ''}
                    onChange={(e) => {
                      const newImages = [...content.images];
                      newImages[index] = { ...img, caption: e.target.value };
                      updateContent({ images: newImages });
                    }}
                    placeholder="キャプション（任意）"
                  />
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() => {
              const newImage = {
                id: `img-${Date.now()}`,
                src: '',
                alt: '',
                caption: '',
              };
              updateContent({ images: [...(content.images || []), newImage] });
            }}
          >
            + 画像を追加
          </Button>
        </div>
      )}

      {block.type === 'release' && (
        <div className="space-y-4">
          <div className="space-y-4">
            <h5 className="text-sm font-semibold">ジャケット画像</h5>
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={async () => {
                  const result = await window.electronAPI.selectFile({
                    filters: [
                      { name: '画像', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] },
                    ],
                    properties: ['openFile'],
                  });
                  if (result) {
                    const filePath = result;
                    const data = await window.electronAPI.readFileBase64(filePath);
                    const ext = filePath.split('.').pop()?.toLowerCase() || 'jpg';
                    const mimeMap: Record<string, string> = {
                      jpg: 'image/jpeg',
                      jpeg: 'image/jpeg',
                      png: 'image/png',
                      gif: 'image/gif',
                      webp: 'image/webp',
                    };
                    const dataUrl = `data:${mimeMap[ext] || 'image/jpeg'};base64,${data}`;
                    const buffer = Uint8Array.from(atob(data), c => c.charCodeAt(0));
                    await window.electronAPI.cacheAssetBuffer({
                      filename: filePath.split(/[/\\]/).pop(),
                      data: Array.from(buffer),
                      mime: mimeMap[ext] || 'image/jpeg'
                    });
                    updateContent({ jacketImage: dataUrl });
                  }
                }}
              >
                ジャケット画像を選択
              </Button>
              {content.jacketImage && <p className="text-sm text-muted-foreground">画像設定済み</p>}
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="text-sm font-semibold">アルバム情報</h5>
            <div className="space-y-2">
              <Label htmlFor="release-album-title">アルバムタイトル</Label>
              <Input
                id="release-album-title"
                type="text"
                value={content.albumTitle || ''}
                onChange={(e) => updateContent({ albumTitle: e.target.value })}
                placeholder="Album Title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="release-artist-name">アーティスト名</Label>
              <Input
                id="release-artist-name"
                type="text"
                value={content.artistName || ''}
                onChange={(e) => updateContent({ artistName: e.target.value })}
                placeholder="Artist Name"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="text-sm font-semibold">リリース情報</h5>
            <div className="space-y-3">
              {(content.releaseInfo || []).map((info: any, index: number) => (
                <div key={info.id} className="rounded border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">情報 {index + 1}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const newInfo = content.releaseInfo.filter((_: any, i: number) => i !== index);
                        updateContent({ releaseInfo: newInfo });
                      }}
                    >
                      削除
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`release-info-${index}-label`}>ラベル</Label>
                    <Input
                      id={`release-info-${index}-label`}
                      type="text"
                      value={info.label || ''}
                      onChange={(e) => {
                        const newInfo = [...content.releaseInfo];
                        newInfo[index] = { ...info, label: e.target.value };
                        updateContent({ releaseInfo: newInfo });
                      }}
                      placeholder="Release、Priceなど"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`release-info-${index}-value`}>値</Label>
                    <Input
                      id={`release-info-${index}-value`}
                      type="text"
                      value={info.value || ''}
                      onChange={(e) => {
                        const newInfo = [...content.releaseInfo];
                        newInfo[index] = { ...info, value: e.target.value };
                        updateContent({ releaseInfo: newInfo });
                      }}
                      placeholder="2025.12.31、¥1,000など"
                    />
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => {
                const newInfo = {
                  id: `info-${Date.now()}`,
                  label: '',
                  value: '',
                };
                updateContent({ releaseInfo: [...(content.releaseInfo || []), newInfo] });
              }}
            >
              + 情報を追加
            </Button>
          </div>

          <div className="space-y-4">
            <h5 className="text-sm font-semibold">ショップリンク</h5>
            <div className="space-y-3">
              {(content.shopLinks || []).map((link: any, index: number) => (
                <div key={link.id} className="rounded border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">リンク {index + 1}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const newLinks = content.shopLinks.filter((_: any, i: number) => i !== index);
                        updateContent({ shopLinks: newLinks });
                      }}
                    >
                      削除
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`release-link-${index}-label`}>ラベル</Label>
                    <Input
                      id={`release-link-${index}-label`}
                      type="text"
                      value={link.label || ''}
                      onChange={(e) => {
                        const newLinks = [...content.shopLinks];
                        newLinks[index] = { ...link, label: e.target.value };
                        updateContent({ shopLinks: newLinks });
                      }}
                      placeholder="BOOTH、Melonbooksなど"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`release-link-${index}-url`}>URL</Label>
                    <Input
                      id={`release-link-${index}-url`}
                      type="text"
                      value={link.url || ''}
                      onChange={(e) => {
                        const newLinks = [...content.shopLinks];
                        newLinks[index] = { ...link, url: e.target.value };
                        updateContent({ shopLinks: newLinks });
                      }}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => {
                const newLink = {
                  id: `link-${Date.now()}`,
                  label: '',
                  url: '',
                };
                updateContent({ shopLinks: [...(content.shopLinks || []), newLink] });
              }}
            >
              + リンクを追加
            </Button>
          </div>

          <div className="space-y-4">
            <h5 className="text-sm font-semibold">レイアウト設定</h5>
            <div className="space-y-2">
              <Label htmlFor="release-layout">レイアウト</Label>
              <Select
                value={settings.layout || 'side-by-side'}
                onValueChange={(value) => updateSettings({ layout: value })}
              >
                <SelectTrigger id="release-layout">
                  <SelectValue placeholder="レイアウトを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="side-by-side">横並び</SelectItem>
                  <SelectItem value="stacked">縦積み</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="release-jacket-position">ジャケット位置</Label>
              <Select
                value={settings.jacketPosition || 'left'}
                onValueChange={(value) => updateSettings({ jacketPosition: value })}
              >
                <SelectTrigger id="release-jacket-position">
                  <SelectValue placeholder="位置を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">左</SelectItem>
                  <SelectItem value="right">右</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {block.type === 'shop-links' && (
        <div className="space-y-4">
          <h5 className="text-sm font-semibold">ショップリンク</h5>
          <div className="space-y-3">
            {(content.links || []).map((link: any, index: number) => (
              <div key={link.id} className="rounded border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">リンク {index + 1}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      const newLinks = content.links.filter((_: any, i: number) => i !== index);
                      updateContent({ links: newLinks });
                    }}
                  >
                    削除
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`shop-link-${index}-label`}>ラベル</Label>
                  <Input
                    id={`shop-link-${index}-label`}
                    type="text"
                    value={link.label || ''}
                    onChange={(e) => {
                      const newLinks = [...content.links];
                      newLinks[index] = { ...link, label: e.target.value };
                      updateContent({ links: newLinks });
                    }}
                    placeholder="Booth、Melonbooksなど"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`shop-link-${index}-url`}>URL</Label>
                  <Input
                    id={`shop-link-${index}-url`}
                    type="text"
                    value={link.url || ''}
                    onChange={(e) => {
                      const newLinks = [...content.links];
                      newLinks[index] = { ...link, url: e.target.value };
                      updateContent({ links: newLinks });
                    }}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`shop-link-${index}-icon`}>アイコン（絵文字または画像URL）</Label>
                  <Input
                    id={`shop-link-${index}-icon`}
                    type="text"
                    value={link.icon || ''}
                    onChange={(e) => {
                      const newLinks = [...content.links];
                      newLinks[index] = { ...link, icon: e.target.value };
                      updateContent({ links: newLinks });
                    }}
                    placeholder="🛒"
                  />
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() => {
              const newLink = {
                id: `link-${Date.now()}`,
                label: '',
                url: '',
                icon: '',
              };
              updateContent({ links: [...(content.links || []), newLink] });
            }}
          >
            + リンクを追加
          </Button>
        </div>
      )}

      {block.type === 'tracklist' && (
        <div className="space-y-4">
          <h5 className="text-sm font-semibold">トラックリスト</h5>
          <div className="space-y-3">
            {(content.tracks || []).map((track: any, index: number) => (
              <div key={track.id} className="rounded border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">トラック {index + 1}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      const newTracks = content.tracks.filter((_: any, i: number) => i !== index);
                      updateContent({ tracks: newTracks });
                    }}
                  >
                    削除
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`track-${index}-title`}>タイトル</Label>
                  <Input
                    id={`track-${index}-title`}
                    type="text"
                    value={track.title || ''}
                    onChange={(e) => {
                      const newTracks = [...content.tracks];
                      newTracks[index] = { ...track, title: e.target.value };
                      updateContent({ tracks: newTracks });
                    }}
                    placeholder="曲名"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`track-${index}-artist`}>アーティスト</Label>
                  <Input
                    id={`track-${index}-artist`}
                    type="text"
                    value={track.artist || ''}
                    onChange={(e) => {
                      const newTracks = [...content.tracks];
                      newTracks[index] = { ...track, artist: e.target.value };
                      updateContent({ tracks: newTracks });
                    }}
                    placeholder="アーティスト名（任意）"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`track-${index}-duration`}>再生時間</Label>
                  <Input
                    id={`track-${index}-duration`}
                    type="text"
                    value={track.duration || ''}
                    onChange={(e) => {
                      const newTracks = [...content.tracks];
                      newTracks[index] = { ...track, duration: e.target.value };
                      updateContent({ tracks: newTracks });
                    }}
                    placeholder="3:45"
                  />
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() => {
              const newTrack = {
                id: `track-${Date.now()}`,
                title: '',
                artist: '',
                duration: '',
              };
              updateContent({ tracks: [...(content.tracks || []), newTrack] });
            }}
          >
            + トラックを追加
          </Button>
        </div>
      )}

      {block.type === 'credits' && (
        <div className="space-y-4">
          <h5 className="text-sm font-semibold">クレジットグループ</h5>
          <div className="space-y-4">
            {(content.groups || []).map((group: any, groupIndex: number) => (
              <div key={group.id} className="rounded border p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">グループ {groupIndex + 1}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      const newGroups = content.groups.filter((_: any, i: number) => i !== groupIndex);
                      updateContent({ groups: newGroups });
                    }}
                  >
                    削除
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`credit-group-${groupIndex}-title`}>グループタイトル（任意）</Label>
                  <Input
                    id={`credit-group-${groupIndex}-title`}
                    type="text"
                    value={group.title || ''}
                    onChange={(e) => {
                      const newGroups = [...content.groups];
                      newGroups[groupIndex] = { ...group, title: e.target.value };
                      updateContent({ groups: newGroups });
                    }}
                    placeholder="サントラ、アートワーク、運営など"
                  />
                </div>
                <div className="space-y-3 pl-4 border-l-2">
                  <h6 className="text-sm font-medium">メンバー</h6>
                  <div className="space-y-2">
                    {(group.items || []).map((item: any, itemIndex: number) => (
                      <div key={item.id} className="rounded border border-dashed p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">メンバー {itemIndex + 1}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newGroups = [...content.groups];
                              newGroups[groupIndex].items = group.items.filter((_: any, i: number) => i !== itemIndex);
                              updateContent({ groups: newGroups });
                            }}
                          >
                            ✕
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`credit-item-${groupIndex}-${itemIndex}-role`} className="text-xs">役割</Label>
                          <Input
                            id={`credit-item-${groupIndex}-${itemIndex}-role`}
                            type="text"
                            value={item.role || ''}
                            onChange={(e) => {
                              const newGroups = [...content.groups];
                              newGroups[groupIndex].items[itemIndex] = { ...item, role: e.target.value };
                              updateContent({ groups: newGroups });
                            }}
                            placeholder="作曲、イラストなど"
                            className="h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`credit-item-${groupIndex}-${itemIndex}-name`} className="text-xs">名前</Label>
                          <Input
                            id={`credit-item-${groupIndex}-${itemIndex}-name`}
                            type="text"
                            value={item.name || ''}
                            onChange={(e) => {
                              const newGroups = [...content.groups];
                              newGroups[groupIndex].items[itemIndex] = { ...item, name: e.target.value };
                              updateContent({ groups: newGroups });
                            }}
                            placeholder="名前"
                            className="h-8"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newItem = {
                        id: `item-${Date.now()}`,
                        role: '',
                        name: '',
                        links: [],
                      };
                      const newGroups = [...content.groups];
                      newGroups[groupIndex].items = [...(group.items || []), newItem];
                      updateContent({ groups: newGroups });
                    }}
                  >
                    + メンバーを追加
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() => {
              const newGroup = {
                id: `group-${Date.now()}`,
                title: '',
                items: [],
              };
              updateContent({ groups: [...(content.groups || []), newGroup] });
            }}
          >
            + グループを追加
          </Button>
        </div>
      )}

      {/* Columnsは特殊なので後で実装 */}
      {block.type === 'columns' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            カラムブロックは子ブロックを含む特殊なブロックです。設定UIは後で実装予定です。
          </p>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm">詳細設定（JSON）</summary>
            <pre className="text-xs overflow-auto max-h-[150px] mt-2 p-2 rounded bg-muted">
              {JSON.stringify({ content, settings }, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

// グローバル設定パネル
interface GlobalSettingsProps {
  globalSettings: Project['globalSettings'];
  onUpdate: (settings: Project['globalSettings']) => void;
}

const GlobalSettings: React.FC<GlobalSettingsProps> = ({ globalSettings, onUpdate }) => {
  // デバウンス用のタイマー参照
  const debounceTimerRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const updateColors = (updates: Partial<typeof globalSettings.colors>) => {
    onUpdate({
      ...globalSettings,
      colors: { ...globalSettings.colors, ...updates } as typeof globalSettings.colors,
    });
  };

  const updateTypography = (updates: Partial<typeof globalSettings.typography>) => {
    onUpdate({
      ...globalSettings,
      typography: { ...globalSettings.typography, ...updates },
    });
  };

  const updateLayout = (updates: Partial<typeof globalSettings.layout>) => {
    onUpdate({
      ...globalSettings,
      layout: { ...globalSettings.layout, ...updates },
    });
  };

  // デバウンス付き色更新（カラーピッカー用）
  const updateColorsDebounced = useCallback((updates: Partial<typeof globalSettings.colors>, delay: number = 100) => {
    const key = 'colors-' + JSON.stringify(Object.keys(updates));

    // 既存のタイマーをクリア
    const existingTimer = debounceTimerRef.current.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // 新しいタイマーをセット
    const timer = setTimeout(() => {
      onUpdate({
        ...globalSettings,
        colors: { ...globalSettings.colors, ...updates } as typeof globalSettings.colors,
      });
      debounceTimerRef.current.delete(key);
    }, delay);

    debounceTimerRef.current.set(key, timer);
  }, [globalSettings, onUpdate]);

  return (
    <div className="block-settings-form">
      <h4>🎨 共通設定</h4>

      {/* カラーパレット */}
      <div className="setting-section">
        <h5>カラーパレット</h5>
        <div className="setting-field">
          <label>プライマリカラー</label>
          <div className="color-picker-group">
            <input
              type="color"
              value={globalSettings.colors.primary}
              onChange={(e) => updateColorsDebounced({ primary: e.target.value })}
            />
            <input
              type="text"
              value={globalSettings.colors.primary}
              onChange={(e) => updateColorsDebounced({ primary: e.target.value }, 300)}
              placeholder="#000000"
              className="color-text-input"
            />
          </div>
        </div>

        <div className="setting-field">
          <label>セカンダリカラー</label>
          <div className="color-picker-group">
            <input
              type="color"
              value={globalSettings.colors.secondary}
              onChange={(e) => updateColorsDebounced({ secondary: e.target.value })}
            />
            <input
              type="text"
              value={globalSettings.colors.secondary}
              onChange={(e) => updateColorsDebounced({ secondary: e.target.value }, 300)}
              placeholder="#000000"
              className="color-text-input"
            />
          </div>
        </div>

        <div className="setting-field">
          <label>アクセントカラー</label>
          <div className="color-picker-group">
            <input
              type="color"
              value={globalSettings.colors.accent}
              onChange={(e) => updateColorsDebounced({ accent: e.target.value })}
            />
            <input
              type="text"
              value={globalSettings.colors.accent}
              onChange={(e) => updateColorsDebounced({ accent: e.target.value }, 300)}
              placeholder="#000000"
              className="color-text-input"
            />
          </div>
        </div>

        <div className="setting-field">
          <label>背景色</label>
          <div className="color-picker-group">
            <input
              type="color"
              value={globalSettings.colors.background}
              onChange={(e) => updateColorsDebounced({ background: e.target.value })}
            />
            <input
              type="text"
              value={globalSettings.colors.background}
              onChange={(e) => updateColorsDebounced({ background: e.target.value }, 300)}
              placeholder="#ffffff"
              className="color-text-input"
            />
          </div>
        </div>

        <div className="setting-field">
          <label>テキストカラー</label>
          <div className="color-picker-group">
            <input
              type="color"
              value={globalSettings.colors.text}
              onChange={(e) => updateColorsDebounced({ text: e.target.value })}
            />
            <input
              type="text"
              value={globalSettings.colors.text}
              onChange={(e) => updateColorsDebounced({ text: e.target.value }, 300)}
              placeholder="#000000"
              className="color-text-input"
            />
          </div>
        </div>
      </div>

      {/* タイポグラフィ */}
      <div className="setting-section">
        <h5>タイポグラフィ</h5>
        <div className="setting-field">
          <label>見出しフォント</label>
          <input
            type="text"
            value={globalSettings.typography.headingFont}
            onChange={(e) => updateTypography({ headingFont: e.target.value })}
            placeholder="'Noto Sans JP', sans-serif"
          />
        </div>

        <div className="setting-field">
          <label>本文フォント</label>
          <input
            type="text"
            value={globalSettings.typography.bodyFont}
            onChange={(e) => updateTypography({ bodyFont: e.target.value })}
            placeholder="'Noto Sans JP', sans-serif"
          />
        </div>

        <div className="setting-field">
          <label>基本フォントサイズ (px)</label>
          <input
            type="number"
            value={globalSettings.typography.baseSize}
            onChange={(e) => updateTypography({ baseSize: parseInt(e.target.value) })}
            min="12"
            max="24"
          />
        </div>

        <div className="setting-field">
          <label>スケール比</label>
          <input
            type="number"
            value={globalSettings.typography.scale}
            onChange={(e) => updateTypography({ scale: parseFloat(e.target.value) })}
            min="1.0"
            max="2.0"
            step="0.05"
          />
        </div>
      </div>

      {/* レイアウト */}
      <div className="setting-section">
        <h5>レイアウト</h5>
        <div className="setting-field">
          <label>最大幅 (px)</label>
          <input
            type="number"
            value={globalSettings.layout.maxWidth}
            onChange={(e) => updateLayout({ maxWidth: parseInt(e.target.value) })}
            min="800"
            max="2000"
            step="50"
          />
        </div>

        <div className="setting-field">
          <label>余白 (px)</label>
          <input
            type="number"
            value={globalSettings.layout.gutter}
            onChange={(e) => updateLayout({ gutter: parseInt(e.target.value) })}
            min="8"
            max="64"
            step="4"
          />
        </div>
      </div>
    </div>
  );
};
