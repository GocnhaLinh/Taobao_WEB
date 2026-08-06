import type { Brand } from '../types';

export const filterBrands = (brands: Brand[], query: string): Brand[] => {
  if (!query.trim()) return brands;
  const q = query.toLowerCase();
  return brands.filter(
    (b) =>
      b.name.toLowerCase().includes(q) ||
      (b.description && b.description.toLowerCase().includes(q)),
  );
};
