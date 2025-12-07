import React, { useState, useMemo, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import './ConfigEditor.css';
import { Input, Textarea, Switch, Slider } from '@fluentui/react-components';
import { ChevronDown20Regular, ChevronRight20Regular, Search20Regular, Dismiss20Regular } from '@fluentui/react-icons';

interface ConfigEditorProps {
  schema: any;
  config: any;
  onChange: (config: any) => void;
  focusedFieldId?: string | null;
}

export interface ConfigEditorRef {
  scrollToField: (fieldId: string) => void;
}

const ConfigEditor = forwardRef<ConfigEditorRef, ConfigEditorProps>(({ schema, config, onChange, focusedFieldId }, ref) => {
  // スキーマ形式を判定
  const isFormSchema = schema.formSchema && schema.formSchema.sections;

  // 状態管理
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(isFormSchema ? [schema.formSchema.sections[0]?.id] : ['basic'])
  );
  const [sidebarWidth, setSidebarWidth] = useState(500);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [collapsedFields, setCollapsedFields] = useState<Set<string>>(new Set());
  const [imagePreviewHeights, setImagePreviewHeights] = useState<Map<string, number>>(new Map());

  // デバウンス用のタイマー参照とローカル値キャッシュ
  const debounceTimerRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const [localValues, setLocalValues] = useState<Map<string, any>>(new Map());

  // セクション定義
  const sections = isFormSchema
    ? schema.formSchema.sections
    : [
        { id: 'basic', title: '基本設定', icon: '⚙️', fields: [] },
        { id: 'design', title: 'デザイン', icon: '🎨', fields: [] },
        { id: 'content', title: 'コンテンツ', icon: '📝', fields: [] },
        { id: 'effects', title: 'エフェクト', icon: '✨', fields: [] },
      ];

  // フィールドID -> セクションIDのマップ
  const fieldSectionMap = useMemo(() => {
    const map = new Map<string, string>();
    try {
      const srcSections = isFormSchema ? schema.formSchema.sections : [];
      srcSections?.forEach((sec: any) => {
        sec?.fields?.forEach((f: any) => {
          if (f?.id) map.set(f.id, sec.id);
        });
      });
    } catch {}
    return map;
  }, [schema, isFormSchema]);

  // リサイズハンドラー
  const handleResize = (e: React.MouseEvent) => {
    e.preventDefault();
    document.body.classList.add('resizing');

    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const newWidth = Math.max(400, Math.min(800, startWidth + delta));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.body.classList.remove('resizing');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // セクション展開トグル
  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // フィールド折りたたみトグル
  const toggleFieldCollapse = (fieldId: string) => {
    const newCollapsed = new Set(collapsedFields);
    if (newCollapsed.has(fieldId)) {
      newCollapsed.delete(fieldId);
    } else {
      newCollapsed.add(fieldId);
    }
    setCollapsedFields(newCollapsed);
  };

  // 画像プレビュー高さのリサイズ
  const handleImageResize = (fieldId: string, e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = imagePreviewHeights.get(fieldId) || 200;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientY - startY;
      const newHeight = Math.max(100, Math.min(800, startHeight + delta));
      setImagePreviewHeights(new Map(imagePreviewHeights.set(fieldId, newHeight)));
    };

    const handleMouseUp = () => {
      document.body.classList.remove('resizing');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.body.classList.add('resizing');
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // フィールドへのスクロール機能
  const scrollToField = useCallback((fieldId: string) => {
    console.log('🎯 [ConfigEditor] Scrolling to field:', fieldId);
    console.log('📊 [ConfigEditor] Current expanded sections:', Array.from(expandedSections));
    console.log('📊 [ConfigEditor] Current collapsed fields:', Array.from(collapsedFields));

    // フィールド要素を検索
    const fieldElement = document.querySelector(`[data-field-id="${fieldId}"]`) as HTMLElement;

    if (!fieldElement) {
      console.warn('⚠️ [ConfigEditor] Field element not found in DOM:', fieldId);
      return;
    }

    console.log('✅ [ConfigEditor] Field element found:', fieldElement);

    // セクションを展開
    const sectionElement = fieldElement.closest('[data-section-id]');
    let needsSectionExpansion = false;
    let sectionId: string | null = null;

    if (sectionElement) {
      sectionId = sectionElement.getAttribute('data-section-id');
      if (sectionId && !expandedSections.has(sectionId)) {
        console.log('🔓 [ConfigEditor] Expanding section:', sectionId);
        needsSectionExpansion = true;
        const newExpanded = new Set(expandedSections);
        newExpanded.add(sectionId);
        setExpandedSections(newExpanded);
      } else {
        console.log('✅ [ConfigEditor] Section already expanded:', sectionId);
      }
    }

    // フィールドの折りたたみを解除
    let needsFieldExpansion = false;
    if (collapsedFields.has(fieldId)) {
      console.log('🔓 [ConfigEditor] Expanding field:', fieldId);
      needsFieldExpansion = true;
      const newCollapsed = new Set(collapsedFields);
      newCollapsed.delete(fieldId);
      setCollapsedFields(newCollapsed);
    }

    // 展開が必要な場合は待機時間を長くする
    const waitTime = (needsSectionExpansion || needsFieldExpansion) ? 400 : 100;
    console.log(`⏳ [ConfigEditor] Waiting ${waitTime}ms for DOM updates...`);

    // スクロールと視覚的フィードバック
    setTimeout(() => {
      console.log('📜 [ConfigEditor] Attempting to scroll to field...');

      // 要素を再取得（展開後にDOMが変わる可能性があるため）
      const targetElement = document.querySelector(`[data-field-id="${fieldId}"]`) as HTMLElement;

      if (targetElement) {
        // 要素が表示されているか確認
        const rect = targetElement.getBoundingClientRect();
        const isVisible = rect.height > 0 && rect.width > 0;
        console.log('📊 [ConfigEditor] Element visibility:', { isVisible, rect });

        if (!isVisible) {
          console.warn('⚠️ [ConfigEditor] Element found but not visible, may be collapsed');
        }

        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });

        console.log('✅ [ConfigEditor] Scroll initiated');

        // 視覚的フィードバック
        targetElement.classList.add('field-highlight');
        setTimeout(() => {
          targetElement.classList.remove('field-highlight');
        }, 2000);
      } else {
        console.error('❌ [ConfigEditor] Field element disappeared after expansion:', fieldId);
      }
    }, waitTime);
  }, [expandedSections, collapsedFields]);

  // 改良版スクロール: 折りたたみとセクション展開に強い
  const scrollToFieldNew = useCallback((fieldId: string) => {
    // 対応セクションをスキーマから逆引き
    const sectionId = fieldSectionMap.get(fieldId) || null;

    let needsSectionExpansion = false;
    if (sectionId && !expandedSections.has(sectionId)) {
      const newExpanded = new Set(expandedSections);
      newExpanded.add(sectionId);
      setExpandedSections(newExpanded);
      needsSectionExpansion = true;
    }

    let needsFieldExpansion = false;
    if (collapsedFields.has(fieldId)) {
      const newCollapsed = new Set(collapsedFields);
      newCollapsed.delete(fieldId);
      setCollapsedFields(newCollapsed);
      needsFieldExpansion = true;
    }

    const waitTime = (needsSectionExpansion || needsFieldExpansion) ? 400 : 100;

    setTimeout(() => {
      const containerId = `field-${fieldId}`;
      const container = document.getElementById(containerId) as HTMLElement | null;
      const inputEl = document.querySelector(`[data-field-id="${fieldId}"]`) as HTMLElement | null;
      const targetElement = container || inputEl;

      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetElement.classList.add('field-highlight');
        setTimeout(() => targetElement.classList.remove('field-highlight'), 2000);
      }
    }, waitTime);
  }, [expandedSections, collapsedFields, fieldSectionMap]);

  // 外部から呼び出せるメソッドを公開
  useImperativeHandle(ref, () => ({
    scrollToField: scrollToFieldNew,
  }));

  // 値の取得と更新（即座に反映）
  const handleChange = (path: string[], value: any) => {
    console.log('📝 [ConfigEditor] handleChange called:', { path, value });
    const newConfig = JSON.parse(JSON.stringify(config));
    let current = newConfig;

    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) current[path[i]] = {};
      current = current[path[i]];
    }

    current[path[path.length - 1]] = value;
    console.log('📝 [ConfigEditor] New config:', newConfig);
    onChange(newConfig);
  };

  // デバウンス付き値更新（連続入力用：カラーピッカー、スライダーなど）
  const handleChangeDebounced = useCallback((path: string[], value: any, delay: number = 300) => {
    const pathKey = path.join('.');

    // ローカル値を即座に更新（UI表示用）
    setLocalValues(prev => {
      const newMap = new Map(prev);
      newMap.set(pathKey, value);
      return newMap;
    });

    // 既存のタイマーをクリア
    const existingTimer = debounceTimerRef.current.get(pathKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // 新しいタイマーをセット（実際の更新は遅延）
    const timer = setTimeout(() => {
      console.log('⏱️ [ConfigEditor] Debounced change:', { path, value });
      const newConfig = JSON.parse(JSON.stringify(config));
      let current = newConfig;

      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) current[path[i]] = {};
        current = current[path[i]];
      }

      current[path[path.length - 1]] = value;
      onChange(newConfig);

      // 実際の更新が完了したらローカル値をクリア
      setLocalValues(prev => {
        const newMap = new Map(prev);
        newMap.delete(pathKey);
        return newMap;
      });

      debounceTimerRef.current.delete(pathKey);
    }, delay);

    debounceTimerRef.current.set(pathKey, timer);
  }, [config, onChange]);

  const getValue = (path: string[]) => {
    const pathKey = path.join('.');

    // ローカル値が存在すればそれを優先（入力中の値）
    if (localValues.has(pathKey)) {
      return localValues.get(pathKey);
    }

    // 通常のconfig値を返す
    let current = config;
    for (const key of path) {
      if (current === undefined) return undefined;
      current = current[key];
    }
    return current;
  };

  // 画像アップロード
  const handleImageUpload = async (path: string[]) => {
    try {
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        const filePath = await window.electronAPI.selectFile({
          filters: [
            { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'] }
          ],
          properties: ['openFile']
        });

        if (filePath) {
          const base64 = await window.electronAPI.readFileBase64(filePath);
          const ext = filePath.split('.').pop()?.toLowerCase() || 'png';
          const mimeType = ext === 'svg' ? 'image/svg+xml' : `image/${ext}`;
          const dataUrl = `data:${mimeType};base64,${base64}`;
          handleChange(path, dataUrl);
        }
      } else {
        // Web fallback: use a hidden file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.jpg,.jpeg,.png,.gif,.webp,.svg,image/*';
        input.onchange = () => {
          const file = input.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            handleChange(path, result);
          };
          reader.readAsDataURL(file);
        };
        input.click();
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('画像のアップロードに失敗しました');
    }
  };

  // フィールドレンダリング
  const renderField = (field: any, sectionId: string) => {
    const value = getValue([field.id]);
    const fieldId = `field-${field.id}`;
    const isFocused = focusedField === field.id;

    const fieldProps = {
      onFocus: () => setFocusedField(field.id),
      onBlur: () => setFocusedField(null),
      'data-field-id': field.id,
      className: isFocused ? 'focused' : ''
    };

    let inputElement;

    switch (field.type) {
      case 'text':
        inputElement = (
          <Input
            {...fieldProps}
            value={value || ''}
            onChange={(e) => handleChange([field.id], (e.target as HTMLInputElement).value)}
            placeholder={field.placeholder}
          />
        );
        break;

      case 'textarea':
        inputElement = (
          <Textarea
            {...fieldProps}
            value={value || ''}
            onChange={(e) => handleChange([field.id], (e.target as HTMLTextAreaElement).value)}
            placeholder={field.placeholder}
            rows={field.rows || 3}
          />
        );
        break;

      case 'number':
        // フィールド名や範囲から割合系かどうかを判定
        const isPercentageField =
          field.id?.toLowerCase().includes('opacity') ||
          field.id?.toLowerCase().includes('percent') ||
          field.id?.toLowerCase().includes('alpha') ||
          field.label?.toLowerCase().includes('透明度') ||
          field.label?.toLowerCase().includes('不透明度') ||
          field.label?.toLowerCase().includes('割合') ||
          (field.min !== undefined && field.max !== undefined && field.max <= 100);

        if (isPercentageField && field.min !== undefined && field.max !== undefined) {
          // スライダーとして表示（デバウンス付き）
          inputElement = (
            <div className="form-slider">
              <Slider
                value={value ?? field.min ?? 0}
                min={field.min || 0}
                max={field.max || 100}
                step={field.step || 1}
                onChange={(_, data) => handleChangeDebounced([field.id], data.value, 100)}
              />
              <span className="slider-value">{value ?? field.min ?? 0}{field.unit || '%'}</span>
            </div>
          );
        } else {
          // 通常の数値入力
          inputElement = (
            <Input
              {...fieldProps}
              type="number"
              value={String(value ?? 0)}
              onChange={(e) => handleChange([field.id], Number((e.target as HTMLInputElement).value))}
              min={field.min}
              max={field.max}
              step={field.step}
            />
          );
        }
        break;

      case 'color':
        inputElement = (
          <div className="form-color">
            <input
              type="color"
              value={value || '#000000'}
              onChange={(e) => handleChangeDebounced([field.id], e.target.value, 100)}
              className="form-color-input"
              {...fieldProps}
            />
            <Input
              value={value || ''}
              onChange={(e) => handleChangeDebounced([field.id], (e.target as HTMLInputElement).value, 300)}
              className="form-color-text"
            />
          </div>
        );
        break;

      case 'select':
        inputElement = (
          <select
            {...fieldProps}
            value={value || ''}
            onChange={(e) => handleChange([field.id], e.target.value)}
            className="form-select"
          >
            {field.placeholder && <option value="">{field.placeholder}</option>}
            {field.options?.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
        break;

      case 'switch':
      case 'boolean':
        inputElement = (
          <Switch
            checked={value || false}
            onChange={(_, data) => handleChange([field.id], !!data.checked)}
          />
        );
        break;

      case 'slider':
        inputElement = (
          <div className="form-slider">
            <Slider
              value={value ?? field.min ?? 0}
              min={field.min || 0}
              max={field.max || 100}
              step={field.step || 1}
              onChange={(_, data) => handleChangeDebounced([field.id], data.value, 100)}
            />
            <span className="slider-value">{value ?? field.min ?? 0}{field.unit || ''}</span>
          </div>
        );
        break;

      case 'image':
        const previewHeight = imagePreviewHeights.get(field.id) || 200;
        inputElement = (
          <div className="form-image-upload">
            {value && (
              <div
                className="image-upload-preview"
                style={{ height: `${previewHeight}px` }}
              >
                <img src={value} alt="Preview" className="image-preview" />
                <div
                  className="image-resize-handle"
                  onMouseDown={(e) => handleImageResize(field.id, e)}
                  title="ドラッグして高さを調整"
                />
              </div>
            )}
            {!value && (
              <div className="image-upload-preview image-upload-empty">
                画像を選択してください
              </div>
            )}
            <div className="image-upload-actions">
              <button
                type="button"
                className="btn-upload"
                onClick={() => handleImageUpload([field.id])}
              >
                {value ? '画像を変更' : '画像を選択'}
              </button>
              {value && (
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => handleChange([field.id], '')}
                >
                  削除
                </button>
              )}
            </div>
          </div>
        );
        break;

      case 'array':
        inputElement = renderArrayField(field);
        break;

      default:
        inputElement = (
          <Input
            {...fieldProps}
            value={value || ''}
            onChange={(e) => handleChange([field.id], (e.target as HTMLInputElement).value)}
          />
        );
    }

    const isCollapsed = collapsedFields.has(field.id);
    const isLargeField = field.type === 'image' || field.type === 'array' || field.type === 'textarea';

    return (
      <div key={field.id} id={fieldId} className={`form-field ${isFocused ? 'field-focused' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="form-field-header">
          <label className="form-label">
            {field.label}
            {field.required && <span className="required">*</span>}
            {field.description && (
              <span className="form-description">{field.description}</span>
            )}
          </label>
          {isLargeField && (
            <button
              type="button"
              className="field-collapse-btn"
              onClick={() => toggleFieldCollapse(field.id)}
              title={isCollapsed ? '展開' : '折りたたむ'}
            >
              {isCollapsed ? <ChevronRight20Regular /> : <ChevronDown20Regular />}
            </button>
          )}
        </div>
        {!isCollapsed && inputElement}
      </div>
    );
  };

  // 配列フィールドレンダリング
  const renderArrayField = (field: any) => {
    const value = getValue([field.id]) || [];
    const items = Array.isArray(value) ? value : [];

    const addItem = () => {
      const newItems = [...items, field.itemTemplate || { label: '', url: '' }];
      handleChange([field.id], newItems);
    };

    const removeItem = (index: number) => {
      const newItems = items.filter((_, i) => i !== index);
      handleChange([field.id], newItems);
    };

    const updateItem = (index: number, key: string, val: any) => {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], [key]: val };
      handleChange([field.id], newItems);
    };

    return (
      <div className="form-array-field">
        {items.map((item: any, index: number) => (
          <div key={index} className="array-item">
            <div className="array-item-fields">
              {Object.keys(field.itemTemplate || { label: '', url: '' }).map((key) => (
                <div key={key} className="array-item-field">
                  <label className="array-item-label">{key}</label>
                  <Input
                    value={item[key] || ''}
                    onChange={(e) => updateItem(index, key, (e.target as HTMLInputElement).value)}
                    placeholder={key}
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn-remove-item"
              onClick={() => removeItem(index)}
              title="削除"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn-add-item"
          onClick={addItem}
        >
          + 項目を追加
        </button>
      </div>
    );
  };

  // 検索フィルター
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;

    const query = searchQuery.toLowerCase();
    return sections.map(section => {
      const matchingFields = section.fields?.filter((field: any) => {
        const matchLabel = field.label?.toLowerCase().includes(query);
        const matchDescription = field.description?.toLowerCase().includes(query);
        const matchId = field.id?.toLowerCase().includes(query);
        return matchLabel || matchDescription || matchId;
      }) || [];

      return {
        ...section,
        fields: matchingFields,
        hasMatches: matchingFields.length > 0
      };
    }).filter(section => section.hasMatches);
  }, [searchQuery, sections]);

  // サイドバーの実際の幅を計算
  const actualSidebarWidth = sidebarCollapsed ? 48 : sidebarWidth;

  return (
    <div className="config-editor-v2">
      {/* 左サイドバー */}
      <aside
        className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}
        style={{ width: `${actualSidebarWidth}px` }}
      >
        {/* サイドバー折りたたみボタン */}
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={sidebarCollapsed ? 'サイドバーを展開' : 'サイドバーを折りたたむ'}
        >
          {sidebarCollapsed ? <ChevronRight20Regular /> : <ChevronDown20Regular />}
        </button>

        {!sidebarCollapsed && (
          <>
            <div className="sidebar-header">
              <h2 className="sidebar-title">設定</h2>
            </div>

            {/* 検索 */}
            <div className="sidebar-search">
              <Search20Regular className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="設定を検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="search-clear"
                  onClick={() => setSearchQuery('')}
                  title="クリア"
                >
                  <Dismiss20Regular />
                </button>
              )}
            </div>

            {/* アコーディオン式セクション一覧 */}
            <nav className="sidebar-nav">
              {(searchQuery ? filteredSections : sections).map((section: any) => {
                const isExpanded = expandedSections.has(section.id);

                return (
                  <div key={section.id} className="accordion-section" data-section-id={section.id}>
                    <button
                      className={`section-button ${isExpanded ? 'expanded' : ''}`}
                      onClick={() => toggleSection(section.id)}
                    >
                      <ChevronRight20Regular className={`expand-icon ${isExpanded ? 'expanded' : ''}`} />
                      <span className="section-icon">{section.icon || '⚙️'}</span>
                      <span className="section-title">{section.title}</span>
                    </button>

                    {isExpanded && (
                      <div className="section-fields">
                        {section.fields?.map((field: any) => renderField(field, section.id))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* リサイザー */}
            <div
              className="sidebar-resizer"
              onMouseDown={handleResize}
            />
          </>
        )}
      </aside>

      {/* 右プレビューエリア */}
      <main className="content-area">
        {/* プレビュー専用エリア（将来的にプレビュー機能を追加する場合） */}
      </main>
    </div>
  );
});

ConfigEditor.displayName = 'ConfigEditor';

export default ConfigEditor;
