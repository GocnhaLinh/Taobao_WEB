import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

async function clearCollection(collectionName: string) {
  try {
    await prisma.$runCommandRaw({
      delete: collectionName,
      deletes: [{ q: {}, limit: 0 }],
    });
  } catch (error) {
    console.log(`Lưu ý: Không thể xóa collection ${collectionName}`);
  }
}

async function insertDocument(collectionName: string, doc: any) {
  await prisma.$runCommandRaw({
    insert: collectionName,
    documents: [doc],
  });
}

async function main() {
  console.log("Bắt đầu dọn dẹp dữ liệu cũ qua Raw MongoDB Commands...");

  const collections = [
    "fees",
    "exchange_rates",
    "coupons",
    "reviewer",
    "inventories",
    "cart_items",
    "cart",
    "orders_items",
    "order_status_history",
    "order_price_history",
    "order_cancellations",
    "notifications",
    "payments",
    "orders",
    "addresses",
    "images",
    "products_variants",
    "products",
    "brands",
    "categories",
    "warehouses",
    "users",
  ];

  for (const collection of collections) {
    await clearCollection(collection);
  }
  console.log("Đã dọn dẹp xong.");

  console.log("Tạo mã băm mật khẩu...");
  const adminPass = await bcryptjs.hash("Admin@123", 10);
  const userPass = await bcryptjs.hash("User@123", 10);

  // Định nghĩa các IDs cố định để tạo liên kết
  const adminId = "65b2a0000000000000000001";
  const user1Id = "65b2a0000000000000000002";
  const user2Id = "65b2a0000000000000000003";
  const user3Id = "65b2a0000000000000000004";
  const user4Id = "65b2a0000000000000000005";
  const user5Id = "65b2a0000000000000000006";
  const user6Id = "65b2a0000000000000000007";

  const brandLVId = "65b2b0000000000000000001";
  const brandChanelId = "65b2b0000000000000000002";

  const catWatchId = "65b2c0000000000000000001";
  const catShoesId = "65b2c0000000000000000002";
  const catBackpackId = "65b2c0000000000000000003";

  const prod1Id = "65b2d0000000000000000001";
  const prod2Id = "65b2d0000000000000000002";
  const prod3Id = "65b2d0000000000000000003";

  const var1Id = "65b2e0000000000000000001";
  const var2Id = "65b2e0000000000000000002";
  const var3Id = "65b2e0000000000000000003";

  console.log("Tạo người dùng...");
  await insertDocument("users", {
    _id: { $oid: adminId },
    full_name: "Admin Manager",
    email: "admin@example.com",
    pass: adminPass,
    phone: "0987654321",
    role: "ADMIN",
    status: "ACTIVE",
    created_at: { $date: new Date().toISOString() },
  });

  await insertDocument("users", {
    _id: { $oid: user1Id },
    full_name: "John Doe",
    email: "john@example.com",
    pass: userPass,
    phone: "0123456789",
    role: "USER",
    status: "ACTIVE",
    created_at: { $date: new Date().toISOString() },
  });

  await insertDocument("users", {
    _id: { $oid: user2Id },
    full_name: "Jane Smith",
    email: "jane@example.com",
    pass: userPass,
    phone: "0912345678",
    role: "USER",
    status: "ACTIVE",
    created_at: { $date: new Date().toISOString() },
  });

  await insertDocument("users", {
    _id: { $oid: user3Id },
    full_name: "Nguyễn Văn Hùng",
    email: "hung.nguyen@gmail.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    pass: userPass,
    phone: "0938111222",
    role: "USER",
    status: "ACTIVE",
    created_at: { $date: new Date().toISOString() },
  });

  await insertDocument("users", {
    _id: { $oid: user4Id },
    full_name: "Trần Thị Mai",
    email: "mai.tran88@gmail.com",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200",
    pass: userPass,
    phone: "0938333444",
    role: "USER",
    status: "ACTIVE",
    created_at: { $date: new Date().toISOString() },
  });

  await insertDocument("users", {
    _id: { $oid: user5Id },
    full_name: "Lê Minh Tuấn",
    email: "tuan.leminh@yahoo.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    pass: userPass,
    phone: "0938555666",
    role: "USER",
    status: "ACTIVE",
    created_at: { $date: new Date().toISOString() },
  });

  await insertDocument("users", {
    _id: { $oid: user6Id },
    full_name: "Phạm Hoài An",
    email: "hoaian.pham@outlook.com",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    pass: userPass,
    phone: "0938777888",
    role: "USER",
    status: "ACTIVE",
    created_at: { $date: new Date().toISOString() },
  });

  console.log("Tạo cấu hình tỷ giá & phí hệ thống...");
  await insertDocument("exchange_rates", {
    _id: { $oid: "65b310000000000000000001" },
    rate: 3995,
    effective_from: { $date: new Date().toISOString() },
    created_by: "ADMIN",
    status: "ACTIVE",
    created_at: { $date: new Date().toISOString() },
  });

  await insertDocument("fees", {
    _id: { $oid: "65b310000000000000000002" },
    exchange_rate: 3995,
    shipping_cn_per_kg: 25000,
    shipping_vn_per_kg: 15000,
    warehouse_free_days: 7,
    warehouse_fee_per_day: 5000,
    service_fee_percent: 5,
    deposit_percent: 70,
    status: "ACTIVE",
    updated_at: { $date: new Date().toISOString() },
  });

  console.log("Tạo danh sách Kho hàng (Warehouses)...");
  await insertDocument("warehouses", {
    _id: { $oid: "65b2f0000000000000000001" },
    code: "KHO_HCM_Q1",
    name: "Kho TP.HCM - Quận 1",
    province: "Hồ Chí Minh",
    district: "Quận 1",
    address: "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1",
    supportedDistricts: ["Quận 1", "Quận 3", "Quận 4", "Quận 5"],
    supportedProvinces: ["Hồ Chí Minh"],
    is_default: false,
    status: "ACTIVE",
    created_at: { $date: new Date().toISOString() },
    updated_at: { $date: new Date().toISOString() },
  });

  await insertDocument("warehouses", {
    _id: { $oid: "65b2f0000000000000000002" },
    code: "KHO_HCM_Q7",
    name: "Kho TP.HCM - Quận 7",
    province: "Hồ Chí Minh",
    district: "Quận 7",
    address: "456 Nguyễn Thị Thập, Phường Tân Phong, Quận 7",
    supportedDistricts: ["Quận 7", "Quận 8", "Nhà Bè", "Bình Chánh"],
    supportedProvinces: ["Hồ Chí Minh"],
    is_default: false,
    status: "ACTIVE",
    created_at: { $date: new Date().toISOString() },
    updated_at: { $date: new Date().toISOString() },
  });

  await insertDocument("warehouses", {
    _id: { $oid: "65b2f0000000000000000003" },
    code: "KHO_HCM_BT",
    name: "Kho TP.HCM - Bình Tân (Tổng Kho Mặc Định)",
    province: "Hồ Chí Minh",
    district: "Bình Tân",
    address: "789 Kinh Dương Vương, Phường An Lạc, Bình Tân",
    supportedDistricts: [
      "Bình Tân",
      "Tân Phú",
      "Quận 6",
      "Quận 11",
      "Củ Chi",
      "Hóc Môn",
    ],
    supportedProvinces: [
      "Hồ Chí Minh",
      "Long An",
      "Bình Dương",
      "Đồng Nai",
      "Tây Ninh",
    ],
    is_default: true,
    status: "ACTIVE",
    created_at: { $date: new Date().toISOString() },
    updated_at: { $date: new Date().toISOString() },
  });

  await insertDocument("warehouses", {
    _id: { $oid: "65b2f0000000000000000004" },
    code: "KHO_HN_CG",
    name: "Kho Hà Nội - Cầu Giấy",
    province: "Hà Nội",
    district: "Cầu Giấy",
    address: "12 Duy Tân, Phường Dịch Vọng Hậu, Cầu Giấy",
    supportedDistricts: [
      "Cầu Giấy",
      "Nam Từ Liêm",
      "Bắc Từ Liêm",
      "Tây Hồ",
      "Đống Đa",
    ],
    supportedProvinces: ["Hà Nội"],
    is_default: false,
    status: "ACTIVE",
    created_at: { $date: new Date().toISOString() },
    updated_at: { $date: new Date().toISOString() },
  });

  await insertDocument("warehouses", {
    _id: { $oid: "65b2f0000000000000000005" },
    code: "KHO_HN_LB",
    name: "Kho Hà Nội - Long Biên",
    province: "Hà Nội",
    district: "Long Biên",
    address: "99 Nguyễn Văn Cừ, Phường Ngọc Lâm, Long Biên",
    supportedDistricts: [
      "Long Biên",
      "Gia Lâm",
      "Hoàn Kiếm",
      "Hai Bà Trưng",
      "Hoàng Mai",
    ],
    supportedProvinces: [
      "Hà Nội",
      "Bắc Ninh",
      "Hưng Yên",
      "Hải Phòng",
      "Quảng Ninh",
    ],
    is_default: false,
    status: "ACTIVE",
    created_at: { $date: new Date().toISOString() },
    updated_at: { $date: new Date().toISOString() },
  });

  await insertDocument("warehouses", {
    _id: { $oid: "65b2f0000000000000000006" },
    code: "KHO_DN_HC",
    name: "Kho Đà Nẵng - Hải Châu",
    province: "Đà Nẵng",
    district: "Hải Châu",
    address: "88 Trạch Nữ Vương, Phường Hòa Thuận Đông, Hải Châu",
    supportedDistricts: ["Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn"],
    supportedProvinces: ["Đà Nẵng"],
    is_default: false,
    status: "ACTIVE",
    created_at: { $date: new Date().toISOString() },
    updated_at: { $date: new Date().toISOString() },
  });

  await insertDocument("warehouses", {
    _id: { $oid: "65b2f0000000000000000007" },
    code: "KHO_DN_LC",
    name: "Kho Đà Nẵng - Liên Chiểu",
    province: "Đà Nẵng",
    district: "Liên Chiểu",
    address: "254 Tôn Đức Thắng, Phường Hòa Minh, Liên Chiểu",
    supportedDistricts: ["Liên Chiểu", "Cẩm Lệ", "Hòa Vang"],
    supportedProvinces: ["Đà Nẵng", "Quảng Nam", "Thừa Thiên Huế"],
    is_default: false,
    status: "ACTIVE",
    created_at: { $date: new Date().toISOString() },
    updated_at: { $date: new Date().toISOString() },
  });

  console.log("Tạo thương hiệu (Brand)...");
  await insertDocument("brands", {
    _id: { $oid: brandLVId },
    name: "Louis Vuitton",
    logo: "https://res.cloudinary.com/duqmtsxgg/image/upload/v17214567/brands/lv_logo.png",
    description: "Thương hiệu thời trang xa xỉ hàng đầu từ Pháp.",
    status: "ACTIVE",
  });

  await insertDocument("brands", {
    _id: { $oid: brandChanelId },
    name: "Chanel",
    logo: "https://res.cloudinary.com/duqmtsxgg/image/upload/v17214567/brands/chanel_logo.png",
    description:
      "Thương hiệu thời trang, nước hoa và trang sức đẳng cấp toàn cầu.",
    status: "ACTIVE",
  });

  console.log("Tạo danh mục (Category)...");
  await insertDocument("categories", {
    _id: { $oid: catWatchId },
    name: "Đồng hồ",
    slug: "dong-ho",
    sex: "Unisex",
    status: "ACTIVE",
  });

  await insertDocument("categories", {
    _id: { $oid: catShoesId },
    name: "Giày",
    slug: "giay",
    sex: "Unisex",
    status: "ACTIVE",
  });

  await insertDocument("categories", {
    _id: { $oid: catBackpackId },
    name: "Balo",
    slug: "balo",
    sex: "Unisex",
    status: "ACTIVE",
  });

  console.log("Tạo 3 mã giảm giá (Coupons)...");
  await insertDocument("coupons", {
    _id: { $oid: "65b300000000000000000001" },
    code: "TAOBAO50K",
    discount_type: "fixed",
    discount_value: 50000,
    min_order_value: 300000,
    max_discount: 50000,
    expired_at: { $date: new Date("2026-12-31T23:59:59.000Z").toISOString() },
    status: "ACTIVE",
  });

  await insertDocument("coupons", {
    _id: { $oid: "65b300000000000000000002" },
    code: "VIP10",
    discount_type: "percent",
    discount_value: 10,
    min_order_value: 500000,
    max_discount: 200000,
    expired_at: { $date: new Date("2026-12-31T23:59:59.000Z").toISOString() },
    status: "ACTIVE",
  });

  await insertDocument("coupons", {
    _id: { $oid: "65b300000000000000000003" },
    code: "FREESHIP",
    discount_type: "fixed",
    discount_value: 30000,
    min_order_value: 200000,
    max_discount: 30000,
    expired_at: { $date: new Date("2026-12-31T23:59:59.000Z").toISOString() },
    status: "ACTIVE",
  });

  console.log("Tạo sản phẩm với Giá Tệ (RMB)...");

  // --- SẢN PHẨM 1: ĐỒNG HỒ ---
  await insertDocument("products", {
    _id: { $oid: prod1Id },
    id_category: { $oid: catWatchId },
    id_brand: { $oid: brandChanelId },
    product_name: "Đồng hồ Chanel Première Édition Originale",
    slug: "dong-ho-chanel-premiere-edition-originale",
    description:
      "Đồng hồ Première Édition Originale chế tác từ thép mạ vàng 18K và dây da đen đan xen dây xích.",
    thumbnail:
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=500&q=80",
    status: "ACTIVE",
  });

  const p1Images = [
    "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=500&q=80",
  ];
  for (const imgUrl of p1Images) {
    await insertDocument("images", {
      id_product: { $oid: prod1Id },
      image_url: imgUrl,
    });
  }

  // Price in CNY: 31,289 RMB (31,289 * 3,995 = 125,000,000 VND)
  await insertDocument("products_variants", {
    _id: { $oid: var1Id },
    id_products: { $oid: prod1Id },
    size: "One Size",
    color: "Gold",
    sku: "WAT-CH-PREM-01",
    price: 31289,
    sale_price: 30037,
    stock: 10,
    image:
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=500&q=80",
    weight: 0.2,
    status: "ACTIVE",
  });

  await insertDocument("inventories", {
    id_variants: { $oid: var1Id },
    quantity: 10,
    warehouse: "VN",
  });

  // --- SẢN PHẨM 2: GIÀY ---
  await insertDocument("products", {
    _id: { $oid: prod2Id },
    id_category: { $oid: catShoesId },
    id_brand: { $oid: brandLVId },
    product_name: "Giày Sneaker LV Trainer Blue",
    slug: "giay-sneaker-lv-trainer-blue",
    description:
      "Mẫu giày sneaker LV Trainer nổi bật được làm từ da bê vân nổi Monogram kết hợp vải denim.",
    thumbnail:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=500&q=80",
    status: "ACTIVE",
  });

  const p2Images = [
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=500&q=80",
  ];
  for (const imgUrl of p2Images) {
    await insertDocument("images", {
      id_product: { $oid: prod2Id },
      image_url: imgUrl,
    });
  }

  // Price in CNY: 8,010 RMB (8,010 * 3,995 = 32,000,000 VND)
  await insertDocument("products_variants", {
    _id: { $oid: var2Id },
    id_products: { $oid: prod2Id },
    size: "41",
    color: "Blue",
    sku: "SH-LV-TRB-41",
    price: 8010,
    sale_price: 7509,
    stock: 15,
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=500&q=80",
    weight: 0.8,
    status: "ACTIVE",
  });

  await insertDocument("inventories", {
    id_variants: { $oid: var2Id },
    quantity: 15,
    warehouse: "VN",
  });

  // --- SẢN PHẨM 3: BALO ---
  await insertDocument("products", {
    _id: { $oid: prod3Id },
    id_category: { $oid: catBackpackId },
    id_brand: { $oid: brandChanelId },
    product_name: "Balo Chanel Grained Calfskin Black",
    slug: "balo-chanel-grained-calfskin-black",
    description:
      "Balo Chanel cổ điển làm từ da bê hạt màu đen bóng bẩy cùng logo kim loại mạ vàng sang trọng.",
    thumbnail:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80",
    status: "ACTIVE",
  });

  const p3Images = [
    "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=500&q=80",
  ];
  for (const imgUrl of p3Images) {
    await insertDocument("images", {
      id_product: { $oid: prod3Id },
      image_url: imgUrl,
    });
  }

  // Price in CNY: 36,295 RMB (36,295 * 3,995 = 145,000,000 VND)
  await insertDocument("products_variants", {
    _id: { $oid: var3Id },
    id_products: { $oid: prod3Id },
    size: "Medium",
    color: "Black",
    sku: "BAG-CH-BK-01",
    price: 36295,
    stock: 5,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80",
    weight: 1.0,
    status: "ACTIVE",
  });

  await insertDocument("inventories", {
    id_variants: { $oid: var3Id },
    quantity: 5,
    warehouse: "VN",
  });

  console.log("Tạo 6 đánh giá (Review) ngẫu nhiên...");
  await insertDocument("reviewer", {
    id_user: { $oid: user1Id },
    id_product: { $oid: prod1Id },
    ratting: 5,
    comment: "Đồng hồ quá tuyệt vời, thiết kế rất tinh xảo và sang trọng!",
    created_at: { $date: new Date().toISOString() },
  });

  await insertDocument("reviewer", {
    id_user: { $oid: user2Id },
    id_product: { $oid: prod1Id },
    ratting: 4,
    comment: "Đồng hồ đẹp nhưng giao hàng hơi lâu hơn dự kiến một chút.",
    created_at: { $date: new Date().toISOString() },
  });

  await insertDocument("reviewer", {
    id_user: { $oid: user1Id },
    id_product: { $oid: prod2Id },
    ratting: 5,
    comment: "Giày LV Trainer đi cực kỳ êm chân và chuẩn size, rất hài lòng!",
    created_at: { $date: new Date().toISOString() },
  });

  await insertDocument("reviewer", {
    id_user: { $oid: user2Id },
    id_product: { $oid: prod2Id },
    ratting: 5,
    comment: "Màu xanh phối rất đẹp mắt, mang lên chân cực kỳ ngầu.",
    created_at: { $date: new Date().toISOString() },
  });

  await insertDocument("reviewer", {
    id_user: { $oid: user1Id },
    id_product: { $oid: prod3Id },
    ratting: 3,
    comment: "Balo đẹp nhưng dây xích đan da hơi nặng vai khi đeo lâu.",
    created_at: { $date: new Date().toISOString() },
  });

  await insertDocument("reviewer", {
    id_user: { $oid: user2Id },
    id_product: { $oid: prod3Id },
    ratting: 4,
    comment: "Thiết kế cổ điển rất dễ phối đồ, chất da tốt.",
    created_at: { $date: new Date().toISOString() },
  });

  console.log("Tạo Địa chỉ mẫu cho Top Buyers...");
  const addr3Id = "65b2a1000000000000000003";
  const addr4Id = "65b2a1000000000000000004";
  const addr5Id = "65b2a1000000000000000005";
  const addr6Id = "65b2a1000000000000000006";

  await insertDocument("addresses", {
    _id: { $oid: addr3Id },
    id_user: { $oid: user3Id },
    full_name: "Nguyễn Văn Hùng",
    phone: "0938111222",
    province: "Hồ Chí Minh",
    district: "Quận 1",
    ward: "Phường Bến Nghé",
    detail: "12 Lê Duẩn",
    is_default: true,
    status: "ACTIVE",
  });

  await insertDocument("addresses", {
    _id: { $oid: addr4Id },
    id_user: { $oid: user4Id },
    full_name: "Trần Thị Mai",
    phone: "0938333444",
    province: "Hà Nội",
    district: "Hoàn Kiếm",
    ward: "Phường Tràng Tiền",
    detail: "45 Lý Thường Kiệt",
    is_default: true,
    status: "ACTIVE",
  });

  await insertDocument("addresses", {
    _id: { $oid: addr5Id },
    id_user: { $oid: user5Id },
    full_name: "Lê Minh Tuấn",
    phone: "0938555666",
    province: "Đà Nẵng",
    district: "Hải Châu",
    ward: "Phường Phước Ninh",
    detail: "88 Nguyễn Văn Linh",
    is_default: true,
    status: "ACTIVE",
  });

  await insertDocument("addresses", {
    _id: { $oid: addr6Id },
    id_user: { $oid: user6Id },
    full_name: "Phạm Hoài An",
    phone: "0938777888",
    province: "Hồ Chí Minh",
    district: "Quận 3",
    ward: "Phường Võ Thị Sáu",
    detail: "102 Nam Kỳ Khởi Nghĩa",
    is_default: true,
    status: "ACTIVE",
  });

  console.log("Tạo Đơn hàng mẫu cho Top Buyers...");
  await insertDocument("orders", {
    _id: { $oid: "65b2f1000000000000000001" },
    id_user: { $oid: user3Id },
    address_id: { $oid: addr3Id },
    total_amount: 185400000,
    shipping_fee: 50000,
    discount_amount: 0,
    payment_status: "paid",
    order_status: "completed",
    status: "ACTIVE",
    created_at: { $date: new Date().toISOString() },
    updated_at: { $date: new Date().toISOString() },
  });

  await insertDocument("orders", {
    _id: { $oid: "65b2f1000000000000000002" },
    id_user: { $oid: user4Id },
    address_id: { $oid: addr4Id },
    total_amount: 142000000,
    shipping_fee: 50000,
    discount_amount: 0,
    payment_status: "paid",
    order_status: "completed",
    status: "ACTIVE",
    created_at: { $date: new Date().toISOString() },
    updated_at: { $date: new Date().toISOString() },
  });

  await insertDocument("orders", {
    _id: { $oid: "65b2f1000000000000000003" },
    id_user: { $oid: user5Id },
    address_id: { $oid: addr5Id },
    total_amount: 98500000,
    shipping_fee: 50000,
    discount_amount: 0,
    payment_status: "paid",
    order_status: "completed",
    status: "ACTIVE",
    created_at: { $date: new Date().toISOString() },
    updated_at: { $date: new Date().toISOString() },
  });

  await insertDocument("orders", {
    _id: { $oid: "65b2f1000000000000000004" },
    id_user: { $oid: user6Id },
    address_id: { $oid: addr6Id },
    total_amount: 74200000,
    shipping_fee: 50000,
    discount_amount: 0,
    payment_status: "paid",
    order_status: "completed",
    status: "ACTIVE",
    created_at: { $date: new Date().toISOString() },
    updated_at: { $date: new Date().toISOString() },
  });

  console.log("=== SEED DỮ LIỆU HOÀN THÀNH THÀNH CÔNG ===");
}

main()
  .catch((e) => {
    console.error("Lỗi khi chạy seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
