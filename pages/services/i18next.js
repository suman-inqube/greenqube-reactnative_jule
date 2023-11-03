import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import bng from '../locales/bng.json';

export const languageResources = {
    en: { translation: en },
    hi: { translation: hi },
    bng: { translation: bng },
};

i18n.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    lng: 'en',
    fallbackLng: 'en',
    resources: languageResources,
    interpolation: {
        escapeValue: false // react already safes from xss 
    }
});

export default i18n; 
