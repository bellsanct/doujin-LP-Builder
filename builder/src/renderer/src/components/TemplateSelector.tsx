import React from 'react';
import './TemplateSelector.css';

interface TemplateSelectorProps {
  templates: any[];
  onSelect: (templateId: string) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ templates, onSelect }) => {
  return (
    <div className="template-selector">
      {templates.length === 0 ? (
        <div className="no-templates">
          <p>テンプレートが見つかりません</p>
          <p className="text-secondary">templates/ ディレクトリにテンプレートを配置してください</p>
        </div>
      ) : (
        <div className="template-grid">
          {templates.map((template) => (
            <div
              key={template.id}
              className="template-card"
              onClick={() => onSelect(template.id)}
            >
              {template.preview?.thumbnail && (
                <div className="template-thumbnail">
                  <img src={template.preview.thumbnail} alt={template.name} />
                </div>
              )}
              <div className="template-card-content">
                <h3>{template.name}</h3>
                <p>{template.description}</p>
                <div className="template-meta">
                  <span className="template-category">{template.category}</span>
                  <span className="template-version">v{template.version}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplateSelector;
