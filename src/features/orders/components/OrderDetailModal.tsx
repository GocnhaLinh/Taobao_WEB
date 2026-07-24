import React from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';
import { useTranslation } from '../../../lib/i18n';
import type { Order } from '../../../services/orderService';
import { ShoppingBag, User, Calendar, MapPin, CreditCard, Truck, CheckCircle2, Clock } from 'lucide-react';

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  if (!order) return null;

  const userName = order.user?.fullName || order.userId || 'Khách hàng';
  const userEmail = order.user?.email || 'N/A';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Chi Tiết Đơn Hàng #${order.id}`}>
      <div className="space-y-6 text-slate-900 dark:text-white">
        {/* Order Header Meta */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-indigo-500 text-sm">{order.id}</span>
              <span className="text-xs text-slate-400">
                <Calendar className="h-3 w-3 inline mr-1" />
                {new Date(order.createdAt).toLocaleString('vi-VN')}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Mã địa chỉ giao: {order.addressId}</p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={order.paymentStatus === 'PAID' || order.paymentStatus === 'paid' ? 'success' : 'warning'}>
              Thanh toán: {order.paymentStatus}
            </Badge>
            <Badge variant={order.orderStatus === 'COMPLETED' || order.orderStatus === 'completed' ? 'success' : order.orderStatus === 'SHIPPING' || order.orderStatus === 'shipping' ? 'info' : 'neutral'}>
              Trạng thái: {order.orderStatus}
            </Badge>
          </div>
        </div>

        {/* Customer & Shipping Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <User className="h-4 w-4 text-indigo-500" /> Thông Tin Khách Hàng
            </div>
            <div>
              <p className="font-bold text-sm">{userName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{userEmail}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <MapPin className="h-4 w-4 text-emerald-500" /> Địa Chỉ Nhận Hàng
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              ID Địa chỉ: <span className="font-mono text-indigo-400">{order.addressId}</span>
              <br />
              Vận chuyển: Nhanh / Tiêu chuẩn Taobao
            </p>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-indigo-500" />
            Danh Sách Sản Phẩm ({order.items?.length || 0})
          </h4>

          <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden divide-y divide-slate-200 dark:divide-white/10">
            {order.items?.map((item) => (
              <div key={item.id} className="p-3.5 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 font-bold text-xs shrink-0">
                    x{item.quantity}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{item.productName}</p>
                    <p className="text-[11px] text-slate-400">Variant ID: {item.variantId}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{item.price.toLocaleString()} ₫</p>
                  <p className="text-[10px] text-slate-400">Tổng: {(item.price * item.quantity).toLocaleString()} ₫</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary Breakdown */}
        <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl space-y-2 text-xs">
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>Tiền hàng</span>
            <span>{(order.totalAmount - order.shippingFee + order.discountAmount).toLocaleString()} ₫</span>
          </div>
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>Phí vận chuyển</span>
            <span>+{order.shippingFee.toLocaleString()} ₫</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-500 font-medium">
              <span>Giảm giá (Voucher)</span>
              <span>-{order.discountAmount.toLocaleString()} ₫</span>
            </div>
          )}
          <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex justify-between items-center text-sm font-black">
            <span>Tổng thanh toán</span>
            <span className="text-indigo-600 dark:text-indigo-400 text-base">{order.totalAmount.toLocaleString()} ₫</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
