import { Prisma } from '@prisma/client';
import * as brandModel from '../models/brand.model';

export const createBrand = async (data: Prisma.BrandCreateInput) => {
  return brandModel.createBrand(data);
};

export const getBrands = async (status = 'ACTIVE') => {
  return brandModel.getBrands({ status });
};

export const getBrand = async (id: string) => {
  const brand = await brandModel.getBrandById(id);
  if (!brand) {
    throw new Error('Thương hiệu không tồn tại.');
  }
  return brand;
};

export const updateBrand = async (id: string, data: Prisma.BrandUpdateInput) => {
  const brand = await brandModel.getBrandById(id);
  if (!brand) {
    throw new Error('Thương hiệu không tồn tại để cập nhật.');
  }
  return brandModel.updateBrand(id, data);
};

export const deleteBrand = async (id: string, softDelete = true) => {
  const brand = await brandModel.getBrandById(id);
  if (!brand) {
    throw new Error('Thương hiệu không tồn tại để xóa.');
  }
  return brandModel.deleteBrand(id, { softDelete });
};

export const listBrandsWithPagination = async (params: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}) => {
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? params.limit : 10;
  const skip = (page - 1) * limit;

  const [brands, total] = await Promise.all([
    brandModel.getBrandsWithPagination({
      status: params.status,
      search: params.search,
      skip,
      take: limit,
    }),
    brandModel.countBrands({
      status: params.status,
      search: params.search,
    }),
  ]);

  return {
    brands,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
