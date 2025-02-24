import { useIsHideBrand } from "@/hooks/global/use-is-hide-brand";
import { chatVisibleAtom } from "@/stores/slices/chat_store";
import { useAtom } from "jotai";

export const useChat = () => {
  const isHideBrand = useIsHideBrand();
  const [isChatVisible, setIsChatVisible] = useAtom(chatVisibleAtom);

  const shouldShowChat = !isHideBrand && isChatVisible;

  const toggleChat = () => {
    setIsChatVisible(!isChatVisible);
    if (isChatVisible) {
      document.getElementById("ss-chat-p")?.remove();
    }
  };

  return {
    isChatVisible,
    shouldShowChat,
    toggleChat,
  };
};
