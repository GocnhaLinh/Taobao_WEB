import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "../../../../lib/i18n";
import { useDebounce } from "../../../../hooks/useDebounce";
import { fetchProductsApi } from "../../products/api/product.api";
import { getUsersApi } from "../../users/api/user.api";
import { validateCouponApi } from "../../coupons/api/coupon.api";
import { createOrderApi, getAddressesByUserIdApi } from "../api/order.api";
import type {
  CreateOrderCustomer,
  CustomerMode,
  DraftOrderItem,
  OrderUser,
  UseCreateOrderParams,
  UseCreateOrderReturn,
} from "../types";
import type { Address } from "../../../../types";

const emptyCustomer = (): CreateOrderCustomer => ({
  fullName: "",
  phone: "",
  email: "",
  province: "",
  district: "",
  ward: "",
  detail: "",
});

const toOrderUser = (u: {
  id: string;
  fullName?: string;
  name?: string;
  email: string;
  phone?: string | null;
}): OrderUser => ({
  id: u.id,
  fullName: u.fullName || u.name || u.email,
  email: u.email,
  phone: u.phone || null,
});

export const useCreateOrder = ({
  isOpen,
  onClose,
  onSuccess,
}: UseCreateOrderParams): UseCreateOrderReturn => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // ── Dữ liệu nền (users, products) — dùng react-query cache chung với page Users/Products ──
  // Chỉ fetch khi modal mở (enabled: isOpen); mở lại sau đó dùng cache (staleTime 5 phút) nên không gọi lại API
  const { data: rawUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getUsersApi,
    enabled: isOpen,
  });

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products", "active"],
    queryFn: fetchProductsApi,
    enabled: isOpen,
  });

  // Hiện loader nếu chưa có cache (đã có sẵn khi mở page Users/Products trước đó thì không cần chờ)
  const loadingData = loadingUsers || loadingProducts;

  // users = khách hàng đã đăng ký (loại trừ admin — admin chỉ là người TẠO đơn, không phải khách của đơn)
  const registeredUsers = useMemo(
    () =>
      rawUsers
        .filter((u) => {
          if ((u.role || "").toUpperCase() === "ADMIN") return false;
          // Chỉ hiển thị tài khoản còn hoạt động — không cho tạo đơn cho user đã xóa
          const st = (u.status || "ACTIVE").toUpperCase();
          return st !== "DELETED" && st !== "BLOCKED";
        })
        .map(toOrderUser),
    [rawUsers],
  );

  // ── Chế độ khách hàng (chỉ có: Khách đã đăng ký | Khách vãng lai) ──
  // Người tạo đơn luôn là Admin (payload gửi createdBy: 'ADMIN') — không cần chế độ "Gán cho Admin"
  const [customerMode, setCustomerMode] = useState<CustomerMode>("registered");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [customer, setCustomer] =
    useState<CreateOrderCustomer>(emptyCustomer());

  // Đổi giữa 2 đối tượng khách (đăng ký ↔ vãng lai) → reset toàn bộ phần chọn khách hàng
  // để dữ liệu của loại khách trước không bị lẫn sang loại khách sau
  const handleCustomerModeChange = useCallback((mode: CustomerMode) => {
    setCustomerMode(mode);
    setSelectedUserId("");
    setSelectedAddressId("");
    setAddresses([]);
    setCustomer(emptyCustomer());
  }, []);

  // Khi chọn khách đã đăng ký → tải danh sách địa chỉ của họ
  useEffect(() => {
    if (customerMode !== "registered" || !selectedUserId) {
      setAddresses([]);
      setSelectedAddressId("");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const list = await getAddressesByUserIdApi(selectedUserId);
        if (cancelled) return;
        setAddresses(list);
        const def = list.find((a) => a.isDefault);
        setSelectedAddressId(def?.id || list[0]?.id || "");
      } catch {
        if (!cancelled) setAddresses([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [customerMode, selectedUserId]);

  const setCustomerField = useCallback(
    (field: keyof CreateOrderCustomer, value: string) => {
      setCustomer((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  // ── Chọn sản phẩm ──
  const [productSearch, setProductSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [priceOverride, setPriceOverride] = useState("");

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.productName.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.category?.name || "").toLowerCase().includes(q) ||
        (p.brand?.name || "").toLowerCase().includes(q) ||
        (p.variants || []).some((v) => v.sku.toLowerCase().includes(q)),
    );
  }, [products, productSearch]);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) || null,
    [products, selectedProductId],
  );

  // Đổi product → reset variant + giá
  const handleSelectProduct = useCallback((id: string) => {
    setSelectedProductId(id);
    setSelectedVariantId("");
    setPriceOverride("");
    setQuantity(1);
  }, []);

  // Chọn variant → tự điền giá (ưu tiên salePrice)
  const handleSelectVariant = useCallback(
    (variantId: string) => {
      setSelectedVariantId(variantId);
      const variants = selectedProduct?.variants || [];
      const v = variants.find((x) => x.id === variantId);
      setPriceOverride(v ? String(v.salePrice ?? v.price) : "");
    },
    [selectedProduct],
  );

  // ── Giỏ hàng đơn (draft items) ──
  const [draftItems, setDraftItems] = useState<DraftOrderItem[]>([]);

  const addItem = useCallback(() => {
    if (!selectedProduct) return;
    const variant = (selectedProduct.variants || []).find(
      (v) => v.id === selectedVariantId,
    );
    if (!variant) return;
    // Chặn thêm variant đang tạm ngưng (INACTIVE) vào đơn — chỉ bán variant ACTIVE
    if (variant.status !== "ACTIVE") return;
    // Chặn số lượng vượt tồn kho — clamp theo stock của variant (nếu có khai báo kho)
    const qty = Math.min(
      Math.max(1, quantity),
      variant.stock ?? Number.MAX_SAFE_INTEGER,
    );
    const price =
      Number(priceOverride) > 0
        ? Number(priceOverride)
        : (variant.salePrice ?? variant.price);

    setDraftItems((prev) => {
      const existing = prev.find((it) => it.variantId === variant.id);
      if (existing) {
        return prev.map((it) =>
          it.variantId === variant.id
            ? { ...it, quantity: it.quantity + qty, price }
            : it,
        );
      }
      const variantName =
        [variant.size, variant.color].filter(Boolean).join(" - ") || "—";
      // Ảnh đại diện: ưu tiên ảnh variant (đúng màu/size), fallback về thumbnail/ảnh của sản phẩm
      // (nhiều sản phẩm chỉ có ảnh cấp product, variant không lưu ảnh riêng)
      const image =
        variant.image ||
        variant.images?.[0] ||
        selectedProduct.thumbnail ||
        selectedProduct.images?.[0]?.imageUrl ||
        "";
      return [
        ...prev,
        {
          variantId: variant.id,
          productName: selectedProduct.productName,
          variantName,
          quantity: qty,
          price,
          image,
          variant: {
            id: variant.id,
            sku: variant.sku,
            size: variant.size,
            color: variant.color,
            price: variant.price,
            salePrice: variant.salePrice,
            stock: variant.stock,
            image: variant.image,
            images: variant.images,
            weight: variant.weight,
            originalPriceCNY: variant.originalPriceCNY,
            exchangeRate: variant.exchangeRate,
            shippingCostVND: variant.shippingCostVND,
            totalCostVND: variant.totalCostVND,
            profitVND: variant.profitVND,
            status: variant.status,
          },
        },
      ];
    });
  }, [selectedProduct, selectedVariantId, quantity, priceOverride]);

  const updateItemQuantity = useCallback((variantId: string, qty: number) => {
    setDraftItems((prev) =>
      prev.map((it) => {
        if (it.variantId !== variantId) return it;
        // Clamp theo stock snapshot của variant trong đơn (chặn vượt tồn kho)
        const maxQty = it.variant?.stock ?? Number.MAX_SAFE_INTEGER;
        return { ...it, quantity: Math.min(Math.max(1, qty), maxQty) };
      }),
    );
  }, []);

  const removeItem = useCallback((variantId: string) => {
    setDraftItems((prev) => prev.filter((it) => it.variantId !== variantId));
  }, []);

  // ── Phí ship, coupon, tổng tiền ──
  const [shippingFee, setShippingFee] = useState("");
  const [couponCode, setCouponCode] = useState("");

  const subtotal = useMemo(
    () => draftItems.reduce((sum, it) => sum + it.price * it.quantity, 0),
    [draftItems],
  );

  // ── Kiểm tra coupon (debounce) → tính đúng tiền giảm ──
  // Dùng API validate của backend để tổng hiển thị KHỚP với đơn thực tạo (trừ đúng voucher).
  const debouncedCoupon = useDebounce(couponCode.trim(), 400);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponStatus, setCouponStatus] = useState<
    "idle" | "valid" | "invalid"
  >("idle");
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!debouncedCoupon) {
      setDiscountAmount(0);
      setCouponStatus("idle");
      setCouponMessage(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await validateCouponApi({
          code: debouncedCoupon,
          orderValue: subtotal,
        });
        if (cancelled) return;
        if (res.valid && res.coupon) {
          const c = res.coupon;
          let discount =
            c.discountType === "percent"
              ? (subtotal * c.discountValue) / 100
              : c.discountValue;
          if (c.maxDiscount && discount > c.maxDiscount)
            discount = c.maxDiscount;
          if (discount > subtotal) discount = subtotal;
          setDiscountAmount(discount);
          setCouponStatus("valid");
          setCouponMessage(null);
        } else {
          setDiscountAmount(0);
          setCouponStatus("invalid");
          setCouponMessage(res.message || "Mã giảm giá không hợp lệ.");
        }
      } catch {
        if (cancelled) return;
        setDiscountAmount(0);
        setCouponStatus("invalid");
        setCouponMessage("Lỗi khi kiểm tra mã giảm giá.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedCoupon, subtotal]);

  // Tổng thanh toán = tiền hàng + phí ship − giảm giá voucher
  const total =
    subtotal +
    (Number(shippingFee) > 0 ? Number(shippingFee) : 0) -
    discountAmount;

  // ── Submit ──
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Reset form ──
  // Dùng chung: sau khi tạo đơn thành công VÀ khi đóng modal (Hủy/X) → mở lại là form trống
  const resetForm = useCallback(() => {
    setCustomerMode("registered");
    setSelectedUserId("");
    setSelectedAddressId("");
    setAddresses([]);
    setCustomer(emptyCustomer());
    setProductSearch("");
    setSelectedProductId("");
    setSelectedVariantId("");
    setPriceOverride("");
    setQuantity(1);
    setDraftItems([]);
    setShippingFee("");
    setCouponCode("");
    setDiscountAmount(0);
    setCouponStatus("idle");
    setCouponMessage(null);
    setError(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    setError(null);

    if (draftItems.length === 0) {
      setError(t("createOrderNoItems") || "Vui lòng thêm ít nhất 1 sản phẩm.");
      return;
    }

    let payloadUserId: string | undefined;
    let payloadAddressId: string | undefined;
    const shipping: CreateOrderCustomer = {
      ...emptyCustomer(),
      ...customer,
    };

    if (customerMode === "registered") {
      if (!selectedUserId) {
        setError(
          t("createOrderSelectCustomer") ||
            "Vui lòng chọn khách hàng đã đăng ký.",
        );
        return;
      }
      const u = registeredUsers.find((x) => x.id === selectedUserId);
      payloadUserId = selectedUserId;
      payloadAddressId = selectedAddressId || undefined;
      shipping.fullName = shipping.fullName || u?.fullName || "";
      shipping.phone = shipping.phone || u?.phone || "";
    } else {
      // Khách vãng lai — chưa đăng ký tài khoản
      if (!shipping.fullName.trim()) {
        setError(
          t("createOrderGuestNameRequired") || "Vui lòng nhập tên khách hàng.",
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const order = await createOrderApi({
        userId: payloadUserId,
        addressId: payloadAddressId,
        items: draftItems.map((it) => ({
          variantId: it.variantId,
          quantity: it.quantity,
          price: it.price,
        })),
        couponCode: couponCode.trim() || undefined,
        shippingFee: Number(shippingFee) > 0 ? Number(shippingFee) : 0,
        customer: shipping,
        createdBy: "ADMIN",
      });

      // Tạo đơn đã trừ kho → làm mới cache products để lần mở modal sau thấy stock mới
      queryClient.invalidateQueries({ queryKey: ["products", "active"] });

      // Reset form về trạng thái ban đầu
      resetForm();

      if (onSuccess) onSuccess(order);
    } catch (err: any) {
      setError(
        err?.response?.data?.error || err.message || t("createOrderFailed"),
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    draftItems,
    customerMode,
    selectedUserId,
    selectedAddressId,
    registeredUsers,
    customer,
    couponCode,
    shippingFee,
    resetForm,
    onSuccess,
    t,
    queryClient,
  ]);

  // Đóng modal (Hủy / X / click overlay) → reset toàn bộ form để lần mở sau bắt đầu trống
  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  return {
    customerMode,
    setCustomerMode: handleCustomerModeChange,
    users: registeredUsers,
    loadingData,
    selectedUserId,
    setSelectedUserId,
    selectedAddressId,
    setSelectedAddressId,
    addresses,
    customer,
    setCustomerField,
    productSearch,
    setProductSearch,
    filteredProducts,
    selectedProduct,
    selectedVariantId,
    handleSelectVariant,
    handleSelectProduct,
    quantity,
    setQuantity,
    priceOverride,
    setPriceOverride,
    draftItems,
    addItem,
    updateItemQuantity,
    removeItem,
    shippingFee,
    setShippingFee,
    couponCode,
    setCouponCode,
    subtotal,
    discountAmount,
    couponStatus,
    couponMessage,
    total,
    isSubmitting,
    error,
    handleSubmit,
    handleClose,
  };
};
