// Language Context — RTL/LTR support
import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { Language } from '../constants/i18n';

interface LanguageContextType {
  language: Language;
  isRTL: boolean;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: 'ar',
  isRTL: true,
  toggleLanguage: () => {},
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLang] = useState<Language>('ar');

  const toggleLanguage = useCallback(() => {
    setLang(prev => prev === 'ar' ? 'en' : 'ar');
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLang(lang);
  }, []);

  return (
    <LanguageContext.Provider value={{
      language,
      isRTL: language === 'ar',
      toggleLanguage,
      setLanguage,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}
