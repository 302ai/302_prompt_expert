import { THEME_COOKIE_NAME } from "@/constants";
import { setCookie } from "cookies-next";
import { useTheme as useNextTheme } from "next-themes";
import { useEffect } from "react";

export const useTheme = () => {
  const { theme, setTheme: setNextTheme } = useNextTheme();

  const setTheme = (theme: string) => {
    setNextTheme(theme);
  };

  useEffect(() => {
    let newTheme = theme;
    if (theme === "system") {
      newTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    // When the theme is modified on the client side, set the cookie.
    // The server will set the theme based on the cookie value.
    setCookie(THEME_COOKIE_NAME, newTheme);
  }, [theme]);
  return { theme, setTheme };
};
