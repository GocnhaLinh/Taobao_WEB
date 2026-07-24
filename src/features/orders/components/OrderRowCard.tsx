import React from 'react';
import { Badge } from '../../../components/ui/Badge';
import { useTranslation } from '../../../lib/i18n';
import type { Order } from '../../../services/orderService';
import { Eye, Package, Calendar, User } from 'lucide-react';

interface OrderRowCardProps {
  order: Order;
  onViewDetails?: (order: Order) => void;
}

export const OrderRowCard: React.FC<OrderRowCardProps> = ({ order, onViewDetails }) => {
  const { t } = useTranslation();
  const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || order.items?.length || 0;
  const userName = order.user?.fullName || order.userId || 'Khách hàng';

  // Get customer initial for avatar
  const initial = userName.charAt(0).toUpperCase();

  return (
    <div
      onClick={() => onViewDetails && onViewDetails(order)}
      className="group p-4 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start md:items-center gap-3.5">
        {/* Avatar Ring */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-black text-sm flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
          {initial}
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-extrabold text-indigo-600 dark:text-indigo-400 group-hover:underline">
              #{order.id}
            </span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(order.createdAt).toLocaleDateString('vi-VN')}
            </span>
          </div>

          <h4 className="text-slate-900 dark:text-white font-bold text-sm group-hover:text-indigo-500 transition-colors">
            {userName}
          </h4>

          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 line-clamp-1">
            <Package className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>{itemCount} {t('itemsPurchased')}</span>
            <span>•</span>
            <span className="truncate max-w-xs md:max-w-md">
              {order.items?.map((i) => i.productName).join(', ') || 'Sản phẩm Taobao'}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-white/5">
        <div className="text-left md:text-right">
          <span className="block text-slate-900 dark:text-white font-black text-base">
            {order.totalAmount.toLocaleString()} ₫
          </span>
          <span className="text-[10px] text-slate-400 block">Đã gồm ship & giảm giá</span>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={order.paymentStatus === 'PAID' || order.paymentStatus === 'paid' ? 'success' : order.paymentStatus === 'PENDING' || order.paymentStatus === 'pending' ? 'warning' : 'danger'}>
            {order.paymentStatus}
          </Badge>
          <Badge variant={order.orderStatus === 'COMPLETED' || order.orderStatus === 'completed' ? 'success' : order.orderStatus === 'SHIPPING' || order.orderStatus === 'shipping' ? 'info' : 'neutral'}>
            {order.orderStatus}
          </Badge>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails && onViewDetails(order);
            }}
            className="p-2 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition cursor-pointer"
            title="Xem chi tiết đơn hàng"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
