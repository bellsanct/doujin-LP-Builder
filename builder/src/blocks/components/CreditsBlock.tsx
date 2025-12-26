import React from 'react';
import type { CreditsBlock as CreditsBlockType } from '../../types/block-system';

interface CreditsBlockProps {
  block: CreditsBlockType;
}

export const CreditsBlock: React.FC<CreditsBlockProps> = ({ block }) => {
  const { content, settings } = block;

  const style = {
    '--credits-gap': settings.gap ? `${settings.gap}px` : undefined,
  } as React.CSSProperties;

  return (
    <section
      className="block block-credits"
      data-block-id={block.id}
      style={style}
    >
      <div className="block-container">
        {content.groups.map((group) => (
          <div key={group.id} className="credits-group">
            {group.title && (
              <h3 className="credits-group-title">{group.title}</h3>
            )}

            <div className="credits-grid">
              {group.items.map((item) => (
                <div key={item.id} className="credit-item">
                  {settings.showAvatars && item.avatar && (
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="credit-avatar"
                    />
                  )}

                  <span className="credit-role">{item.role}</span>
                  <span className="credit-name">{item.name}</span>

                  {settings.showBios && item.bio && (
                    <p className="credit-bio">{item.bio}</p>
                  )}

                  {settings.showLinks && item.links && item.links.length > 0 && (
                    <div className="credit-links">
                      {item.links.map((link) => (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {link.icon && <span>{link.icon}</span>}
                          {link.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
