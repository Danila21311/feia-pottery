'use client';

import { useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { AdminOrdersPaginationBar } from '@/views/Admin/AdminOrdersPaginationBar';
import { useAdminTablePagination } from '@/views/Admin/useAdminTablePagination';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { minimalInputClass, minimalSelectClass } from '@/lib/formFieldStyles';
import { useAdminOrdersData } from '@/views/Admin/AdminOrdersDataContext';
import {
  BOOKING_PAYMENT_LABELS,
  downloadCsv,
  getAdminOrdersErrorMessage,
  tableScrollClass,
  thClass,
  tdClass,
} from '@/views/Admin/adminOrdersShared';
import {
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_OPTIONS,
} from '@/lib/applicationStatusLabels';
import { AdminEditableStatusCell } from '@/components/Admin/AdminEditableStatusCell';
import { AdminConfirmDeleteDialog } from '@/components/Admin/AdminConfirmDeleteDialog';
import { useToast } from '@/hooks/use-toast';
import { ApiError, type WorkshopBookingStatus } from '@/lib/api';

export function AdminOrdersWorkshopsTab() {
  const { workshopBookings, isLoading, patchBookingPaymentStatus, deleteWorkshopBooking } =
    useAdminOrdersData();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [bookingPaymentStatus, setBookingPaymentStatus] = useState<
    'all' | 'pending_manager' | 'paid' | 'cancelled'
  >('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const normalizedSearch = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    return workshopBookings
      .filter((b) => (bookingPaymentStatus === 'all' ? true : b.paymentStatus === bookingPaymentStatus))
      .filter((b) => {
        if (!normalizedSearch) return true;
        return (
          b.customerName.toLowerCase().includes(normalizedSearch) ||
          b.customerPhone.toLowerCase().includes(normalizedSearch) ||
          b.customerEmail.toLowerCase().includes(normalizedSearch) ||
          b.workshopTitle.toLowerCase().includes(normalizedSearch)
        );
      });
  }, [workshopBookings, bookingPaymentStatus, normalizedSearch]);

  const filterKey = useMemo(
    () => [normalizedSearch, bookingPaymentStatus].join('|'),
    [normalizedSearch, bookingPaymentStatus],
  );

  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    totalCount,
    pageItems,
  } = useAdminTablePagination(filtered, filterKey);

  const exportCsv = () => {
    const headers = [
      'Дата заявки',
      'Мастер-класс',
      'Дата МК',
      'Время МК',
      'Формат',
      'Клиент',
      'Телефон',
      'Email',
      'Статус оплаты',
      'Стоимость',
      'Комментарий',
    ];

    const rows = filtered.map((booking) => [
      new Date(booking.createdAt).toLocaleString('ru-RU'),
      booking.workshopTitle,
      booking.workshopDate,
      booking.workshopTime,
      booking.selectedFormat,
      booking.customerName,
      booking.customerPhone,
      booking.customerEmail,
      booking.paymentStatus,
      booking.price,
      booking.comment ?? '',
    ]);

    downloadCsv(`workshop-bookings-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteWorkshopBooking(deleteId);
      toast({ title: 'Удалено', description: 'Запись на мастер-класс удалена' });
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : getAdminOrdersErrorMessage(error);
      toast({ title: 'Ошибка', description: message, variant: 'destructive' });
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground/30" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div className="grid gap-3 sm:grid-cols-2 flex-1 max-w-xl">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground font-normal">Поиск</Label>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Клиент, мастер-класс…"
              className={minimalInputClass}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground font-normal">Статус оплаты</Label>
            <select
              className={minimalSelectClass}
              value={bookingPaymentStatus}
              onChange={(e) => setBookingPaymentStatus(e.target.value as typeof bookingPaymentStatus)}
            >
              <option value="all">Все</option>
              <option value="pending_manager">Ожидает менеджера</option>
              <option value="paid">Оплачено</option>
              <option value="cancelled">Отменено</option>
            </select>
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" className="shrink-0 h-9 text-xs uppercase tracking-wide" onClick={exportCsv}>
          Скачать CSV
        </Button>
      </div>

      <div className={tableScrollClass}>
        <table className="w-full min-w-[760px] caption-bottom text-sm">
          <TableHeader className="sticky top-0 z-[1] bg-background shadow-[0_1px_0_0_hsl(var(--border)/0.5)]">
            <TableRow className="border-b border-border/50 hover:bg-transparent">
              <TableHead className={thClass}>Дата</TableHead>
              <TableHead className={thClass}>Мастер-класс</TableHead>
              <TableHead className={thClass}>Сеанс</TableHead>
              <TableHead className={thClass}>Формат</TableHead>
              <TableHead className={thClass}>Статус</TableHead>
              <TableHead className={thClass}>Клиент</TableHead>
              <TableHead className={thClass}>Контакты</TableHead>
              <TableHead className={thClass}>Сумма</TableHead>
              <TableHead className={thClass}>Комм.</TableHead>
              <TableHead className={cn(thClass, 'w-10')} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((booking) => (
              <TableRow key={booking.id} className="border-border/40 hover:bg-muted/20">
                <TableCell className={cn(tdClass, 'whitespace-nowrap tabular-nums')}>
                  {new Date(booking.createdAt).toLocaleString('ru-RU')}
                </TableCell>
                <TableCell className={cn(tdClass, 'min-w-[140px]')}>{booking.workshopTitle}</TableCell>
                <TableCell className={cn(tdClass, 'whitespace-nowrap')}>
                  {booking.workshopDate} · {booking.workshopTime}
                </TableCell>
                <TableCell className={tdClass}>{booking.selectedFormat}</TableCell>
                <TableCell className={cn(tdClass, 'whitespace-nowrap')}>
                  <AdminEditableStatusCell
                    value={booking.paymentStatus}
                    options={PAYMENT_STATUS_OPTIONS}
                    labels={PAYMENT_STATUS_LABELS}
                    onSave={(status) =>
                      patchBookingPaymentStatus(booking.id, status as WorkshopBookingStatus)
                    }
                  />
                </TableCell>
                <TableCell className={tdClass}>{booking.customerName}</TableCell>
                <TableCell className={cn(tdClass, 'min-w-[160px]')}>
                  <div className="leading-5">
                    <p>{booking.customerPhone}</p>
                    <p className="text-muted-foreground">{booking.customerEmail}</p>
                  </div>
                </TableCell>
                <TableCell className={cn(tdClass, 'tabular-nums whitespace-nowrap')}>
                  {booking.price.toLocaleString('ru-RU')} ₽
                </TableCell>
                <TableCell className={cn(tdClass, 'min-w-[100px] max-w-[160px] text-muted-foreground line-clamp-2')}>
                  {booking.comment || '—'}
                </TableCell>
                <TableCell className={tdClass}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteId(booking.id)}
                    aria-label="Удалить запись"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={10} className="py-12 text-center text-sm text-muted-foreground">
                  Записей нет
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </table>
      </div>

      <AdminOrdersPaginationBar
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      <AdminConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Удалить запись на мастер-класс?"
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
