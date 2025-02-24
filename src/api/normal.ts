"use client";

import { env } from "@/env";
import { appConfigAtom, languageAtom, store } from "@/stores";
import { langToCountry } from "@/utils/302";
import { emitter } from "@/utils/mitt";
import ky from "ky";

// Error response type for 302 endpoints
type ErrorResponse = {
  error: {
    err_code: number;
    [key: `message${string}`]: string;
    type: string;
  };
};

export const apiKy = ky.create({
  prefixUrl: env.NEXT_PUBLIC_API_URL,
  timeout: 60000,
  hooks: {
    beforeRequest: [
      (request) => {
        const { apiKey } = store.get(appConfigAtom);
        const uiLanguage = store.get(languageAtom);

        if (apiKey) {
          request.headers.set("Authorization", `Bearer ${apiKey}`);
        }

        // Some 302 endpoints require the language to be set, so we set it here
        if (uiLanguage) {
          request.headers.set("Lang", langToCountry(uiLanguage));
        }
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        if (!response.ok) {
          const res = await response.json<ErrorResponse>();

          // Emit a toast error if there is an error code
          const uiLanguage = store.get(languageAtom);
          if (res.error && uiLanguage) {
            const countryCode = langToCountry(uiLanguage);
            const message =
              res.error[`message${countryCode ? `_${countryCode}` : ""}`];
            emitter.emit("ToastError", {
              code: res.error.err_code,
              message,
            });
          }
        }
      },
    ],
  },
});
