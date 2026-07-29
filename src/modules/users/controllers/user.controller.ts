import { Request, Response } from 'express';
import * as userService from '../services/user.service';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, pass, fullName, phone, role, avatar, status } = req.body;

    if (!email || !pass || !fullName) {
      res.status(400).json({ error: 'Email, mật khẩu và họ tên là bắt buộc.' });
      return;
    }

    const user = await userService.registerUser({
      email,
      pass,
      fullName,
      phone,
      role,
      avatar,
      status,
    });

    // Remove password hash from the response
    const { pass: _, ...userWithoutPassword } = user;

    res.status(201).json(userWithoutPassword);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, status, search, page, limit } = req.query;

    if (!page && !limit && !search) {
      const users = await userService.getAllUsers({
        role: role as string,
        status: status as string,
      });
      res.json(users);
      return;
    }

    const result = await userService.listUsers({
      role: role as string,
      status: status as string,
      search: search as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

