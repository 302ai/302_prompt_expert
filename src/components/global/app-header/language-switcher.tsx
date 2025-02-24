"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APP_LANG_OPTION } from "@/constants";
import { usePathname, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { languageAtom } from "@/stores/slices/language_store";
import { useSetAtom } from "jotai";
import { LanguagesIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { startTransition } from "react";
type LanguageSwitchProps = {
  className?: string;
};
export function LanguageSwitcher({ className }: LanguageSwitchProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const setLanguage = useSetAtom(languageAtom);
  const handleChangeLocale = (locale: string) => {
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- TypeScript will validate that only known `params`
        // are used in combination with a given `pathname`. Since the two will
        // always match for the current route, we can skip runtime checks.
        { pathname, params },
        { locale }
      );
    });
    setLanguage(locale);
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild={true}>
        <Button
          aria-label={t("global.header.language_switcher.switch_language")}
          variant="icon"
          size="roundIconSm"
          className={cn(className)}
        >
          <LanguagesIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent aria-describedby={undefined}>
        <DropdownMenuRadioGroup
          value={locale as string}
          onValueChange={handleChangeLocale}
        >
          {APP_LANG_OPTION.map((language) => (
            <DropdownMenuRadioItem key={language.id} value={language.value}>
              {language.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
