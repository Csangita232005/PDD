import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { translations } from "../shared/translations";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem("sharebite_lang");
      if (saved && translations[saved]) {
        setLanguage(saved);
      }
    } catch (e) {
      console.warn("Error loading language preference:", e);
    }
  };

  const changeLanguage = async (langCode) => {
    if (translations[langCode]) {
      setLanguage(langCode);
      try {
        await AsyncStorage.setItem("sharebite_lang", langCode);
      } catch (e) {
        console.warn("Error saving language preference:", e);
      }
    }
  };

  const t = (key) => {
    const langObj = translations[language] || translations["en"];
    return langObj[key] || translations["en"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
