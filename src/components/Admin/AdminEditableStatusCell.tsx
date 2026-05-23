'use client';

import { useState } from 'react';
import { AdminStatusSelect } from '@/components/Admin/AdminStatusSelect';
import { useToast } from '@/hooks/use-toast';
import { ApiError } from '@/lib/api';

interface AdminEditableStatusCellProps<T extends string> {
  value: T;
  options: readonly T[];
  labels: Record<T, string>;
  onSave: (value: T) => Promise<void>;
}

export function AdminEditableStatusCell<T extends string>({
  value,
  options,
  labels,
  onSave,
}: AdminEditableStatusCellProps<T>) {
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleChange = async (next: T) => {
    if (next === value) return;
    setSaving(true);
    try {
      await onSave(next);
      toast({ title: 'Статус обновлён' });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Не удалось сохранить статус';
      toast({ title: 'Ошибка', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminStatusSelect
      value={value}
      options={options}
      labels={labels}
      onChange={handleChange}
      saving={saving}
    />
  );
}
