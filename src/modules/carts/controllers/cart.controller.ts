import { Request, Response } from 'express';
import * as cartService from '../services/cart.service';

export const getCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!userId) {
      res.status(400).json({ error: 'Mã người dùng (userId) là bắt buộc.' });
      return;
    }
    const cart = await cartService.getOrCreateCart(userId);
    res.json(cart);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const addToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, variantId, quantity } = req.body;
    if (!userId || !variantId) {
      res.status(400).json({ error: 'userId và variantId là bắt buộc.' });
      return;
    }
    const item = await cartService.addToCart(userId, variantId, Number(quantity) || 1);
    res.status(201).json(item);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateItemQuantity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    if (!itemId || quantity === undefined) {
      res.status(400).json({ error: 'itemId và quantity là bắt buộc.' });
      return;
    }
    const updated = await cartService.changeCartItemQuantity(itemId, Number(quantity));
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const removeItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemId } = req.params;
    if (!itemId) {
      res.status(400).json({ error: 'itemId là bắt buộc.' });
      return;
    }
    await cartService.removeFromCart(itemId);
    res.json({ message: 'Đã xóa sản phẩm khỏi giỏ hàng.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const clearCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!userId) {
      res.status(400).json({ error: 'userId là bắt buộc.' });
      return;
    }
    await cartService.emptyCart(userId);
    res.json({ message: 'Đã làm sạch giỏ hàng thành công.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
