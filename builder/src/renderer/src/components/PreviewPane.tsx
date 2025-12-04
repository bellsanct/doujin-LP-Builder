import React, { useEffect, useRef, useState } from 'react';
import Handlebars from 'handlebars';
import './PreviewPane.css';
import { Button } from '@fluentui/react-components';
import { Desktop24Regular, Tablet24Regular, Phone24Regular } from '@fluentui/react-icons';

interface PreviewPaneProps {
  template: any;
  config: any;
}

const PreviewPane: React.FC<PreviewPaneProps> = ({ template, config }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  useEffect(() => {
    console.log('🎨 [PreviewPane] useEffect triggered with config:', config);
    if (!iframeRef.current) return;

    // Handlebarsヘルパーを登録
    Handlebars.registerHelper('equals', function(a, b, options) {
      return a === b ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper('contains', function(array, item, options) {
      if (Array.isArray(array) && array.includes(item)) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    Handlebars.registerHelper('extractYouTubeID', function(url) {
      if (!url) return '';
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : '';
    });

    try {
      // アセットをData URLに変換する関数
      const convertAssetsToDataUrls = (content: string): string => {
        let result = content;

        if (template.assets && template.assets.size > 0) {
          template.assets.forEach((buffer: Uint8Array, filename: string) => {
            // ファイル拡張子からMIMEタイプを推測
            const ext = filename.split('.').pop()?.toLowerCase();
            const mimeTypes: Record<string, string> = {
              'png': 'image/png',
              'jpg': 'image/jpeg',
              'jpeg': 'image/jpeg',
              'gif': 'image/gif',
              'svg': 'image/svg+xml',
              'webp': 'image/webp',
              'ico': 'image/x-icon',
            };

            const mimeType = mimeTypes[ext || ''] || 'application/octet-stream';

            // BufferをBase64に変換
            const base64 = btoa(
              Array.from(buffer)
                .map(byte => String.fromCharCode(byte))
                .join('')
            );

            const dataUrl = `data:${mimeType};base64,${base64}`;

            // ファイル名の参照をData URLに置換
            result = result.replace(new RegExp(filename, 'g'), dataUrl);
          });
        }

        return result;
      };

      // Handlebarsテンプレートをコンパイル
      console.log('🔨 [PreviewPane] Compiling template...', {
        templateLength: template.template?.length,
        templateName: template.manifest?.name
      });
      const compiledTemplate = Handlebars.compile(template.template);

      // HTMLを生成
      console.log('🎨 [PreviewPane] Generating HTML with config:', config);
      let html = '';
      try {
        html = compiledTemplate(config);
        console.log('✅ [PreviewPane] HTML generated, length:', html.length);
      } catch (renderError) {
        console.error('❌ [PreviewPane] Handlebars rendering failed:', renderError);
        console.error('Template snippet:', template.template?.substring(0, 500));
        console.error('Config keys:', Object.keys(config));
        throw renderError;
      }

      // アセットをData URLに変換
      html = convertAssetsToDataUrls(html);

      if (!html || html.trim().length === 0) {
        console.warn('⚠️ [PreviewPane] Generated HTML is empty!');
        console.warn('Config:', config);
        console.warn('Template snippet:', template.template?.substring(0, 500));
      }

      // CSSもアセット参照を変換
      const styles = convertAssetsToDataUrls(template.styles);

      // iframeに書き込み
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;

      if (doc) {
        console.log('📄 [PreviewPane] Writing to iframe...', {
          htmlLength: html.length,
          stylesLength: styles.length,
          scriptsLength: template.scripts?.length || 0
        });
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html lang="ja">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>${styles}</style>
          </head>
          <body>
            ${html}
            <script>${template.scripts || ''}</script>
          </body>
          </html>
        `);
        doc.close();

        console.log('✅ [PreviewPane] Template rendered with', template.assets?.size || 0, 'assets');
      }
    } catch (error) {
      console.error('❌ [PreviewPane] Failed to render preview:', error);
      console.error('❌ [PreviewPane] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

      // ログファイルに記録
      if (window.electronAPI?.log) {
        window.electronAPI.log.error('PreviewPane', 'Failed to render preview', {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          templateName: template.manifest?.name,
          configKeys: Object.keys(config),
        });
      }
    }
  }, [template, config]);

  const deviceSizes = {
    desktop: { width: '100%', height: '100%' },
    tablet: { width: '768px', height: '1024px' },
    mobile: { width: '375px', height: '667px' },
  };

  return (
    <div className="preview-pane">
      <div className="preview-toolbar">
        <div className="preview-device-selector">
          <Button
            appearance={device === 'desktop' ? 'primary' : 'secondary'}
            icon={<Desktop24Regular />}
            onClick={() => setDevice('desktop')}
            title="デスクトップ"
          />
          <Button
            appearance={device === 'tablet' ? 'primary' : 'secondary'}
            icon={<Tablet24Regular />}
            onClick={() => setDevice('tablet')}
            title="タブレット"
          />
          <Button
            appearance={device === 'mobile' ? 'primary' : 'secondary'}
            icon={<Phone24Regular />}
            onClick={() => setDevice('mobile')}
            title="モバイル"
          />
        </div>
      </div>

      <div className="preview-container">
        <div className="preview-frame-wrapper" style={deviceSizes[device]}>
          <iframe
            ref={iframeRef}
            className="preview-iframe"
            title="Preview"
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
      </div>
    </div>
  );
};

export default PreviewPane;
