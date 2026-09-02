import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import { t, TranslationKey } from '../constants/i18n';

export function useLanguage() {
  const context = useContext(LanguageContext);

  const translate = (key: TranslationKey) => t(key, context.language);

  return {
    ...context,
    t: translate,
  };
}
