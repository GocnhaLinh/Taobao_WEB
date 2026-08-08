import type { Product } from '../../../../types';
import type { ProductMetrics } from '../types';

export const filterProducts = (products: Product[], searchQuery: string): Product[] => {
  if (!searchQuery.trim()) return products;
  const q = searchQuery.toLowerCase().trim();

  return products.filter((p) => {
    const matchName = p.productName?.toLowerCase().includes(q);
    const matchCategory = p.category?.name?.toLowerCase().includes(q);
    const matchBrand = p.brand?.name?.toLowerCase().includes(q);

    const matchVariantSku = p.variants?.some((v) => v.sku?.toLowerCase().includes(q));

    return matchName || matchCategory || matchBrand || matchVariantSku;
  });
};

export const calculateProductMetrics = (
  activeProducts: Product[],
  deletedProducts: Product[]
): ProductMetrics => {
  let outOfStockCount = 0;
  let totalVariantsCount = 0;

  activeProducts.forEach((p) => {
    const variants = p.variants || [];
    totalVariantsCount += variants.length;

    const totalStock = variants.reduce((acc, v) => acc + (v.stock || 0), 0);
    if (variants.length === 0 || totalStock === 0) {
      outOfStockCount++;
    }
  });

  return {
    totalProducts: activeProducts.length + deletedProducts.length,
    activeProducts: activeProducts.length,
    outOfStockCount,
    deletedProductsCount: deletedProducts.length,
    totalVariantsCount,
  };
};
