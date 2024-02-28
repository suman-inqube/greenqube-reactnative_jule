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
    en: { translation: en },
    hhindi: { translation: hi },
    bng: { translation: bng },
    span:{translation:span},
    bh:{translation:BAHASA},
    french:{translation:FRENCH},
    marathi:{translation:MARATHI},
    swahili:{translation:SWAHILI},
    urdu:{translation:URDU},
    Garo:{translation:GARO},
    kannada:{translation:KANNADA},
    telegu:{translation:TELEGU},
    oriya:{translation:ODIA},
    gujarati:{translation:GUJARATI},
    punjabi:{translation:PUNJABI},
    tamil:{translation:TAMIL},
    malayalam:{translation:MALAYALAM},
    malay:{translation:MALAY},
    thai:{translation:THAI},
    filipino:{translation:FILIPINO},
    অহমীয়া:{translation:ASSAMESE},
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
