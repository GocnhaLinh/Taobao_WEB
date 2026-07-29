import * as categoryLabelModel from "../models/categoryLabel.model";

export const getCategoryLabels = async () => {
  return categoryLabelModel.getAllLabels();
};

export const addCategoryLabel = async (data: {
  name: string;
  icon?: string;
}) => {
  if (!data.name || !data.name.trim()) {
    throw new Error("Tên nhãn đối tượng phân loại là bắt buộc.");
  }

  const trimmedName = data.name.trim();

  // Check duplicate
  const existing = await categoryLabelModel.getLabelByName(trimmedName);
  if (existing) {
    throw new Error(`Nhãn đối tượng "${trimmedName}" đã tồn tại.`);
  }

  return categoryLabelModel.createLabel({
    name: trimmedName,
    icon: data.icon ? data.icon.trim() : "🏷️",
  });
};

export const editCategoryLabel = async (
  id: string,
  data: { name?: string; icon?: string }
) => {
  const existing = await categoryLabelModel.getLabelById(id);
  if (!existing || existing.status === "DELETED") {
    throw new Error("Nhãn đối tượng không tồn tại.");
  }

  return categoryLabelModel.updateLabel(id, data);
};

export const removeCategoryLabel = async (id: string) => {
  const existing = await categoryLabelModel.getLabelById(id);
  if (!existing) {
    throw new Error("Nhãn đối tượng không tồn tại.");
  }

  return categoryLabelModel.deleteLabel(id);
};
