import { Prisma } from "@prisma/client";
import { isDefined } from "../../../utils/prisma-helpers";
import * as productModel from "../models/product.model";
import { prisma } from "../../../config/prisma";
import {
  deleteFromCloudinary,
  extractPublicId,
} from "../../../middlewares/upload.middleware";

// --- In-memory cache cho fee config (TTL: 5 phút) ---
// Fee config (tỷ giá, phí ship) hiếm khi thay đổi — không cần query DB mỗi request
let cachedFeeConfig: { exchangeRate: number; shippingCnPerKg: number } | null = null;
let lastFetch = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour — tỷ giá/phí ship hiếm thay đổi, admin update sẽ bust cache thủ công qua invalidateFeeConfigCache()

// Xóa cache thủ công khi admin cập nhật fee/exchangeRate
export const invalidateFeeConfigCache = () => {
  cachedFeeConfig = null;
  lastFetch = 0;
};

const getActiveFeeConfig = async (): Promise<{
  exchangeRate: number;
  shippingCnPerKg: number;
}> => {
  // Trả về cache nếu còn hạn — tránh query DB lặp lại
  if (cachedFeeConfig && Date.now() - lastFetch < CACHE_TTL) {
    return cachedFeeConfig;
  }

  try {
    const latestExchangeRate = await prisma.exchangeRate.findFirst({
      where: { status: { not: "DELETED" } },
      orderBy: { createdAt: "desc" },
    });

    const latestFee = await prisma.fee.findFirst({
      where: { status: { not: "DELETED" } },
      orderBy: { updatedAt: "desc" },
    });

    const exchangeRate =
      latestExchangeRate && latestExchangeRate.rate > 0
        ? latestExchangeRate.rate
        : latestFee && latestFee.exchangeRate > 0
          ? latestFee.exchangeRate
          : 1;

    const shippingCnPerKg = latestFee?.shippingCnPerKg || 0;

    cachedFeeConfig = { exchangeRate, shippingCnPerKg };
    lastFetch = Date.now();

    return cachedFeeConfig;
  } catch (error) {
    return { exchangeRate: 1, shippingCnPerKg: 0 };
  }
};

// ✅ Format đầy đủ — dùng cho detail (GET /api/products/:id)
// Tính lại totalCostVND, profitVND, shippingCostVND theo tỷ giá hiện tại
const formatProductWithPrice = (
  product: any,
  feeConfig: { exchangeRate: number; shippingCnPerKg: number },
) => {
  if (!product) return null;
  const { exchangeRate, shippingCnPerKg } = feeConfig;

  const variants = (product.variants || []).map((v: any) => {
    const priceVnd = Number(v.price || 0); // Giá bán ra thị trường GIỮ NGUYÊN (Admin chỉ tự thao tác thay đổi giá bán)
    const salePriceVnd = v.salePrice ? Number(v.salePrice) : null;
    const weight = v.weight ? Number(v.weight) : 0;
    const originalPriceCNY = v.originalPriceCNY
      ? Number(v.originalPriceCNY)
      : 0;

    // Phí ship TQ ➔ VN tự động cập nhật theo số kg * Phí vận chuyển hệ thống
    const rawShip =
      weight > 0 && shippingCnPerKg > 0 ? weight * shippingCnPerKg : 0;
    const shippingCostVND =
      rawShip > 0 ? Math.round(rawShip) : v.shippingCostVND || 0;

    // Giá gốc về kho (Giá vốn về tay) = (Giá NDT * Tỷ giá hệ thống) + Phí ship TQ->VN
    const totalCost =
      originalPriceCNY > 0 && exchangeRate > 0
        ? Math.round(originalPriceCNY * exchangeRate + rawShip)
        : v.totalCostVND !== undefined && v.totalCostVND !== null
          ? v.totalCostVND
          : null;

    // Lợi nhuận = Giá bán thị trường (priceVnd - giữ nguyên) - Giá vốn về tay (totalCost)
    const profitVND =
      totalCost !== null ? Math.round(priceVnd - totalCost) : v.profitVND;

    return {
      ...v,
      price: priceVnd, // Giá bán giữ nguyên
      salePrice: salePriceVnd,
      shippingCostVND,
      totalCostVND: totalCost,
      profitVND,
      exchangeRate: exchangeRate || v.exchangeRate,
    };
  });

  const firstVariant = variants.length > 0 ? variants[0] : null;

  return {
    ...product,
    exchangeRate,
    price: firstVariant ? firstVariant.price : 0,
    salePrice: firstVariant ? firstVariant.salePrice : null,
    variants,
  };
};

// ✅ Format danh sách (GET /api/products)
// Tự động tính toán shippingCostVND, totalCostVND, profitVND nếu DB lưu null
const formatProductBasic = (
  product: any,
  feeConfig?: { exchangeRate: number; shippingCnPerKg: number },
) => {
  if (!product) return null;

  const exchangeRate = feeConfig?.exchangeRate || 0;
  const shippingCnPerKg = feeConfig?.shippingCnPerKg || 0;

  const variants = (product.variants || []).map((v: any) => {
    const priceVnd = Number(v.price || 0);
    const salePriceVnd = v.salePrice ? Number(v.salePrice) : null;
    const weight = v.weight ? Number(v.weight) : 0;
    const originalPriceCNY = v.originalPriceCNY ? Number(v.originalPriceCNY) : 0;

    const rawShip = weight > 0 && shippingCnPerKg > 0 ? weight * shippingCnPerKg : 0;
    const shippingCostVND = rawShip > 0 ? Math.round(rawShip) : (v.shippingCostVND || 0);

    const totalCost = originalPriceCNY > 0 && exchangeRate > 0
      ? Math.round(originalPriceCNY * exchangeRate + rawShip)
      : (v.totalCostVND !== undefined && v.totalCostVND !== null ? v.totalCostVND : null);

    const profitVND = totalCost !== null ? Math.round(priceVnd - totalCost) : v.profitVND;

    return {
      id: v.id,
      productId: v.productId ?? product.id,
      sku: v.sku,
      price: priceVnd,
      salePrice: salePriceVnd,
      stock: v.stock ?? 0,
      size: v.size ?? null,
      color: v.color ?? null,
      image: v.image ?? null,
      status: v.status,
      weight,
      originalPriceCNY: originalPriceCNY || null,
      exchangeRate: exchangeRate || v.exchangeRate || null,
      shippingCostVND,
      totalCostVND: totalCost,
      profitVND,
      images: v.images || [],
    };
  });

  const firstVariant = variants[0] ?? null;

  return {
    ...product,
    price: firstVariant ? firstVariant.price : 0,
    salePrice: firstVariant ? firstVariant.salePrice : null,
    variants,
  };
};
// Check Category
export const createProduct = async (data: any) => {
  const { images, initialVariant, ...productData } = data;

  // 1. Parallel validation queries (Category, Brand, Slug & FeeConfig in 1 Promise.all call)
  const [category, brand, existingProduct, feeConfig] = await Promise.all([
    productData.categoryId
      ? prisma.category.findUnique({ where: { id: productData.categoryId } })
      : Promise.resolve(null),
    productData.brandId
      ? prisma.brand.findUnique({ where: { id: productData.brandId } })
      : Promise.resolve(null),
    productModel.getProductBySlug(productData.slug),
    getActiveFeeConfig(),
  ]);

  if (productData.categoryId && !category) {
    throw new Error(`Danh mục (categoryId: ${productData.categoryId}) không tồn tại.`);
  }

  if (productData.brandId && !brand) {
    throw new Error(`Thương hiệu (brandId: ${productData.brandId}) không tồn tại.`);
  }

  if (existingProduct) {
    throw new Error("Slug sản phẩm đã tồn tại.");
  }

  const hasInitialVariant = Boolean(
    initialVariant &&
      (typeof initialVariant.price === "number" ||
        Boolean(initialVariant.sku) ||
        Boolean(initialVariant.size) ||
        Boolean(initialVariant.color) ||
        initialVariant.stock !== undefined)
  );

  const status =
    productData.status || (hasInitialVariant ? "ACTIVE" : "INACTIVE");

  const product = await productModel.createProduct({
    ...productData,
    status,
  });

  // 2. Create images and initial variant
  if (images && Array.isArray(images) && images.length > 0) {
    await prisma.productImage.createMany({
      data: images.map((url: string) => ({
        productId: product.id,
        imageUrl: url,
      })),
    });
  }

  if (hasInitialVariant) {
    await addProductVariant({
      productId: product.id,
      sku: initialVariant.sku || `SKU-${Date.now()}`,
      price: Number(initialVariant.price || 0),
      originalPriceCNY: initialVariant.originalPriceCNY
        ? Number(initialVariant.originalPriceCNY)
        : undefined,
      exchangeRate: initialVariant.exchangeRate
        ? Number(initialVariant.exchangeRate)
        : undefined,
      weight: initialVariant.weight
        ? Number(initialVariant.weight)
        : undefined,
      shippingCostVND: initialVariant.shippingCostVND
        ? Number(initialVariant.shippingCostVND)
        : undefined,
      stock: initialVariant.stock !== undefined ? Number(initialVariant.stock) : 10,
      size: initialVariant.size || undefined,
      color: initialVariant.color || undefined,
      image: initialVariant.image || undefined,
      images: initialVariant.images || [],
    });
  }

  const createdProduct = await productModel.getProductById(product.id);
  return formatProductWithPrice(createdProduct, feeConfig);
};

export const getProduct = async (id: string) => {
  const product = await productModel.getProductById(id);
  if (!product) {
    throw new Error("Sản phẩm không tồn tại.");
  }
  const feeConfig = await getActiveFeeConfig();
  return formatProductWithPrice(product, feeConfig);
};

export const getProductById = getProduct;

export const getProductBySlug = async (slug: string) => {
  const product = await productModel.getProductBySlug(slug);
  if (!product) {
    throw new Error("Sản phẩm không tồn tại.");
  }
  const feeConfig = await getActiveFeeConfig();
  return formatProductWithPrice(product, feeConfig);
};

// ✅ Endpoint danh sách nhẹ (GET /api/products)
// Dùng getProducts với select — KHÔNG load inventories, giảm tải query
export const listProducts = async (
  params: {
    categoryId?: string;
    brandId?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {},
) => {
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? params.limit : 10;
  const skip = (page - 1) * limit;

  const whereCondition = {
    ...(isDefined(params.categoryId) && { categoryId: params.categoryId }),
    ...(isDefined(params.brandId) && { brandId: params.brandId }),
    ...(params.status ? { status: params.status } : { status: { not: "DELETED" as const } }),
  };

  const [products, total, feeConfig] = await Promise.all([
    productModel.getProducts({
      categoryId: params.categoryId,
      brandId: params.brandId,
      status: params.status,
      skip,
      take: limit,
    }),
    prisma.product.count({ where: whereCondition }),
    getActiveFeeConfig(),
  ]);

  const formattedProducts = products.map((p) => formatProductBasic(p, feeConfig));

  return {
    products: formattedProducts,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const updateProduct = async (id: string, data: any) => {
  const product = await productModel.getProductById(id);
  if (!product) {
    throw new Error("Sản phẩm không tồn tại để cập nhật.");
  }

  const { images, ...productData } = data;

  // If the thumbnail is updated, delete the old thumbnail
  if (
    productData.thumbnail &&
    typeof productData.thumbnail === "string" &&
    product.thumbnail &&
    product.thumbnail !== productData.thumbnail
  ) {
    const oldPublicId = extractPublicId(product.thumbnail);
    if (oldPublicId) {
      await deleteFromCloudinary(oldPublicId).catch((err) =>
        console.error(
          `Lỗi khi xóa ảnh cũ ${oldPublicId} trên Cloudinary:`,
          err,
        ),
      );
    }
  }

  await productModel.updateProduct(id, productData);

  if (images && Array.isArray(images)) {
    if (product.images && product.images.length > 0) {
      const currentUrls = product.images.map((img) => img.imageUrl);
      const urlsToDelete = currentUrls.filter((url) => !images.includes(url));

      for (const url of urlsToDelete) {
        const publicId = extractPublicId(url);
        if (publicId) {
          await deleteFromCloudinary(publicId).catch((err) =>
            console.error(
              `Lỗi khi xóa ảnh phụ ${publicId} trên Cloudinary:`,
              err,
            ),
          );
        }
      }
    }

    await prisma.productImage.deleteMany({
      where: { productId: id },
    });

    if (images.length > 0) {
      await prisma.productImage.createMany({
        data: images.map((url: string) => ({
          productId: id,
          imageUrl: url,
        })),
      });
    }
  }

  const updatedProduct = await productModel.getProductById(id);
  const feeConfig = await getActiveFeeConfig();
  return formatProductWithPrice(updatedProduct, feeConfig);
};

export const deleteProduct = async (id: string, softDelete = true) => {
  const product = await productModel.getProductById(id);
  if (!product) {
    throw new Error("Sản phẩm không tồn tại để xóa.");
  }

  if (!softDelete) {
    if (product.thumbnail) {
      const thumbPublicId = extractPublicId(product.thumbnail);
      if (thumbPublicId) {
        await deleteFromCloudinary(thumbPublicId).catch((err) =>
          console.error(
            `Lỗi khi xóa thumbnail ${thumbPublicId} trên Cloudinary:`,
            err,
          ),
        );
      }
    }

    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        const imgPublicId = extractPublicId(img.imageUrl);
        if (imgPublicId) {
          await deleteFromCloudinary(imgPublicId).catch((err) =>
            console.error(
              `Lỗi khi xóa ảnh chi tiết ${imgPublicId} trên Cloudinary:`,
              err,
            ),
          );
        }
      }
    }
  }

  return productModel.deleteProduct(id, { softDelete });
};

// --- Variant Management ---

export const addProductVariant = async (data: any) => {
  const { images, ...variantData } = data;

  const product = await productModel.getProductById(variantData.productId);
  if (!product) {
    throw new Error("Sản phẩm không tồn tại để thêm phiên bản.");
  }

  const existingVariant = await productModel.getVariantBySku(variantData.sku);
  if (existingVariant) {
    throw new Error("Mã SKU đã tồn tại trong hệ thống.");
  }

  const originalPriceCNY = variantData.originalPriceCNY
    ? Number(variantData.originalPriceCNY)
    : null;
  let exchangeRate = variantData.exchangeRate
    ? Number(variantData.exchangeRate)
    : null;
  let shippingCostVND = variantData.shippingCostVND
    ? Number(variantData.shippingCostVND)
    : 0;
  const weight = variantData.weight ? Number(variantData.weight) : null;
  const price = Number(variantData.price || 0);

  // If exchangeRate or shippingCostVND is missing, fetch live Fee config from DB
  let rawShip = 0;
  if (weight && weight > 0) {
    const feeCfg = await getActiveFeeConfig();
    rawShip = feeCfg.shippingCnPerKg > 0 ? weight * feeCfg.shippingCnPerKg : 0;
    if (!shippingCostVND && rawShip > 0) {
      shippingCostVND = Math.round(rawShip);
    }
  } else {
    rawShip = shippingCostVND;
  }

  if (!exchangeRate) {
    const feeCfg = await getActiveFeeConfig();
    if (feeCfg.exchangeRate > 0) {
      exchangeRate = feeCfg.exchangeRate;
    }
  }

  let totalCostVND: number | null = null;
  let profitVND: number | null = null;

  if (originalPriceCNY && exchangeRate) {
    totalCostVND = Math.round(originalPriceCNY * exchangeRate + rawShip);
    profitVND = Math.round(price - totalCostVND);
  }

  const createdVariant = await productModel.createVariant({
    ...variantData,
    images: images && Array.isArray(images) ? images : [],
    exchangeRate,
    shippingCostVND,
    weight,
    price,
    originalPriceCNY,
    totalCostVND,
    profitVND,
  });

  // Automatically activate product if it was INACTIVE
  if (product.status === "INACTIVE") {
    await productModel.updateProduct(product.id, { status: "ACTIVE" });
  }

  return createdVariant;
};

export const updateProductVariant = async (id: string, data: any) => {
  const { images, ...variantData } = data;

  const variant = await productModel.getVariantById(id);
  if (!variant) {
    throw new Error("Phiên bản sản phẩm không tồn tại để cập nhật.");
  }

  const originalPriceCNY =
    variantData.originalPriceCNY !== undefined
      ? variantData.originalPriceCNY
        ? Number(variantData.originalPriceCNY)
        : null
      : variant.originalPriceCNY;

  // Lấy tỷ giá: ưu tiên giá trị gửi lên, fallback về giá trị cũ của biến thể,
  // nếu cả hai đều null/0 thì tự động lấy từ Fee Config hệ thống
  let resolvedExchangeRate: number | null =
    variantData.exchangeRate !== undefined
      ? variantData.exchangeRate
        ? Number(variantData.exchangeRate)
        : null
      : variant.exchangeRate
        ? Number(variant.exchangeRate)
        : null;

  const weight =
    variantData.weight !== undefined
      ? variantData.weight
        ? Number(variantData.weight)
        : null
      : variant.weight
        ? Number(variant.weight)
        : null;

  const price =
    variantData.price !== undefined ? Number(variantData.price) : variant.price;

  // Nếu exchangeRate không hợp lệ (null hoặc 0), tự động lấy từ Fee Config hệ thống
  let feeConfig: { exchangeRate: number; shippingCnPerKg: number } | null = null;
  if (!resolvedExchangeRate || resolvedExchangeRate <= 0) {
    feeConfig = await getActiveFeeConfig();
    if (feeConfig.exchangeRate > 0) {
      resolvedExchangeRate = feeConfig.exchangeRate;
    }
  }

  // Tính lại phí ship TQ→VN theo trọng lượng + phí ship/kg hệ thống
  let resolvedShippingCostVND: number =
    variantData.shippingCostVND !== undefined
      ? variantData.shippingCostVND
        ? Number(variantData.shippingCostVND)
        : 0
      : variant.shippingCostVND || 0;

  if (weight && weight > 0) {
    if (!feeConfig) feeConfig = await getActiveFeeConfig();
    if (feeConfig.shippingCnPerKg > 0) {
      const rawShip = weight * feeConfig.shippingCnPerKg;
      resolvedShippingCostVND = Math.round(rawShip);
    }
  }

  let totalCostVND: number | null = null;
  let profitVND: number | null = null;

  if (originalPriceCNY && resolvedExchangeRate) {
    totalCostVND = Math.round(
      originalPriceCNY * resolvedExchangeRate + resolvedShippingCostVND,
    );
    profitVND = Math.round(price - totalCostVND);
  }

  const updatedVariant = await productModel.updateVariant(id, {
    ...variantData,
    ...(Array.isArray(images) ? { images } : {}),
    // Luôn ghi lại tỷ giá và phí ship đã được resolve vào DB
    exchangeRate: resolvedExchangeRate,
    shippingCostVND: resolvedShippingCostVND,
    totalCostVND,
    profitVND,
  });

  // Clean up any legacy ProductImage records that were incorrectly created for variant images
  const newImages = Array.isArray(images) ? images : [];
  const oldImages = Array.isArray(variant.images) ? variant.images : [];
  const allVariantUrls = Array.from(
    new Set(
      [...newImages, ...oldImages, variant.image, variantData.image].filter(
        Boolean,
      ),
    ),
  );

  if (allVariantUrls.length > 0) {
    await prisma.productImage.deleteMany({
      where: {
        productId: variant.productId,
        imageUrl: { in: allVariantUrls as string[] },
      },
    });
  }

  return updatedVariant;
};

export const deleteProductVariant = async (id: string, softDelete = true) => {
  const variant = await productModel.getVariantById(id);
  if (!variant) {
    throw new Error("Phiên bản sản phẩm không tồn tại để xóa.");
  }
  const deleted = await productModel.deleteVariant(id, { softDelete });

  // Sync product status: set to INACTIVE if 0 active variants remain
  const remainingProduct = await productModel.getProductById(variant.productId);
  if (remainingProduct) {
    const activeVariants = (remainingProduct.variants || []).filter(
      (v: any) => v.status !== "DELETED" && v.id !== id,
    );
    if (activeVariants.length === 0) {
      await productModel.updateProduct(remainingProduct.id, {
        status: "INACTIVE",
      });
    }
  }

  return deleted;
};
