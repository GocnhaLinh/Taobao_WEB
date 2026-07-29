import { Prisma } from '@prisma/client';
import { prisma } from '../../../config/prisma';
import { isNotEmpty } from '../../../utils/prisma-helpers';

export const createBrand = async (data: Prisma.BrandCreateInput) => {
  return prisma.brand.create({ data });
};

export const getBrands = async (params: { status?: string } = { status: 'ACTIVE' }) => {
  return prisma.brand.findMany({
    where: {
      ...(params.status && { status: params.status }),
    },
  });
};

export const getBrandsWithPagination = async (params: {
  status?: string;
  search?: string;
  skip?: number;
  take?: number;
} = {}) => {
  const { status = 'ACTIVE', search, skip, take } = params;
  return prisma.brand.findMany({
    where: {
      ...(status && { status }),
      ...(isNotEmpty(search) && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    skip,
    take,
  });
};

export const countBrands = async (params: {
  status?: string;
  search?: string;
} = {}) => {
  const { status = 'ACTIVE', search } = params;
  return prisma.brand.count({
    where: {
      ...(status && { status }),
      ...(isNotEmpty(search) && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
  });
};

export const getBrandById = async (id: string) => {
  return prisma.brand.findUnique({
    where: { id },
    include: {
      products: true,
    },
  });
};

export const updateBrand = async (id: string, data: Prisma.BrandUpdateInput) => {
  return prisma.brand.update({
    where: { id },
    data: {
      ...data,
      ...(data.status === 'ACTIVE' && { deletedAt: null }),
    },
  });
};

export const deleteBrand = async (id: string, options: { softDelete?: boolean } = { softDelete: true }) => {
  if (options.softDelete !== false) {
    return prisma.brand.update({
      where: { id },
      data: { status: 'DELETED', deletedAt: new Date() },
    });
  } else {
    return prisma.brand.delete({
      where: { id },
    });
  }
};
