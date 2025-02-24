"use client";

import { ReactNode, useEffect, useState } from "react";

import SkeletonRenderer from "@/components/common/skeleton-renderer";

interface ClientOnlyProps {
  children: ReactNode;
}

export default function AppClient({ children }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <SkeletonRenderer element="APP_CLIENT" />;
  }

  return <>{children}</>;
}
