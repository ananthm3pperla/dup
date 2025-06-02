import { useEffect } from "react";

export type Theme = "light" | "dark" | "system" | "high-contrast";

export const THEME_OPTIONS = [
  {
    id: "light",
    name: "Light",
    icon: "Sun",
    description: "Light mode for daytime use",
  },
  {
    id: "dark",
    name: "Dark",
    icon: "Moon",
    description: "Dark mode for nighttime use",
  },
  {
    id: "system",
    name: "System",
    icon: "Monitor",
    description: "Follow system preferences",
  },
  {
    id: "high-contrast",
    name: "High Contrast",
    icon: "Zap",
    description: "Enhanced visibility mode",
  },
];

export function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyTheme(theme: Theme): "light" | "dark" {
  const root = window.document.documentElement;
  let resolvedTheme: "light" | "dark";

  // Remove all theme classes first
  root.classList.remove("light", "dark", "high-contrast");

  if (theme === "system") {
    // Detect system preference
    resolvedTheme = getSystemTheme();
  } else if (theme === "high-contrast") {
    resolvedTheme = "dark"; // High contrast is based on dark mode
    root.classList.add("high-contrast");
  } else {
    resolvedTheme = theme as "light" | "dark";
  }

  // Add the resolved theme class
  root.classList.add(resolvedTheme);

  return resolvedTheme;
}

export function useSystemThemeListener(callback: (isDark: boolean) => void) {
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    // Initial callback
    callback(mediaQuery.matches);

    // Setup listener for changes
    const handleChange = (e: MediaQueryListEvent) => {
      callback(e.matches);
    };

    // Use the proper method based on browser support
    mediaQuery.addEventListener("change", handleChange);

    // Cleanup
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [callback]);
}
