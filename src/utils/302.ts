// Start of Selection
// Utility functions specific to 302

import { INTERNAL_DEPLOY_MODE, OUTSIDE_DEPLOY_MODE } from "@/constants";
import { env } from "@/env";

// Convert language code to country code
export function langToCountry(lang: string) {
  const map: Record<string, string> = {
    zh: "cn",
    en: "en",
    ja: "jp",
  };
  return map[lang] ?? lang;
}

// Get deploy mode
export function depolyMode() {
  return !!env.NEXT_PUBLIC_302_API_KEY
    ? OUTSIDE_DEPLOY_MODE
    : INTERNAL_DEPLOY_MODE;
}

// Check if it's outside deploy mode
export function isOutsideDeployMode() {
  return depolyMode() === OUTSIDE_DEPLOY_MODE;
}
