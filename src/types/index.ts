export const Sex = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  KID: 'KID',
  OTHER: 'OTHER',
  UNISEX: 'UNISEX',
} as const;

export type SexType = (typeof Sex)[keyof typeof Sex];

export interface Category {
  id: string;
  name: string;
  slug: string;
  sex?: SexType | string;
  status: string;
  deletedAt?: string;
}

export interface Brand {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  status: string;
  deletedAt?: string;
  updatedAt?: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  province: string;
  district?: string;
  address?: string;
  supportedDistricts: string[];
  supportedProvinces: string[];
  isDefault: boolean;
  status: string;
  deletedAt?: string;
  updatedAt?: string;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detail: string;
  isDefault: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  size?: string;
  color?: string;
  price: number; // Giá bán ra thị trường Việt (VNĐ)
  originalPriceCNY?: number; // Giá gốc Tệ bên Trung (¥ CNY)
  exchangeRate?: number; // Tỷ giá NDT -> VNĐ
  shippingCostVND?: number; // Phí vận chuyển, ship, kho VNĐ
  totalCostVND?: number; // Tổng chi phí vốn VNĐ
  profitVND?: number; // Lợi nhuận VNĐ (Giá bán - Tổng chi phí)
  stock: number;
  image?: string;
  images?: string[];
  weight?: number;
  status: string;
  deletedAt?: string;
}

export interface Product {
  id: string;
  productName: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  categoryId: string;
  brandId?: string;
  category?: Category;
  brand?: Brand;
  status: string;
  deletedAt?: string;
  updatedAt?: string;
  images?: { id?: string; imageUrl: string }[];
  variants?: ProductVariant[];
  soldCount?: number;
  ratingAverage?: number;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user?: User;
  product?: Product;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderValue?: number;
  status: string;
}
