import React from 'react';
import './BlockToolbar.css';

export interface BlockToolbarProps {
  blockId: string;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export const BlockToolbar: React.FC<BlockToolbarProps> = ({
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  canMoveUp,
  canMoveDown,
}) => {
  return (
    <div className="block-toolbar" role="toolbar" aria-label="ブロック操作">
      <button
        onClick={onMoveUp}
        disabled={!canMoveUp}
        aria-label="上に移動"
        title="上に移動"
        className="toolbar-btn"
      >
        ↑
      </button>
      <button
        onClick={onMoveDown}
        disabled={!canMoveDown}
        aria-label="下に移動"
        title="下に移動"
        className="toolbar-btn"
      >
        ↓
      </button>
      <button
        onClick={onDuplicate}
        aria-label="複製"
        title="複製 (Ctrl+D)"
        className="toolbar-btn"
      >
        ⎘
      </button>
      <button
        onClick={onDelete}
        aria-label="削除"
        title="削除 (Delete)"
        className="toolbar-btn toolbar-btn-danger"
      >
        ✕
      </button>
    </div>
  );
};
