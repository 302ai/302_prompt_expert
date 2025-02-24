import ISO639 from "iso-639-1";
import { GLOBAL } from "./values";

export type OptionProps = {
  id: number;
  label: string;
  value: string;
};

export const APP_LANG_OPTION: OptionProps[] = GLOBAL.LOCALE.SUPPORTED.map(
  (language, index) => {
    return {
      id: index,
      label: ISO639.getNativeName(language),
      value: language,
    };
  }
);
