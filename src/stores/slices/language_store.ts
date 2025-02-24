import { env } from "@/env";
import { atom } from "jotai";

export const languageAtom = atom<string>(env.NEXT_PUBLIC_DEFAULT_LOCALE);
