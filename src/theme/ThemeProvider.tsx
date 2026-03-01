import React, { createContext, useContext, useEffect, useState } from "react";
import { THEME_COLORS, THEME_VERSION } from "./themeConfig";

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  resetTheme: () => void;
  themeVersion: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDark, setIsDark] = useState(() => {
    // Initialize from localStorage or system preference immediately
    if (typeof window === "undefined") return false;
    
    const savedTheme = localStorage.getItem("app-theme-mode");
    if (savedTheme === "dark") return true;
    if (savedTheme === "light") return false;
    
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Apply theme class to document on mount and when isDark changes
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("app-theme-mode", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("app-theme-mode", "light");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      // debug log to help diagnose toggle issues
      try {
        // eslint-disable-next-line no-console
        console.log("Theme toggle:", next ? "dark" : "light");
      } catch {}
      return next;
    });
  };

  const resetTheme = () => {
    localStorage.removeItem("app-theme-mode");
    setIsDark(false);
    document.documentElement.classList.remove("dark");
  };

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        toggleTheme,
        resetTheme,
        themeVersion: THEME_VERSION,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access theme context
 * Throws error if used outside of ThemeProvider
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

/**
 * Get protected color token - safely access colors through this function
 * This ensures colors cannot be accidentally modified at runtime
 */
export const getColorToken = (colorName: keyof typeof THEME_COLORS): string => {
  return THEME_COLORS[colorName];
};
