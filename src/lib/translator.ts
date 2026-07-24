/**
 * Auto Translation Utility using free Google Translate API with local fallback
 */
export async function autoTranslateText(text: string, targetLang: 'vi' | 'en' | 'zh'): Promise<string> {
  if (!text || !text.trim()) return '';

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(
      text.trim()
    )}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Translation failed');
    const data = await res.json();
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      return data[0][0][0];
    }
  } catch (error) {
    console.warn('Google Translate API fallback used:', error);
  }

  // Fallback if network/offline
  return text;
}
