import { ApiError } from '@/lib/api';

export {
  ORDER_STATUS_LABELS as STATUS_LABELS,
  PAYMENT_STATUS_LABELS as BOOKING_PAYMENT_LABELS,
  PAYMENT_STATUS_LABELS as GIFT_PAYMENT_LABELS,
} from '@/lib/applicationStatusLabels';

export function getAdminOrdersErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Сессия истекла. Войдите заново в менеджерский аккаунт.';
    if (error.status === 403) return 'Недостаточно прав: доступ только для администратора.';
    if (error.status >= 500) return 'Сервер временно недоступен. Попробуйте обновить страницу позже.';
    return error.message;
  }

  if (error instanceof Error && /fetch|network|timeout|abort/i.test(error.message)) {
    return 'Проблема с сетью. Проверьте подключение и попробуйте снова.';
  }

  return 'Не удалось загрузить заявки';
}

/** Горизонтальный скролл таблицы; вертикаль ограничивается пагинацией (число строк на странице). */
export const tableScrollClass = 'rounded-md border border-border/50 overflow-x-auto';
export const thClass =
  'h-8 px-2 text-left text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap';
export const tdClass = 'px-2 py-2 align-top text-xs';

export function toCsvCell(value: unknown) {
  const stringValue = value == null ? '' : String(value);
  return `"${stringValue.replace(/"/g, '""')}"`;
}

export function downloadCsv(filename: string, headers: string[], rows: Array<Array<unknown>>) {
  const csv = [headers, ...rows].map((row) => row.map(toCsvCell).join(',')).join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
