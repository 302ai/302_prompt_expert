"use client";

import { useTheme } from "next-themes";

// Detect if the system is dark or light, if the theme is system, it will return the system's dark mode
export function useIsDark() {
  const { theme } = useTheme();
  if (theme === "system") {
    return {
      isDark: window.matchMedia("(prefers-color-scheme: dark)").matches,
    };
  }
  return {
    isDark: theme === "dark",
  };
}
