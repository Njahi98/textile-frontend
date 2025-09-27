// src/hooks/useLanguage.ts
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const useLanguage = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const updateLanguageAttributes = (language: string) => {
      document.documentElement.lang = language;
      document.documentElement.dir = 'ltr';
    };

    updateLanguageAttributes(i18n.language);

    // Listen for language changes
    const handleLanguageChange = (lng: string) => {
      updateLanguageAttributes(lng);
    };

    i18n.on('languageChanged', handleLanguageChange);

    // Cleanup
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const changeLanguage = async (language: string) => {
    await i18n.changeLanguage(language);
    localStorage.setItem('preferred-language', language);
  };

  return {
    currentLanguage: i18n.language,
    changeLanguage,
  };
};