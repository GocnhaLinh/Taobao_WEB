import { Request, Response } from "express";
import * as categoryLabelService from "../services/categoryLabel.service";

export const getCategoryLabels = async (req: Request, res: Response) => {
  try {
    const labels = await categoryLabelService.getCategoryLabels();
    res.json(labels);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi server" });
  }
};

export const createCategoryLabel = async (req: Request, res: Response) => {
  try {
    const { name, icon } = req.body;
    const label = await categoryLabelService.addCategoryLabel({ name, icon });
    res.status(201).json(label);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Lỗi khi thêm nhãn đối tượng" });
  }
};

export const updateCategoryLabel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, icon } = req.body;
    const label = await categoryLabelService.editCategoryLabel(id, { name, icon });
    res.json(label);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Lỗi khi sửa nhãn đối tượng" });
  }
};

export const deleteCategoryLabel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await categoryLabelService.removeCategoryLabel(id);
    res.json({ message: "Xóa nhãn đối tượng thành công." });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Lỗi khi xóa nhãn đối tượng" });
  }
};
