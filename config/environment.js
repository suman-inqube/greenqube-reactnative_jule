// Change this only when switching environment
const ENV = 'DEMO'; // 'DEMO' | 'LIVE'

const BASE_URLS = {
  DEMO: 'http://134.209.155.11:4003/',
  LIVE: 'https://mygreenqube.com:4003/',
};

export const BASE_URL = BASE_URLS[ENV];
export const ENCRYPTION_KEY = 'greenQube_96740_64428';
export const CURRENT_ENV = ENV;
