import { APP_ROUTE_MENU } from "@/constants";

export const isAuthPath = (pathname: string): boolean => {
  return pathname.includes("/auth");
};

export const needAuth = (pathname: string): boolean => {
  return APP_ROUTE_MENU.filter((menu) => menu.needAuth).some((menu) => {
    return pathname === menu.path;
  });
};

export const removeParams = (pathname: string): void => {
  if (typeof window !== "undefined" && pathname) {
    window.history.replaceState({}, "", pathname);
  }
};
