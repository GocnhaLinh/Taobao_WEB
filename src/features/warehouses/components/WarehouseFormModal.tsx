import React, { useState, useEffect } from 'react';
import type { Warehouse } from '../../../types';
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

  const modalTitle = initialData ? 'Chỉnh sửa Kho Hàng' : 'Thêm Kho Hàng Mới';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
            {initialData ? 'Cập nhật' : 'Lưu kho hàng'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Code & Name Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Mã kho hàng *"
            placeholder="Ví dụ: HCM-MAIN, HN-KHO-01"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
          />
          <Input
            label="Tên kho hàng *"
            placeholder="Ví dụ: Kho Tổng TP. Hồ Chí Minh"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Province & District Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Tỉnh / Thành phố *"
            placeholder="Ví dụ: Hồ Chí Minh, Hà Nội"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            required
          />
          <Input
            label="Quận / Huyện"
            placeholder="Ví dụ: Quận 1, Cầu Giấy"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          />
        </div>

        {/* Detailed Address */}
        <Input
          label="Địa chỉ chi tiết kho"
          placeholder="Số 123 Đường Nguyễn Huệ, Phường Bến Nghé..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        {/* Supported Provinces Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Các Tỉnh / Thành phố hỗ trợ vận chuyển
          </label>
          <Input
            placeholder="Ví dụ: Hồ Chí Minh, Bình Dương, Đồng Nai, Long An..."
            value={supportedProvincesText}
            onChange={(e) => setSupportedProvincesText(e.target.value)}
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Nhập danh sách tên các Tỉnh/Thành cách nhau bởi dấu phẩy để hệ thống tự gán kho khi đơn hàng được đặt.
          </p>
        </div>

        {/* Supported Districts Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Các Quận / Huyện hỗ trợ vận chuyển
          </label>
          <Input
            placeholder="Ví dụ: Quận 1, Quận 3, Bình Thạnh, Thủ Đức..."
            value={supportedDistrictsText}
            onChange={(e) => setSupportedDistrictsText(e.target.value)}
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Nhập danh sách Quận/Huyện cách nhau bởi dấu phẩy (để trống nếu kho hỗ trợ toàn tỉnh).
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
            Đặt làm Tổng Kho Mặc Định của hệ thống
          </label>
        </div>
      </form>
    </Modal>
  );
};
