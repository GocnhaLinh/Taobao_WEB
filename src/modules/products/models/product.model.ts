import { Prisma } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import { isDefined } from "../../../utils/prisma-helpers";

// --- Product CRUD Helpers ---

export const createProduct = async (
  data: Prisma.ProductUncheckedCreateInput,
) => {
  return prisma.product.create({ data });
};

// ✅ Detail query — dùng select + take để tránh N+1 và quá tải dữ liệu
// Limit reviews xuống 10 mới nhất, dùng select thay include cho variants
const productDetailSelect = {
  id: true,
  productName: true,
  slug: true,
  description: true,
  thumbnail: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  categoryId: true,
  brandId: true,
  category: {
    select: { id: true, name: true, slug: true, sex: true },
  },
  brand: {
    select: { id: true, name: true, logo: true, description: true },
  },
  images: {
    select: { id: true, imageUrl: true },
  },
  variants: {
    where: { status: { not: "DELETED" } },
    select: {
      id: true,
      sku: true,
      price: true,
      salePrice: true,
      stock: true,
      size: true,
      color: true,
      image: true,
      images: true,
      status: true,
      weight: true,
      originalPriceCNY: true,
      exchangeRate: true,
      shippingCostVND: true,
      totalCostVND: true,
      profitVND: true,
      productId: true,
      inventories: {
        select: { id: true, quantity: true, warehouse: true, warehouseId: true },
      },
    },
  },
  // Chỉ load 10 reviews mới nhất — tránh load hàng trăm reviews không cần thiết
  reviews: {
    take: 10,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      user: {
        select: { id: true, fullName: true, avatar: true },
      },
    },
  },
} as const;

export const getProductById = async (id: string) => {
  return prisma.product.findUnique({
    where: { id },
    select: productDetailSelect,
  });
};

export const getProductBySlug = async (slug: string) => {
  return prisma.product.findUnique({
    where: { slug },
    select: productDetailSelect,
  });
};

// ✅ Lightweight list query — dùng select thay include, KHÔNG load inventories
// Tránh N+1 problem khi có nhiều sản phẩm (100 products × 3 variants = 300+ queries)
export const getProducts = async (
  params: {
    categoryId?: string;
    brandId?: string;
    status?: string;
    skip?: number;
    take?: number;
  } = {},
) => {
  const { categoryId, brandId, status, skip, take } = params;
  return prisma.product.findMany({
    where: {
      ...(isDefined(categoryId) && { categoryId }),
      ...(isDefined(brandId) && { brandId }),
      ...(status ? { status } : { status: { not: "DELETED" } }),
    },
    select: {
      id: true,
      productName: true,
      slug: true,
      description: true,
      thumbnail: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      categoryId: true,
      brandId: true,
      category: {
        select: { id: true, name: true, slug: true },
      },
      brand: {
        select: { id: true, name: true, logo: true },
      },
      images: {
        select: { id: true, imageUrl: true },
      },
      // Chỉ load thông tin cơ bản của variants — KHÔNG load inventories
      variants: {
        where: { status: { not: "DELETED" } },
        select: {
          id: true,
          sku: true,
          price: true,
          salePrice: true,
          stock: true,
          size: true,
          color: true,
          image: true,
          images: true,
          status: true,
          weight: true,
          originalPriceCNY: true,
          exchangeRate: true,
          shippingCostVND: true,
          totalCostVND: true,
          profitVND: true,
          productId: true,
        },
      },
    },
    skip,
    take,
    orderBy: { createdAt: "desc" },
  });
};

export const updateProduct = async (
  id: string,
  data: Prisma.ProductUpdateInput,
) => {
  return prisma.product.update({
    where: { id },
    data,
  });
};

export const deleteProduct = async (
  id: string,
  options: { softDelete?: boolean } = { softDelete: true },
) => {
  if (options.softDelete !== false) {
    return prisma.product.update({
      where: { id },
      data: { status: "DELETED", deletedAt: new Date() },
    });
  } else {
    // ✅ Dùng $transaction để đảm bảo tất cả xóa thành công hoặc rollback toàn bộ
    // Tránh tình trạng xóa giữa chừng (partial delete) gây dữ liệu mồ côi
    return prisma.$transaction(async (tx) => {
      const variants = await tx.productVariant.findMany({
        where: { productId: id },
        select: { id: true },
      });
      const variantIds = variants.map((v) => v.id);

      if (variantIds.length > 0) {
        await tx.inventory.deleteMany({ where: { variantId: { in: variantIds } } });
        await tx.cartItem.deleteMany({ where: { variantId: { in: variantIds } } });
        await tx.orderItem.deleteMany({ where: { variantId: { in: variantIds } } });
      }

      await tx.productVariant.deleteMany({ where: { productId: id } });
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.review.deleteMany({ where: { productId: id } });

      return tx.product.delete({ where: { id } });
    });
  }
};

// --- Product Variant CRUD Helpers ---

export const createVariant = async (
  data: Prisma.ProductVariantUncheckedCreateInput,
) => {
  return prisma.productVariant.create({ data });
};

export const getVariantById = async (id: string) => {
  return prisma.productVariant.findUnique({
    where: { id },
    include: {
      inventories: true,
      product: true,
    },
  });
};

export const getVariantBySku = async (sku: string) => {
  return prisma.productVariant.findUnique({
    where: { sku },
    include: {
      inventories: true,
      product: true,
    },
  });
};

export const updateVariant = async (
  id: string,
  data: Prisma.ProductVariantUpdateInput,
) => {
  return prisma.productVariant.update({
    where: { id },
    data,
  });
};

export const deleteVariant = async (
  id: string,
  options: { softDelete?: boolean } = { softDelete: false },
) => {
  if (options.softDelete === true) {
    return prisma.productVariant.update({
      where: { id },
      data: { status: "DELETED", deletedAt: new Date() },
    });
  } else {
    await prisma.inventory.deleteMany({
      where: { variantId: id },
    });
    await prisma.cartItem.deleteMany({
      where: { variantId: id },
    });
    await prisma.orderItem.deleteMany({
      where: { variantId: id },
    });
    return prisma.productVariant.delete({
      where: { id },
    });
  }
};
