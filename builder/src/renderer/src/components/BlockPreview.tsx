import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Project, Block } from '../../../types/block-system';
import { blockRegistry } from '../../../blocks/registry';
import './BlockPreview.css';
import {
  Desktop20Regular,
  TabletLaptop20Regular,
  Phone20Regular,
  ArrowSync20Regular,
  Pause20Regular,
  Checkmark20Regular,
  Circle20Regular,
} from '@fluentui/react-icons';

interface BlockPreviewProps {
  project: Project;
  selectedBlockId: string | null;
  onBlockSelect: (blockId: string | null) => void;
  onReorderBlocks: (draggedBlockId: string, targetBlockId: string) => void;
}

type DeviceSize = 'desktop' | 'tablet' | 'mobile';

const DEVICE_WIDTHS = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

/**
 * ブロックをHTMLに変換する関数
 */
function blockToHTML(block: Block): string {
  if (!block.visible) {
    return '';
  }

  const content = block.content as any;
  const settings = block.settings as any;
  const isSelected = false; // iframeでは選択状態は扱わない

  switch (block.type) {
    case 'hero':
      const overlayEnabled = settings.overlay?.enabled !== false;
      const overlayColor = settings.overlay?.color || '#000000';
      const overlayOpacity = settings.overlay?.opacity ?? 50;

      // HEX色をRGBAに変換
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
      };

      const rgb = hexToRgb(overlayColor);
      const overlayStyle = overlayEnabled
        ? `background-color: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${overlayOpacity / 100});`
        : 'display: none;';

      return `
        <section class="block block-hero" data-block-id="${block.id}" style="background-image: url('${content.backgroundImage || ''}');">
          <div class="hero-overlay" style="${overlayStyle}"></div>
          <div class="hero-content">
            ${content.title ? `<h1 class="hero-title">${content.title}</h1>` : ''}
            ${content.subtitle ? `<p class="hero-subtitle">${content.subtitle}</p>` : ''}
          </div>
        </section>
      `;

    case 'text':
      const alignment = settings.alignment || 'left';
      return `
        <section class="block block-text" data-block-id="${block.id}">
          <div class="block-container">
            <p class="text-content" style="text-align: ${alignment};">${content.text || ''}</p>
          </div>
        </section>
      `;

    case 'heading':
      const level = settings.level || 2;
      return `
        <section class="block block-heading" data-block-id="${block.id}">
          <div class="block-container">
            <h${level} class="heading-text">${content.text || ''}</h${level}>
            <div class="heading-line"></div>
          </div>
        </section>
      `;

    case 'image':
      return `
        <section class="block block-image" data-block-id="${block.id}">
          <div class="block-container">
            <img src="${content.src || ''}" alt="${content.alt || ''}" />
            ${content.caption ? `<p class="image-caption">${content.caption}</p>` : ''}
          </div>
        </section>
      `;

    case 'button':
      return `
        <section class="block block-button" data-block-id="${block.id}">
          <div class="block-container">
            <a href="${content.url || '#'}" class="btn btn-${settings.style || 'primary'}" ${settings.openInNewTab ? 'target="_blank" rel="noopener noreferrer"' : ''}>
              ${content.text || 'ボタン'}
            </a>
          </div>
        </section>
      `;

    case 'divider':
      return `
        <section class="block block-divider" data-block-id="${block.id}">
          <div class="block-container">
            <hr />
          </div>
        </section>
      `;

    case 'spacer':
      return `
        <div class="block block-spacer" data-block-id="${block.id}" style="height: ${settings.height || 40}px;"></div>
      `;

    case 'credits':
      const groups = content.groups || [];
      const groupsHTML = groups.map((group: any) => {
        const itemsHTML = group.items.map((item: any) => `
          <div class="credit-item">
            ${settings.showAvatars && item.avatar ? `<img src="${item.avatar}" alt="${item.name}" class="credit-avatar" />` : ''}
            <span class="credit-role">${item.role || ''}</span>
            <span class="credit-name">${item.name || ''}</span>
            ${settings.showBios && item.bio ? `<p class="credit-bio">${item.bio}</p>` : ''}
            ${settings.showLinks && item.links && item.links.length > 0 ? `
              <div class="credit-links">
                ${item.links.map((link: any) => `
                  <a href="${link.url || '#'}" target="_blank" rel="noopener noreferrer">
                    ${link.label || ''}
                  </a>
                `).join('')}
              </div>
            ` : ''}
          </div>
        `).join('');

        return `
          <div class="credits-group">
            ${group.title ? `<h3 class="credits-group-title">${group.title}</h3>` : ''}
            <div class="credits-grid">
              ${itemsHTML}
            </div>
          </div>
        `;
      }).join('');

      return `
        <section class="block block-credits" data-block-id="${block.id}">
          <div class="block-container">
            ${groupsHTML}
          </div>
        </section>
      `;

    case 'tracklist':
      const tracks = content.tracks || [];
      const tracksHTML = tracks.map((track: any, index: number) => `
        <tr class="track-row">
          <td class="track-num">${String(index + 1).padStart(2, '0')}</td>
          <td class="track-main">
            <span class="track-name">${track.title || ''}</span>
            ${track.artist ? `<span class="track-artist"> / ${track.artist}</span>` : ''}
          </td>
          <td class="track-time">${track.duration || ''}</td>
        </tr>
      `).join('');

      return `
        <section class="block block-tracklist" data-block-id="${block.id}">
          <div class="block-container">
            <table class="track-table">
              ${tracksHTML}
            </table>
          </div>
        </section>
      `;

    case 'release':
      const releaseInfo = content.releaseInfo || [];
      const releaseShopLinks = content.shopLinks || [];
      const releaseLayout = settings.layout || 'side-by-side';
      const jacketPosition = settings.jacketPosition || 'left';

      const releaseInfoHTML = releaseInfo.map((info: any) => `
        <div class="spec-row">
          <dt>${info.label}</dt>
          <dd>${info.value}</dd>
        </div>
      `).join('');

      const releaseLinksHTML = releaseShopLinks.map((link: any) => `
        <a href="${link.url || '#'}" class="btn-shop" target="_blank" rel="noopener noreferrer">${link.label || ''}</a>
      `).join('');

      return `
        <section class="block block-release" data-block-id="${block.id}">
          <div class="block-container">
            <div class="release-layout ${releaseLayout === 'stacked' ? 'stacked' : ''} ${jacketPosition === 'right' ? 'jacket-right' : ''}">
              <div class="jacket-area">
                ${content.jacketImage ? `<img src="${content.jacketImage}" alt="${content.albumTitle || ''}" class="jacket-img">` : `<div class="jacket-placeholder"><span>${content.albumTitle || 'Album'}</span></div>`}
              </div>
              <div class="info-area">
                <div class="info-header">
                  <h2 class="album-title">${content.albumTitle || ''}</h2>
                  ${content.artistName ? `<p class="artist-name">${content.artistName}</p>` : ''}
                </div>
                ${releaseInfo.length > 0 ? `<dl class="spec-list">${releaseInfoHTML}</dl>` : ''}
                ${releaseShopLinks.length > 0 ? `<div class="shop-buttons">${releaseLinksHTML}</div>` : ''}
              </div>
            </div>
          </div>
        </section>
      `;

    case 'shop-links':
      const links = content.links || [];
      const linksHTML = links.map((link: any) => `
        <a href="${link.url || '#'}" class="btn-shop" target="_blank" rel="noopener noreferrer">
          ${link.label || ''}
        </a>
      `).join('');

      return `
        <section class="block block-shop-links" data-block-id="${block.id}">
          <div class="block-container">
            <div class="shop-buttons">
              ${linksHTML}
            </div>
          </div>
        </section>
      `;

    case 'gallery':
      const images = content.images || [];
      const imagesHTML = images.map((img: any) => `
        <div class="gallery-item">
          <img src="${img.src || ''}" alt="${img.alt || ''}" />
          ${img.caption ? `<p class="gallery-caption">${img.caption}</p>` : ''}
        </div>
      `).join('');

      return `
        <section class="block block-gallery" data-block-id="${block.id}">
          <div class="block-container">
            <div class="gallery-grid">
              ${imagesHTML}
            </div>
          </div>
        </section>
      `;

    case 'video':
      return `
        <section class="block block-video" data-block-id="${block.id}">
          <div class="block-container">
            ${content.url ? `
              <div class="video-wrapper">
                <iframe src="${content.url}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
              </div>
            ` : ''}
          </div>
        </section>
      `;

    case 'audio':
      return `
        <section class="block block-audio" data-block-id="${block.id}">
          <div class="block-container">
            ${content.url ? `<audio controls style="width: 100%;"><source src="${content.url}" /></audio>` : ''}
          </div>
        </section>
      `;

    case 'columns':
      const childrenHTML = (block.children || []).map(childBlock => blockToHTML(childBlock)).join('');
      return `
        <section class="block block-columns" data-block-id="${block.id}">
          <div class="block-container">
            <div class="columns-container">
              ${childrenHTML}
            </div>
          </div>
        </section>
      `;

    case 'embed':
      return `
        <section class="block block-embed" data-block-id="${block.id}">
          <div class="block-container">
            ${content.html || ''}
          </div>
        </section>
      `;

    default:
      return `
        <div class="block block-unknown" data-block-id="${block.id}" style="padding: 2rem; background: #f0f0f0; text-align: center;">
          <p>Unknown block type: ${block.type}</p>
        </div>
      `;
  }
}

export const BlockPreview: React.FC<BlockPreviewProps> = ({
  project,
  selectedBlockId,
  onBlockSelect,
  onReorderBlocks
}) => {
  const [deviceSize, setDeviceSize] = useState<DeviceSize>('desktop');
  const [pendingUpdate, setPendingUpdate] = useState<boolean>(false);
  const [autoUpdate, setAutoUpdate] = useState<boolean>(true); // 自動更新モード
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastProjectRef = useRef<Project>(project);
  const isInitialMount = useRef<boolean>(true);
  const autoUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);

  // テンプレートCSSはプロジェクトに内包されているため、ファイル読み込み不要
  const templateCSS = project.templateCSS || '/* No template CSS */';

  // Debug log
  useEffect(() => {
    console.log(`[BlockPreview] Using embedded CSS, length: ${templateCSS.length}`);
  }, [templateCSS]);

  // プレビュー更新関数
  const updatePreview = useCallback(() => {
    if (!iframeRef.current) return;
    if (!templateCSS) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    // ブロックをHTMLに変換
    const blocksHTML = project.blocks
      .sort((a, b) => a.order - b.order)
      .map(block => blockToHTML(block))
      .join('\n');

    // CSS変数を生成
    const cssVariables = `
      --primary-color: ${project.globalSettings.colors.primary};
      --secondary-color: ${project.globalSettings.colors.secondary};
      --accent-color: ${project.globalSettings.colors.accent};
      --background-color: ${project.globalSettings.colors.background};
      --text-color: ${project.globalSettings.colors.text};
      --font-heading: ${project.globalSettings.typography.headingFont};
      --font-body: ${project.globalSettings.typography.bodyFont};
      --font-size-base: ${project.globalSettings.typography.baseSize}px;
      --font-scale: ${project.globalSettings.typography.scale};
      --max-width: ${project.globalSettings.layout.maxWidth}px;
      --gutter: ${project.globalSettings.layout.gutter}px;
    `;

    // 完全なHTMLドキュメントを生成
    const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      ${cssVariables}
      font-family: var(--font-body);
      font-size: var(--font-size-base);
      color: var(--text-color);
      background: var(--background-color);
      line-height: 1.6;
    }

    .block-container {
      max-width: var(--max-width);
      margin: 0 auto;
      padding: 0 var(--gutter);
    }

    /* 選択状態のハイライト */
    [data-block-id] {
      position: relative;
      transition: all 0.2s ease;
      outline: 2px solid transparent;
      outline-offset: -2px;
    }

    [data-block-id]:hover {
      cursor: pointer;
      outline-color: rgba(0, 102, 204, 0.4);
      background-color: rgba(0, 102, 204, 0.02);
    }

    [data-block-id].selected {
      outline: 3px solid #0078d4;
      outline-offset: -3px;
      background-color: rgba(0, 120, 212, 0.05);
      box-shadow: 0 0 0 1px rgba(0, 120, 212, 0.1);
    }

    [data-block-id].selected::before {
      content: '✓ 選択中';
      position: absolute;
      top: 8px;
      right: 8px;
      background: #0078d4;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      z-index: 10;
      pointer-events: none;
    }

    /* ドラッグ&ドロップのスタイル */
    [data-block-id].dragging {
      opacity: 0.4;
      cursor: move !important;
    }

    [data-block-id].drag-over {
      border-top: 3px solid #0078d4;
    }

    /* テンプレートCSS */
    ${templateCSS}
  </style>
</head>
<body class="template-${project.template}">
  ${blocksHTML}

  <script>
    (function() {
      'use strict';

      console.log('[iframe] Template:', '${project.template}');
      console.log('[iframe] CSS loaded:', ${templateCSS.length > 0});
      console.log('[iframe] Blocks count:', document.querySelectorAll('[data-block-id]').length);

      // 全ブロックをドラッグ可能にする
      const blocks = document.querySelectorAll('[data-block-id]');
      blocks.forEach(block => {
        block.setAttribute('draggable', 'true');
        // ブロック内の子要素もドラッグ可能にしないようにする
        block.querySelectorAll('*').forEach(child => {
          child.setAttribute('draggable', 'false');
        });
      });

      let draggedElement = null;
      let isDragging = false;

      // ドラッグ開始
      document.addEventListener('dragstart', (e) => {
        const blockElement = e.target.closest('[data-block-id]');
        if (blockElement) {
          isDragging = true;
          draggedElement = blockElement;
          blockElement.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', blockElement.getAttribute('data-block-id'));
          console.log('[iframe] Drag start:', blockElement.getAttribute('data-block-id'));
        }
      });

      // ドラッグ終了
      document.addEventListener('dragend', (e) => {
        isDragging = false;
        // すべてのdrag-overクラスを削除
        document.querySelectorAll('[data-block-id]').forEach(el => {
          el.classList.remove('dragging');
          el.classList.remove('drag-over');
        });
        draggedElement = null;
        console.log('[iframe] Drag end');
      });

      // ドラッグオーバー
      document.addEventListener('dragover', (e) => {
        e.preventDefault();
        const blockElement = e.target.closest('[data-block-id]');
        if (blockElement && blockElement !== draggedElement) {
          e.dataTransfer.dropEffect = 'move';
          // すべてのdrag-overクラスを削除してから追加
          document.querySelectorAll('[data-block-id]').forEach(el => {
            if (el !== blockElement) el.classList.remove('drag-over');
          });
          blockElement.classList.add('drag-over');
        }
      });

      // ドラッグ離脱
      document.addEventListener('dragleave', (e) => {
        const blockElement = e.target.closest('[data-block-id]');
        if (blockElement && e.relatedTarget && !blockElement.contains(e.relatedTarget)) {
          blockElement.classList.remove('drag-over');
        }
      });

      // ドロップ
      document.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const targetElement = e.target.closest('[data-block-id]');
        if (targetElement && draggedElement && targetElement !== draggedElement) {
          const draggedId = draggedElement.getAttribute('data-block-id');
          const targetId = targetElement.getAttribute('data-block-id');

          console.log('[iframe] Drop:', draggedId, 'to', targetId);

          // 親ウィンドウに並び替えを通知
          window.parent.postMessage({
            type: 'block-reorder',
            draggedBlockId: draggedId,
            targetBlockId: targetId
          }, '*');
        }

        // クリーンアップ
        document.querySelectorAll('[data-block-id]').forEach(el => {
          el.classList.remove('drag-over');
          el.classList.remove('dragging');
        });
        draggedElement = null;
        isDragging = false;
      });

      // ブロッククリック時に親ウィンドウに通知（ドラッグ中は無視）
      document.addEventListener('click', (e) => {
        // ドラッグ終了直後のクリックを防ぐ
        if (isDragging) return;

        const blockElement = e.target.closest('[data-block-id]');
        if (blockElement) {
          const blockId = blockElement.getAttribute('data-block-id');
          console.log('[iframe] Click:', blockId);
          window.parent.postMessage({ type: 'block-select', blockId }, '*');
        }
      });

      // 選択状態の更新を受け取る
      window.addEventListener('message', (e) => {
        if (e.data && e.data.type === 'update-selection') {
          console.log('[iframe] Update selection:', e.data.blockId);
          document.querySelectorAll('[data-block-id]').forEach(el => {
            el.classList.remove('selected');
          });
          if (e.data.blockId) {
            const selectedEl = document.querySelector('[data-block-id="' + e.data.blockId + '"]');
            if (selectedEl) {
              selectedEl.classList.add('selected');
            }
          }
        }
      });

      console.log('[iframe] Event handlers initialized');
    })();
  </script>
</body>
</html>
    `;

    console.log(`[BlockPreview] Injecting HTML, template CSS length: ${templateCSS.length}`);

    // iframeに書き込み
    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    // 選択状態を更新（iframeのスクリプト実行を待つため少し遅延）
    setTimeout(() => {
      if (selectedBlockId && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'update-selection', blockId: selectedBlockId }, '*');
      }
    }, 50);

    // 更新完了
    setPendingUpdate(false);
    lastProjectRef.current = project;
  }, [project, selectedBlockId, templateCSS]);

  // 初回マウント時にプレビューを更新
  useEffect(() => {
    if (isInitialMount.current && iframeRef.current && templateCSS) {
      console.log('[BlockPreview] Initial mount - updating preview');
      isInitialMount.current = false;
      // 少し遅延させてiframeが完全に準備されるのを待つ
      setTimeout(() => {
        updatePreview();
      }, 100);
    }
  }, [updatePreview, templateCSS]);

  // プロジェクトの変更を監視して自動更新（デバウンス300ms）
  useEffect(() => {
    // 初回マウント時はスキップ
    if (isInitialMount.current) {
      return;
    }

    // プロジェクトが変更されていない場合はスキップ
    const currentProjectStr = JSON.stringify(project);
    const lastProjectStr = JSON.stringify(lastProjectRef.current);

    if (currentProjectStr === lastProjectStr) {
      return;
    }

    console.log('[BlockPreview] Project changed - pending update');
    // 変更を検出したらpendingフラグを立てる
    setPendingUpdate(true);

    // 自動更新モードの場合、デバウンス付きで自動更新
    if (autoUpdate) {
      // 既存のタイマーをクリア
      if (autoUpdateTimerRef.current) {
        clearTimeout(autoUpdateTimerRef.current);
      }

      // 300ms後に自動更新
      autoUpdateTimerRef.current = setTimeout(() => {
        console.log('[BlockPreview] Auto-updating preview');
        updatePreview();
        autoUpdateTimerRef.current = null;
      }, 300);
    }

    // クリーンアップ
    return () => {
      if (autoUpdateTimerRef.current) {
        clearTimeout(autoUpdateTimerRef.current);
      }
    };
  }, [project, autoUpdate, updatePreview]);

  // 選択状態の変更は即座に反映
  useEffect(() => {
    if (!iframeRef.current) return;
    const iframe = iframeRef.current;

    if (selectedBlockId) {
      iframe.contentWindow?.postMessage({ type: 'update-selection', blockId: selectedBlockId }, '*');
    }
  }, [selectedBlockId]);

  // iframe からのメッセージを受け取る
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data.type === 'block-select') {
        onBlockSelect(e.data.blockId);
      } else if (e.data.type === 'block-reorder') {
        onReorderBlocks(e.data.draggedBlockId, e.data.targetBlockId);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onBlockSelect, onReorderBlocks]);

  return (
    <div className="block-preview">
      <div className="preview-toolbar">
        <div className="device-switcher">
          <button
            className={deviceSize === 'desktop' ? 'active' : ''}
            onClick={() => setDeviceSize('desktop')}
            title="デスクトップ"
          >
            <Desktop20Regular /> PC
          </button>
          <button
            className={deviceSize === 'tablet' ? 'active' : ''}
            onClick={() => setDeviceSize('tablet')}
            title="タブレット"
          >
            <TabletLaptop20Regular /> Tablet
          </button>
          <button
            className={deviceSize === 'mobile' ? 'active' : ''}
            onClick={() => setDeviceSize('mobile')}
            title="モバイル"
          >
            <Phone20Regular /> SP
          </button>
        </div>
        <div className="preview-controls">
          <button
            className={`control-btn auto-update-btn ${autoUpdate ? 'active' : ''}`}
            onClick={() => setAutoUpdate(!autoUpdate)}
            title={autoUpdate ? '自動更新ON（クリックでOFF）' : '自動更新OFF（クリックでON）'}
          >
            {autoUpdate ? <><ArrowSync20Regular /> 自動</> : <><Pause20Regular /> 手動</>}
          </button>
          {!autoUpdate && (
            <button
              className={`control-btn update-btn ${pendingUpdate ? 'pending' : ''}`}
              onClick={() => updatePreview()}
              title="プレビューを更新"
            >
              {pendingUpdate ? <><Circle20Regular className="pending-icon" /> 更新</> : <><Checkmark20Regular /> 最新</>}
            </button>
          )}
        </div>
      </div>
      <div className="preview-viewport">
        <div
          className="preview-frame"
          style={{
            width: DEVICE_WIDTHS[deviceSize],
            margin: deviceSize === 'desktop' ? '0' : '0 auto',
            transition: 'width 0.3s ease',
          }}
        >
          <iframe
            ref={iframeRef}
            className="preview-iframe"
            title="Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
};
