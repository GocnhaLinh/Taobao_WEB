import { Request, Response } from "express";
import * as categoryService from "../services/category.service";

export const createCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, sex, slug, status } = req.body;

    if (!name || !slug) {
      res.status(400).json({ error: "Tên danh mục và slug là bắt buộc." });
      return;
    }

    const category = await categoryService.createCategory({
      name,
      sex,
      slug,
      status,
    });
    res.status(201).json(category);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getCategories = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const status = req.query.status as string | undefined;
    const categories = await categoryService.getCategories(status);
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCategoryById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await categoryService.getCategory(id);
    res.json(category);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const getCategoryBySlug = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { slug } = req.params;
    const category = await categoryService.getCategoryBySlug(slug);
    res.json(category);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, sex, slug, status } = req.body;
    const category = await categoryService.updateCategory(id, {
      name,
      sex,
      slug,
      status,
    });
    res.json(category);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const softDelete = req.query.softDelete !== "false";
    await categoryService.deleteCategory(id, softDelete);
    res.json({ message: "Xóa danh mục thành công." });
  } catch (error: any) {
    let msg = error.message || "Xóa danh mục thất bại.";
    if (
      msg.includes("CategoryToProduct") ||
      msg.includes("invocation") ||
      msg.includes("foreign key") ||
      msg.includes("Prisma")
    ) {
      msg = "Không thể xóa vĩnh viễn danh mục này vì đang có sản phẩm thuộc danh mục.";
    }
    res.status(400).json({ error: msg });
  }
};
