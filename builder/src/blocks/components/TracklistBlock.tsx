import React from 'react';
import type { TracklistBlock as TracklistBlockType } from '../../types/block-system';

interface TracklistBlockProps {
  block: TracklistBlockType;
}

export const TracklistBlock: React.FC<TracklistBlockProps> = ({ block }) => {
  const { content, settings } = block;

  return (
    <section
      className="block block-tracklist"
      data-block-id={block.id}
    >
      <div className="block-container">
        <table className="track-table">
          <tbody>
            {content.tracks.map((track) => (
              <tr key={track.id} className="track-row">
                {settings.showNumbers && (
                  <td className="track-num">{track.number}</td>
                )}

                <td className="track-main">
                  <span className="track-name">{track.title}</span>
                  {settings.showArtist && track.artist && (
                    <span className="track-artist">/ {track.artist}</span>
                  )}
                </td>

                {settings.showDuration && track.duration && (
                  <td className="track-time">{track.duration}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
