import { axiosClient } from "./axiosClient";

export interface CategoryLabelItem {
  id: string;
  name: string;
  code: string;
  icon?: string;
  status: string;
  createdAt?: string;
}

export const fetchCategoryLabelsApi = async (): Promise<
  CategoryLabelItem[]
> => {
  return axiosClient.get<any, CategoryLabelItem[]>("/category-labels");
};

export const createCategoryLabelApi = async (data: {
  name: string;
  code?: string;
  icon?: string;
}): Promise<CategoryLabelItem> => {
  const code =
    data.code?.trim() ||
    data.name
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "d")
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "")
      .toUpperCase() ||
    `LABEL_${Date.now()}`;

  return axiosClient.post<any, CategoryLabelItem>("/category-labels", {
    name: data.name.trim(),
    code,
    icon: data.icon,
  });
};

export const updateCategoryLabelApi = async (
  id: string,
  data: { name?: string; icon?: string },
): Promise<CategoryLabelItem> => {
  return axiosClient.put<any, CategoryLabelItem>(
    `/category-labels/${id}`,
    data,
  );
};

export const deleteCategoryLabelApi = async (id: string): Promise<void> => {
  await axiosClient.delete(`/category-labels/${id}`);
};
