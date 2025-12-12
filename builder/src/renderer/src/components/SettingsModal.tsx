/**
 * Settings Modal Component
 * Modal dialog for application settings (language, theme, log folder, Netlify API key)
 */
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  Label,
  Input,
  Select,
  Text,
} from '@fluentui/react-components';
import { Settings24Regular, Folder24Regular } from '@fluentui/react-icons';
import { useTranslation, Language } from '../i18n';

export interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface Settings {
  language: Language;
  theme: 'light' | 'dark' | 'system';
  logFolderPath: string;
  netlifyApiKey: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ open, onOpenChange }) => {
  const { t, language, setLanguage } = useTranslation();

  // Settings state
  const [settings, setSettings] = useState<Settings>({
    language: language,
    theme: 'light',
    logFolderPath: '',
    netlifyApiKey: '',
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      const savedTheme = localStorage.getItem('app-theme') as 'light' | 'dark' | 'system' | null;
      const savedLogFolder = localStorage.getItem('app-log-folder') || '';
      const savedNetlifyKey = localStorage.getItem('app-netlify-key') || '';

      setSettings({
        language: language,
        theme: savedTheme || 'light',
        logFolderPath: savedLogFolder,
        netlifyApiKey: savedNetlifyKey,
      });
    };

    loadSettings();
  }, [language]);

  // Save settings to localStorage
  const saveSettings = () => {
    // Save language
    if (settings.language !== language) {
      setLanguage(settings.language);
    }

    // Save other settings
    localStorage.setItem('app-theme', settings.theme);
    localStorage.setItem('app-log-folder', settings.logFolderPath);
    localStorage.setItem('app-netlify-key', settings.netlifyApiKey);

    // Close modal
    onOpenChange(false);
  };

  // Handle log folder browse button
  const handleBrowseLogFolder = async () => {
    if (window.electronAPI?.selectDirectory) {
      try {
        const selectedPath = await window.electronAPI.selectDirectory();
        if (selectedPath) {
          setSettings({ ...settings, logFolderPath: selectedPath });
        }
      } catch (error) {
        console.error('Failed to select directory:', error);
      }
    }
  };

  // Handle open log folder button
  const handleOpenLogFolder = async () => {
    if (window.electronAPI?.openPath && settings.logFolderPath) {
      try {
        await window.electronAPI.openPath(settings.logFolderPath);
      } catch (error) {
        console.error('Failed to open log folder:', error);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(_, data) => onOpenChange(data.open)}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Settings24Regular />
              {t.settings.title}
            </span>
          </DialogTitle>
          <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Language Setting */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Label htmlFor="language-select" weight="semibold">
                {t.settings.language.label}
              </Label>
              <Text size={200}>{t.settings.language.description}</Text>
              <Select
                id="language-select"
                value={settings.language}
                onChange={(_, data) => setSettings({ ...settings, language: data.value as Language })}
              >
                <option value="ja">{t.settings.language.japanese}</option>
                <option value="en">{t.settings.language.english}</option>
              </Select>
            </div>

            {/* Theme Setting */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Label htmlFor="theme-select" weight="semibold">
                {t.settings.theme.label}
              </Label>
              <Text size={200}>{t.settings.theme.description}</Text>
              <Select
                id="theme-select"
                value={settings.theme}
                onChange={(_, data) => setSettings({ ...settings, theme: data.value as 'light' | 'dark' | 'system' })}
              >
                <option value="light">{t.settings.theme.light}</option>
                <option value="dark">{t.settings.theme.dark}</option>
                <option value="system">{t.settings.theme.system}</option>
              </Select>
            </div>

            {/* Log Folder Path Setting */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Label htmlFor="log-folder-input" weight="semibold">
                {t.settings.logFolder.label}
              </Label>
              <Text size={200}>{t.settings.logFolder.description}</Text>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Input
                  id="log-folder-input"
                  value={settings.logFolderPath}
                  onChange={(_, data) => setSettings({ ...settings, logFolderPath: data.value })}
                  style={{ flex: 1 }}
                />
                <Button
                  appearance="secondary"
                  icon={<Folder24Regular />}
                  onClick={handleBrowseLogFolder}
                >
                  {t.settings.logFolder.browse}
                </Button>
                {settings.logFolderPath && (
                  <Button
                    appearance="secondary"
                    onClick={handleOpenLogFolder}
                  >
                    {t.settings.logFolder.open}
                  </Button>
                )}
              </div>
            </div>

            {/* Netlify API Key Setting */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Label htmlFor="netlify-key-input" weight="semibold">
                {t.settings.netlify.label}
              </Label>
              <Text size={200}>{t.settings.netlify.description}</Text>
              <Input
                id="netlify-key-input"
                type="password"
                value={settings.netlifyApiKey}
                onChange={(_, data) => setSettings({ ...settings, netlifyApiKey: data.value })}
                placeholder={t.settings.netlify.placeholder}
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={() => onOpenChange(false)}>
              {t.common.cancel}
            </Button>
            <Button appearance="primary" onClick={saveSettings}>
              {t.common.save}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
