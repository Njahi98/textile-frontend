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
import enPerformanceAnalytics from '../locales/en/performanceAnalytics.json';
import enAssignments from '../locales/en/assignment.json';
import enWorkers from '../locales/en/workers.json';
import enProductionLines from '../locales/en/productionLines.json';
import enProducts from '../locales/en/products.json';
import enPerformanceRecords from '../locales/en/performanceRecords.json';
import enAuditLogs from '../locales/en/auditLogs.json';
import enAuditStats from '../locales/en/auditStats.json';
import enChat from '../locales/en/chat.json';
import enAiInsights from '../locales/en/aiInsights.json';

import frCommon from '../locales/fr/common.json';
import frAuth from '../locales/fr/auth.json';
import frHome from '../locales/fr/home.json';
import frSidebar from '../locales/fr/sidebar.json';
import frHomeDashboard from '../locales/fr/dashboard.json';
import frAccountSettings from '../locales/fr/accountSettings.json';
import frUsers from '../locales/fr/users.json';
import frPerformanceAnalytics from '../locales/fr/performanceAnalytics.json';
import frAssignments from '../locales/fr/assignment.json';
import frWorkers from '../locales/fr/workers.json';
import frProductionLines from '../locales/fr/productionLines.json';
import frProducts from '../locales/fr/products.json';
import frPerformanceRecords from '../locales/fr/performanceRecords.json';
import frAuditLogs from '../locales/fr/auditLogs.json';
import frAuditStats from '../locales/fr/auditStats.json';
import frChat from '../locales/fr/chat.json';
import frAiInsights from '../locales/fr/aiInsights.json';

const resources = {
  en: {
    auth: enAuth,
    common: enCommon,
    home: enHome,
    sidebar: enSidebar,
    dashboard: enHomeDashboard,
    accountSettings: enAccountSettings,
    users: enUsers,
    auditStats: enAuditStats,
    performanceAnalytics: enPerformanceAnalytics,
    assignment: enAssignments,
    workers: enWorkers,
    productionLines: enProductionLines,
    products: enProducts,
    performanceRecords: enPerformanceRecords,
    auditLogs: enAuditLogs,
    chat: enChat,
    aiInsights: enAiInsights,
  },
  fr: {
    auth: frAuth,
    common:frCommon,
    home: frHome,
    sidebar: frSidebar,
    dashboard: frHomeDashboard,
    accountSettings: frAccountSettings,
    users: frUsers,
    auditStats: frAuditStats,
    performanceAnalytics: frPerformanceAnalytics,
    assignment: frAssignments,
    workers: frWorkers,
    productionLines: frProductionLines,
    products: frProducts,
    performanceRecords: frPerformanceRecords,
    auditLogs: frAuditLogs,
    chat: frChat,
    aiInsights: frAiInsights,
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