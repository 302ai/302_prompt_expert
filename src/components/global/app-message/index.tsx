"use client";

import HostRenderer from "@/components/common/host-renderer";
import { Toaster } from "@/components/ui/sonner";
import { useIsDark } from "@/hooks/global/use-is-dark";
import { emitter, ToastInfo } from "@/utils/mitt";
import { useEffect } from "react";
import { toast } from "sonner";
const AppMessage = () => {
  const { isDark } = useIsDark();
  useEffect(() => {
    // Handler for success messages
    const handleToastSuccess = (successInfo: ToastInfo) => {
      toast.success(
        () => (
          <div className="flex items-center gap-2">
            <HostRenderer content={successInfo.message} />
          </div>
        ),
        {
          id: successInfo.code.toString(),
        }
      );
    };

    // Handler for error messages
    const handleToastError = (errorInfo: ToastInfo) => {
      toast.error(
        () => (
          <div className="flex items-center gap-2">
            <HostRenderer content={errorInfo.message} />
          </div>
        ),
        {
          id: errorInfo.code.toString(),
        }
      );
    };

    // Listen for success and error events
    emitter.on("ToastSuccess", handleToastSuccess);
    emitter.on("ToastError", handleToastError);

    // Cleanup listeners on component unmount
    return () => {
      emitter.off("ToastSuccess", handleToastSuccess);
      emitter.off("ToastError", handleToastError);
    };
  }, [isDark]); // Dependency array ensures the effect is set up again if toast changes

  return <Toaster />;
};

export default AppMessage;
