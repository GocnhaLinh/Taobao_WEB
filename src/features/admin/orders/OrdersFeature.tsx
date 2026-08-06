import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '../../../lib/i18n';
import { useDebounce } from '../../../lib/useDebounce';
import { getOrdersApi, type Order } from '../../../services/orderService';
import {
  RefreshCw,
  ShoppingBag,
  Search,
  Truck,
  CheckCircle2,
  Package,
  TrendingUp,
} from 'lucide-react';
import { OrderRowCard } from './components/OrderRowCard';
import { CustomSelect } from '../../../components/ui/CustomSelect';

const OrderDetailModal = React.lazy(() =>
  import('./components/OrderDetailModal').then((m) => ({ default: m.OrderDetailModal })),
);

export const OrdersFeature: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Debounce 400ms — tránh gọi API mỗi lần gõ phím
  const debouncedSearch = useDebounce(searchTerm, 400);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['orders', debouncedSearch, statusFilter], // ✅ dùng debounced
    queryFn: () =>
      getOrdersApi({
        search: debouncedSearch || undefined,            // ✅ dùng debounced
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      }),
    retry: 1,
  });

  const rawOrders: Order[] = data?.orders || [];

  // Filter local state
  const displayOrders = rawOrders.filter((ord) => {
    const userName = ord.user?.fullName || '';
    const userEmail = ord.user?.email || '';
    const matchesSearch =
      ord.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || ord.orderStatus === statusFilter;
    const matchesPayment = paymentFilter === 'ALL' || ord.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Calculate Metrics
  const totalRevenue = rawOrders.reduce((sum, ord) => sum + (ord.totalAmount || 0), 0);
  const shippingCount = rawOrders.filter((o) => o.orderStatus === 'SHIPPING').length;
  const completedCount = rawOrders.filter((o) => o.orderStatus === 'COMPLETED').length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShoppingBag className="h-7 w-7 text-indigo-500" />
            {t('allClientOrders')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('auditStatuses')}</p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer text-sm font-semibold shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 text-indigo-500 ${isLoading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl border border-indigo-500/20">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng Đơn Hàng</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{rawOrders.length}</h4>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng Doanh Thu</p>
            <h4 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {totalRevenue.toLocaleString()} ₫
            </h4>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
          <div className="p-3 bg-sky-500/10 text-sky-500 rounded-xl border border-sky-500/20">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Đang Vận Chuyển</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{shippingCount}</h4>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
          <div className="p-3 bg-teal-500/10 text-teal-500 rounded-xl border border-teal-500/20">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Đã Hoàn Thành</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{completedCount}</h4>
          </div>
        </div>
      </div>

      {/* Main Container & Filter Controls */}
      <div className="p-6 bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-white/10">
          <h3 className="text-slate-900 dark:text-white font-bold text-lg flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-indigo-500" />
            {t('transactionLog')}
          </h3>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm mã đơn, tên khách, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Order Status Filter */}
            <CustomSelect
              size="sm"
              className="w-44"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'ALL', label: 'Tất cả trạng thái' },
                { value: 'PENDING', label: 'PENDING (Chờ xử lý)' },
                { value: 'SHIPPING', label: 'SHIPPING (Đang giao)' },
                { value: 'COMPLETED', label: 'COMPLETED (Hoàn thành)' },
                { value: 'CANCELLED', label: 'CANCELLED (Đã hủy)' },
              ]}
            />

            {/* Payment Filter */}
            <CustomSelect
              size="sm"
              className="w-40"
              value={paymentFilter}
              onChange={setPaymentFilter}
              options={[
                { value: 'ALL', label: 'Tất cả thanh toán' },
                { value: 'PAID', label: 'Đã thanh toán' },
                { value: 'PENDING', label: 'Chờ thanh toán' },
              ]}
            />
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 text-sm space-y-2">
            <RefreshCw className="h-7 w-7 animate-spin mx-auto text-indigo-500" />
            <p className="font-semibold">Đang tải danh sách đơn hàng từ CSDL...</p>
          </div>
        ) : displayOrders.length === 0 ? (
          <div className="py-16 text-center space-y-3 text-slate-400 animate-in fade-in duration-300">
            <ShoppingBag className="h-12 w-12 mx-auto stroke-1 text-slate-500" />
            <h4 className="text-slate-700 dark:text-slate-300 font-bold text-base">Không tìm thấy đơn hàng nào</h4>
            <p className="text-xs max-w-sm mx-auto">
              Thử tìm kiếm với từ khóa khác hoặc bỏ chọn bộ lọc trạng thái.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayOrders.map((ord, index) => (
              <div key={ord.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${index * 60}ms` }}>
              <OrderRowCard
                order={ord}
                onViewDetails={(o) => setSelectedOrder(o)}
              />
            </div>
            ))}
          </div>
        )}
      </div>

      {/* Lazy-loaded Order Detail Modal */}
      <React.Suspense fallback={null}>
        <OrderDetailModal
          order={selectedOrder}
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
        />
      </React.Suspense>
    </div>
  );
};

