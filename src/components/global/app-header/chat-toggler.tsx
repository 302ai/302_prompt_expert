import { Button } from "@/components/ui/button";
import { useChat } from "@/hooks/global/use-chat";
import { cn } from "@/lib/utils";
import { MessageCircle } from "lucide-react";

export default function ChatToggler() {
  const { isChatVisible, toggleChat } = useChat();

  return (
    <Button
      variant="icon"
      size="roundIconSm"
      onClick={toggleChat}
      className={cn(isChatVisible && "text-primary")}
    >
      <MessageCircle className="size-4" />
    </Button>
  );
}
