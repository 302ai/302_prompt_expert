"use client";

import { useDomain } from "@/hooks/global/use-domain";
import { cn } from "@/lib/utils";

import Image from "next/image";

type AppLogoProps = {
  size?: "mini" | "full";
  height?: number;
  width?: number;
  quality?: number;
  className?: string;
  wrapperClassName?: string;
};

export default function AppLogo({
  size = "mini",
  height = 72,
  width = 256,
  quality = 100,
  className,
  wrapperClassName,
}: AppLogoProps) {
  const domain = useDomain();
  return (
    <a
      href={domain}
      rel="noreferrer"
      target="_blank"
      className={cn(wrapperClassName)}
    >
      {size === "mini" ? (
        <Image
          alt="ai-302"
          priority
          className={cn(className)}
          src="/images/global/logo-mini.png"
          quality={quality}
          height={height}
          width={width}
        />
      ) : (
        <>
          <Image
            alt="ai-302"
            priority
            className={cn("hidden dark:block", className)}
            src="/images/global/logo-dark.png"
            quality={quality}
            height={height}
            width={width}
          />

          <Image
            alt="ai-302"
            priority
            className={cn("dark:hidden", className)}
            src="/images/global/logo-light.png"
            quality={quality}
            height={height}
            width={width}
          />
        </>
      )}
    </a>
  );
}
