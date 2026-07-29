import { Request, Response } from 'express';
import * as brandService from '../services/brand.service';

export const createBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, logo, description, status } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Tên thương hiệu là bắt buộc.' });
      return;
    }

    const brand = await brandService.createBrand({ name, logo, description, status });
    res.status(201).json(brand);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getBrands = async (req: Request, res: Response): Promise<void> => {
  try {
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

    if (!page && !limit && !search) {
      const brands = await brandService.getBrands(status || 'ACTIVE');
      res.json(brands);
      return;
    }

    const result = await brandService.listBrandsWithPagination({
      status,
      search,
      page,
      limit,
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllBrands = async (req: Request, res: Response): Promise<void> => {
  try {
    const status = req.query.status as string | undefined;
    const brands = await brandService.getBrands(status);
    res.json(brands);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getBrandById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const brand = await brandService.getBrand(id);
    res.json(brand);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const updateBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, logo, description, status } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (logo !== undefined) updateData.logo = logo ? logo : null;
    if (description !== undefined) updateData.description = description ? description : null;
    if (status !== undefined) updateData.status = status;

    const brand = await brandService.updateBrand(id, updateData);
    res.json(brand);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const softDelete = req.query.softDelete !== 'false';
    await brandService.deleteBrand(id, softDelete);
    res.json({ message: 'Xóa thương hiệu thành công.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
