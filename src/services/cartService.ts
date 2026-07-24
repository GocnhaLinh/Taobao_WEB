import { axiosClient } from './axiosClient';

export interface CartItem {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  status: string;
  variant?: {
    id: string;
    productId: string;
    size?: string | null;
    color?: string | null;
    price: number;
    salePrice?: number | null;
    image?: string | null;
    product?: {
      id: string;
      productName: string;
      thumbnail?: string | null;
    };
  };
}

export interface Cart {
  id: string;
  userId: string;
  status: string;
  items: CartItem[];
}

export const getCartApi = async (userId: string): Promise<Cart> => {
  return axiosClient.get<any, Cart>(`/carts/${userId}`);
};

export const addToCartApi = async (userId: string, variantId: string, quantity = 1): Promise<CartItem> => {
  return axiosClient.post<any, CartItem>('/carts/items', { userId, variantId, quantity });
};

export const updateCartItemQuantityApi = async (itemId: string, quantity: number): Promise<CartItem> => {
  return axiosClient.put<any, CartItem>(`/carts/items/${itemId}`, { quantity });
};

export const removeCartItemApi = async (itemId: string): Promise<any> => {
  return axiosClient.delete<any, any>(`/carts/items/${itemId}`);
};

export const clearCartApi = async (userId: string): Promise<any> => {
  return axiosClient.delete<any, any>(`/carts/${userId}/clear`);
};
