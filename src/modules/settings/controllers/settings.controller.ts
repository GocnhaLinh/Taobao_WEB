import { Request, Response } from 'express';
import * as settingsService from '../services/settings.service';

export const getExchangeRate = async (req: Request, res: Response): Promise<void> => {
  try {
    const rate = await settingsService.getExchangeRate();
    res.json(rate);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const updateExchangeRate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rate, createdBy } = req.body;
    if (rate === undefined || Number(rate) <= 0) {
      res.status(400).json({ error: 'Tỷ giá (rate) phải lớn hơn 0.' });
      return;
    }

    const newRate = await settingsService.updateExchangeRate(Number(rate), createdBy || 'ADMIN');
    res.status(201).json(newRate);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getFeeConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const fees = await settingsService.getFeeConfig();
    res.json(fees);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const saveFeeConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      exchangeRate,
      shippingCnPerKg,
      shippingVnPerKg,
      warehouseFreeDays,
      warehouseFeePerDay,
      serviceFeePercent,
      depositPercent,
    } = req.body;

    if (
      exchangeRate === undefined ||
      shippingCnPerKg === undefined ||
      shippingVnPerKg === undefined ||
      warehouseFreeDays === undefined ||
      warehouseFeePerDay === undefined ||
      serviceFeePercent === undefined ||
      depositPercent === undefined
    ) {
      res.status(400).json({ error: 'Tất cả các thông số cấu hình phí đều là bắt buộc.' });
      return;
    }

    const updatedFee = await settingsService.saveFeeConfig({
      exchangeRate: Number(exchangeRate),
      shippingCnPerKg: Number(shippingCnPerKg),
      shippingVnPerKg: Number(shippingVnPerKg),
      warehouseFreeDays: Number(warehouseFreeDays),
      warehouseFeePerDay: Number(warehouseFeePerDay),
      serviceFeePercent: Number(serviceFeePercent),
      depositPercent: Number(depositPercent),
    });

    res.json(updatedFee);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
