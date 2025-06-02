import React, { createContext, useContext, useEffect, useState } from "react";
import {
  Theme,
  applyTheme,
  useSystemThemeListener,
  getSystemTheme,
} from "@/lib/utils/themeUtils";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Set theme to 'system' by default to respect system settings
  const [theme, setTheme] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(
    getSystemTheme(),
  );

  useEffect(() => {
    const newResolvedTheme = applyTheme(theme);
    setResolvedTheme(newResolvedTheme);

    // For debugging only - don't persist to storage
    console.log(`Theme applied: ${theme}, resolved as: ${newResolvedTheme}`);
  }, [theme]);

  // Listen for system theme changes
  useSystemThemeListener((isDark) => {
    if (theme === "system") {
      setResolvedTheme(isDark ? "dark" : "light");
      // Apply the theme to document
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(isDark ? "dark" : "light");
    }
  });

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
