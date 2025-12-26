import React from 'react';
import type { HeroBlock as HeroBlockType } from '../../types/block-system';

interface HeroBlockProps {
  block: HeroBlockType;
}

export const HeroBlock: React.FC<HeroBlockProps> = ({ block }) => {
  const { content, settings } = block;

  // CSS変数の生成
  const style = {
    '--hero-height': settings.height === 'viewport' ? '100vh' :
                     settings.height === 'auto' ? 'auto' :
                     `${settings.height.value}${settings.height.unit}`,
    '--hero-bg-size': settings.backgroundSize,
    '--hero-pos-x': `${settings.backgroundPosition.x}%`,
    '--hero-pos-y': `${settings.backgroundPosition.y}%`,
    '--hero-overlay-color': settings.overlay.color,
    '--hero-overlay-opacity': settings.overlay.opacity / 100,
    backgroundImage: settings.backgroundImage ? `url(${settings.backgroundImage})` : undefined,
  } as React.CSSProperties;

  return (
    <section
      className="block block-hero"
      data-block-id={block.id}
      style={style}
    >
      {settings.backgroundImage && (
        <div
          className="hero-background"
          style={{ backgroundImage: `url(${settings.backgroundImage})` }}
        />
      )}

      {settings.overlay.enabled && (
        <div className="hero-overlay" />
      )}

      <div className="hero-content">
        {content.title && (
          <h1 className="hero-title">{content.title}</h1>
        )}

        {content.subtitle && (
          <p className="hero-subtitle">{content.subtitle}</p>
        )}

        {content.ctaButton && (
          <a
            href={content.ctaButton.url}
            className="hero-cta"
          >
            {content.ctaButton.text}
          </a>
        )}
      </div>
    </section>
  );
};
