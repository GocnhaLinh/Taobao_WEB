import React, { useState, useEffect, useRef } from 'react';
import type { Category } from '../../../types';
import { useTranslation } from '../../../lib/i18n';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { CustomSelect } from '../../../components/ui/CustomSelect';
import type { SelectOption } from '../../../components/ui/CustomSelect';
import { Plus, Tag } from 'lucide-react';
import {
  fetchCategoryLabelsApi,
  createCategoryLabelApi,
  deleteCategoryLabelApi,
  type CategoryLabelItem,
} from '../../../services/categoryLabelService';

import { EMOJI_PRESETS } from '../../../utils/iconPresets';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; slug: string; sex: string }) => void;
  initialData?: Category | null;
  defaultSex?: string;
  isLoading?: boolean;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultSex = 'UNISEX',
  isLoading = false,
}) => {
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sex, setSex] = useState<string>('UNISEX');

  // Dynamic labels from DB
  const [dbLabels, setDbLabels] = useState<CategoryLabelItem[]>([]);
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelIcon, setNewLabelIcon] = useState('🏷️');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const iconPickerRef = useRef<HTMLDivElement>(null);

  const [deletedValues, setDeletedValues] = useState<string[]>([]);

  // Effect 1: Fetch category labels khi modal mở
  // Dùng AbortController để huỷ request cũ nếu user đóng/mở modal nhanh
  useEffect(() => {
    if (!isOpen) return;

    const controller = new AbortController();

    fetchCategoryLabelsApi()
      .then((items) => {
        if (!controller.signal.aborted) {
          setDbLabels(items);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          console.warn('Could not fetch category labels:', err);
        }
      });

    return () => {
      controller.abort();
    };
  }, [isOpen]);

  // Effect 2: Populate / reset form data khi initialData thay đổi
  // Tách riêng với Effect 1 để tránh fetch labels lại khi chỉ cần reset form
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setSlug(initialData.slug);
      setSex(initialData.sex || 'UNISEX');
    } else {
      setName('');
      setSlug('');
      setSex(defaultSex);
    }
  }, [initialData, defaultSex]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (iconPickerRef.current && !iconPickerRef.current.contains(e.target as Node)) {
        setShowIconPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(generateSlug(val));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;
    onSubmit({ name, slug, sex });
  };

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;
    try {
      const created = await createCategoryLabelApi({
        name: newLabelName.trim(),
        icon: newLabelIcon.trim() || '🏷️',
      });
      setDbLabels((prev) => [...prev, created]);
      setSex(created.name);
      setNewLabelName('');
      setIsAddingLabel(false);
      setShowIconPicker(false);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Lỗi khi thêm nhãn đối tượng');
    }
  };

  const [deletingLabel, setDeletingLabel] = useState<CategoryLabelItem | null>(null);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);

  const confirmDeleteLabel = async () => {
    if (!deletingLabel) return;
    setIsDeletingLoading(true);
    try {
      await deleteCategoryLabelApi(deletingLabel.id);
      setDbLabels((prev) => prev.filter((item) => item.id !== deletingLabel.id));
      if (sex === deletingLabel.name) {
        setSex('UNISEX');
      }
      setDeletedValues((prev) => [...prev, deletingLabel.name]);
      setDeletingLabel(null);
    } catch (err: any) {
      console.warn('Lỗi khi xóa nhãn từ CSDL:', err);
      alert(err.response?.data?.error || 'Lỗi khi xóa nhãn đối tượng');
    } finally {
      setIsDeletingLoading(false);
    }
  };

  // Build options ONLY from dbLabels (no hardcoded fallbacks)
  const dbOptionNames = new Set(dbLabels.map((l) => l.name));
  const fallbackOptions: SelectOption[] = [];
  if (sex && !dbOptionNames.has(sex) && !deletedValues.includes(sex)) {
    fallbackOptions.push({
      value: sex,
      label: sex,
      icon: '🏷️',
    });
  }

  const sexOptions: SelectOption[] = [
    ...fallbackOptions,
    ...dbLabels
      .filter((lbl) => !deletedValues.includes(lbl.name))
      .map((lbl) => ({
        value: lbl.name,
        label: lbl.name,
        icon: lbl.icon || '🏷️',
        onDelete: () => setDeletingLabel(lbl),
      })),
  ];

  const modalTitle = initialData
    ? t('editCategory') || 'Chỉnh sửa Danh mục'
    : t('addCategory') || 'Thêm Danh Mục Mới';

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={modalTitle}
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>
              {t('cancel') || 'Hủy'}
            </Button>
            <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
              {initialData ? t('update') || 'Cập nhật' : t('saveCategory') || 'Lưu Danh Mục'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Tên danh mục"
            placeholder="Ví dụ: Áo khoác da Nam, Dụng cụ ăn uống..."
            value={name}
            onChange={handleNameChange}
            required
          />
          <Input
            label={t('slug') || 'Mã đường dẫn (Slug)'}
            placeholder="ao-khoac-da-nam"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Đối tượng / Nhãn phân loại
              </label>
              <button
                type="button"
                onClick={() => setIsAddingLabel(!isAddingLabel)}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                Tự thêm đối tượng mới
              </button>
            </div>

            <CustomSelect
              value={sex}
              onChange={(val) => setSex(val)}
              options={sexOptions}
              placeholder={dbLabels.length === 0 ? 'Bấm "+ Tự thêm đối tượng mới" để tạo nhãn' : 'Chọn đối tượng...'}
            />
          </div>

          {/* Quick Add Custom Label Box */}
          {isAddingLabel && (
            <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" />
                Thêm Nhãn Đối Tượng Mới vào CSDL:
              </div>
              <div className="flex items-center gap-2">
                {/* Interactive Icon Picker */}
                <div className="relative shrink-0" ref={iconPickerRef}>
                  <button
                    type="button"
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className="w-12 h-9 px-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-lg text-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
                    title="Click để chọn icon emoji"
                  >
                    {newLabelIcon || '🏷️'}
                  </button>

                  {showIconPicker && (
                    <div className="absolute left-0 mt-1.5 p-2 bg-white dark:bg-slate-900 border border-indigo-100 dark:border-white/15 rounded-xl shadow-2xl backdrop-blur-xl z-50 w-56 animate-in fade-in zoom-in-95 duration-150">
                      <div className="text-[10px] font-semibold text-slate-500 mb-1 px-1">Chọn Icon Emoji:</div>
                      <div className="grid grid-cols-5 gap-1 max-h-36 overflow-y-auto p-1 no-scrollbar">
                        {EMOJI_PRESETS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                              setNewLabelIcon(emoji);
                              setShowIconPicker(false);
                            }}
                            className={`h-8 text-base flex items-center justify-center rounded-lg hover:bg-indigo-50 dark:hover:bg-white/10 transition-colors cursor-pointer ${
                              newLabelIcon === emoji ? 'bg-indigo-100 dark:bg-indigo-500/30 ring-1 ring-indigo-500' : ''
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                      <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-white/10 flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 shrink-0">Khác:</span>
                        <input
                          type="text"
                          placeholder="Emoji..."
                          value={newLabelIcon}
                          onChange={(e) => setNewLabelIcon(e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded text-center text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Tên đối tượng (ví dụ: Dụng cụ trang điểm)"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-lg text-xs"
                />
                <Button type="button" size="sm" onClick={handleCreateLabel}>
                  Lưu Nhãn
                </Button>
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* Custom Confirmation Modal for Deleting Category Label */}
      {deletingLabel && (
        <Modal
          isOpen={!!deletingLabel}
          onClose={() => !isDeletingLoading && setDeletingLabel(null)}
          title="Xác nhận xóa nhãn đối tượng"
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setDeletingLabel(null)}
                disabled={isDeletingLoading}
              >
                Hủy
              </Button>
              <Button
                variant="danger"
                onClick={confirmDeleteLabel}
                isLoading={isDeletingLoading}
              >
                Xóa nhãn
              </Button>
            </>
          }
        >
          <div className="py-2 text-sm text-slate-700 dark:text-slate-300">
            Bạn có chắc chắn muốn xóa nhãn đối tượng <strong className="text-rose-600 dark:text-rose-400">"{deletingLabel.name}"</strong> khỏi cơ sở dữ liệu?
          </div>
        </Modal>
      )}
    </>
  );
};
