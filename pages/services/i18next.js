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
import ASSAMESE from '../locales/ASSAMESE.json'
export const languageResources = {
    1: { translation: en },
    2: { translation: bng },
    3: { translation: hi },
    4:{translation:ASSAMESE},
    5:{translation:FRENCH},
    6:{translation:GARO},
    7:{translation:MARATHI},
    8:{translation:URDU},
    9:{translation:SWAHILI},
    10:{translation:KANNADA},
    11:{translation:span},
    12:{translation:TELEGU},
    13:{translation:ODIA},
    14:{translation:GUJARATI},
    15:{translation:PUNJABI},
    16:{translation:TAMIL},
    17:{translation:MALAYALAM},
    18:{translation:FILIPINO},
    19:{translation:MALAY},
    20:{translation:BAHASA},
    21:{translation:THAI},
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
