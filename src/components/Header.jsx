import { useEffect, memo } from "react";
import { useTranslation } from "react-i18next";
import { trackEvent } from "../utils/ga";
import { STORAGE_KEYS } from "../utils/constants";

const Header = ({ toggleDarkMode, darkMode }) => {
  const { t, i18n } = useTranslation();
  const languages = {
    en: "English",
    zh: "中文",
    hi: "हिन्दी",
    es: "Español",
    fr: "Français",
    ar: "العربية",
    bn: "বাংলা",
    ru: "Русский",
    pt: "Português",
    id: "Bahasa Indonesia",
  };

  // Load saved language on mount
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
      if (savedLanguage && savedLanguage !== i18n.language) {
        i18n.changeLanguage(savedLanguage);
      }
    } catch (e) {
      console.error("Failed to load language from localStorage:", e);
    }
  }, [i18n]);

  const handleLanguageChange = (newLanguage) => {
    i18n.changeLanguage(newLanguage);
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, newLanguage);
    } catch (e) {
      console.error("Failed to save language to localStorage:", e);
    }
    trackEvent("change_language", { language: newLanguage });
  };

  return (
    <header>
      <h1>{t("title")}</h1>
      <div className="header-controls">
        <select
          value={i18n.language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="language-selector"
        >
          {Object.entries(languages).map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            toggleDarkMode();
            trackEvent("toggle_dark_mode", { dark_mode: !darkMode });
          }}
          className="dark-mode-toggle"
          title={t("toggleDarkMode")}
        >
          {darkMode ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
};

export default memo(Header);
