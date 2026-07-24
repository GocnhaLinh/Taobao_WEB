/**
 * Utility functions for generating auto SKU codes in format:
 * SKU-<CHỮ_VIẾT_TẮT_DANH_MỤC>-<MÃ_RANDOM>
 */

export const getCategoryCode = (categoryName?: string): string => {
  if (!categoryName || !categoryName.trim()) return "SP";

  // Remove Vietnamese diacritics / accents
  const cleanStr = categoryName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim();

  if (!cleanStr) return "SP";

  const words = cleanStr.split(/\s+/).filter(Boolean);

  // Single word: e.g. "Giày" -> "GIAY", "Balo" -> "BALO"
  if (words.length === 1) {
    return words[0].substring(0, 6).toUpperCase();
  }

  // Multiple words: e.g. "Thời Trang Nam" -> "TTN" or "Giày Nam" -> "GN"
  const acronym = words.map((w) => w[0]).join("").toUpperCase();
  if (acronym.length >= 2 && acronym.length <= 4) {
    return acronym;
  }

  return cleanStr.replace(/\s+/g, "").substring(0, 6).toUpperCase();
};

export const generateAutoSku = (categoryName?: string): string => {
  const code = getCategoryCode(categoryName);
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `SKU-${code}-${randomDigits}`;
};
