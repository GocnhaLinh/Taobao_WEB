import React, { useState, useEffect } from 'react';
import { Modal } from '../../../../components/ui/Modal';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { CustomSelect } from '../../../../components/ui/CustomSelect';
import { useTranslation } from '../../../../lib/i18n';
import { createUserApi, updateUserApi } from '../api/user.api';
import { getUserRoleOptions, getUserStatusOptions } from '../constants';
import type { UserFormModalProps } from '../types';
import { UserPlus, UserCheck, Loader2, Save } from 'lucide-react';

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  editingUser,
  onSuccess,
}) => {
  const { t } = useTranslation();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pass, setPass] = useState('');
  const [role, setRole] = useState('USER');
  const [status, setStatus] = useState('ACTIVE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editingUser) {
      setFullName(editingUser.fullName || editingUser.name || '');
      setEmail(editingUser.email || '');
      setPhone(editingUser.phone || '');
      setPass('');
      setRole(editingUser.role || 'USER');
      setStatus(editingUser.status || 'ACTIVE');
    } else {
      setFullName('');
      setEmail('');
      setPhone('');
      setPass('');
      setRole('USER');
      setStatus('ACTIVE');
    }
    setErrorMsg('');
  }, [editingUser, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = fullName.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim() ? phone.trim() : undefined;

    if (!cleanName || !cleanEmail || (!editingUser && !pass)) {
      setErrorMsg(t('fillRequiredFields'));
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      const payload = {
        fullName: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        role,
        status,
      };

      if (editingUser) {
        await updateUserApi(editingUser.id, payload);
      } else {
        await createUserApi({
          ...payload,
          pass,
        });
      }

      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; error?: string } }; message?: string };
      const msg = error.response?.data?.message || error.response?.data?.error || error.message || 'Lỗi xử lý tài khoản';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalTitleNode = (
    <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base sm:text-lg">
      {editingUser ? (
        <>
          <UserCheck className="h-5 w-5 text-indigo-500" />
          <span>{t('editUserTitle')}</span>
        </>
      ) : (
        <>
          <UserPlus className="h-5 w-5 text-indigo-500" />
          <span>{t('addNewAccount')}</span>
        </>
      )}
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitleNode} maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4 text-slate-900 dark:text-white">
        {errorMsg && (
          <div className="p-3 text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-xl">
            {errorMsg}
          </div>
        )}

        <div className="space-y-3">
          {/* Full Name */}
          <Input
            label={`${t('userFullName')} *`}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ví dụ: Nguyễn Văn A"
            required
            className="text-xs"
          />

          {/* Email */}
          <Input
            type="email"
            label="Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@gmail.com"
            required
            className="text-xs"
          />

          {/* Phone */}
          <Input
            label={t('userPhoneLabel')}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0901234567"
            className="text-xs"
          />

          {/* Password (Only required for new users) */}
          {!editingUser && (
            <Input
              type="password"
              label={`${t('passwordLabel')} *`}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••••"
              required={!editingUser}
              className="text-xs"
            />
          )}

          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Role Select */}
            <CustomSelect
              label={t('userRoleLabel')}
              value={role}
              onChange={setRole}
              options={getUserRoleOptions(t, false)}
              size="sm"
              dropUp={true}
            />

            {/* Status Select */}
            <CustomSelect
              label={t('userStatusLabel')}
              value={status}
              onChange={setStatus}
              options={getUserStatusOptions(t, false)}
              size="sm"
              dropUp={true}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/10">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                {t('saving')}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1.5" />
                {editingUser ? t('saveChanges') : t('createAccount')}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
