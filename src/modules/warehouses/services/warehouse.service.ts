import * as warehouseModel from "../models/warehouse.model";
import { prisma } from "../../../config/prisma";

export const createWarehouse = async (data: any) => {
  const existingCode = await warehouseModel.getWarehouseByCode(data.code);
  if (existingCode) {
    throw new Error(`Mã kho ${data.code} đã tồn tại trong hệ thống.`);
  }

  // If set as default, reset other default warehouses
  if (data.isDefault) {
    await prisma.warehouse.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    });
  }

  return warehouseModel.createWarehouse(data);
};

export const getWarehouse = async (id: string) => {
  const warehouse = await warehouseModel.getWarehouseById(id);
  if (!warehouse) {
    throw new Error("Kho hàng không tồn tại.");
  }
  return warehouse;
};

export const listWarehouses = async (params: { status?: string; province?: string } = {}) => {
  return warehouseModel.getAllWarehouses(params);
};

export const updateWarehouse = async (id: string, data: any) => {
  const warehouse = await warehouseModel.getWarehouseById(id);
  if (!warehouse) {
    throw new Error("Kho hàng không tồn tại để cập nhật.");
  }

  if (data.code && data.code !== warehouse.code) {
    const existingCode = await warehouseModel.getWarehouseByCode(data.code);
    if (existingCode) {
      throw new Error(`Mã kho ${data.code} đã tồn tại.`);
    }
  }

  if (data.isDefault) {
    await prisma.warehouse.updateMany({
      where: { isDefault: true, id: { not: id } },
      data: { isDefault: false },
    });
  }

  return warehouseModel.updateWarehouse(id, data);
};

export const deleteWarehouse = async (id: string, softDelete = true) => {
  const warehouse = await warehouseModel.getWarehouseById(id);
  if (!warehouse) {
    throw new Error("Kho hàng không tồn tại để xóa.");
  }
  return warehouseModel.deleteWarehouse(id, { softDelete });
};

/**
 * Thuật toán tự động tìm Kho hàng phù hợp nhất dựa theo Địa chỉ của Khách hàng:
 * 1. Mức ưu tiên 1: Khớp Tỉnh/Thành phố VÀ đúng Quận/Huyện (hoặc nằm trong supportedDistricts của kho).
 * 2. Mức ưu tiên 2: Khớp cùng Tỉnh/Thành phố (province hoặc nằm trong supportedProvinces).
 * 3. Mức ưu tiên 3: Kho Mặc định toàn quốc (isDefault: true).
 */
export const selectWarehouseByAddress = async (params: {
  province?: string;
  district?: string;
  ward?: string;
}) => {
  const { province, district } = params;

  if (!province) {
    throw new Error("Vui lòng cung cấp thông tin Tỉnh/Thành phố để tìm kho.");
  }

  const activeWarehouses = await prisma.warehouse.findMany({
    where: { status: "ACTIVE" },
  });

  if (activeWarehouses.length === 0) {
    throw new Error("Hiện tại chưa có kho hàng nào hoạt động trong hệ thống.");
  }

  const cleanProvince = province.trim().toLowerCase();
  const cleanDistrict = district ? district.trim().toLowerCase() : "";

  // 1. Mức ưu tiên 1: Cùng Tỉnh/Thành VÀ khớp đúng Quận/Huyện vị trí kho hoặc nằm trong supportedDistricts
  if (cleanDistrict) {
    const districtMatch = activeWarehouses.find((wh) => {
      const matchProvince =
        wh.province.toLowerCase().includes(cleanProvince) ||
        wh.supportedProvinces.some((p) => p.toLowerCase().includes(cleanProvince));

      if (!matchProvince) return false;

      const sameDistrict = wh.district && wh.district.toLowerCase().includes(cleanDistrict);
      const supportedDistrict = wh.supportedDistricts.some((d) =>
        d.toLowerCase().includes(cleanDistrict)
      );

      return sameDistrict || supportedDistrict;
    });

    if (districtMatch) {
      return {
        matchedBy: "DISTRICT",
        warehouse: districtMatch,
        message: `Đã tự động chọn kho ${districtMatch.name} (Gần nhất cấp Quận/Huyện).`,
      };
    }
  }

  // 2. Mức ưu tiên 2: Khớp cùng Tỉnh/Thành phố
  const provinceMatch = activeWarehouses.find((wh) => {
    return (
      wh.province.toLowerCase().includes(cleanProvince) ||
      wh.supportedProvinces.some((p) => p.toLowerCase().includes(cleanProvince))
    );
  });

  if (provinceMatch) {
    return {
      matchedBy: "PROVINCE",
      warehouse: provinceMatch,
      message: `Đã tự động chọn kho ${provinceMatch.name} (Cùng Tỉnh/Thành phố).`,
    };
  }

  // 3. Mức ưu tiên 3: Kho Mặc định toàn quốc
  const defaultWarehouse =
    activeWarehouses.find((wh) => wh.isDefault) || activeWarehouses[0];

  return {
    matchedBy: "DEFAULT",
    warehouse: defaultWarehouse,
    message: `Không có kho thuộc ${province}. Đã chọn kho mặc định: ${defaultWarehouse.name}.`,
  };
};
