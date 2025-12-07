/**
 * i18n (Internationalization) System
 * Provides translation context and hooks for the application
 */
import { createContext, useContext } from 'react';
import { ja, TranslationKey } from './ja';
import { en } from './en';

export type Language = 'ja' | 'en';

export interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKey;
}

// Default context (Japanese)
export const I18nContext = createContext<I18nContextType>({
  language: 'ja',
  setLanguage: () => {},
  t: ja,
});

/**
 * Hook to access translations
 * @returns Translation object for current language
 */
export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return context;
};

/**
 * Get translation object for specified language
 */
export const getTranslations = (language: Language): TranslationKey => {
  return language === 'ja' ? ja : en;
};

// Export language files
export { ja, en };
export type { TranslationKey };
