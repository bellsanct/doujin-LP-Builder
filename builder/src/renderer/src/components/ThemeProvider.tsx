/**
 * Theme Provider Component
 * Manages application theme (light/dark/system) with CSS custom properties and FluentUI integration
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { webLightTheme, webDarkTheme, Theme } from '@fluentui/react-components';

type ThemeSetting = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  themeSetting: ThemeSetting;
  resolvedTheme: ResolvedTheme;
  fluentTheme: Theme;
  setThemeSetting: (theme: ThemeSetting) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'app-theme';

/**
 * Get system preferred color scheme
 */
const getSystemTheme = (): ResolvedTheme => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

/**
 * Resolve theme setting to actual theme
 */
const resolveTheme = (setting: ThemeSetting): ResolvedTheme => {
  if (setting === 'system') {
    return getSystemTheme();
  }
  return setting;
};

/**
 * Apply theme to document element
 */
const applyThemeToDocument = (theme: ResolvedTheme) => {
  document.documentElement.setAttribute('data-theme', theme);
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize from localStorage
  const [themeSetting, setThemeSettingState] = useState<ThemeSetting>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeSetting | null;
    return saved && ['light', 'dark', 'system'].includes(saved) ? saved : 'light';
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolveTheme(themeSetting)
  );

  // Update resolved theme when setting changes
  useEffect(() => {
    const newResolved = resolveTheme(themeSetting);
    setResolvedTheme(newResolved);
    applyThemeToDocument(newResolved);
  }, [themeSetting]);

  // Listen for system theme changes when using 'system' setting
  useEffect(() => {
    if (themeSetting !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light';
      setResolvedTheme(newTheme);
      applyThemeToDocument(newTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeSetting]);

  // Apply theme on initial mount
  useEffect(() => {
    applyThemeToDocument(resolvedTheme);
  }, []);

  const setThemeSetting = useCallback((theme: ThemeSetting) => {
    setThemeSettingState(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, []);

  // Listen for theme changes from SettingsModal
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const newTheme = e.newValue as ThemeSetting;
        if (['light', 'dark', 'system'].includes(newTheme)) {
          setThemeSettingState(newTheme);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Custom event for same-tab theme changes (from SettingsModal)
  useEffect(() => {
    const handleThemeChange = () => {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeSetting | null;
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        setThemeSettingState(saved);
      }
    };

    window.addEventListener('theme-changed', handleThemeChange);
    return () => window.removeEventListener('theme-changed', handleThemeChange);
  }, []);

  const fluentTheme = resolvedTheme === 'dark' ? webDarkTheme : webLightTheme;

  return (
    <ThemeContext.Provider value={{ themeSetting, resolvedTheme, fluentTheme, setThemeSetting }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
