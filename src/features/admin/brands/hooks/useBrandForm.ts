import { useState, useEffect, useRef } from 'react';
import type { Brand } from '../types';
import { uploadSingleImageApi, deleteImageApi } from '../../../../services/uploadService';
import { useNotification } from '../../../../lib/notification';
import { useTranslation } from '../../../../lib/i18n';

interface UseBrandFormOptions {
  isOpen: boolean;
  initialData?: Brand | null;
  onSubmit: (data: { name: string; logo?: string; description?: string }) => void;
}

export function useBrandForm({ isOpen, initialData, onSubmit }: UseBrandFormOptions) {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [description, setDescription] = useState('');
  const [imgError, setImgError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingLogo, setIsDeletingLogo] = useState(false);

  const resetForm = () => {
    setName('');
    setLogo('');
    setDescription('');
    setImgError(false);
    setIsUploading(false);
    setIsDeletingLogo(false);
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || '');
        setLogo(initialData.logo || '');
        setDescription(initialData.description || '');
        setImgError(false);
      } else {
        resetForm();
      }
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('Please select a valid image file (PNG, JPG, WEBP).', 'error');
      return;
    }

    try {
      setIsUploading(true);
      const res = await uploadSingleImageApi(file);
      if (res && res.url) {
        setLogo(res.url);
        setImgError(false);
        showNotification(t('logoUploadSuccess') || 'Tải logo thương hiệu thành công!', 'success');
      }
    } catch (error: any) {
      showNotification(error.message || 'Logo upload failed, please try again.', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = async () => {
    if (!logo) return;
    try {
      setIsDeletingLogo(true);
      await deleteImageApi(logo);
      setLogo('');
      showNotification('Logo removed', 'info');
    } catch (error) {
      setLogo('');
    } finally {
      setIsDeletingLogo(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      logo: logo.trim() || undefined,
      description: description.trim() || undefined,
    });
  };

  return {
    t,
    fileInputRef,
    name,
    setName,
    logo,
    setLogo,
    description,
    setDescription,
    imgError,
    setImgError,
    isUploading,
    isDeletingLogo,
    handleFileChange,
    handleRemoveLogo,
    handleSubmit,
  };
}
