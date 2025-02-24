import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, value, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

    // 合并 ref
    React.useImperativeHandle(ref, () => textareaRef.current!);

    // 动态调整高度的函数
    const adjustHeight = () => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "35px"; // 重置高度以获取scrollHeight
        textarea.style.height = `${Math.min(textarea.scrollHeight, 210) || 35}px`; // 设置高度，最大600px
        textarea.style.overflowY = textarea.scrollHeight > 210 ? "auto" : "hidden"; // 根据高度设置 overflow
      }
    };

    // 使用 useEffect 来在组件挂载时调整初始高度
    React.useEffect(() => {
      adjustHeight(); // 初始调整高度
    }, [value, className]);

    return (
      <textarea
        ref={textareaRef}
        className={cn(
          "flex h-auto max-h-[600px] w-full resize-none rounded-md border outline-none border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground  disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onInput={adjustHeight}
        value={value} // 当输入内容变化时调整高度
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
