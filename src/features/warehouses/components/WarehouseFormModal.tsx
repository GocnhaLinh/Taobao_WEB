import React, { useState, useEffect } from 'react';
import type { Warehouse } from '../../../types';
import { useTranslation } from '../../../lib/i18n';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

interface WarehouseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    code: string;
    name: string;
    province: string;
    district?: string;
    address?: string;
    supportedProvinces?: string[];
    supportedDistricts?: string[];
    isDefault?: boolean;
  }) => void;
  initialData?: Warehouse | null;
  isLoading?: boolean;
}

export const WarehouseFormModal: React.FC<WarehouseFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [supportedProvincesText, setSupportedProvincesText] = useState('');
  const [supportedDistrictsText, setSupportedDistrictsText] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code || '');
      setName(initialData.name || '');
      setProvince(initialData.province || '');
      setDistrict(initialData.district || '');
      setAddress(initialData.address || '');
      setSupportedProvincesText(
        initialData.supportedProvinces ? initialData.supportedProvinces.join(', ') : ''
      );
      setSupportedDistrictsText(
        initialData.supportedDistricts ? initialData.supportedDistricts.join(', ') : ''
      );
      setIsDefault(Boolean(initialData.isDefault));
    } else {
      setCode('');
      setName('');
      setProvince('');
      setDistrict('');
      setAddress('');
      setSupportedProvincesText('');
      setSupportedDistrictsText('');
      setIsDefault(false);
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim() || !province.trim()) return;

    const supportedProvinces = supportedProvincesText
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    const supportedDistricts = supportedDistrictsText
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);

    onSubmit({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      province: province.trim(),
      district: district.trim() || undefined,
      address: address.trim() || undefined,
      supportedProvinces: supportedProvinces.length > 0 ? supportedProvinces : undefined,
      supportedDistricts: supportedDistricts.length > 0 ? supportedDistricts : undefined,
      isDefault,
    });
  };

  const modalTitle = initialData ? t('editWarehouseTitle') : t('addWarehouseTitle');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
            {initialData ? t('updateWarehouse') : t('saveWarehouse')}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Code & Name Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label={t('warehouseCode')}
            placeholder={t('warehouseCodePlaceholder')}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
          />
          <Input
            label={t('warehouseName')}
            placeholder={t('warehouseNamePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Province & District Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label={t('warehouseProvince')}
            placeholder={t('warehouseProvincePlaceholder')}
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            required
          />
          <Input
            label={t('warehouseDistrict')}
            placeholder={t('warehouseDistrictPlaceholder')}
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          />
        </div>

        {/* Detailed Address */}
        <Input
          label={t('warehouseAddress')}
          placeholder={t('warehouseAddressPlaceholder')}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        {/* Supported Provinces Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {t('warehouseSupportedProvinces')}
          </label>
          <Input
            placeholder={t('warehouseSupportedProvincesPlaceholder')}
            value={supportedProvincesText}
            onChange={(e) => setSupportedProvincesText(e.target.value)}
          />
          <p className="text-[11px] text-slate-400 mt-1">
            {t('warehouseSupportedProvincesHint')}
          </p>
        </div>

        {/* Supported Districts Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {t('warehouseSupportedDistricts')}
          </label>
          <Input
            placeholder={t('warehouseSupportedDistrictsPlaceholder')}
            value={supportedDistrictsText}
            onChange={(e) => setSupportedDistrictsText(e.target.value)}
          />
          <p className="text-[11px] text-slate-400 mt-1">
            {t('warehouseSupportedDistrictsHint')}
          </p>
        </div>

        {/* Default Checkbox */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isDefault"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <label htmlFor="isDefault" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
            {t('warehouseSetDefault')}
          </label>
        </div>
      </form>
    </Modal>
  );
};
