"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { appConfigAtom } from "@/stores";
import { useAtomValue } from "jotai";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  className?: string;
}
function ToolInfo({ className }: Props) {
  const t = useTranslations();
  const config = useAtomValue(appConfigAtom);

  return (
    <>
      <Dialog>
        <DialogTrigger asChild={true}>
          <Button
            aria-label={t("global.header.tool_info.trigger.label")}
            variant="icon"
            size="roundIconSm"
            className={cn(className)}
          >
            <Info className="size-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("global.header.tool_info.title")}</DialogTitle>
            <DialogDescription>
              {t("global.header.tool_info.description")}
            </DialogDescription>
          </DialogHeader>
          <div
            dangerouslySetInnerHTML={{ __html: config.toolInfo || "" }}
            className="prose dark:prose-invert"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export { ToolInfo };
