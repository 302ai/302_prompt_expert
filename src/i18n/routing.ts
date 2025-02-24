import { GLOBAL } from "@/constants/values";
import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: GLOBAL.LOCALE.SUPPORTED,
  defaultLocale: GLOBAL.LOCALE.DEFAULT,
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
