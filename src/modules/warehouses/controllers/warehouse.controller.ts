import { Request, Response } from "express";
import * as warehouseService from "../services/warehouse.service";

export const createWarehouse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, name, province, district, address, supportedDistricts, supportedProvinces, isDefault } = req.body;

    if (!code || !name || !province) {
      res.status(400).json({ error: "code, name và province là bắt buộc." });
      return;
    }

    const warehouse = await warehouseService.createWarehouse({
      code,
      name,
      province,
      district,
      address,
      supportedDistricts: supportedDistricts || [],
      supportedProvinces: supportedProvinces || [],
      isDefault: Boolean(isDefault),
    });

    res.status(201).json(warehouse);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getWarehouses = async (req: Request, res: Response): Promise<void> => {
  try {
    const status = req.query.status as string | undefined;
    const province = req.query.province as string | undefined;

    const warehouses = await warehouseService.listWarehouses({ status, province });
    res.json(warehouses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getWarehouseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const warehouse = await warehouseService.getWarehouse(id);
    res.json(warehouse);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const selectWarehouseByAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { province, district, ward } = req.body;

    if (!province) {
      res.status(400).json({ error: "Vui lòng truyền province trong body." });
      return;
    }

    const result = await warehouseService.selectWarehouseByAddress({ province, district, ward });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateWarehouse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const warehouse = await warehouseService.updateWarehouse(id, req.body);
    res.json(warehouse);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteWarehouse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const softDelete = req.query.softDelete !== 'false';
    await warehouseService.deleteWarehouse(id, softDelete);
    res.json({ message: "Xóa kho hàng thành công." });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
