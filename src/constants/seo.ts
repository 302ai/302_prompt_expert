export type SEOData = {
  supportLanguages: string[];
  fallbackLanguage: string;
  languages: Record<
    string,
    { title: string; description: string; image: string }
  >;
};

export const SEO_DATA: SEOData = {
  // TODO: Change to your own support languages
  supportLanguages: ["zh", "en", "ja"],
  fallbackLanguage: "en",
  // TODO: Change to your own SEO data
  languages: {
    zh: {
      title: "AI 提示词专家2.0",
      description: "AI 驱动的高级提示词生成工具",
      image: "/images/global/prompter_zh_tool_logo.png",
    },
    en: {
      title: "AI Prompt Expert",
      description: "AI-powered advanced prompt generation tool",
      image: "/images/global/prompter_en_tool_logo.png",
    },
    ja: {
      title: "AIプロンプトの専門家",
      description: "AI搭載の高度なプロンプト生成ツール。",
      image: "/images/global/prompter_ja_tool_logo.png",
    },
  },
};
