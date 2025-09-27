import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

import enAuth from '../locales/en/auth.json';
import enCommon from '../locales/en/common.json';
import enHome from '../locales/en/home.json';
import enSidebar from '../locales/en/sidebar.json';
import enHomeDashboard from '../locales/en/dashboard.json';
import enAccountSettings from '../locales/en/accountSettings.json';
import enUsers from '../locales/en/users.json';
import enAudit from '../locales/en/audit.json';
import enPerformanceAnalytics from '../locales/en/performanceAnalytics.json';
import enAssignments from '../locales/en/assignment.json';

import frCommon from '../locales/fr/common.json';
import frAuth from '../locales/fr/auth.json';
import frHome from '../locales/fr/home.json';
import frSidebar from '../locales/fr/sidebar.json';
import frHomeDashboard from '../locales/fr/dashboard.json';
import frAccountSettings from '../locales/fr/accountSettings.json';
import frUsers from '../locales/fr/users.json';
import frAudit from '../locales/fr/audit.json';
import frPerformanceAnalytics from '../locales/fr/performanceAnalytics.json';
import frAssignments from '../locales/fr/assignment.json';

const resources = {
  en: {
    auth: enAuth,
    common: enCommon,
    home: enHome,
    sidebar: enSidebar,
    dashboard: enHomeDashboard,
    accountSettings: enAccountSettings,
    users: enUsers,
    audit: enAudit,
    performanceAnalytics: enPerformanceAnalytics,
    assignment: enAssignments,
  },
  fr: {
    auth: frAuth,
    common:frCommon,
    home: frHome,
    sidebar: frSidebar,
    dashboard: frHomeDashboard,
    accountSettings: frAccountSettings,
    users: frUsers,
    audit: frAudit,
    performanceAnalytics: frPerformanceAnalytics,
    assignment: frAssignments,
  },
};

void i18n
  .use(Backend) // loads translations from backend
  .use(LanguageDetector) // detects user language
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr'],
    
    // Namespace configuration
    ns: ['auth', 'common'],
    defaultNS: 'common',
    
    // Language detection
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'preferred-language',
    },
    
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    
    // Backend configuration (optional - for loading from server)
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    // React specific options
    react: {
      useSuspense: false, // Set to false to handle loading states manually
    },
  });

export default i18n;