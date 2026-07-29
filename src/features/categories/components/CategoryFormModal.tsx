import React, { useState, useEffect, useRef } from 'react';
import type { Category } from '../../../types';
import { useTranslation } from '../../../lib/i18n';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { CustomSelect } from '../../../components/ui/CustomSelect';
import type { SelectOption } from '../../../components/ui/CustomSelect';
import { Plus, Tag, Edit2 } from 'lucide-react';
import {
  fetchCategoryLabelsApi,
  createCategoryLabelApi,
  updateCategoryLabelApi,
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
  onLabelsChanged?: () => void;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultSex = 'UNISEX',
  isLoading = false,
  onLabelsChanged,
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

  // Edit label state
  const [editingLabel, setEditingLabel] = useState<CategoryLabelItem | null>(null);
  const [editLabelName, setEditLabelName] = useState('');
  const [editLabelIcon, setEditLabelIcon] = useState('');
  const [showEditIconPicker, setShowEditIconPicker] = useState(false);
  const editIconPickerRef = useRef<HTMLDivElement>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);

  // Delete confirm state
  const [deletingLabel, setDeletingLabel] = useState<CategoryLabelItem | null>(null);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);

  // Effect 1: Fetch category labels khi modal mở
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

  const resetForm = () => {
    setName('');
    setSlug('');
    setSex(defaultSex);
    setIsAddingLabel(false);
    setNewLabelName('');
    setNewLabelIcon('🏷️');
    setShowIconPicker(false);
    setEditingLabel(null);
    setEditLabelName('');
    setEditLabelIcon('');
    setShowEditIconPicker(false);
    setDeletingLabel(null);
  };

  // Effect 2: Populate / reset form data khi initialData thay đổi hoặc modal mở lại
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setSlug(initialData.slug);
        setSex(initialData.sex || 'UNISEX');
      } else {
        resetForm();
      }
    } else {
      resetForm();
    }
  }, [initialData, defaultSex, isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (iconPickerRef.current && !iconPickerRef.current.contains(e.target as Node)) {
        setShowIconPicker(false);
      }
      if (editIconPickerRef.current && !editIconPickerRef.current.contains(e.target as Node)) {
        setShowEditIconPicker(false);
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
    resetForm();
  };

  // === CREATE LABEL ===
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
      onLabelsChanged?.();
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || 'Error adding label');
    }
  };

  // === DELETE LABEL (hard delete) ===
  const confirmDeleteLabel = async () => {
    if (!deletingLabel) return;
    setIsDeletingLoading(true);
    try {
      await deleteCategoryLabelApi(deletingLabel.id);
      setDbLabels((prev) => prev.filter((item) => item.id !== deletingLabel.id));
      if (sex === deletingLabel.name) {
        setSex('UNISEX');
      }
      setDeletingLabel(null);
      onLabelsChanged?.();
    } catch (err: any) {
      console.warn('Error deleting label from DB:', err);
      alert(err.response?.data?.error || err.message || 'Error deleting label');
    } finally {
      setIsDeletingLoading(false);
    }
  };

  // === EDIT LABEL ===
  const handleStartEdit = (lbl: CategoryLabelItem) => {
    setEditingLabel(lbl);
    setEditLabelName(lbl.name);
    setEditLabelIcon(lbl.icon || '🏷️');
    setIsAddingLabel(false);
    setShowEditIconPicker(false);
  };

  const handleSaveEdit = async () => {
    if (!editingLabel || !editLabelName.trim()) return;
    setIsEditLoading(true);
    try {
      const updated = await updateCategoryLabelApi(editingLabel.id, {
        name: editLabelName.trim(),
        icon: editLabelIcon.trim() || '🏷️',
      });
      setDbLabels((prev) =>
        prev.map((item) => (item.id === editingLabel.id ? { ...item, ...updated } : item)),
      );
      // If current sex was the old name, update to new name
      if (sex === editingLabel.name && updated.name !== editingLabel.name) {
        setSex(updated.name);
      }
      setEditingLabel(null);
      setShowEditIconPicker(false);
      onLabelsChanged?.();
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || 'Error editing label');
    } finally {
      setIsEditLoading(false);
    }
  };

  // Build options from dbLabels
  const dbOptionNames = new Set(dbLabels.map((l) => l.name));
  const fallbackOptions: SelectOption[] = [];
  if (sex && !dbOptionNames.has(sex)) {
    fallbackOptions.push({
      value: sex,
      label: sex,
      icon: '🏷️',
    });
  }

  const sexOptions: SelectOption[] = [
    ...fallbackOptions,
    ...dbLabels.map((lbl) => ({
      value: lbl.name,
      label: lbl.name,
      icon: lbl.icon || '🏷️',
      onDelete: () => setDeletingLabel(lbl),
      onEdit: () => handleStartEdit(lbl),
    })),
  ];

  const modalTitle = initialData
    ? t('editCategory') || 'Edit Category'
    : t('addCategory') || 'Add New Category';

  // Shared Icon Picker Grid Component
  const renderIconPicker = (
    selectedIcon: string,
    onSelect: (emoji: string) => void,
    inputValue: string,
    onInputChange: (val: string) => void,
  ) => (
    <div className="absolute left-0 mt-1.5 p-2 bg-white dark:bg-slate-900 border border-indigo-100 dark:border-white/15 rounded-xl shadow-2xl backdrop-blur-xl z-50 w-56 animate-in fade-in zoom-in-95 duration-150">
      <div className="text-[10px] font-semibold text-slate-500 mb-1 px-1">{t('selectTargetPlaceholder') || 'Select Emoji:'}</div>
      <div className="grid grid-cols-5 gap-1 max-h-36 overflow-y-auto p-1 no-scrollbar">
        {EMOJI_PRESETS.map((emoji, idx) => (
          <button
            key={`${emoji}-${idx}`}
            type="button"
            onClick={() => onSelect(emoji)}
            className={`h-8 text-base flex items-center justify-center rounded-lg hover:bg-indigo-50 dark:hover:bg-white/10 transition-colors cursor-pointer ${
              selectedIcon === emoji ? 'bg-indigo-100 dark:bg-indigo-500/30 ring-1 ring-indigo-500' : ''
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>
      <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-white/10 flex items-center gap-1.5">
        <span className="text-[10px] text-slate-400 shrink-0">{t('sexOther')}:</span>
        <input
          type="text"
          placeholder="Emoji..."
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded text-center text-xs"
        />
      </div>
    </div>
  );

  return (
    <>
      <Modal
        isOpen={isOpen && !deletingLabel}
        onClose={onClose}
        title={modalTitle}
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>
              {t('cancel') || 'Cancel'}
            </Button>
            <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
              {initialData ? t('update') || 'Update' : t('saveCategory') || 'Save Category'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('categoryName')}
            placeholder={t('categoryNamePlaceholder')}
            value={name}
            onChange={handleNameChange}
            required
          />
          <Input
            label={t('slug') || 'Mã đường dẫn (Slug)'}
            placeholder={t('slugPlaceholder')}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('targetLabel')}
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsAddingLabel(!isAddingLabel);
                  setEditingLabel(null);
                }}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                {t('addNewLabel')}
              </button>
            </div>

            <CustomSelect
              value={sex}
              onChange={(val) => setSex(val)}
              options={sexOptions}
              placeholder={dbLabels.length === 0 ? t('noLabelsHint') : t('selectTargetPlaceholder')}
            />
          </div>

          {/* Quick Add Custom Label Box */}
          {isAddingLabel && !editingLabel && (
            <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" />
                {t('addLabelToDb')}
              </div>
              <div className="flex items-center gap-2">
                {/* Interactive Icon Picker */}
                <div className="relative shrink-0" ref={iconPickerRef}>
                  <button
                    type="button"
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className="w-12 h-9 px-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-lg text-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
                    title={t('selectTargetPlaceholder') || 'Click to select emoji icon'}
                  >
                    {newLabelIcon || '🏷️'}
                  </button>

                  {showIconPicker &&
                    renderIconPicker(
                      newLabelIcon,
                      (emoji) => {
                        setNewLabelIcon(emoji);
                        setShowIconPicker(false);
                      },
                      newLabelIcon,
                      setNewLabelIcon,
                    )}
                </div>

                <input
                  type="text"
                  placeholder={t('addLabelName')}
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-lg text-xs"
                />
                <Button type="button" size="sm" onClick={handleCreateLabel}>
                  {t('saveLabel')}
                </Button>
              </div>
            </div>
          )}

          {/* Edit Label Box */}
          {editingLabel && (
            <div className="p-3 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                <Edit2 className="h-3.5 w-3.5" />
                {t('editLabel')} <span className="text-amber-600 dark:text-amber-400">"{editingLabel.name}"</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Icon Picker for Edit */}
                <div className="relative shrink-0" ref={editIconPickerRef}>
                  <button
                    type="button"
                    onClick={() => setShowEditIconPicker(!showEditIconPicker)}
                    className="w-12 h-9 px-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-lg text-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
                    title={t('selectTargetPlaceholder') || 'Click to select emoji icon'}
                  >
                    {editLabelIcon || '🏷️'}
                  </button>

                  {showEditIconPicker &&
                    renderIconPicker(
                      editLabelIcon,
                      (emoji) => {
                        setEditLabelIcon(emoji);
                        setShowEditIconPicker(false);
                      },
                      editLabelIcon,
                      setEditLabelIcon,
                    )}
                </div>

                <input
                  type="text"
                  placeholder={t('categoryName')}
                  value={editLabelName}
                  onChange={(e) => setEditLabelName(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-lg text-xs"
                />
                <Button type="button" size="sm" variant="primary" onClick={handleSaveEdit} isLoading={isEditLoading}>
                  {t('saveLabel')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingLabel(null);
                    setShowEditIconPicker(false);
                  }}
                >
                  {t('cancelLabel')}
                </Button>
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* Confirmation Modal for Deleting Category Label */}
      {deletingLabel && (
        <Modal
          isOpen={!!deletingLabel}
          onClose={() => !isDeletingLoading && setDeletingLabel(null)}
          title={t('confirmDeleteLabelTitle')}
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setDeletingLabel(null)}
                disabled={isDeletingLoading}
              >
                {t('cancelLabel')}
              </Button>
              <Button
                variant="danger"
                onClick={confirmDeleteLabel}
                isLoading={isDeletingLoading}
              >
                {t('deleteLabelBtn')}
              </Button>
            </>
          }
        >
          <div className="py-2 text-sm text-slate-700 dark:text-slate-300 space-y-2">
            <p>{t('confirmDeleteLabelDesc', { name: deletingLabel.name })}</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">{t('confirmDeleteLabelWarning')}</p>
          </div>
        </Modal>
      )}
    </>
  );
};
