import type { CategoryLabel } from '../types';

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const mapCategoryLabelsToMap = (categoryLabels: CategoryLabel[]): Record<string, string> => {
  const map: Record<string, string> = {};
  categoryLabels.forEach((lbl) => {
    map[lbl.name] = lbl.icon || '🏷️';
  });
  return map;
};
