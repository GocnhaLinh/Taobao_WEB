import React, { useEffect, useState } from 'react';
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { CustomSelect } from '../../../../components/ui/CustomSelect';
import { useTranslation } from '../../../../lib/i18n';
import { useCreateOrder } from '../hooks/useCreateOrder';
import type { CreateOrderModalProps, CustomerMode } from '../types';
import {
  UserRound,
  ShoppingBag,
  Plus,
  Trash2,
  Search,
  Minus,
  Loader2,
  PackagePlus,
  MapPin,
  Phone,
  Mail,
  User,
  Truck,
  TicketPercent,
  AlertCircle,
  CheckCircle2,
  ImageOff,
} from 'lucide-react';

// Chỉ có 2 đối tượng khách: đã đăng ký hoặc vãng lai. Người tạo đơn luôn là Admin (createdBy: 'ADMIN').
const MODE_TABS: { value: CustomerMode; icon: React.ReactNode }[] = [
  { value: 'registered', icon: <UserRound className="h-4 w-4" /> },
  { value: 'guest', icon: <ShoppingBag className="h-4 w-4" /> },
];

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [userSearch, setUserSearch] = useState('');

  const o = useCreateOrder({ isOpen, onClose, onSuccess });

  // Mở modal → xóa từ khóa tìm kiếm khách để form luôn bắt đầu trống
  useEffect(() => {
    if (isOpen) setUserSearch('');
  }, [isOpen]);

  const registeredTabLabel = t('createOrderModeRegistered') || 'Khách đã đăng ký';
  const guestTabLabel = t('createOrderModeGuest') || 'Khách vãng lai';

  const tabLabels: Record<CustomerMode, string> = {
    registered: registeredTabLabel,
    guest: guestTabLabel,
  };

  const filteredUsers = o.users.filter((u) => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q)
    );
  });

  // Chỉ cho chọn variant đang ACTIVE — variant tạm ngưng (INACTIVE) không được bán/đặt
  const selectedProductVariants = (o.selectedProduct?.variants || []).filter((v) => v.status === 'ACTIVE');
  const selectedVariant = selectedProductVariants.find((v) => v.id === o.selectedVariantId) || null;

  const addressText = (a: { province: string; district: string; ward: string; detail: string }) =>
    [a.detail, a.ward, a.district, a.province].filter(Boolean).join(', ');

  const guestNameError = o.error === (t('createOrderGuestNameRequired') || 'Vui lòng nhập tên khách hàng.');

  return (
    <Modal
      isOpen={isOpen}
      onClose={o.handleClose}
      title={
        <div className="flex items-center gap-2 min-w-0 pr-2">
          <PackagePlus className="h-5 w-5 text-indigo-500 shrink-0" />
          <span className="truncate font-bold text-slate-900 dark:text-white text-base sm:text-lg">
            {t('createOrderTitle')}
          </span>
        </div>
      }
      maxWidth="6xl"
    >
      <div className="space-y-5 text-slate-900 dark:text-white">
        {o.error && (
          <div className="flex items-start gap-2 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{o.error}</span>
          </div>
        )}

        {/* ─── 1. Chọn khách hàng ─── */}
        <section className="space-y-3">
          <h4 className="text-xs sm:text-sm font-black flex items-center gap-2 text-slate-900 dark:text-white">
            <User className="h-4 w-4 text-indigo-500" />
            {t('createOrderCustomerSection')}
          </h4>

          {/* Mode tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-white/10">
            {MODE_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => o.setCustomerMode(tab.value)}
                className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                  o.customerMode === tab.value
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-500/30'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-transparent'
                }`}
              >
                {tab.icon}
                <span className="truncate">{tabLabels[tab.value]}</span>
              </button>
            ))}
          </div>

          {/* Mode content */}
          {o.customerMode === 'registered' && (
            <div className="space-y-3">
              <div className="w-full">
                <Input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder={t('searchUserPlaceholder') || 'Tìm theo tên, email, sđt...'}
                  icon={<Search className="h-4 w-4" />}
                  className="text-xs"
                />
              </div>
              <div className="max-h-44 overflow-y-auto no-scrollbar border border-slate-200 dark:border-white/10 rounded-2xl divide-y divide-slate-200 dark:divide-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
                {o.users.length === 0 ? (
                  <p className="p-4 text-center text-xs text-slate-400">
                    {t('createOrderLoadingUsers') || 'Đang tải danh sách khách hàng...'}
                  </p>
                ) : filteredUsers.length === 0 ? (
                  <p className="p-4 text-center text-xs text-slate-400">
                    {t('noUsersFound') || 'Không tìm thấy khách hàng nào'}
                  </p>
                ) : (
                  filteredUsers.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => o.setSelectedUserId(u.id)}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                        o.selectedUserId === u.id
                          ? 'bg-indigo-50 dark:bg-indigo-500/15'
                          : 'hover:bg-indigo-50/50 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                        {u.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold truncate">{u.fullName}</p>
                        <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                      </div>
                      {u.phone && (
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 shrink-0 hidden sm:block">
                          {u.phone}
                        </span>
                      )}
                      {o.selectedUserId === u.id && (
                        <CheckCircle2 className="h-4 w-4 text-indigo-500 shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Address picker của khách đã chọn */}
              {o.selectedUserId && (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                    {t('createOrderUserAddresses')}
                  </p>
                  {o.addresses.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">
                      {t('createOrderNoAddresses')}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {o.addresses.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => o.setSelectedAddressId(a.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            o.selectedAddressId === a.id
                              ? 'border-indigo-500/40 bg-indigo-50 dark:bg-indigo-500/10'
                              : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/40 hover:border-indigo-500/30'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                            <span className="text-[11px] font-bold truncate">{a.fullName}</span>
                            {a.isDefault && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                                {t('warehouseDefault') || 'MẶC ĐỊNH'}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {addressText(a)}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {o.customerMode === 'guest' && (
            <div className="p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-3">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <ShoppingBag className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                {t('createOrderGuestHint')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label={`${t('createOrderGuestName')} *`}
                  value={o.customer.fullName}
                  onChange={(e) => o.setCustomerField('fullName', e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  error={guestNameError ? t('createOrderGuestNameRequired') : undefined}
                  icon={<User className="h-4 w-4" />}
                  className="text-xs"
                />
                <Input
                  label={t('createOrderGuestPhone')}
                  value={o.customer.phone}
                  onChange={(e) => o.setCustomerField('phone', e.target.value)}
                  placeholder="0901 234 567"
                  icon={<Phone className="h-4 w-4" />}
                  className="text-xs"
                />
                <div className="sm:col-span-2">
                  <Input
                    label={t('createOrderGuestEmail')}
                    value={o.customer.email}
                    onChange={(e) => o.setCustomerField('email', e.target.value)}
                    placeholder="khach@email.com"
                    icon={<Mail className="h-4 w-4" />}
                    className="text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Địa chỉ giao hàng (hiển thị ở mọi mode) */}
          <div className="p-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl space-y-3">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-emerald-500" />
              {t('createOrderShippingAddress')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label={t('createOrderProvince')}
                value={o.customer.province}
                onChange={(e) => o.setCustomerField('province', e.target.value)}
                placeholder="Tỉnh / Thành phố"
                className="text-xs"
              />
              <Input
                label={t('createOrderDistrict')}
                value={o.customer.district}
                onChange={(e) => o.setCustomerField('district', e.target.value)}
                placeholder="Quận / Huyện"
                className="text-xs"
              />
              <Input
                label={t('createOrderWard')}
                value={o.customer.ward}
                onChange={(e) => o.setCustomerField('ward', e.target.value)}
                placeholder="Phường / Xã"
                className="text-xs"
              />
              <Input
                label={t('createOrderDetail')}
                value={o.customer.detail}
                onChange={(e) => o.setCustomerField('detail', e.target.value)}
                placeholder="Số nhà, đường, phường..."
                className="text-xs"
              />
            </div>
          </div>
        </section>

        {/* ─── 2. Chọn sản phẩm ─── */}
        <section className="space-y-3">
          <h4 className="text-xs sm:text-sm font-black flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-indigo-500" />
            {t('createOrderProductsSection')}
          </h4>

          <div className="w-full">
            <Input
              value={o.productSearch}
              onChange={(e) => o.setProductSearch(e.target.value)}
              placeholder={t('createOrderSearchProduct')}
              icon={<Search className="h-4 w-4" />}
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Product list */}
            <div className="max-h-72 overflow-y-auto no-scrollbar border border-slate-200 dark:border-white/10 rounded-2xl divide-y divide-slate-200 dark:divide-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
              {o.loadingData ? (
                <div className="flex items-center justify-center gap-2 p-6 text-xs text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('loadingProducts')}
                </div>
              ) : o.filteredProducts.length === 0 ? (
                <p className="p-6 text-center text-xs text-slate-400">{t('noProductsFound')}</p>
              ) : (
                o.filteredProducts.map((p) => {
                  const thumb = p.thumbnail || p.images?.[0]?.imageUrl;
                  const active = o.selectedProduct?.id === p.id;
                  // Sản phẩm không còn variant ACTIVE nào → đang tạm ngưng, không được đặt
                  const activeVariants = (p.variants || []).filter((v) => v.status === 'ACTIVE');
                  const isPaused = activeVariants.length === 0;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => !isPaused && o.handleSelectProduct(p.id)}
                      disabled={isPaused}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
                        isPaused
                          ? 'opacity-50 cursor-not-allowed'
                          : active
                            ? 'bg-indigo-50 dark:bg-indigo-500/15 cursor-pointer'
                            : 'hover:bg-indigo-50/50 dark:hover:bg-white/5 cursor-pointer'
                      }`}
                    >
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={p.productName}
                          className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-white/10 shrink-0 bg-white dark:bg-slate-800"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                          <ImageOff className="h-4 w-4" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold truncate">{p.productName}</p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {[p.category?.name, p.brand?.name].filter(Boolean).join(' · ') || p.slug}
                        </p>
                      </div>
                      {isPaused ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[9px] font-black uppercase tracking-wider shrink-0">
                          {t('variantPausedNotice')}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 shrink-0">
                          {activeVariants.length} {t('variantLabel')}
                        </span>
                      )}
                      {active && !isPaused && <CheckCircle2 className="h-4 w-4 text-indigo-500 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>

            {/* Variant & quantity config */}
            <div className="space-y-3 p-3.5 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent border border-indigo-500/20 rounded-2xl">
              {!o.selectedProduct ? (
                <p className="text-xs text-slate-400 italic flex items-center gap-2 py-6 justify-center">
                  <PackagePlus className="h-5 w-5" />
                  {t('createOrderPickProductFirst')}
                </p>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold truncate">{o.selectedProduct.productName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{o.selectedProduct.slug}</p>
                    </div>
                    {selectedVariant && (
                      <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                        {t('stock')}: {selectedVariant.stock ?? 0}
                      </span>
                    )}
                  </div>

                  {selectedProductVariants.length === 0 && (
                    <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-2.5 py-2 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {t('variantPausedNotice')} — {t('createOrderNoActiveVariant')}
                    </p>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {t('createOrderSelectVariant')} *
                    </label>
                    <CustomSelect
                      value={o.selectedVariantId}
                      onChange={o.handleSelectVariant}
                      placeholder={t('createOrderVariantPlaceholder')}
                      className="w-full text-xs"
                      size="sm"
                      options={selectedProductVariants.map((v) => ({
                        value: v.id,
                        label: [
                          [v.size, v.color].filter(Boolean).join(' - '),
                          v.sku,
                          `${(v.salePrice ?? v.price).toLocaleString()} ₫`,
                        ]
                          .filter(Boolean)
                          .join(' · '),
                      }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {t('quantity')}
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => o.setQuantity(Math.max(1, o.quantity - 1))}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition cursor-pointer shrink-0"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="flex-1 text-center text-sm font-black py-1.5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl">
                        {o.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          o.setQuantity(
                            Math.min(
                              o.quantity + 1,
                              selectedVariant?.stock ?? Number.MAX_SAFE_INTEGER,
                            ),
                          )
                        }
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition cursor-pointer shrink-0"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {t('createOrderPriceOverride')}
                      </label>
                      <Input
                        type="number"
                        value={o.priceOverride}
                        onChange={(e) => o.setPriceOverride(e.target.value)}
                        placeholder="Giá bán (VNĐ)"
                        className="text-xs font-mono"
                      />
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={o.addItem}
                    // Chỉ enable khi đang có variant ACTIVE được chọn (đã lọc tạm ngưng)
                    disabled={!selectedVariant}
                    className="w-full text-xs py-2.5 font-bold"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    {t('createOrderAddItem')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ─── 3. Sản phẩm trong đơn ─── */}
        {o.draftItems.length > 0 && (
          <section className="space-y-2.5">
            <h4 className="text-xs sm:text-sm font-black flex items-center gap-2">
              <PackagePlus className="h-4 w-4 text-indigo-500" />
              {t('createOrderItemsInOrder', { count: o.draftItems.length })}
            </h4>
            <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden divide-y divide-slate-200 dark:divide-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
              {o.draftItems.map((it) => (
                <div key={it.variantId} className="p-3 flex items-center gap-3 min-w-0">
                  {it.image ? (
                    <img
                      src={it.image}
                      alt={it.productName}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-white/10 shrink-0 bg-white dark:bg-slate-800"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                      <ImageOff className="h-4 w-4" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate">{it.productName}</p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {it.variantName} · {it.variant.sku}
                    </p>
                    <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                      {it.price.toLocaleString()} ₫
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => o.updateItemQuantity(it.variantId, it.quantity - 1)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition cursor-pointer"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-black">{it.quantity}</span>
                    <button
                      type="button"
                      onClick={() => o.updateItemQuantity(it.variantId, it.quantity + 1)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => o.removeItem(it.variantId)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer ml-1"
                      title={t('delete')}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── 4. Phí ship + Coupon ─── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            type="number"
            label={t('shippingFeeLabel')}
            value={o.shippingFee}
            onChange={(e) => o.setShippingFee(e.target.value)}
            placeholder="0"
            icon={<Truck className="h-4 w-4" />}
            className="text-xs font-mono"
          />
          <div>
            <Input
              label={t('couponCode')}
              value={o.couponCode}
              onChange={(e) => o.setCouponCode(e.target.value)}
              placeholder="VD: TAOBAO2026"
              icon={<TicketPercent className="h-4 w-4" />}
              className="text-xs font-mono uppercase"
            />
            {o.couponStatus === 'valid' && o.discountAmount > 0 && (
              <p className="mt-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                {t('discountVoucherLabel')}: -{o.discountAmount.toLocaleString()} ₫
              </p>
            )}
            {o.couponStatus === 'invalid' && o.couponMessage && (
              <p className="mt-1.5 text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {o.couponMessage}
              </p>
            )}
          </div>
        </section>

        {/* ─── 5. Tổng kết ─── */}
        <section className="p-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl space-y-2 text-xs overflow-hidden">
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>{t('itemsTotalLabel')}</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">{o.subtotal.toLocaleString()} ₫</span>
          </div>
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>{t('shippingFeeLabel')}</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              +{(Number(o.shippingFee) > 0 ? Number(o.shippingFee) : 0).toLocaleString()} ₫
            </span>
          </div>
          {o.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-500 font-semibold">
              <span>{t('discountVoucherLabel')}</span>
              <span className="shrink-0">-{o.discountAmount.toLocaleString()} ₫</span>
            </div>
          )}
          <div className="pt-2.5 mt-1 border-t-2 border-indigo-500/15 flex justify-between items-center bg-gradient-to-r from-indigo-500/10 to-transparent -mx-3.5 px-3.5 py-2.5 rounded-b-2xl">
            <span className="text-indigo-600 dark:text-indigo-400 uppercase tracking-wide text-xs font-black">{t('totalPaymentLabel')}</span>
            <span className="text-indigo-700 dark:text-indigo-300 text-lg font-black tracking-tight">{o.total.toLocaleString()} ₫</span>
          </div>
        </section>

        {/* ─── Footer buttons ─── */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={o.handleClose}
            disabled={o.isSubmitting}
            className="text-xs px-4 py-2.5 w-full sm:w-auto font-semibold"
          >
            {t('cancel')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={o.handleSubmit}
            disabled={o.isSubmitting || o.draftItems.length === 0}
            className="text-xs px-5 py-2.5 w-full sm:w-auto font-bold"
          >
            {o.isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                {t('creatingOrder')}
              </>
            ) : (
              <>
                <PackagePlus className="h-4 w-4 mr-1.5" />
                {t('createOrderBtn')}
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
