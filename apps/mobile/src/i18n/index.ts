import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import hi from './locales/hi.json';
import ar from './locales/ar.json';

const LANGUAGE_KEY = 'app_language';

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  hi: { translation: hi },
  ar: { translation: ar },
};

const getLanguage = async (): Promise<string> => {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (saved && resources[saved]) return saved;
  } catch {
    // ignore
  }
  const locale = Localization.getLocales()[0]?.languageCode ?? 'en';
  return resources[locale] ? locale : 'en';
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

// Set language asynchronously on app start
getLanguage().then((lng) => {
  i18n.changeLanguage(lng);
});

// Helper to persist language changes
export const changeLanguage = async (lng: string) => {
  await AsyncStorage.setItem(LANGUAGE_KEY, lng);
  i18n.changeLanguage(lng);
};

export const isRTL = (lng: string = i18n.language) =>
  lng === 'ar';

export default i18n;
