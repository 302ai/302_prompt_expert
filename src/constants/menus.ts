import { env } from "@/env";

export type MenuProps = {
  // IMPORTANT: The label key for i18n
  label: string;
  path: string;
  // IMPORTANT: Whether the route needs to be authenticated
  needAuth?: boolean;
};

// TODO: Add your route menu here
export const APP_ROUTE_MENU: MenuProps[] = [
  {
    label: "home.title",
    path: "/",
    needAuth: true,
  },
  {
    label: "auth.title",
    path: env.NEXT_PUBLIC_AUTH_PATH,
    needAuth: false,
  },
];
