import { useEffect, useState } from "react";

export const useHostname = () => {
  const [hostname, setHostname] = useState<string>("");

  useEffect(() => {
    setHostname(window.location.hostname);
  }, []);

  return hostname;
};
