/**
 * I18nProvider Component
 * Provides language context to the entire application
 */
import React, { useState, useEffect } from 'react';
import { I18nContext, getTranslations, Language } from '../i18n';

interface I18nProviderProps {
  children: React.ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  // Default to Japanese, can be extended to read from localStorage
  const [language, setLanguage] = useState<Language>('ja');
  const translations = getTranslations(language);

  // Optional: Save language preference to localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('app-language') as Language;
    if (savedLanguage && (savedLanguage === 'ja' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('app-language', lang);
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        t: translations,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};
