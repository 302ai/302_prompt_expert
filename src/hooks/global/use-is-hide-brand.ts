import { appConfigAtom } from "@/stores";

import { useAtomValue } from "jotai";

export function useIsHideBrand() {
  const config = useAtomValue(appConfigAtom);
  return config.hideBrand;
}
