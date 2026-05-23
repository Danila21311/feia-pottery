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
  GIFT_PAYMENT_LABELS,
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
import { ApiError, type GiftCertificatePaymentStatus } from '@/lib/api';

export function AdminOrdersGiftsTab() {
  const { giftCertificateOrders, isLoading, patchGiftPaymentStatus, deleteGiftCertificateOrder } =
    useAdminOrdersData();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [giftPaymentStatus, setGiftPaymentStatus] = useState<
    'all' | 'pending_manager' | 'paid' | 'cancelled'
  >('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const normalizedSearch = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    return giftCertificateOrders
      .filter((g) => (giftPaymentStatus === 'all' ? true : g.paymentStatus === giftPaymentStatus))
      .filter((g) => {
        if (!normalizedSearch) return true;
        return (
          g.customerName.toLowerCase().includes(normalizedSearch) ||
          g.customerPhone.toLowerCase().includes(normalizedSearch) ||
          g.customerEmail.toLowerCase().includes(normalizedSearch) ||
          g.recipientName.toLowerCase().includes(normalizedSearch)
        );
      });
  }, [giftCertificateOrders, giftPaymentStatus, normalizedSearch]);

  const filterKey = useMemo(
    () => [normalizedSearch, giftPaymentStatus].join('|'),
    [normalizedSearch, giftPaymentStatus],
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
      'Номинал',
      'Получатель',
      'Пожелание',
      'Заказчик',
      'Телефон',
      'Email',
      'Связь',
      'Статус оплаты',
      'Комментарий',
    ];

    const rows = filtered.map((g) => [
      new Date(g.createdAt).toLocaleString('ru-RU'),
      g.amount,
      g.recipientName,
      g.message ?? '',
      g.customerName,
      g.customerPhone,
      g.customerEmail,
      g.contactMethod,
      GIFT_PAYMENT_LABELS[g.paymentStatus] ?? g.paymentStatus,
      g.comment ?? '',
    ]);

    downloadCsv(`gift-certificates-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteGiftCertificateOrder(deleteId);
      toast({ title: 'Удалено', description: 'Заявка на сертификат удалена' });
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
              placeholder="Заказчик, получатель…"
              className={minimalInputClass}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground font-normal">Статус оплаты</Label>
            <select
              className={minimalSelectClass}
              value={giftPaymentStatus}
              onChange={(e) => setGiftPaymentStatus(e.target.value as typeof giftPaymentStatus)}
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
        <table className="w-full min-w-[720px] caption-bottom text-sm">
          <TableHeader className="sticky top-0 z-[1] bg-background shadow-[0_1px_0_0_hsl(var(--border)/0.5)]">
            <TableRow className="border-b border-border/50 hover:bg-transparent">
              <TableHead className={thClass}>Дата</TableHead>
              <TableHead className={thClass}>Номинал</TableHead>
              <TableHead className={thClass}>Получатель</TableHead>
              <TableHead className={thClass}>Заказчик</TableHead>
              <TableHead className={thClass}>Контакты</TableHead>
              <TableHead className={thClass}>Статус</TableHead>
              <TableHead className={thClass}>Комм.</TableHead>
              <TableHead className={cn(thClass, 'w-10')} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((g) => (
              <TableRow key={g.id} className="border-border/40 hover:bg-muted/20">
                <TableCell className={cn(tdClass, 'whitespace-nowrap tabular-nums')}>
                  {new Date(g.createdAt).toLocaleString('ru-RU')}
                </TableCell>
                <TableCell className={cn(tdClass, 'tabular-nums whitespace-nowrap')}>
                  {g.amount.toLocaleString('ru-RU')} ₽
                </TableCell>
                <TableCell className={cn(tdClass, 'min-w-[110px]')}>
                  <p>{g.recipientName}</p>
                  {g.message ? <p className="text-muted-foreground text-[0.7rem] mt-1 line-clamp-2">{g.message}</p> : null}
                </TableCell>
                <TableCell className={tdClass}>{g.customerName}</TableCell>
                <TableCell className={cn(tdClass, 'min-w-[160px]')}>
                  <div className="leading-5">
                    <p>{g.customerPhone}</p>
                    <p className="text-muted-foreground">{g.customerEmail}</p>
                    <p className="text-muted-foreground text-[0.7rem]">{g.contactMethod}</p>
                  </div>
                </TableCell>
                <TableCell className={tdClass}>
                  <AdminEditableStatusCell
                    value={g.paymentStatus}
                    options={PAYMENT_STATUS_OPTIONS}
                    labels={PAYMENT_STATUS_LABELS}
                    onSave={(status) =>
                      patchGiftPaymentStatus(g.id, status as GiftCertificatePaymentStatus)
                    }
                  />
                </TableCell>
                <TableCell className={cn(tdClass, 'min-w-[90px] max-w-[160px] text-muted-foreground line-clamp-2')}>
                  {g.comment || '—'}
                </TableCell>
                <TableCell className={tdClass}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteId(g.id)}
                    aria-label="Удалить заявку"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                  Заявок на сертификаты нет
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
        title="Удалить заявку на сертификат?"
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
