import { Prisma } from '@prisma/client';
import bcryptjs from 'bcryptjs';
import * as userModel from '../models/user.model';

export const registerUser = async (data: Prisma.UserCreateInput) => {
  const existingEmail = await userModel.findUserByEmail(data.email);
  if (existingEmail) {
    throw new Error('Email đã được sử dụng bởi tài khoản khác.');
  }

  if (data.phone) {
    const existingPhone = await userModel.findUserByPhone(data.phone);
    if (existingPhone) {
      throw new Error('Số điện thoại đã được sử dụng bởi tài khoản khác.');
    }
  }

  // Hash the password
  const hashedPassword = await bcryptjs.hash(data.pass, 10);

  return userModel.createUser({
    ...data,
    pass: hashedPassword,
  });
};

export const getUserProfile = async (id: string) => {
  const user = await userModel.findUserById(id);
  if (!user) {
    throw new Error('Không tìm thấy người dùng.');
  }

  // Remove sensitive data (like password) before returning
  const { pass, ...profile } = user;
  return profile;
};

export const updateUserProfile = async (id: string, data: Prisma.UserUpdateInput) => {
  const user = await userModel.findUserById(id);
  if (!user) {
    throw new Error('Không tìm thấy người dùng để cập nhật.');
  }

  return userModel.updateUser(id, data);
};

export const deleteUserProfile = async (id: string, softDelete = true) => {
  const user = await userModel.findUserById(id);
  if (!user) {
    throw new Error('Không tìm thấy người dùng để xóa.');
  }

  return userModel.deleteUser(id, { softDelete });
};

export const getAllUsers = async (params: { role?: string; status?: string } = {}) => {
  const users = await userModel.getUsersWithPagination({
    role: params.role,
    status: params.status,
  });
  return users.map(({ pass, ...u }) => u);
};

export const listUsers = async (params: {
  role?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}) => {
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? params.limit : 10;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    userModel.getUsersWithPagination({
      role: params.role,
      status: params.status,
      search: params.search,
      skip,
      take: limit,
    }),
    userModel.countUsers({
      role: params.role,
      status: params.status,
      search: params.search,
    }),
  ]);

  return {
    users: users.map(({ pass, ...u }) => u),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
