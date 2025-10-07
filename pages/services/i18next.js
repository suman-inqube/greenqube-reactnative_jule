import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locales/en.json';
import hi from '../locales/hi.json';
import bng from '../locales/bng.json';
import span from '../locales/spanish.json';
import BAHASA from '../locales/BAHASA.json';
import FRENCH from '../locales/FRENCH.json';
import MARATHI from '../locales/MARATHI.json';
import SWAHILI from '../locales/SWAHILI.json';
import URDU from '../locales/URDU.json';
import GARO from '../locales/GARO.json';
import KANNADA from '../locales/KANNADA.json';
import TELEGU from '../locales/TELEGU.json';
import ODIA from '../locales/ODIA.json';
import GUJARATI from '../locales/GUJARATI.json';
import PUNJABI from '../locales/PUNJABI.json';
import TAMIL from '../locales/TAMIL.json';
import MALAYALAM from '../locales/MALAYALAM.json';
import MALAY from '../locales/MALAY.json';
import THAI from '../locales/THAI.json';
import FILIPINO from '../locales/FILIPINO.json';
import ASSAMESE from '../locales/ASSAMESE.json';

export const languageResources = {
  en: { translation: en },
  bn: { translation: bng },
  hi: { translation: hi },
  as: { translation: ASSAMESE },
  fr: { translation: FRENCH },
  gr: { translation: GARO },
  mr: { translation: MARATHI },
  ur: { translation: URDU },
  sw: { translation: SWAHILI },
  kn: { translation: KANNADA },
  es: { translation: span },
  te: { translation: TELEGU },
  or: { translation: ODIA },
  gu: { translation: GUJARATI },
  pa: { translation: PUNJABI },
  ta: { translation: TAMIL },
  ml: { translation: MALAYALAM },
  fil: { translation: FILIPINO },
  ms: { translation: MALAY },
  id: { translation: BAHASA },   // Bahasa (Indonesia)
  th: { translation: THAI },
};

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: 'en',
  fallbackLng: 'en',
  resources: languageResources,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
