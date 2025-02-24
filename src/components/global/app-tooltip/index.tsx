"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ReactNode } from "react";

const AppTheme = ({ children }: { children: ReactNode }) => {
  return <TooltipProvider>{children}</TooltipProvider>;
};

export default AppTheme;
