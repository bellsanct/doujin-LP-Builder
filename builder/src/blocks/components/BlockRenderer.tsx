import React from 'react';
import type { Block } from '../../types/block-system';
import { HeroBlock } from './HeroBlock';
import { TextBlock } from './TextBlock';
import { CreditsBlock } from './CreditsBlock';
import { TracklistBlock } from './TracklistBlock';

interface BlockRendererProps {
  block: Block;
}

/**
 * ブロックタイプに応じて適切なコンポーネントをレンダリング
 */
export const BlockRenderer: React.FC<BlockRendererProps> = ({ block }) => {
  if (!block.visible) {
    return null;
  }

  switch (block.type) {
    case 'hero':
      return <HeroBlock block={block as any} />;

    case 'text':
      return <TextBlock block={block as any} />;

    case 'credits':
      return <CreditsBlock block={block as any} />;

    case 'tracklist':
      return <TracklistBlock block={block as any} />;

    case 'heading':
      return (
        <section className="block block-heading" data-block-id={block.id}>
          <div className="block-container">
            {React.createElement(
              `h${(block.settings as any).level}`,
              { className: 'heading-text' },
              (block.content as any).text
            )}
            <div className="heading-line" />
          </div>
        </section>
      );

    case 'image':
      return (
        <section className="block block-image" data-block-id={block.id}>
          <div className="block-container">
            <img
              src={(block.content as any).src}
              alt={(block.content as any).alt || ''}
            />
            {(block.content as any).caption && (
              <p className="image-caption">{(block.content as any).caption}</p>
            )}
          </div>
        </section>
      );

    case 'button':
      return (
        <section className="block block-button" data-block-id={block.id}>
          <div className="block-container">
            <a
              href={(block.content as any).url}
              className={`btn btn-${(block.settings as any).style}`}
              target={(block.settings as any).openInNewTab ? '_blank' : undefined}
              rel={(block.settings as any).openInNewTab ? 'noopener noreferrer' : undefined}
            >
              {(block.content as any).text}
            </a>
          </div>
        </section>
      );

    case 'divider':
      return (
        <section className="block block-divider" data-block-id={block.id}>
          <div className="block-container">
            <hr />
          </div>
        </section>
      );

    case 'spacer':
      return (
        <div
          className="block block-spacer"
          data-block-id={block.id}
          style={{ height: `${(block.settings as any).height}px` }}
        />
      );

    case 'shop-links':
      return (
        <section className="block block-shop-links" data-block-id={block.id}>
          <div className="block-container">
            <div className="shop-buttons">
              {((block.content as any).links || []).map((link: any) => (
                <a
                  key={link.id}
                  href={link.url}
                  className="btn-shop"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.icon && <span>{link.icon}</span>}
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </section>
      );

    default:
      console.warn(`Unknown block type: ${block.type}`);
      return (
        <div
          className="block block-unknown"
          data-block-id={block.id}
          style={{ padding: '2rem', background: '#f0f0f0', textAlign: 'center' }}
        >
          <p>Unknown block type: {block.type}</p>
        </div>
      );
  }
};
