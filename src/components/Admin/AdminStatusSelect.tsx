'use client';

import { cn } from '@/lib/utils';
import { minimalSelectClass } from '@/lib/formFieldStyles';

interface AdminStatusSelectProps<T extends string> {
  value: T;
  options: readonly T[];
  labels: Record<T, string>;
  onChange: (value: T) => void;
  disabled?: boolean;
  saving?: boolean;
  className?: string;
}

export function AdminStatusSelect<T extends string>({
  value,
  options,
  labels,
  onChange,
  disabled,
  saving,
  className,
}: AdminStatusSelectProps<T>) {
  return (
    <select
      className={cn(minimalSelectClass, 'h-8 min-w-[9.5rem] text-xs py-1', className)}
      value={value}
      disabled={disabled || saving}
      onChange={(e) => onChange(e.target.value as T)}
      aria-busy={saving}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {labels[option] ?? option}
        </option>
      ))}
    </select>
  );
}
