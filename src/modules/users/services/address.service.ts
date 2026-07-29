import { Prisma } from '@prisma/client';
import * as addressModel from '../models/address.model';
import * as userModel from '../models/user.model';

export const addUserAddress = async (userId: string, data: Omit<Prisma.AddressUncheckedCreateInput, 'userId'>) => {
  const user = await userModel.findUserById(userId);
  if (!user) {
    throw new Error('Người dùng không tồn tại.');
  }

  // If this address is set as default, we should unset other defaults for this user
  if (data.isDefault) {
    const existingAddresses = await addressModel.getAddressesByUserId(userId);
    for (const address of existingAddresses) {
      if (address.isDefault) {
        await addressModel.updateAddress(address.id, { isDefault: false });
      }
    }
  }

  return addressModel.createAddress({
    ...data,
    userId,
  });
};

export const getUserAddresses = async (userId: string, status = 'ACTIVE') => {
  const user = await userModel.findUserById(userId);
  if (!user) {
    throw new Error('Người dùng không tồn tại.');
  }

  return addressModel.getAddressesByUserId(userId, status);
};

export const updateUserAddress = async (id: string, data: Prisma.AddressUpdateInput) => {
  const address = await addressModel.getAddressById(id);
  if (!address) {
    throw new Error('Địa chỉ không tồn tại.');
  }

  // If setting this address to default, unset other defaults
  if (data.isDefault) {
    const existingAddresses = await addressModel.getAddressesByUserId(address.userId);
    for (const addr of existingAddresses) {
      if (addr.isDefault && addr.id !== id) {
        await addressModel.updateAddress(addr.id, { isDefault: false });
      }
    }
  }

  return addressModel.updateAddress(id, data);
};

export const removeUserAddress = async (id: string, softDelete = true) => {
  const address = await addressModel.getAddressById(id);
  if (!address) {
    throw new Error('Địa chỉ không tồn tại.');
  }

  return addressModel.deleteAddress(id, { softDelete });
};
