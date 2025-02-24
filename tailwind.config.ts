import typography from "@tailwindcss/typography";
import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import type { PluginAPI } from "tailwindcss/types/config";

// Enhance scrollbar style, small size and smooth color
const scrollbar = ({ addBase, theme }: PluginAPI) => {
  addBase({
    // Light mode scrollbar style
    "::-webkit-scrollbar": {
      width: "4px",
      height: "4px",
    },
    "::-webkit-scrollbar-track": {
      backgroundColor: theme("colors.gray.100", "#f1f1f1"),
      borderRadius: "4px",
      width: "4px",
    },
    "::-webkit-scrollbar-thumb": {
      backgroundColor: theme("colors.gray.300", "#888"),
      borderRadius: "4px",
    },
    "::-webkit-scrollbar-thumb:hover": {
      backgroundColor: theme("colors.gray.400", "#555"),
    },
    // Dark mode scrollbar style
    ".dark ::-webkit-scrollbar": {
      width: "4px",
      height: "4px",
    },
    ".dark ::-webkit-scrollbar-track": {
      backgroundColor: theme("colors.gray.800", "#2d2d2d"),
      borderRadius: "4px",
      width: "4px",
    },
    ".dark ::-webkit-scrollbar-thumb": {
      backgroundColor: theme("colors.gray.600", "#555"),
      borderRadius: "4px",
    },
    ".dark ::-webkit-scrollbar-thumb:hover": {
      backgroundColor: theme("colors.gray.700", "#333"),
    },
  });
};

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pageBackground: "hsl(var(--page-background))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [animate, typography, scrollbar],
};
export default config;
