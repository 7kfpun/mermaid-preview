import i18next from "i18next";
import { initReactI18next } from "react-i18next";

// Define RTL languages
export const RTL_LANGUAGES = ["ar"];

// Helper function to check if a language is RTL
export const isRTL = (language) => RTL_LANGUAGES.includes(language);

i18next.use(initReactI18next).init({
  resources: {},
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18next;
