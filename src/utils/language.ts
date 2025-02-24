// Normalize language code (e.g., 'zh-CN' -> 'zh', 'en-US' -> 'en')
export function normalizeLanguageCode(lang: string): string {
  // Handle both 'zh-CN' format and 'zh_CN' format
  const baseLang = lang.split(/[-_]/)[0].toLowerCase();
  return baseLang;
}
