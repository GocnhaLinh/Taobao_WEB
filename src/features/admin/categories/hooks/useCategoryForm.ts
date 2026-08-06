import { useState, useEffect, useRef } from 'react';
import type { Category } from '../types';
import {
  fetchCategoryLabelsApi,
  createCategoryLabelApi,
  updateCategoryLabelApi,
  deleteCategoryLabelApi,
  type CategoryLabelItem,
} from '../../../../services/categoryLabelService';
import { slugify } from '../utils/category.utils';

interface UseCategoryFormOptions {
  isOpen: boolean;
  initialData?: Category | null;
  defaultSex?: string;
  onSubmit: (data: { name: string; slug: string; sex: string }) => void;
  onLabelsChanged?: () => void;
}

export function useCategoryForm({
  isOpen,
  initialData,
  defaultSex = 'UNISEX',
  onSubmit,
  onLabelsChanged,
}: UseCategoryFormOptions) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sex, setSex] = useState<string>('UNISEX');

  const [dbLabels, setDbLabels] = useState<CategoryLabelItem[]>([]);
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelIcon, setNewLabelIcon] = useState('🏷️');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const iconPickerRef = useRef<HTMLDivElement>(null);

  const [editingLabel, setEditingLabel] = useState<CategoryLabelItem | null>(null);
  const [editLabelName, setEditLabelName] = useState('');
  const [editLabelIcon, setEditLabelIcon] = useState('');
  const [showEditIconPicker, setShowEditIconPicker] = useState(false);
  const editIconPickerRef = useRef<HTMLDivElement>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);

  const [deletingLabel, setDeletingLabel] = useState<CategoryLabelItem | null>(null);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);

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

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setSlug(initialData.slug);
        setSex(initialData.sex || defaultSex);
      } else {
        resetForm();
      }
    }
  }, [isOpen, initialData, defaultSex]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (iconPickerRef.current && !iconPickerRef.current.contains(event.target as Node)) {
        setShowIconPicker(false);
      }
      if (
        editIconPickerRef.current &&
        !editIconPickerRef.current.contains(event.target as Node)
      ) {
        setShowEditIconPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!initialData) {
      setSlug(slugify(val));
    }
  };

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;
    try {
      const created = await createCategoryLabelApi({
        name: newLabelName.trim(),
        icon: newLabelIcon,
      });
      setDbLabels((prev) => [...prev, created]);
      setName(created.name);
      if (!initialData) setSlug(slugify(created.name));

      setNewLabelName('');
      setNewLabelIcon('🏷️');
      setIsAddingLabel(false);
      setShowIconPicker(false);
      onLabelsChanged?.();
    } catch (err: any) {
      alert(err?.response?.data?.error || err.message || 'Lỗi khi tạo nhãn');
    }
  };

  const handleStartEditLabel = (item: CategoryLabelItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLabel(item);
    setEditLabelName(item.name);
    setEditLabelIcon(item.icon || '🏷️');
    setShowEditIconPicker(false);
  };

  const handleSaveEditLabel = async () => {
    if (!editingLabel || !editLabelName.trim()) return;
    setIsEditLoading(true);
    try {
      const updated = await updateCategoryLabelApi(editingLabel.id, {
        name: editLabelName.trim(),
        icon: editLabelIcon,
      });
      setDbLabels((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      if (name === editingLabel.name) {
        setName(updated.name);
      }
      setEditingLabel(null);
      setShowEditIconPicker(false);
      onLabelsChanged?.();
    } catch (err: any) {
      alert(err?.response?.data?.error || err.message || 'Lỗi khi sửa nhãn');
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleConfirmDeleteLabel = async () => {
    if (!deletingLabel) return;
    setIsDeletingLoading(true);
    try {
      await deleteCategoryLabelApi(deletingLabel.id);
      setDbLabels((prev) => prev.filter((item) => item.id !== deletingLabel.id));
      if (name === deletingLabel.name) {
        setName('');
      }
      setDeletingLabel(null);
      onLabelsChanged?.();
    } catch (err: any) {
      alert(err?.response?.data?.error || err.message || 'Lỗi khi xóa nhãn');
    } finally {
      setIsDeletingLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const finalSlug = slug.trim() || slugify(name);
    onSubmit({ name: name.trim(), slug: finalSlug, sex });
  };

  return {
    name,
    setName,
    slug,
    setSlug,
    sex,
    setSex,
    dbLabels,
    isAddingLabel,
    setIsAddingLabel,
    newLabelName,
    setNewLabelName,
    newLabelIcon,
    setNewLabelIcon,
    showIconPicker,
    setShowIconPicker,
    iconPickerRef,
    editingLabel,
    setEditingLabel,
    editLabelName,
    setEditLabelName,
    editLabelIcon,
    setEditLabelIcon,
    showEditIconPicker,
    setShowEditIconPicker,
    editIconPickerRef,
    isEditLoading,
    deletingLabel,
    setDeletingLabel,
    isDeletingLoading,
    handleNameChange,
    handleCreateLabel,
    handleStartEditLabel,
    handleSaveEditLabel,
    handleConfirmDeleteLabel,
    handleSubmit,
  };
}
