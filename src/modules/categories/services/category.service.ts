import { Prisma } from "@prisma/client";
import * as categoryModel from "../models/category.model";

export const createCategory = async (data: Prisma.CategoryCreateInput) => {
  // Check if slug is already used
  const existingCategory = await categoryModel.getCategoryBySlug(data.slug);
  if (existingCategory) {
    throw new Error("Slug danh mục đã tồn tại.");
  }
  return categoryModel.createCategory(data);
};

export const getCategories = async (status = "ACTIVE") => {
  return categoryModel.getCategories({ status });
};

export const getCategory = async (id: string) => {
  const category = await categoryModel.getCategoryById(id);
  if (!category) {
    throw new Error("Danh mục không tồn tại.");
  }
  return category;
};

export const getCategoryBySlug = async (slug: string) => {
  const category = await categoryModel.getCategoryBySlug(slug);
  if (!category) {
    throw new Error("Danh mục không tồn tại.");
  }
  return category;
};

export const updateCategory = async (
  id: string,
  data: Prisma.CategoryUpdateInput,
) => {
  const category = await categoryModel.getCategoryById(id);
  if (!category) {
    throw new Error("Danh mục không tồn tại để cập nhật.");
  }
  return categoryModel.updateCategory(id, data);
};

export const deleteCategory = async (id: string, softDelete = true) => {
  const category = await categoryModel.getCategoryById(id);
  if (!category) {
    throw new Error("Danh mục không tồn tại để xóa.");
  }
  return categoryModel.deleteCategory(id, { softDelete });
};
