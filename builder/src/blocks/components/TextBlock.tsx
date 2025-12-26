import React from 'react';
import type { TextBlock as TextBlockType } from '../../types/block-system';

interface TextBlockProps {
  block: TextBlockType;
}

export const TextBlock: React.FC<TextBlockProps> = ({ block }) => {
  const { content, settings } = block;

  const style = {
    '--text-font-size': settings.fontSize === 'custom' && settings.customFontSize
      ? `${settings.customFontSize}px`
      : undefined,
    '--text-line-height': settings.lineHeight,
  } as React.CSSProperties;

  const alignmentClass = settings.alignment ? `align-${settings.alignment}` : '';

  return (
    <section
      className={`block block-text ${alignmentClass}`}
      data-block-id={block.id}
      style={style}
    >
      <div className="block-container">
        <div
          className="text-content"
          dangerouslySetInnerHTML={{ __html: content.html }}
        />
      </div>
    </section>
  );
};
