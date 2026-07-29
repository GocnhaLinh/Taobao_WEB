import { Prisma } from '@prisma/client';
import { prisma } from '../../../config/prisma';

export const createAddress = async (data: Prisma.AddressUncheckedCreateInput) => {
  return prisma.address.create({ data });
};

export const getAddressById = async (id: string) => {
  return prisma.address.findUnique({
    where: { id },
  });
};

export const getAddressesByUserId = async (userId: string, status = 'ACTIVE') => {
  return prisma.address.findMany({
    where: {
      userId,
      ...(status && { status }),
    },
  });
};

export const updateAddress = async (id: string, data: Prisma.AddressUpdateInput) => {
  return prisma.address.update({
    where: { id },
    data,
  });
};

export const deleteAddress = async (
  id: string,
  options: { softDelete?: boolean } = { softDelete: true }
) => {
  if (options.softDelete !== false) {
    return prisma.address.update({
      where: { id },
      data: { status: 'DELETED' },
    });
  } else {
    return prisma.address.delete({
      where: { id },
    });
  }
};
