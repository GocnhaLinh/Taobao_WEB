import { Request, Response } from "express";
import * as addressService from "../services/address.service";

export const createAddress = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      userId,
      fullName,
      phone,
      province,
      district,
      ward,
      detail,
      isDefault,
    } = req.body;

    if (
      !userId ||
      !fullName ||
      !phone ||
      !province ||
      !district ||
      !ward ||
      !detail
    ) {
      res.status(400).json({
        error:
          "userId, fullName, phone, province, district, ward và detail là bắt buộc.",
      });
      return;
    }

    const address = await addressService.addUserAddress(userId, {
      fullName,
      phone,
      province,
      district,
      ward,
      detail,
      isDefault: Boolean(isDefault),
    });

    res.status(201).json(address);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getAddressesByUserId = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = req.params;
    const addresses = await addressService.getUserAddresses(userId);
    res.json(addresses);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateAddress = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const address = await addressService.updateUserAddress(id, req.body);
    res.json(address);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteAddress = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const softDelete = req.query.softDelete !== 'false';
    await addressService.removeUserAddress(id, softDelete);
    res.json({ message: "Xóa địa chỉ thành công." });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
