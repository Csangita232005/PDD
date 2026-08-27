import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "../translations";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem("sharebite_lang");
    return saved || "en";
  });

  useEffect(() => {
    localStorage.setItem("sharebite_lang", language);
  }, [language]);

  const changeLanguage = (langCode) => {
    if (translations[langCode]) {
      setLanguage(langCode);
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
