"use client";

import { ReactNode } from "react";

import { ThemeProvider as NextThemesProvider } from "next-themes";

type AppThemeProps = {
  children: ReactNode;
  theme: string;
};

const AppTheme = ({ children, theme }: AppThemeProps) => {
  return (
    <NextThemesProvider defaultTheme={theme} attribute="class">
      {children}
    </NextThemesProvider>
  );
};

export default AppTheme;
