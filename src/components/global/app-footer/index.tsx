"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

import { useIsHideBrand } from "@/hooks/global/use-is-hide-brand";
import { useTranslations } from "next-intl";
import AppLogo from "../app-logo";

type FooterProps = {
  className?: string;
};

const Footer = forwardRef<HTMLDivElement, FooterProps>(({ className }, ref) => {
  const t = useTranslations();
  const isHideBrand = useIsHideBrand();

  if (isHideBrand) return <footer ref={ref} />;

  return (
    <footer
      className={cn("flex flex-col items-center justify-center p-2", className)}
      style={{ color: "rgb(102, 102, 102)", fontSize: "12px" }}
      ref={ref}
    >
      <div className="break-all text-center">
        {t("global.footer.copyright_leading")}
      </div>
      <div className="flex items-center justify-center gap-1">
        {t.rich("global.footer.copyright_content", {
          logo: () => (
            <AppLogo
              size="full"
              className="mx-auto h-[18px] w-[64px]"
              height={72}
              width={256}
            />
          ),
        })}
      </div>
    </footer>
  );
});

Footer.displayName = "AppFooter";

export default Footer;
