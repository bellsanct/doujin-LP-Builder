import React, { useEffect, useRef, useState, useCallback } from 'react';
import Handlebars from 'handlebars';
import './PreviewPane.css';
import { Button } from '@fluentui/react-components';
import { Desktop24Regular, Tablet24Regular, Phone24Regular } from '@fluentui/react-icons';
import { useTranslation } from '../i18n';

interface PreviewPaneProps {
  template: any;
  config: any;
  onFieldFocus?: (fieldId: string) => void;
}

const PreviewPane: React.FC<PreviewPaneProps> = ({ template, config, onFieldFocus }) => {
  const { t } = useTranslation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);

  // 繧､繝ｳ繧ｿ繝ｩ繧ｯ繝・ぅ繝也ｷｨ髮・ｩ溯・縺ｮ繧ｻ繝・ヨ繧｢繝・・
  const setupInteractiveEditing = useCallback((doc: Document) => {
    if ((import.meta as any)?.env?.DEV) console.log('肌 [PreviewPane] Starting setupInteractiveEditing...');
    if ((import.meta as any)?.env?.DEV) console.log('投 [PreviewPane] Document body children count:', doc.body?.children?.length || 0);

    // 繝・ヰ繝・げ: 繝峨く繝･繝｡繝ｳ繝亥・縺ｮ縺吶∋縺ｦ縺ｮ繧ｯ繝ｩ繧ｹ繧貞叙蠕・    const allElements = doc.querySelectorAll('*');
    const allClasses = new Set<string>();
    allElements.forEach((el) => {
      const classList = el.classList;
      classList.forEach((cls) => allClasses.add(cls));
    });
    if ((import.meta as any)?.env?.DEV) { const allElements = doc.querySelectorAll('*'); const allClasses = new Set<string>(); allElements.forEach((el:any)=>el.classList?.forEach((cls:string)=>allClasses.add(cls))); console.log('投 [PreviewPane] All CSS classes in document:', Array.from(allClasses).sort()); }

    // 繝輔ぅ繝ｼ繝ｫ繝迂D縺ｨ繧ｻ繝ｬ繧ｯ繧ｿ縺ｮ繝槭ャ繝斐Φ繧ｰ
    const fieldSelectors: Record<string, string> = {
      // Hero section
      'heroTitle': '.hero-title, h1.hero-title',
      'heroBadge': '.hero-badge',
      'heroImage': '.hero, header.hero',

      // About section
      'aboutTitle': '#about .section-title, .about .section-title',
      'aboutText': '#about .text-body, #about .about-content p, #about .about-text, .about-text',

      // Release/Album section
      'albumTitle': '.album-title, h2.album-title',
      'artistName': '.artist-name, p.artist-name',
      'jacketImage': '.jacket-img, .jacket-frame img, .jacket-container img',

      // Release info (驟榊ｸ・鬆貞ｸ・ュ蝣ｱ)
      'releaseInfo': '#info .info-item, .info-section .info-item, .release-info, .album-info, #info .info-grid',

      // Shop links
      'shopLinks': '.shop-links, .purchase-links, .buy-links',

      // Tracklist
      'tracks': '#tracks .track-item, .track-list, .track-title, .track-artist, .track-num, .track-time',

      // Credits
      'credits': '#credits .credit-item, .credits-list, .credit-name, .credit-role, .credit-links',
    };

    let successCount = 0;
    let failCount = 0;

    // 蜷・ヵ繧｣繝ｼ繝ｫ繝峨↓蟇ｾ縺励※螻樊ｧ繧定ｿｽ蜉
    Object.entries(fieldSelectors).forEach(([fieldId, selector]) => {
      try {
        console.log(`剥 [PreviewPane] Trying selector for ${fieldId}: "${selector}"`);
        const elements = doc.querySelectorAll(selector);
        console.log(`   Found ${elements.length} element(s)`);

        if (elements.length === 0) {
          failCount++;
          console.warn(`笞・・[PreviewPane] No elements found for ${fieldId} with selector: ${selector}`);
        } else {
          successCount++;
        }

        elements.forEach((element, index) => {
          const htmlElement = element as HTMLElement;
          console.log(`   Element ${index}: ${htmlElement.tagName}.${Array.from(htmlElement.classList).join('.')}`);

          // data-field-id 縺ｨ data-editable 螻樊ｧ繧定ｿｽ蜉
          htmlElement.setAttribute('data-field-id', fieldId);
          htmlElement.setAttribute('data-editable', 'true');
          console.log(`   笨・Added attributes to element ${index}`);

          // 繧ｯ繝ｪ繝・け繧､繝吶Φ繝・ ConfigEditor縺ｫ繝輔か繝ｼ繧ｫ繧ｹ
          htmlElement.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            console.log('務・・[PreviewPane] Field clicked:', fieldId);

            // 蜑阪・驕ｸ謚槭ｒ隗｣髯､
            doc.querySelectorAll('[data-editable="true"].focused').forEach((el) => {
              el.classList.remove('focused');
            });

            // 迴ｾ蝨ｨ縺ｮ隕∫ｴ繧帝∈謚・            htmlElement.classList.add('focused');

            // ConfigEditor縺ｫ繝輔か繝ｼ繧ｫ繧ｹ騾夂衍
            if (onFieldFocus) {
              console.log('討 [PreviewPane] Calling onFieldFocus with:', fieldId);
              onFieldFocus(fieldId);
            } else {
              console.warn('笞・・[PreviewPane] onFieldFocus is not defined!');
            }
          });
          console.log(`   笨・Added click listener to element ${index}`);
        });

        if (elements.length > 0) {
          console.log(`笨・[PreviewPane] Successfully mapped ${elements.length} element(s) to field: ${fieldId}`);
        }
      } catch (error) {
        failCount++;
        console.error(`笶・[PreviewPane] Failed to setup field: ${fieldId}`, error);
      }
    });

    // schema 鬧・虚縺ｮ霑ｽ蜉繝槭ャ繝斐Φ繧ｰ・・ieldSelectors 縺ｫ辟｡縺・・岼繧定｣懷ｮ鯉ｼ・
    try {
      const schema = template?.schema?.formSchema?.sections ? template.schema : null;
        const idToType = new Map<string, string>();
        const schemaFieldIds: string[] = [];
        try {
          const sections = schema.formSchema.sections || [];
          sections.forEach((sec: any) => {
            (sec.fields || []).forEach((f: any) => {
              if (f?.id) {
                idToType.set(f.id, f.type || 'text');
                schemaFieldIds.push(f.id);
              }
            });
          });
        } catch {}

        const additionalIds = Array.from(new Set(schemaFieldIds.filter((id) => !(id in fieldSelectors))));
        const tryPatterns = (fid: string, type: string): HTMLElement[] => {
          const sels: string[] = [
            `#${fid}`,
            `.field-${fid}`,
            `[data-field="${fid}"]`,
            `[name="${fid}"]`,
            `.config-${fid}`,
          ];
          // array邉ｻ縺ｯ繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ繧ｳ繝ｳ繝・リ繧貞━蜈・          const lc = fid.toLowerCase();
          if (type === 'array' || ['tracks','credits','releaseinfo','shoplinks'].some(k => lc.includes(k))) {
            if (lc.includes('track')) sels.push('#tracks, .tracks, .track-list');
            if (lc.includes('credit')) sels.push('#credits, .credits, .credits-list');
            if (lc.includes('release')) sels.push('#info, .info-section, .release-info, .album-info');
            if (lc.includes('shop')) sels.push('.shop-links, .purchase-links, .buy-links');
          }
          const found: HTMLElement[] = [];
          for (const s of sels) {
            try {
              const n = Array.from(doc.querySelectorAll(s)) as HTMLElement[];
              n.forEach(el => { if (!found.includes(el)) found.push(el); });
              if (found.length > 0) break;
            } catch {}
          }
          return found;
        };

        const tryValueHeuristic = (fid: string, type: string): HTMLElement[] => {
          try {
            const value = (config && fid in config) ? (config as any)[fid] : undefined;
            if (!value || typeof value !== 'string' || value.trim().length === 0) return [];
            // 繝・く繧ｹ繝医ｒ蜷ｫ繧隕∫ｴ蛟呵｣・            const tags = ['h1','h2','h3','h4','p','span','li','div'];
            const nodes = Array.from(doc.querySelectorAll(tags.join(','))) as HTMLElement[];
            const valLower = value.toLowerCase();
            const match = nodes.find(el => (el.textContent || '').toLowerCase().includes(valLower));
            return match ? [match] : [];
          } catch { return []; }
        };

        const mark = (els: HTMLElement[], fid: string) => {
          els.forEach((el) => {
            el.setAttribute('data-field-id', fid);
            el.setAttribute('data-editable', 'true');
          });
        };

        additionalIds.forEach((fid) => {
          try {
            // 譌｢縺ｫ繝槭・繧ｭ繝ｳ繧ｰ貂医∩縺ｪ繧峨せ繧ｭ繝・・
            if (doc.querySelector(`[data-field-id=\"${fid}\"]`)) return;

            const type = idToType.get(fid) || 'text';
            // 1) 譌｢蟄・data-field-id・医ユ繝ｳ繝励Ξ蛛ｴ縺ｧ莉倅ｸ弱＆繧後※縺・ｌ縺ｰ・・            let found = Array.from(doc.querySelectorAll(`[data-field-id="${fid}"]`)) as HTMLElement[];
            // 2) 隕冗ｴ・・繝ｼ繧ｹ
            if (found.length === 0) found = tryPatterns(fid, type);
            // 3) 蛟､繝偵Η繝ｼ繝ｪ繧ｹ繝・ぅ繝・け・亥腰邏斐ユ繧ｭ繧ｹ繝育ｳｻ縺ｮ縺ｿ・・            if (found.length === 0 && type !== 'array' && type !== 'image') found = tryValueHeuristic(fid, type);

            if (found.length > 0) {
              mark(found, fid);
              successCount++;
              console.log(`笨・[PreviewPane] Schema-driven mapped ${fid} to ${found.length} element(s)`);
            } else {
              failCount++;
              console.warn(`笞・・[PreviewPane] Schema-driven mapping found no elements for ${fid}`);
            }
          } catch (e) {
            failCount++;
            console.error('笶・[PreviewPane] Schema-driven mapping error:', fid, e);
          }
        });
    } catch (e) {
      console.error('笶・[PreviewPane] Failed schema-driven pass:', e);
    }

    // 繧ｯ繝ｪ繝・け蟋碑ｭｲ縺ｨ繝輔か繝ｼ繧ｫ繧ｹ蛻ｶ蠕｡・域棧縺梧ｮ九ｊ邯壹￠繧句撫鬘後↓蟇ｾ蠢懶ｼ・    // 螟夐㍾逋ｻ骭ｲ繧帝∩縺代ｋ縺溘ａ縲∽ｸ蠎ｦ縺縺題ｨｭ螳・    const anyDoc = doc as any;
    if (!anyDoc.__interactiveDelegationSetup) {
      const clearFocus = () => {
        doc.querySelectorAll('[data-editable="true"].focused').forEach((el) => el.classList.remove('focused'));
      };

      doc.addEventListener(
        'click',
        (e) => {
          const target = e.target as Element | null;
          const editable = (target && 'closest' in target ? (target as any).closest('[data-editable="true"]') : null) as HTMLElement | null;
          if (editable) {
            // a繧ｿ繧ｰ驕ｷ遘ｻ縺ｯ謚第ｭ｢
            const link = (target as HTMLElement)?.closest?.('a');
            if (link) e.preventDefault();

            clearFocus();
            editable.classList.add('focused');
            const fid = editable.getAttribute('data-field-id') || '';
            if (fid && onFieldFocus) onFieldFocus(fid);
          } else {
            // 邱ｨ髮・ｯｾ雎｡螟悶け繝ｪ繝・け縺ｧ隗｣髯､
            clearFocus();
          }
        },
        true
      );

      doc.addEventListener('keydown', (e: any) => {
        if (e.key === 'Escape') clearFocus();
      });

      anyDoc.__interactiveDelegationSetup = true;
    }

    const totalEditable = doc.querySelectorAll('[data-editable="true"]').length;
    console.log(`笨・[PreviewPane] Setup complete: ${successCount} successful, ${failCount} failed`);
    console.log(`笨・[PreviewPane] Total editable elements: ${totalEditable}`);

    if (totalEditable === 0) {
      console.error('笶・[PreviewPane] WARNING: No editable elements were set up! Check selectors.');
    }
  }, [onFieldFocus]);

  const renderTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const DEV = (import.meta as any)?.env?.DEV === true;
    if (DEV) console.log('耳 [PreviewPane] useEffect triggered with config:', config);
    if (!iframeRef.current) return;

    // Handlebars繝倥Ν繝代・繧堤匳骭ｲ
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

    const doRender = () => {
      try {
      // アセットをBlob URLに変換（data URL化しない）
      const convertAssetsToUrls = (content: string): string => {
        if (!content) return content;
        let result = content;
        const mimeTypes: Record<string, string> = {
          'png': 'image/png',
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'gif': 'image/gif',
          'svg': 'image/svg+xml',
          'webp': 'image/webp',
          'ico': 'image/x-icon',
        };
        if (template.assets && (template.assets as any).forEach) {
          const created: string[] = [];
          try {
            (template.assets as Map<string, Uint8Array>).forEach((buffer: Uint8Array, filename: string) => {
              const ext = filename.split('.').pop()?.toLowerCase();
              const mimeType = mimeTypes[ext || ''] || 'application/octet-stream';
              try {
                const blob = new Blob([buffer], { type: mimeType });
                const url = URL.createObjectURL(blob);
                created.push(url);
                const escaped = filename.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
                result = result.replace(new RegExp(escaped, 'g'), url);
              } catch (e) {
                console.error('Failed to create blob URL for asset', filename, e);
              }
            });
          } finally {
            blobUrlsRef.current.push(...created);
          }
        }
        return result;
      };

      // Handlebars繝・Φ繝励Ξ繝ｼ繝医ｒ繧ｳ繝ｳ繝代う繝ｫ
      console.log('畑 [PreviewPane] Compiling template...', {
        templateLength: template.template?.length,
        templateName: template.manifest?.name
      });
      const compiledTemplate = Handlebars.compile(template.template);

      // HTML繧堤函謌・      console.log('耳 [PreviewPane] Generating HTML with config:', config);
      let html = '';
      try {
        html = compiledTemplate(config);
        console.log('笨・[PreviewPane] HTML generated, length:', html.length);
      } catch (renderError) {
        console.error('笶・[PreviewPane] Handlebars rendering failed:', renderError);
        console.error('Template snippet:', template.template?.substring(0, 500));
        console.error('Config keys:', Object.keys(config));
        throw renderError;
      }

      // アセット参照をBlob URLに変換
      html = convertAssetsToUrls(html);

      if (!html || html.trim().length === 0) {
        console.warn('笞・・[PreviewPane] Generated HTML is empty!');
        console.warn('Config:', config);
        console.warn('Template snippet:', template.template?.substring(0, 500));
      }

      // CSSもアセット参照を変換
      const styles = convertAssetsToUrls(template.styles);

      // iframe縺ｫ譖ｸ縺崎ｾｼ縺ｿ
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;

      if (doc) {
        console.log('塘 [PreviewPane] Writing to iframe...', {
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
            <style>
              ${styles}

              /* 繧､繝ｳ繧ｿ繝ｩ繧ｯ繝・ぅ繝也ｷｨ髮・畑繧ｹ繧ｿ繧､繝ｫ */
              [data-editable="true"] {
                cursor: pointer;
                transition: outline 0.2s ease, box-shadow 0.2s ease;
                position: relative;
              }

              [data-editable="true"]:hover {
                outline: 2px dashed #0078d4;
                outline-offset: 2px;
                box-shadow: 0 0 0 4px rgba(0, 120, 212, 0.1);
              }

              [data-editable="true"]:hover::after {
                content: '笨擾ｸ・邱ｨ髮・;
                position: absolute;
                top: -24px;
                right: 0;
                background: #0078d4;
                color: white;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 600;
                pointer-events: none;
                z-index: 10000;
                white-space: nowrap;
              }

              [data-editable="true"].focused {
                outline: 2px solid #0078d4;
                outline-offset: 2px;
                box-shadow: 0 0 0 4px rgba(0, 120, 212, 0.2);
              }
            </style>
          </head>
          <body>
            ${html}
            <script>${template.scripts || ''}</script>
          </body>
          </html>
        `);
        doc.close();

        console.log('笨・[PreviewPane] Template rendered with', template.assets?.size || 0, 'assets');

        // DOM縺悟ｮ悟・縺ｫ繝ｭ繝ｼ繝峨＆繧後◆蠕後↓繧､繝ｳ繧ｿ繝ｩ繧ｯ繝・ぅ繝也ｷｨ髮・ｒ險ｭ螳・        // iframe縺ｮload繧､繝吶Φ繝医ｒ蠕・▽
        const iframe = iframeRef.current;
        if (iframe) {
          iframe.onload = () => {
            console.log('売 [PreviewPane] Iframe loaded, setting up interactive editing...');
            const loadedDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (loadedDoc) {
              console.log('投 [PreviewPane] DOM ready state:', loadedDoc.readyState);
              console.log('投 [PreviewPane] Body HTML length:', loadedDoc.body?.innerHTML?.length || 0);

              // 縺輔ｉ縺ｫ遒ｺ螳溘ｒ譛溘☆縺溘ａ縺ｫsetTimeout繧剃ｽｿ逕ｨ
              setTimeout(() => {
                setupInteractiveEditing(loadedDoc);
              }, 100);
            }
          };
        }
      }
      } catch (error) {
        console.error('笶・[PreviewPane] Failed to render preview:', error);
        console.error('笶・[PreviewPane] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

        // 繝ｭ繧ｰ繝輔ぃ繧､繝ｫ縺ｫ險倬鹸
        if (window.electronAPI?.log) {
          window.electronAPI.log.error('PreviewPane', 'Failed to render preview', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            templateName: template.manifest?.name,
            configKeys: Object.keys(config || {}),
          });
        }
      }
    };

    if (renderTimerRef.current) {
      clearTimeout(renderTimerRef.current);
    }
    // @ts-ignore
    renderTimerRef.current = window.setTimeout(doRender, 150);

    return () => {
      if (renderTimerRef.current) {
        clearTimeout(renderTimerRef.current);
        renderTimerRef.current = null;
      }
    };
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
            title={t.preview.toolbar.desktop}
          />
          <Button
            appearance={device === 'tablet' ? 'primary' : 'secondary'}
            icon={<Tablet24Regular />}
            onClick={() => setDevice('tablet')}
            title={t.preview.toolbar.tablet}
          />
          <Button
            appearance={device === 'mobile' ? 'primary' : 'secondary'}
            icon={<Phone24Regular />}
            onClick={() => setDevice('mobile')}
            title={t.preview.toolbar.mobile}
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

