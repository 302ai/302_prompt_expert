import { isMobile } from "@/utils";
import { atom } from "jotai";

export const chatVisibleAtom = atom<boolean>(!isMobile());
