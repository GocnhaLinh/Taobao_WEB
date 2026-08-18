import React, { useEffect, useState } from "react";
import { Modal } from "../../../../components/ui/Modal";
import { Badge } from "../../../../components/ui/Badge";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { CustomSelect } from "../../../../components/ui/CustomSelect";
import { useTranslation } from "../../../../lib/i18n";
import { getOrderStatusOptions, getPaymentStatusOptions } from "../constants";
import { formatHistoryNote } from "../utils/order.utils";
import { useOrderDetailModal } from "../hooks/useOrderDetailModal";
import { useOrderCancellation } from "../hooks/useOrderCancellation";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { CancelOrderModal, CancellationStatusBadge } from "./CancelOrderModal";
import { CustomerDetailPanel } from "./CustomerDetailPanel";
import { ProductDetailPanel } from "./ProductDetailPanel";
import type {
  OrderCancellation,
  OrderDetailModalProps,
  OrderItem,
} from "../types";
import {
  ShoppingBag,
  User,
  Calendar,
  MapPin,
  PackageCheck,
  Clock,
  Save,
  Loader2,
  Copy,
  Check,
  Phone,
  Mail,
  Package,
  Tag,
  ChevronRight,
  X,
  XCircle,
  RotateCcw,
} from "lucide-react";

type DetailState =
  | { kind: "customer" }
  | { kind: "product"; item: OrderItem }
  | null;

/**
 * Rule hủy đơn (trang admin):
 * Admin được quyền hủy đơn ở hầu hết trạng thái,
 * nhưng KHÔNG hủy được đơn đã CANCELLED hoặc COMPLETED (đã giao cho khách).
 * (Phân biệt admin/user sẽ ghép sau khi làm auth.)
 */
const isCancellableStatus = (status?: string) => {
  const st = (status || "").toUpperCase();
  return st !== "CANCELLED" && st !== "COMPLETED";
};

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onRefresh,
  onListRefresh,
}) => {
  const { t } = useTranslation();
  const [detail, setDetail] = useState<DetailState>(null);

  const {
    isCancelModalOpen,
    setIsCancelModalOpen,
    currentOrder,
    updatingCancellationId,
    cancellationError,
    handleChangeCancellationStatus,
    handleCancelSuccess,
    refreshOrder,
  } = useOrderCancellation({ order, isOpen, onListRefresh });

  const {
    status,
    setStatus,
    paymentStatus,
    depositAmount,
    setDepositAmount,
    taobaoOrderId,
    setTaobaoOrderId,
    trackingCode,
    setTrackingCode,
    note,
    setNote,
    isUpdating,
    message,
    copiedField,
    handleCopyText,
    handlePaymentStatusChange,
    handleSaveStatus,
  } = useOrderDetailModal({
    order,
    // Làm mới danh sách phía sau (KHÔNG đóng modal) + cập nhật bản chi tiết đang xem sau khi lưu
    onRefresh: onListRefresh || onRefresh,
    onSaved: refreshOrder,
  });

  // Đóng/mở modal mới → reset panel phụ
  useEffect(() => {
    setDetail(null);
  }, [order?.id, isOpen]);

  if (!order) return null;

  // Ưu tiên bản chi tiết đầy đủ (có cancellations/payments); fallback về đơn ban đầu
  const activeOrder = currentOrder ?? order;

  // Render từ bản chi tiết đầy đủ (activeOrder) để badge/giá tiền cập nhật ngay sau khi lưu
  const { user, customerName, customerPhone, customerEmail, userId } =
    activeOrder;
  const isGuest = !user;
  const userName = [
    user?.fullName,
    customerName,
    userId,
    t("anonymousUser"),
  ].find(Boolean)!;
  const userEmail = user?.email ?? customerEmail ?? "N/A";
  const userPhone = user?.phone ?? customerPhone ?? "N/A";

  const shippingAddress = activeOrder.address
    ? [
        activeOrder.address.detail,
        activeOrder.address.ward,
        activeOrder.address.district,
        activeOrder.address.province,
      ]
        .filter(Boolean)
        .join(", ")
    : [
        activeOrder.shippingDetail,
        activeOrder.shippingWard,
        activeOrder.shippingDistrict,
        activeOrder.shippingProvince,
      ]
        .filter(Boolean)
        .join(", ");

  const modalTitleNode = (
    <div className="flex items-center gap-2 min-w-0 pr-2">
      <ShoppingBag className="h-5 w-5 text-indigo-500 shrink-0" />
      <span className="truncate font-bold text-slate-900 dark:text-white text-base sm:text-lg">
        {t("orderDetailTitle")}
      </span>
      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-500/20 shrink-0">
        {activeOrder.orderCode || `#${activeOrder.id.slice(-8)}`}
      </span>
      {detail && (
        <button
          type="button"
          onClick={() => setDetail(null)}
          className="ml-1 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          title={t("close")}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  const renderOrderBody = () => (
    <div className="space-y-5 text-slate-900 dark:text-white">
      {/* Order Card Overview Banner */}
      <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 dark:border-white/10 pb-2.5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-xs text-slate-400 font-medium shrink-0">
              {t("orderIdLabel")}
            </span>
            <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 break-all select-all">
              {activeOrder.id}
            </span>
            <button
              type="button"
              onClick={() => handleCopyText(activeOrder.id, "orderId")} // đưa ra ngoài
              className="p-1 text-slate-400 hover:text-indigo-500 rounded-md transition cursor-pointer shrink-0"
              title={t("copyOrderId")}
            >
              {copiedField === "orderId" ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(activeOrder.createdAt).toLocaleString("vi-VN")}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => setDetail({ kind: "customer" })} // đưa ra ngoài
            className="group flex items-center gap-2 text-xs min-w-0 text-left cursor-pointer"
          >
            <span className="text-slate-400 shrink-0">
              {t("customerLabel")}
            </span>
            <strong className="text-slate-800 dark:text-slate-200 font-bold truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {userName}
            </strong>
            {isGuest && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                {t("guestBadge")}
              </span>
            )}
            <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0" />
            <span className="text-slate-400 hidden xs:inline">
              ({userEmail})
            </span>
          </button>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Badge
              variant={
                activeOrder.paymentStatus === "PAID" ||
                activeOrder.paymentStatus === "paid"
                  ? "success"
                  : "warning"
              }
            >
              {t("paymentLabel")} {activeOrder.paymentStatus.toUpperCase()}
            </Badge>
            <OrderStatusBadge status={activeOrder.orderStatus} />
          </div>
        </div>
      </div>

      {/* Admin Workflow & Status Update Form Card */}
      <div className="p-4 sm:p-5 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent border border-indigo-500/20 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h4 className="text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
            <PackageCheck className="h-4 w-4 shrink-0" />
            {t("updateStatusTitle")}
          </h4>
          <span className="text-[11px] text-slate-400 font-semibold">
            {t("adminControlPanel")}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Status Dropdown */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {t("orderStatusLabel")}
            </label>
            <CustomSelect
              value={status}
              onChange={setStatus}
              className="w-full text-xs"
              options={getOrderStatusOptions(t)}
            />
          </div>

          {/* Payment & Deposit Status Dropdown */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {t("depositPaymentStatusLabel")}
            </label>
            <CustomSelect
              value={paymentStatus}
              onChange={handlePaymentStatusChange}
              className="w-full text-xs"
              options={getPaymentStatusOptions(t)}
            />
          </div>

          {/* Taobao Order ID Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              {t("taobaoOrderIdLabel")}
            </label>
            <Input
              value={taobaoOrderId}
              onChange={(e) => setTaobaoOrderId(e.target.value)}
              placeholder="Ví dụ: TB987654321012"
              className="text-xs font-mono"
            />
          </div>

          {/* CN-VN Tracking Code Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              {t("trackingCodeLabel")}
            </label>
            <Input
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="Ví dụ: VN8899776655CN"
              className="text-xs font-mono"
            />
          </div>

          {/* Deposit Amount Custom Input */}
          <div className="space-y-2 sm:col-span-2 p-3 bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-xl">
            <div className="flex flex-col gap-1.5 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {t("actualDepositLabel")}
              </span>
              <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px] text-center">
                <div className="flex flex-col min-w-0 p-2 rounded-lg bg-gradient-to-br from-indigo-500/15 to-purple-500/10 border border-indigo-500/25">
                  <span className="text-indigo-500 text-[10px] font-sans font-black uppercase tracking-wider">
                    {t("totalOrderLabel")}
                  </span>
                  <strong className="text-indigo-700 dark:text-indigo-300 text-sm truncate mt-0.5">
                    {activeOrder.totalAmount.toLocaleString()}₫
                  </strong>
                </div>
                <div className="flex flex-col min-w-0 p-2 rounded-lg bg-white/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/10">
                  <span className="text-slate-400 text-[10px] font-sans font-bold uppercase tracking-wider">
                    {t("depositedLabel")}
                  </span>
                  <strong className="text-indigo-600 dark:text-indigo-400 truncate mt-0.5">
                    {depositAmount.toLocaleString()}₫
                  </strong>
                </div>
                <div className="flex flex-col min-w-0 p-2 rounded-lg bg-white/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/10">
                  <span className="text-slate-400 text-[10px] font-sans font-bold uppercase tracking-wider">
                    {t("debtLabel")}
                  </span>
                  <strong className="text-rose-500 truncate mt-0.5">
                    {Math.max(
                      0,
                      activeOrder.totalAmount - depositAmount,
                    ).toLocaleString()}
                    ₫
                  </strong>
                </div>
              </div>
            </div>

            <div className="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value) || 0)}
                placeholder={t("depositAmountPlaceholder")}
                className="text-xs font-mono flex-1"
              />
              <div className="grid grid-cols-3 gap-1.5 shrink-0">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePaymentStatusChange("DEPOSIT_50")}
                  className="px-2 py-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20"
                >
                  {t("deposit50Btn")}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePaymentStatusChange("DEPOSIT_70")}
                  className="px-2 py-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20"
                >
                  {t("deposit70Btn")}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePaymentStatusChange("PAID")}
                  className="px-2 py-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20"
                >
                  {t("paid100Btn")}
                </Button>
              </div>
            </div>
          </div>

          {/* Note / History Note */}
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {t("updateNoteLabel")}
            </label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("updateNotePlaceholder")}
              className="text-xs"
            />
          </div>
        </div>

        {message && (
          <p
            className={`text-xs font-bold p-2.5 rounded-xl border ${
              message.type === "success"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
            }`}
          >
            {message.text}
          </p>
        )}

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsCancelModalOpen(true)}
            disabled={
              isUpdating || !isCancellableStatus(activeOrder.orderStatus)
            }
            title={
              isCancellableStatus(activeOrder.orderStatus)
                ? undefined
                : activeOrder.orderStatus?.toUpperCase() === "COMPLETED"
                  ? t("cannotCancelCompleted")
                  : t("orderAlreadyCancelled")
            }
            className="text-xs px-4 py-2 w-full sm:w-auto font-bold"
          >
            <XCircle className="h-3.5 w-3.5 mr-1.5" />
            {t("cancelOrder")}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveStatus}
            disabled={isUpdating}
            className="text-xs px-4 py-2 w-full sm:w-auto"
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                {t("saving")}
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 mr-1.5" />
                {t("updateOrderBtn")}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Customer & Shipping Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Customer info card — click để mở panel chi tiết */}
        <button
          type="button"
          onClick={() => setDetail({ kind: "customer" })}
          className="group p-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl space-y-2 text-left cursor-pointer hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5 transition-all"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <User className="h-4 w-4 text-indigo-500 shrink-0" />{" "}
            {t("customerInfoTitle")}
            <ChevronRight className="h-3.5 w-3.5 ml-auto text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
          <div className="space-y-1 text-xs">
            <p className="font-bold text-sm text-slate-900 dark:text-white">
              {userName}
            </p>
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 break-all">
              <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span>{userEmail}</span>
            </div>
            {userPhone && userPhone !== "N/A" && (
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span>{userPhone}</span>
              </div>
            )}
            {shippingAddress && (
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 pt-0.5">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="line-clamp-2">{shippingAddress}</span>
              </div>
            )}
          </div>
        </button>

        {/* Delivery & Tracking IDs */}
        <div className="p-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />{" "}
            {t("shippingInfoTitle")}
          </div>
          <div className="text-xs space-y-2">
            <div className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-slate-900/40 rounded-xl border border-slate-200/50 dark:border-white/5">
              <span className="text-slate-500 font-semibold shrink-0">
                {t("addressIdLabel")}
              </span>
              <div className="flex items-center gap-1 min-w-0">
                <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 break-all truncate">
                  {activeOrder.addressId || "—"}
                </span>
                {activeOrder.addressId && (
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(activeOrder.addressId!, "addressId")
                    }
                    className="p-1 text-slate-400 hover:text-indigo-500 shrink-0"
                    title={t("copyAddressId")}
                  >
                    {copiedField === "addressId" ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-slate-900/40 rounded-xl border border-slate-200/50 dark:border-white/5">
              <span className="text-slate-500 font-semibold shrink-0">
                {t("cnVnShippingLabel")}
              </span>
              {activeOrder.trackingCode ? (
                <span className="font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-200 dark:border-sky-500/20 text-[11px] truncate">
                  {activeOrder.trackingCode}
                </span>
              ) : (
                <span className="text-slate-400 italic text-[11px]">
                  {t("noTrackingCodeYet")}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Items List — click item để mở panel chi tiết sản phẩm */}
      <div className="space-y-2.5">
        <h4 className="text-xs sm:text-sm font-bold flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-indigo-500" />
          {t("productListTitle")} ({activeOrder.items?.length || 0})
          {activeOrder.items?.length > 0 && (
            <span className="text-[10px] font-semibold text-slate-400">
              {t("clickToViewProductDetail")}
            </span>
          )}
        </h4>

        <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden divide-y divide-slate-200 dark:divide-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
          {activeOrder.items?.map((item) => {
            const thumb =
              item.variant?.image ||
              item.variant?.images?.[0] ||
              item.variant?.product?.thumbnail ||
              item.variant?.product?.images?.[0]?.imageUrl;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setDetail({ kind: "product", item })}
                className="group w-full p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 min-w-0 text-left cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={item.productName}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-white/10 shrink-0 bg-white dark:bg-slate-800"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xs shrink-0 mt-0.5 sm:mt-0">
                      x{item.quantity}
                    </div>
                  )}
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white break-words line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.productName}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {item.variantName && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          {t("variantLabel")}{" "}
                          <strong className="text-slate-700 dark:text-slate-300">
                            {item.variantName}
                          </strong>
                        </p>
                      )}
                      {item.variant?.sku && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-white/10">
                          {item.variant.sku}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {t("viewProductDetail")}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0 self-end sm:self-auto pl-12 sm:pl-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {item.price.toLocaleString()} ₫
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {t("total")}:{" "}
                    {(item.price * item.quantity).toLocaleString()} ₫
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Financial Summary Breakdown */}
      <div className="p-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl space-y-2 text-xs overflow-hidden">
        <div className="flex justify-between text-slate-500 dark:text-slate-400">
          <span>{t("itemsTotalLabel")}</span>
          <span>
            {(
              activeOrder.totalAmount -
              activeOrder.shippingFee +
              activeOrder.discountAmount
            ).toLocaleString()}{" "}
            ₫
          </span>
        </div>
        <div className="flex justify-between text-slate-500 dark:text-slate-400">
          <span>{t("shippingFeeLabel")}</span>
          <span>+{activeOrder.shippingFee.toLocaleString()} ₫</span>
        </div>
        {activeOrder.discountAmount > 0 && (
          <div className="flex justify-between text-emerald-500 font-medium">
            <span>{t("discountVoucherLabel")}</span>
            <span>-{activeOrder.discountAmount.toLocaleString()} ₫</span>
          </div>
        )}
        <div className="pt-2.5 mt-1 border-t-2 border-indigo-500/15 flex justify-between items-center bg-gradient-to-r from-indigo-500/10 to-transparent -mx-3.5 px-3.5 py-2.5 rounded-b-2xl">
          <span className="text-indigo-600 dark:text-indigo-400 uppercase tracking-wide text-xs font-black">
            {t("totalPaymentLabel")}
          </span>
          <span className="text-indigo-700 dark:text-indigo-300 text-lg font-black tracking-tight">
            {activeOrder.totalAmount.toLocaleString()} ₫
          </span>
        </div>
      </div>

      {/* Cancellation & Refund */}
      {activeOrder.cancellations && activeOrder.cancellations.length > 0 && (
        <div className="space-y-2.5">
          <h4 className="text-xs sm:text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <RotateCcw className="h-4 w-4 text-rose-500" />
            {t("cancellationTitle")} ({activeOrder.cancellations.length})
          </h4>
          {cancellationError && (
            <p className="text-[11px] font-bold p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              {cancellationError}
            </p>
          )}
          {activeOrder.cancellations.map((c: OrderCancellation) => (
            <div
              key={c.id}
              className="p-3.5 bg-rose-500/5 border border-rose-500/20 rounded-2xl space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CancellationStatusBadge status={c.status} />
                <span className="text-[10px] text-slate-400">
                  {new Date(c.createdAt).toLocaleString("vi-VN")}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 italic border-l-2 border-rose-500/30 pl-2.5">
                "{c.reason}"
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                <div className="p-2 bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-xl">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    {t("productRefundLabel")}
                  </p>
                  <p className="font-black text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                    {c.productRefund.toLocaleString()} ₫
                  </p>
                </div>
                <div className="p-2 bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-xl">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    {t("shippingLossLabel")}
                  </p>
                  <p className="font-black text-rose-500 mt-0.5 truncate">
                    -{c.shippingLoss.toLocaleString()} ₫
                  </p>
                </div>
                <div className="p-2 bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-xl">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    {t("warehouseLossLabel")}
                  </p>
                  <p className="font-black text-rose-500 mt-0.5 truncate">
                    -{c.warehouseLoss.toLocaleString()} ₫
                  </p>
                </div>
                <div className="p-2 bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-xl">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    {t("serviceLossLabel")}
                  </p>
                  <p className="font-black text-rose-500 mt-0.5 truncate">
                    -{c.serviceLoss.toLocaleString()} ₫
                  </p>
                </div>
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl col-span-2 sm:col-span-1">
                  <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    {t("finalRefundLabel")}
                  </p>
                  <p className="font-black text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                    {c.finalRefund.toLocaleString()} ₫
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-rose-500/10">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {t("cancellationStatusLabel")}
                </span>
                <CustomSelect
                  value={c.status}
                  onChange={(st) => handleChangeCancellationStatus(c.id, st)}
                  className="w-44 text-xs"
                  size="sm"
                  disabled={updatingCancellationId === c.id}
                  options={[
                    { value: "PENDING", label: t("cancellationPending") },
                    { value: "APPROVED", label: t("cancellationApproved") },
                    { value: "REFUNDED", label: t("cancellationRefunded") },
                    { value: "REJECTED", label: t("cancellationRejected") },
                  ]}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Status History Timeline */}
      {activeOrder.statusHistory && activeOrder.statusHistory.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs sm:text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <Clock className="h-4 w-4 text-indigo-500" />
            {t("statusHistoryTitle")} ({activeOrder.statusHistory.length})
          </h4>

          <div className="relative border-l-2 border-indigo-500/20 dark:border-indigo-500/40 ml-3 space-y-3 py-1">
            {activeOrder.statusHistory
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              )
              .map((hist, idx) => (
                <div key={hist.id || idx} className="relative pl-5">
                  <span className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-slate-900 flex items-center justify-center text-[9px] text-white font-bold">
                    ✓
                  </span>
                  <div className="p-2.5 sm:p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <OrderStatusBadge status={hist.status} />
                        <span className="text-[10px] text-slate-400 font-mono">
                          {t("byUser", { user: hist.createdBy })}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(hist.createdAt).toLocaleString("vi-VN")}
                      </span>
                    </div>
                    {hist.note && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic pt-1 border-t border-slate-200/50 dark:border-white/5 mt-1">
                        "{formatHistoryNote(hist.note, t)}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderDetailPanel = () => {
    if (!detail) return null;
    const title =
      detail.kind === "customer"
        ? t("customerDetailTitle") || "Chi Tiết Khách Hàng"
        : t("productDetailTitle") || "Chi Tiết Sản Phẩm";

    return (
      <div className="flex flex-col min-w-0 h-full">
        {/* Header cố định, không cuộn theo nội dung */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-white/10 mb-4 shrink-0">
          <h4 className="text-sm font-black flex items-center gap-2">
            {detail.kind === "customer" ? (
              <User className="h-4 w-4 text-indigo-500" />
            ) : (
              <Package className="h-4 w-4 text-indigo-500" />
            )}
            {title}
          </h4>
          <button
            type="button"
            onClick={() => setDetail(null)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title={t("close")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {/* Nội dung cuộn độc lập trong panel (min-h-0 để scroll hoạt động ổn định mọi trình duyệt) */}
        <div className="flex-1 overflow-y-auto no-scrollbar min-w-0 min-h-0">
          {detail.kind === "customer" ? (
            <CustomerDetailPanel
              order={activeOrder}
              userName={userName}
              userEmail={userEmail}
              userPhone={userPhone}
              isGuest={isGuest}
              shippingAddress={shippingAddress}
            />
          ) : (
            <ProductDetailPanel item={detail.item} />
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setDetail(null);
          onClose();
        }}
        title={modalTitleNode}
        maxWidth={detail ? "full" : "3xl"}
      >
        {detail ? (
          /* 2 panel cuộn độc lập: lăn chuột bên nào chỉ cuộn bên đó */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 min-w-0 lg:h-[calc(72vh-2.5rem)] lg:overflow-hidden">
            {/* Panel trái: đơn hàng — tự cuộn riêng */}
            <div className="min-w-0 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-white/10 pb-5 lg:pb-0 lg:pr-6 max-h-[62vh] lg:max-h-none lg:h-full overflow-y-auto no-scrollbar">
              {renderOrderBody()}
            </div>
            {/* Panel phải: khách hàng / sản phẩm — cuộn riêng, header cố định */}
            <div className="min-w-0 max-h-[62vh] lg:max-h-none lg:h-full overflow-hidden flex flex-col">
              {renderDetailPanel()}
            </div>
          </div>
        ) : (
          renderOrderBody()
        )}
      </Modal>

      {/* Cancel Order Modal — hủy đơn + hoàn tiền */}
      <CancelOrderModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        order={activeOrder}
        onSuccess={handleCancelSuccess}
      />
    </>
  );
};
