import { Prisma } from "@prisma/client";
import { prisma } from "../../../config/prisma";

export const createCategory = async (data: Prisma.CategoryCreateInput) => {
  return prisma.category.create({ data });
};

export const getCategories = async (
  params: { status?: string } = { status: "ACTIVE" },
) => {
  return prisma.category.findMany({
    where: {
      ...(params.status && { status: params.status }),
    },
  });
};

export const getCategoryById = async (id: string) => {
  return prisma.category.findUnique({
    where: { id },
    include: {
      products: true,
    },
  });
};

export const getCategoryBySlug = async (slug: string) => {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      products: true,
    },
  });
};

export const updateCategory = async (
  id: string,
  data: Prisma.CategoryUpdateInput,
) => {
  const updateData = { ...data };
  if (updateData.status === "ACTIVE") {
    updateData.deletedAt = null;
  }
  return prisma.category.update({
    where: { id },
    data: updateData,
  });
};

export const deleteCategory = async (
  id: string,
  options: { softDelete?: boolean } = { softDelete: true },
) => {
  if (options.softDelete !== false) {
    return prisma.category.update({
      where: { id },
      data: {
        status: "DELETED",
        deletedAt: new Date(),
      },
    });
  } else {
    // Check if products exist for this category before hard deleting
    const productCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      throw new Error(
        "Không thể xóa vĩnh viễn danh mục này vì đang có sản phẩm thuộc danh mục.",
      );
    }

    return prisma.category.delete({
      where: { id },
    });
  }
};
