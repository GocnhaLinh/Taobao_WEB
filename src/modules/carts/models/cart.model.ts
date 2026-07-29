import { prisma } from '../../../config/prisma';

// ✅ Dùng select thay include — chỉ lấy fields cần thiết thay vì toàn bộ
// Tránh N+1 khi cart có nhiều items (mỗi item → variant → product + inventories)
const cartWithItemsSelect = {
  id: true,
  userId: true,
  status: true,
  items: {
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      variantId: true,
      quantity: true,
      status: true,
      variant: {
        select: {
          id: true,
          sku: true,
          price: true,
          salePrice: true,
          stock: true,
          size: true,
          color: true,
          image: true,
          images: true,
          status: true,
          weight: true,
          productId: true,
          product: {
            select: {
              id: true,
              productName: true,
              slug: true,
              thumbnail: true,
              status: true,
            },
          },
          inventories: {
            select: {
              id: true,
              quantity: true,
              warehouse: true,
            },
          },
        },
      },
    },
  },
} as const;

export const getCartByUserId = async (userId: string) => {
  let cart = await prisma.cart.findFirst({
    where: { userId, status: 'ACTIVE' },
    select: cartWithItemsSelect,
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId,
        status: 'ACTIVE',
      },
      select: cartWithItemsSelect,
    });
  }

  return cart;
};

export const addItemToCart = async (userId: string, variantId: string, quantity: number) => {
  const cart = await getCartByUserId(userId);

  const existingItem = cart.items.find((item) => item.variantId === variantId);

  if (existingItem) {
    return prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: existingItem.quantity + quantity,
      },
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  return prisma.cartItem.create({
    data: {
      cartId: cart.id,
      variantId,
      quantity,
      status: 'ACTIVE',
    },
    include: {
      variant: {
        include: {
          product: true,
        },
      },
    },
  });
};

export const updateCartItemQuantity = async (cartItemId: string, quantity: number) => {
  if (quantity <= 0) {
    return prisma.cartItem.update({
      where: { id: cartItemId },
      data: { status: 'DELETED' },
    });
  }

  return prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
    include: {
      variant: {
        include: {
          product: true,
        },
      },
    },
  });
};

export const removeItemFromCart = async (cartItemId: string) => {
  return prisma.cartItem.update({
    where: { id: cartItemId },
    data: { status: 'DELETED' },
  });
};

export const clearCart = async (userId: string) => {
  const cart = await getCartByUserId(userId);
  return prisma.cartItem.updateMany({
    where: { cartId: cart.id, status: 'ACTIVE' },
    data: { status: 'DELETED' },
  });
};
