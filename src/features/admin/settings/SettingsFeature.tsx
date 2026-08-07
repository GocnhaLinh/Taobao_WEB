import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sliders, Save, RefreshCw } from 'lucide-react';
import { useTranslation } from '../../../lib/i18n';
import { useManualRefresh } from '../../../hooks/useManualRefresh';
import { useNotification } from '../../../lib/notification';
import { Button } from '../../../components/ui/Button';
import { ThemeSettingCard } from './components/ThemeSettingCard';
import { ExchangeRateCard } from './components/ExchangeRateCard';
import { ShippingFeeCard } from './components/ShippingFeeCard';
import { ServiceWarehouseFeeCard } from './components/ServiceWarehouseFeeCard';
import { getFeeConfigApi, saveFeeConfigApi } from '../../../services/settingsService';

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

  const { isRefreshing, handleRefresh: handleManualRefresh } = useManualRefresh(refetch);

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
    onSuccess: () => {
      // Chỉ invalidateQueries — không dùng setQueryData + invalidate cùng lúc
      // vì invalidate sẽ refetch đè lên data vừa set (request dư thừa)
      queryClient.invalidateQueries({ queryKey: ['feeConfig'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      showNotification(t('configSaved'), 'success');
    },
    onError: (err: any) => {
      showNotification(err.message || t('configSaveError'), 'error');
    },
  });

  const handleSubmit = () => {

    const exRate = parseFloat(exchangeRate);
    if (isNaN(exRate) || exRate <= 0) {
      showNotification(t('exchangeRateError'), 'warning');
      return;
    }

    const shipCn = parseFloat(shippingCnPerKg);
    const shipVn = parseFloat(shippingVnPerKg);
    // Validate số nguyên: parseInt('7.5') = 7 → pass validate isNaN/< 0 sai
    // Dùng Number() rồi kiểm tra !Number.isInteger() để reject số thập phân
    const whDaysRaw = Number(warehouseFreeDays);
    const whDays = Number.isInteger(whDaysRaw) && whDaysRaw >= 0 ? whDaysRaw : NaN;
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
      showNotification(t('configValidationError'), 'warning');
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
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-500 shrink-0" />
            {t('settingsConfigTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('settingsConfigDesc')}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isLoading || isRefreshing}
            className="flex-1 sm:flex-initial items-center justify-center gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 shrink-0 ${isLoading || isRefreshing ? 'animate-spin' : ''}`} />
            {t('refresh')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={saveMutation.isPending}
            className="flex-1 sm:flex-initial items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20"
          >
            <Save className="h-4 w-4 shrink-0" />
            {t('saveChanges')}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
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

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading || saveMutation.isPending}
            className="w-full sm:w-auto"
          >
            {t('settingsCancelChanges')}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            isLoading={saveMutation.isPending}
            className="w-full sm:w-auto shadow-lg shadow-indigo-500/25 px-6"
          >
            <Save className="h-4 w-4 mr-2 shrink-0" />
            {t('settingsSaveConfig')}
          </Button>
        </div>
      </div>
    </div>
  );
};

