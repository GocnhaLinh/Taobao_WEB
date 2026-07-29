import * as cartModel from "../models/cart.model";
import * as userModel from "../../users/models/user.model";
import * as productModel from "../../products/models/product.model";

export const getOrCreateCart = async (userId: string) => {
  const user = await userModel.findUserById(userId);
  if (!user) {
    throw new Error("Người dùng không tồn tại.");
  }
  return cartModel.getCartByUserId(userId);
};

export const addToCart = async (
  userId: string,
  variantId: string,
  quantity = 1,
) => {
  const user = await userModel.findUserById(userId);
  if (!user) {
    throw new Error("Người dùng không tồn tại.");
  }

  const variant = await productModel.getVariantById(variantId);
  if (!variant || !variant.sku || !variant.sku.trim() || variant.status === "DELETED") {
    throw new Error("Mã SKU hoặc phiên bản sản phẩm này không có hợp lệ hoặc đã bị tạm ngưng tại cửa hàng.");
  }

  if (quantity <= 0) {
    throw new Error("Số lượng sản phẩm thêm vào giỏ hàng phải lớn hơn 0.");
  }

  // Check inventory stock if warehouse inventory records exist
  const totalStock = variant.inventories.reduce(
    (acc, curr) => acc + curr.quantity,
    0,
  );
  if (variant.inventories.length > 0 && totalStock < quantity) {
    throw new Error(`Sản phẩm này chỉ còn ${totalStock} sản phẩm trong kho.`);
  }

  return cartModel.addItemToCart(userId, variantId, quantity);
};

export const changeCartItemQuantity = async (
  cartItemId: string,
  quantity: number,
) => {
  // If quantity <= 0, the model deletes the item automatically
  return cartModel.updateCartItemQuantity(cartItemId, quantity);
};

export const removeFromCart = async (cartItemId: string) => {
  return cartModel.removeItemFromCart(cartItemId);
};

export const emptyCart = async (userId: string) => {
  const user = await userModel.findUserById(userId);
  if (!user) {
    throw new Error("Người dùng không tồn tại.");
  }
  return cartModel.clearCart(userId);
};
