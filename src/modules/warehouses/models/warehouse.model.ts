import { Prisma } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import { isNotEmpty } from "../../../utils/prisma-helpers";

export const createWarehouse = async (
  data: Prisma.WarehouseUncheckedCreateInput,
) => {
  return prisma.warehouse.create({ data });
};

// ✅ Detail query — dùng select thay include, giảm từ 3-level xuống 2-level
// Tránh N+1 khi warehouse có nhiều inventories
const warehouseDetailSelect = {
  id: true,
  code: true,
  name: true,
  province: true,
  district: true,
  address: true,
  supportedDistricts: true,
  supportedProvinces: true,
  isDefault: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  inventories: {
    select: {
      id: true,
      quantity: true,
      status: true,
      variantId: true,
      variant: {
        select: {
          id: true,
          sku: true,
          price: true,
          stock: true,
          size: true,
          color: true,
          image: true,
          status: true,
          productId: true,
          product: {
            select: {
              id: true,
              productName: true,
              slug: true,
              thumbnail: true,
              status: true,
            },
          },
        },
      },
    },
  },
} as const;

export const getWarehouseById = async (id: string) => {
  return prisma.warehouse.findUnique({
    where: { id },
    select: warehouseDetailSelect,
  });
};

export const getWarehouseByCode = async (code: string) => {
  return prisma.warehouse.findUnique({
    where: { code },
  });
};


export const getAllWarehouses = async (
  params: {
    status?: string;
    province?: string;
  } = {},
) => {
  const { status = "ACTIVE", province } = params;
  return prisma.warehouse.findMany({
    where: {
      ...(status && { status }),
      ...(isNotEmpty(province) && {
        province: { contains: province, mode: "insensitive" },
      }),
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const updateWarehouse = async (
  id: string,
  data: Prisma.WarehouseUpdateInput,
) => {
  return prisma.warehouse.update({
    where: { id },
    data: {
      ...data,
      ...(data.status === "ACTIVE" && { deletedAt: null }),
    },
  });
};

export const deleteWarehouse = async (
  id: string,
  options: { softDelete?: boolean } = { softDelete: true },
) => {
  if (options.softDelete !== false) {
    return prisma.warehouse.update({
      where: { id },
      data: { status: "DELETED", deletedAt: new Date() },
    });
  } else {
    return prisma.warehouse.delete({
      where: { id },
    });
  }
};
