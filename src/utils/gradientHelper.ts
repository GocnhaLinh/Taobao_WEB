// Explicit color overrides for known sex values
const SEX_COLOR_MAP: Record<string, string> = {
  // Tiếng Việt
  'Nam': 'bg-gradient-to-r from-blue-500/20 to-cyan-600/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
  'Nữ': 'bg-gradient-to-r from-rose-500/20 to-pink-600/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
  'Trẻ em': 'bg-gradient-to-r from-amber-500/20 to-orange-600/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  'Khác': 'bg-gradient-to-r from-emerald-500/20 to-teal-600/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  'Unisex': 'bg-gradient-to-r from-indigo-500/20 to-blue-600/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
  // Tiếng Anh
  'MALE': 'bg-gradient-to-r from-blue-500/20 to-cyan-600/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
  'FEMALE': 'bg-gradient-to-r from-rose-500/20 to-pink-600/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
  'KID': 'bg-gradient-to-r from-amber-500/20 to-orange-600/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  'KIDS': 'bg-gradient-to-r from-amber-500/20 to-orange-600/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  'OTHER': 'bg-gradient-to-r from-emerald-500/20 to-teal-600/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  'UNISEX': 'bg-gradient-to-r from-indigo-500/20 to-blue-600/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
};

// Fallback gradient presets for any other custom values (12 màu khác nhau)
const GRADIENT_PRESETS = [
  'bg-gradient-to-r from-violet-500/20 to-purple-600/15 text-violet-600 dark:text-violet-400 border-violet-500/30',
  'bg-gradient-to-r from-fuchsia-500/20 to-pink-600/15 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/30',
  'bg-gradient-to-r from-lime-500/20 to-green-600/15 text-lime-600 dark:text-lime-400 border-lime-500/30',
  'bg-gradient-to-r from-orange-500/20 to-red-600/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
  'bg-gradient-to-r from-teal-500/20 to-emerald-600/15 text-teal-600 dark:text-teal-400 border-teal-500/30',
  'bg-gradient-to-r from-sky-500/20 to-indigo-600/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
  'bg-gradient-to-r from-cyan-500/20 to-sky-600/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
  'bg-gradient-to-r from-purple-500/20 to-fuchsia-600/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
  'bg-gradient-to-r from-pink-500/20 to-rose-600/15 text-pink-600 dark:text-pink-400 border-pink-500/30',
  'bg-gradient-to-r from-green-500/20 to-lime-600/15 text-green-600 dark:text-green-400 border-green-500/30',
  'bg-gradient-to-r from-yellow-500/20 to-amber-600/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
  'bg-gradient-to-r from-red-500/20 to-orange-600/15 text-red-600 dark:text-red-400 border-red-500/30',
];

/**
 * Returns a gradient class for the given sex value.
 * - Known values (Nam, Nữ, Unisex, MALE, FEMALE...) get explicit colors via SEX_COLOR_MAP
 * - Unknown custom values get a deterministic random gradient from GRADIENT_PRESETS
 */
export const getGradientClass = (key: string): string => {
  // Check if there's an explicit color mapping
  const explicit = SEX_COLOR_MAP[key];
  if (explicit) return explicit;

  // Fallback: deterministic hash-based random
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash) + key.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % GRADIENT_PRESETS.length;
  return GRADIENT_PRESETS[index];
};
