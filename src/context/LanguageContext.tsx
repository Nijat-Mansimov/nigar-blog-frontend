import React, { createContext, useContext, useEffect, useState } from "react";
import { Language, getTranslation, languageNames } from "../i18n";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (path: string) => string;
  languageNames: Record<Language, string>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Try to get from localStorage, otherwise default to 'en'
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("language") as Language | null;
      if (stored && ["en", "az", "ru", "tr"].includes(stored)) {
        return stored;
      }
    }
    return "en";
  });

  // Save to localStorage whenever language changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("language", language);
    }
  }, [language]);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  // Translation helper function with nested key support (e.g. "nav.home")
  const t = (path: string): string => {
    const translations = getTranslation(language);
    const keys = path.split(".");
    let result: any = translations;

    for (const key of keys) {
      if (result && typeof result === "object" && key in result) {
        result = result[key];
      } else {
        return path; // Return the path if translation not found
      }
    }

    return typeof result === "string" ? result : path;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        languageNames,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
