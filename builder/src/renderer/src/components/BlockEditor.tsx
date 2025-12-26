import React, { useState } from 'react';
import './BlockEditor.css';
import type { Block, BlockType, Project } from '../../../types/block-system';
import { blockRegistry, createBlock, getAllCategories, getBlocksByCategory } from '../../../blocks/registry';
import { BlockRenderer } from '../../../blocks/components';

interface BlockEditorProps {
  project: Project;
  onChange: (project: Project) => void;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({ project, onChange }) => {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['layout', 'content'])
  );

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
    <div className="block-editor">
      {/* 左パネル: ブロックパレット */}
      <div className="block-palette">
        <div className="palette-header">
          <h3>ブロック</h3>
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
                >
                  <span className="category-icon">
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
                      >
                        <span className="block-icon">{blockDef.icon}</span>
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
        </div>
        <div className="canvas-content template-katanegai">
          {project.blocks.length === 0 ? (
            <div className="canvas-empty">
              <p>左のパレットからブロックを追加してください</p>
            </div>
          ) : (
            project.blocks
              .sort((a, b) => a.order - b.order)
              .map((block) => (
                <div
                  key={block.id}
                  className={`canvas-block ${
                    selectedBlockId === block.id ? 'selected' : ''
                  }`}
                  onClick={() => setSelectedBlockId(block.id)}
                >
                  <div className="block-controls">
                    <span className="block-type-label">
                      {blockRegistry[block.type].icon}{' '}
                      {blockRegistry[block.type].label}
                    </span>
                    <button
                      className="btn-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBlock(block.id);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="block-preview">
                    <BlockRenderer block={block} />
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* 右パネル: 設定パネル */}
      <div className="block-settings">
        <div className="settings-header">
          <h3>設定</h3>
        </div>
        <div className="settings-content">
          {selectedBlock ? (
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

// ブロック設定パネル（簡易版）
interface BlockSettingsProps {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
}

const BlockSettings: React.FC<BlockSettingsProps> = ({ block, onUpdate }) => {
  const blockDef = blockRegistry[block.type];

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

      {/* ブロックタイプ別の設定は後で実装 */}
      <div className="setting-section">
        <h5>コンテンツ</h5>
        <pre style={{ fontSize: '0.8rem', overflow: 'auto', maxHeight: '200px' }}>
          {JSON.stringify(block.content, null, 2)}
        </pre>
      </div>

      <div className="setting-section">
        <h5>設定</h5>
        <pre style={{ fontSize: '0.8rem', overflow: 'auto', maxHeight: '200px' }}>
          {JSON.stringify(block.settings, null, 2)}
        </pre>
      </div>

      <p style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '1rem' }}>
        詳細な設定UIは後で実装予定
      </p>
    </div>
  );
};
