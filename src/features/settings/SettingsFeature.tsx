import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sliders, Save, RefreshCw } from 'lucide-react';
import { useTranslation } from '../../lib/i18n';
import { useNotification } from '../../lib/notification';
import { Button } from '../../components/ui/Button';
import { ThemeSettingCard } from './components/ThemeSettingCard';
import { ExchangeRateCard } from './components/ExchangeRateCard';
import { ShippingFeeCard } from './components/ShippingFeeCard';
import { ServiceWarehouseFeeCard } from './components/ServiceWarehouseFeeCard';
import { getFeeConfigApi, saveFeeConfigApi } from '../../services/settingsService';

export const SettingsFeature: React.FC = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  // Keep input fields as strings to prevent "0" prefixing bug when clearing values
  const [exchangeRate, setExchangeRate] = useState<string>('');
  const [shippingCnPerKg, setShippingCnPerKg] = useState<string>('');
  const [shippingVnPerKg, setShippingVnPerKg] = useState<string>('');
  const [warehouseFreeDays, setWarehouseFreeDays] = useState<string>('');
  const [warehouseFeePerDay, setWarehouseFeePerDay] = useState<string>('');
  const [serviceFeePercent, setServiceFeePercent] = useState<string>('');
  const [depositPercent, setDepositPercent] = useState<string>('');

  const { data: feeConfig, isLoading, refetch } = useQuery({
    queryKey: ['feeConfig'],
    queryFn: getFeeConfigApi,
    retry: 1,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  useEffect(() => {
    if (feeConfig) {
      if (feeConfig.exchangeRate !== undefined) setExchangeRate(feeConfig.exchangeRate.toString());
      if (feeConfig.shippingCnPerKg !== undefined) setShippingCnPerKg(feeConfig.shippingCnPerKg.toString());
      if (feeConfig.shippingVnPerKg !== undefined) setShippingVnPerKg(feeConfig.shippingVnPerKg.toString());
      if (feeConfig.warehouseFreeDays !== undefined) setWarehouseFreeDays(feeConfig.warehouseFreeDays.toString());
      if (feeConfig.warehouseFeePerDay !== undefined) setWarehouseFeePerDay(feeConfig.warehouseFeePerDay.toString());
      if (feeConfig.serviceFeePercent !== undefined) setServiceFeePercent(feeConfig.serviceFeePercent.toString());
      if (feeConfig.depositPercent !== undefined) setDepositPercent(feeConfig.depositPercent.toString());
    }
  }, [feeConfig]);

  const saveMutation = useMutation({
    mutationFn: saveFeeConfigApi,
    onSuccess: (data) => {
      queryClient.setQueryData(['feeConfig'], data);
      queryClient.invalidateQueries({ queryKey: ['feeConfig'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      if (data?.exchangeRate !== undefined) setExchangeRate(data.exchangeRate.toString());
      if (data?.shippingCnPerKg !== undefined) setShippingCnPerKg(data.shippingCnPerKg.toString());
      if (data?.shippingVnPerKg !== undefined) setShippingVnPerKg(data.shippingVnPerKg.toString());
      if (data?.warehouseFreeDays !== undefined) setWarehouseFreeDays(data.warehouseFreeDays.toString());
      if (data?.warehouseFeePerDay !== undefined) setWarehouseFeePerDay(data.warehouseFeePerDay.toString());
      if (data?.serviceFeePercent !== undefined) setServiceFeePercent(data.serviceFeePercent.toString());
      if (data?.depositPercent !== undefined) setDepositPercent(data.depositPercent.toString());
      showNotification('Cập nhật cấu hình phí & tỷ giá thành công!', 'success');
    },
    onError: (err: any) => {
      showNotification(err.message || 'Lỗi khi lưu cấu hình phí', 'error');
    },
  });

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const exRate = parseFloat(exchangeRate);
    if (isNaN(exRate) || exRate <= 0) {
      showNotification('Tỷ giá NDT phải là số và lớn hơn 0', 'warning');
      return;
    }

    const shipCn = parseFloat(shippingCnPerKg);
    const shipVn = parseFloat(shippingVnPerKg);
    const whDays = parseInt(warehouseFreeDays, 10);
    const whFee = parseFloat(warehouseFeePerDay);
    const svcFee = parseFloat(serviceFeePercent);
    const depFee = parseFloat(depositPercent);

    if (
      isNaN(shipCn) || shipCn < 0 ||
      isNaN(shipVn) || shipVn < 0 ||
      isNaN(whDays) || whDays < 0 ||
      isNaN(whFee) || whFee < 0 ||
      isNaN(svcFee) || svcFee < 0 ||
      isNaN(depFee) || depFee < 0
    ) {
      showNotification('Vui lòng nhập đầy đủ và hợp lệ các thông số phí', 'warning');
      return;
    }

    saveMutation.mutate({
      exchangeRate: exRate,
      shippingCnPerKg: shipCn,
      shippingVnPerKg: shipVn,
      warehouseFreeDays: whDays,
      warehouseFeePerDay: whFee,
      serviceFeePercent: svcFee,
      depositPercent: depFee,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="h-6 w-6 text-indigo-500" />
            Cấu hình Phí & Tỷ giá Hệ thống
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quản lý tỷ giá quy đổi NDT ➔ VNĐ, phí vận chuyển và các tỷ lệ phí dịch vụ nhập hàng.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={saveMutation.isPending}
            className="flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
          >
            <Save className="h-4 w-4" />
            Lưu thay đổi
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <ThemeSettingCard />
        <ExchangeRateCard exchangeRate={exchangeRate} setExchangeRate={setExchangeRate} />
        <ShippingFeeCard
          shippingCnPerKg={shippingCnPerKg}
          setShippingCnPerKg={setShippingCnPerKg}
          shippingVnPerKg={shippingVnPerKg}
          setShippingVnPerKg={setShippingVnPerKg}
        />
        <ServiceWarehouseFeeCard
          serviceFeePercent={serviceFeePercent}
          setServiceFeePercent={setServiceFeePercent}
          depositPercent={depositPercent}
          setDepositPercent={setDepositPercent}
          warehouseFreeDays={warehouseFreeDays}
          setWarehouseFreeDays={setWarehouseFreeDays}
          warehouseFeePerDay={warehouseFeePerDay}
          setWarehouseFeePerDay={setWarehouseFeePerDay}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading || saveMutation.isPending}
          >
            Hủy thay đổi
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={saveMutation.isPending}
            className="shadow-lg shadow-indigo-500/25 px-6"
          >
            <Save className="h-4 w-4 mr-2" />
            Lưu cấu hình Phí & Tỷ giá
          </Button>
        </div>
      </form>
    </div>
  );
};
