import type { Language } from '../../../../lib/i18n';
import type { Warehouse } from '../../../../types';

/**
 * Builds the "supported areas" string shown in the warehouses metric card:
 * up to 3 unique provinces, falling back to `fallbackLabel` when warehouses
 * exist without a province list, or "—" when there are no warehouses.
 */
export const getSupportedAreas = (warehouses: Warehouse[], fallbackLabel: string): string => {
  const areas = new Set<string>();
  warehouses.forEach((wh) =>
    (wh.supportedProvinces || []).forEach((province) => areas.add(province))
  );
  return [...areas].slice(0, 3).join(', ') || (warehouses.length > 0 ? fallbackLabel : '—');
};

/** Locale-aware short month formatter (e.g. "Jan", "thg 1", "1月"). */
export const createMonthLabelFormatter = (language: Language): Intl.DateTimeFormat =>
  new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : language, { month: 'short' });

/** Formats a month number (1..12) into a short label using the given formatter. */
export const formatMonthLabel = (formatter: Intl.DateTimeFormat, month: number): string =>
  formatter.format(new Date(2000, Math.min(Math.max(month, 1), 12) - 1, 1));

/** First letter of a name, uppercased — used for avatar placeholders. */
export const getAvatarInitial = (fullName: string): string =>
  fullName.trim().charAt(0).toUpperCase() || '?';
