import { useState } from "react";
import { STORAGE_KEYS } from "../utils/constants";

const useTheme = () => {
  const [theme, setTheme] = useState("default");
  const [themeConfig, setThemeConfig] = useState("");
  const [showThemeConfig, setShowThemeConfig] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
      return saved === "true";
    } catch {
      return false;
    }
  });

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    try {
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, newDarkMode.toString());
    } catch (e) {
      console.error("Failed to save dark mode preference:", e);
    }
  };

  return {
    theme,
    setTheme,
    themeConfig,
    setThemeConfig,
    showThemeConfig,
    setShowThemeConfig,
    darkMode,
    toggleDarkMode,
  };
};

export default useTheme;
