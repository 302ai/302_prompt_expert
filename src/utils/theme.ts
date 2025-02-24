import { getCookie } from "cookies-next";

import { EMPTY_THEME, THEME_COOKIE_NAME } from "@/constants";
import { CookiesFn } from "cookies-next/lib/types";

export const getServerTheme = (cookies: CookiesFn) => {
  return getCookie(THEME_COOKIE_NAME, { cookies: cookies }) || EMPTY_THEME;
};
