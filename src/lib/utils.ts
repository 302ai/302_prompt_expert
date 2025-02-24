import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export function extractCodeBlocksContent(markdown: string) {
  // 正则表达式匹配代码块
  const codeBlocksRegex =
    /(?:```([a-zA-Z0-9]+)?\s*([\s\S]*?)\s*```|```([a-zA-Z0-9]+)?\s*([\s\S]+?)\s*```)(?![^`]*```)|```([a-zA-Z0-9]+)?\s*([\s\S]+)/gm;
  let match;

  
  const codeBlocksContent = [];
  // 遍历所有匹配项
  while ((match = codeBlocksRegex.exec(markdown))) {
    // 选择第一个非空的捕获组
    const codeBlockContent =
      match[6] || match[5] || match[4] || match[3] || match[2] || match[1];
    if (codeBlockContent) {
      codeBlocksContent.push(codeBlockContent);
    }
  }
  return codeBlocksContent;
}