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

/**
 * Validate directory path for security
 */
const validateDirectoryPath = (dirPath: string): { valid: boolean; error?: string } => {
  if (!dirPath) return { valid: true }; // Empty path is valid (will use default)

  // Path traversal check
  if (dirPath.includes('..')) {
    return { valid: false, error: '相対パス(..)は使用できません' };
  }

  // Windows: Check for system directories
  const systemDirsWin = ['C:\\Windows', 'C:\\Program Files', 'C:\\Program Files (x86)'];
  if (systemDirsWin.some(dir => dirPath.toUpperCase().startsWith(dir.toUpperCase()))) {
    return { valid: false, error: 'システムディレクトリには書き込めません' };
  }

  // Unix: Check for system directories
  const systemDirsUnix = ['/etc', '/var', '/usr', '/bin', '/sbin', '/boot', '/sys', '/proc'];
  if (systemDirsUnix.some(dir => dirPath.startsWith(dir))) {
    return { valid: false, error: 'システムディレクトリには書き込めません' };
  }

  return { valid: true };
};

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
    const loadSettings = async () => {
      const savedTheme = localStorage.getItem('app-theme') as 'light' | 'dark' | 'system' | null;
      const savedLogFolder = localStorage.getItem('app-log-folder') || '';

      // Decrypt Netlify API key
      let netlifyKey = '';
      const encryptedKey = localStorage.getItem('app-netlify-key-encrypted');
      if (encryptedKey && window.electronAPI?.decryptString) {
        try {
          netlifyKey = await window.electronAPI.decryptString(encryptedKey);
        } catch (error) {
          console.error('Failed to decrypt API key:', error);
          // Keep empty string on decryption failure
        }
      }

      setSettings({
        language: language,
        theme: savedTheme || 'light',
        logFolderPath: savedLogFolder,
        netlifyApiKey: netlifyKey,
      });
    };

    loadSettings();
  }, [language]);

  // Save settings to localStorage
  const saveSettings = async () => {
    try {
      // Validate log folder path
      const pathValidation = validateDirectoryPath(settings.logFolderPath);
      if (!pathValidation.valid) {
        alert(`ログフォルダパスが不正です: ${pathValidation.error}`);
        return;
      }

      // Save language
      if (settings.language !== language) {
        setLanguage(settings.language);
      }

      // Save theme and log folder (plaintext OK)
      localStorage.setItem('app-theme', settings.theme);
      localStorage.setItem('app-log-folder', settings.logFolderPath);

      // Encrypt and save Netlify API key
      if (settings.netlifyApiKey && window.electronAPI?.encryptString) {
        try {
          const encrypted = await window.electronAPI.encryptString(settings.netlifyApiKey);
          localStorage.setItem('app-netlify-key-encrypted', encrypted);
        } catch (error) {
          console.error('Failed to encrypt API key:', error);
          alert('API キーの保存に失敗しました。暗号化機能が利用できません。');
          return;
        }
      } else {
        // Remove encrypted key if API key is empty
        localStorage.removeItem('app-netlify-key-encrypted');
      }

      // Remove old plaintext key if exists (migration)
      localStorage.removeItem('app-netlify-key');

      // Close modal
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('設定の保存に失敗しました。');
    }
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
