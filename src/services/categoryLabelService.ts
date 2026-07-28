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
  icon?: string;
}): Promise<CategoryLabelItem> => {
  return axiosClient.post<any, CategoryLabelItem>("/category-labels", data);
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
