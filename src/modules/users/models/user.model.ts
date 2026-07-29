import { Prisma } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import { isNotEmpty } from "../../../utils/prisma-helpers";

export const createUser = async (data: Prisma.UserCreateInput) => {
  return prisma.user.create({ data });
};

export const findUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    include: {
      addresses: true,
    },
  });
};

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const updateUser = async (id: string, data: Prisma.UserUpdateInput) => {
  return prisma.user.update({
    where: { id },
    data,
  });
};

export const deleteUser = async (
  id: string,
  options: { softDelete?: boolean } = { softDelete: true },
) => {
  if (options.softDelete !== false) {
    return prisma.user.update({
      where: { id },
      data: { status: "DELETED" },
    });
  } else {
    return prisma.user.delete({
      where: { id },
    });
  }
};

export const getUsersWithPagination = async (
  params: {
    role?: string;
    status?: string;
    search?: string;
    skip?: number;
    take?: number;
  } = {},
) => {
  const { role, status, search, skip, take } = params;
  return prisma.user.findMany({
    where: {
      ...(role && { role: { equals: role, mode: "insensitive" } }),
      ...(status
        ? { status: { equals: status, mode: "insensitive" } }
        : {
            NOT: { status: "DELETED" },
          }),
      ...(isNotEmpty(search) && {
        OR: [
          { fullName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take,
  });
};

export const countUsers = async (
  params: {
    role?: string;
    status?: string;
    search?: string;
  } = {},
) => {
  const { role, status, search } = params;
  return prisma.user.count({
    where: {
      ...(role && { role }),
      ...(status && { status }),
      ...(isNotEmpty(search) && {
        OR: [
          { fullName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
  });
};

export const findUserByPhone = async (phone: string) => {
  return prisma.user.findFirst({
    where: { phone },
  });
};
