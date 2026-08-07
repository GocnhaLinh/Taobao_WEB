import React from 'react';
import { Search } from 'lucide-react';
import { CustomSelect } from '../../../../components/ui/CustomSelect';
import { Input } from '../../../../components/ui/Input';
import { useTranslation } from '../../../../lib/i18n';
import type { OrderFilterProps } from '../types';
import { getOrderStatusOptions, getPaymentStatusOptions } from '../constants';

export const OrderFilter: React.FC<OrderFilterProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  paymentFilter,
  onPaymentChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full md:w-auto">
      {/* Search Input using shared Input UI component */}
      <div className="w-full sm:w-60 md:w-72">
        <Input
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('searchOrderPlaceholder')}
          icon={<Search className="h-4 w-4" />}
          className="text-xs"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full sm:w-auto">
        {/* Order Status Select */}
        <div className="w-full sm:w-48 md:w-52">
          <CustomSelect
            value={statusFilter}
            onChange={onStatusChange}
            options={getOrderStatusOptions(t, true)}
            className="w-full text-xs"
            size="sm"
          />
        </div>

        {/* Payment Status Select */}
        <div className="w-full sm:w-44 md:w-48">
          <CustomSelect
            value={paymentFilter}
            onChange={onPaymentChange}
            options={getPaymentStatusOptions(t, true)}
            className="w-full text-xs"
            size="sm"
          />
        </div>
      </div>
    </div>
  );
};
