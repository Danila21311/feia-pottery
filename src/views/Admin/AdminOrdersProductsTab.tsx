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
  STATUS_LABELS,
  downloadCsv,
  getAdminOrdersErrorMessage,
  tableScrollClass,
  thClass,
  tdClass,
} from '@/views/Admin/adminOrdersShared';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_OPTIONS,
} from '@/lib/applicationStatusLabels';
import { AdminEditableStatusCell } from '@/components/Admin/AdminEditableStatusCell';
import { AdminConfirmDeleteDialog } from '@/components/Admin/AdminConfirmDeleteDialog';
import { useToast } from '@/hooks/use-toast';
import { ApiError, type OrderStatus } from '@/lib/api';

export function AdminOrdersProductsTab() {
  const { orders, isLoading, patchOrderStatus, deleteOrder } = useAdminOrdersData();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [orderCustomerType, setOrderCustomerType] = useState<'all' | 'individual' | 'legal'>('all');
  const [orderContactMethod, setOrderContactMethod] = useState<'all' | 'telegram' | 'max' | 'phone'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => (orderCustomerType === 'all' ? true : order.customerType === orderCustomerType))
      .filter((order) => (orderContactMethod === 'all' ? true : order.contactMethod === orderContactMethod))
      .filter((order) => {
        if (!normalizedSearch) return true;
        return (
          order.customerName.toLowerCase().includes(normalizedSearch) ||
          order.customerPhone.toLowerCase().includes(normalizedSearch) ||
          order.customerEmail.toLowerCase().includes(normalizedSearch)
        );
      });
  }, [orders, orderCustomerType, orderContactMethod, normalizedSearch]);

  const filterKey = useMemo(
    () => [normalizedSearch, orderCustomerType, orderContactMethod].join('|'),
    [normalizedSearch, orderCustomerType, orderContactMethod],
  );

  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    totalCount,
    pageItems,
  } = useAdminTablePagination(filteredOrders, filterKey);

  const exportOrdersCsv = () => {
    const headers = [
      'Дата',
      'Статус',
      'Клиент',
      'Телефон',
      'Email',
      'Тип клиента',
      'Компания',
      'ИНН',
      'Канал связи',
      'Метод доставки',
      'Тип доставки',
      'Город',
      'Адрес',
      'Тип получателя',
      'Имя получателя',
      'Телефон получателя',
      'Оплата',
      'Сумма',
      'Позиции',
      'Комментарий',
    ];

    const rows = filteredOrders.map((order) => [
      new Date(order.createdAt).toLocaleString('ru-RU'),
      STATUS_LABELS[order.status] ?? order.status,
      order.customerName,
      order.customerPhone,
      order.customerEmail,
      order.customerType,
      order.legalCompanyName ?? '',
      order.legalInn ?? '',
      order.contactMethod,
      order.deliveryMethod,
      order.deliveryType,
      order.city,
      order.fullAddress ?? '',
      order.recipientType,
      order.recipientName ?? '',
      order.recipientPhone ?? '',
      order.paymentMethod,
      order.total,
      Array.isArray(order.items) ? order.items.length : 0,
      order.comment ?? '',
    ]);

    downloadCsv(`orders-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteOrder(deleteId);
      toast({ title: 'Удалено', description: 'Заявка на товары удалена' });
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
        <div className="grid gap-3 sm:grid-cols-3 flex-1 max-w-3xl">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground font-normal">Поиск</Label>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Имя, телефон, email…"
              className={minimalInputClass}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground font-normal">Тип клиента</Label>
            <select
              className={minimalSelectClass}
              value={orderCustomerType}
              onChange={(e) => setOrderCustomerType(e.target.value as typeof orderCustomerType)}
            >
              <option value="all">Все</option>
              <option value="individual">Физ. лицо</option>
              <option value="legal">Юр. лицо</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground font-normal">Связь</Label>
            <select
              className={minimalSelectClass}
              value={orderContactMethod}
              onChange={(e) => setOrderContactMethod(e.target.value as typeof orderContactMethod)}
            >
              <option value="all">Все</option>
              <option value="telegram">Telegram</option>
              <option value="max">MAX</option>
              <option value="phone">Телефон</option>
            </select>
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" className="shrink-0 h-9 text-xs uppercase tracking-wide" onClick={exportOrdersCsv}>
          Скачать CSV
        </Button>
      </div>

      <div className={tableScrollClass}>
        <table className="w-full min-w-[900px] caption-bottom text-sm">
          <TableHeader className="sticky top-0 z-[1] bg-background shadow-[0_1px_0_0_hsl(var(--border)/0.5)]">
            <TableRow className="border-b border-border/50 hover:bg-transparent">
              <TableHead className={thClass}>Дата</TableHead>
              <TableHead className={thClass}>Статус</TableHead>
              <TableHead className={thClass}>Клиент</TableHead>
              <TableHead className={thClass}>Контакты</TableHead>
              <TableHead className={thClass}>Тип</TableHead>
              <TableHead className={thClass}>Доставка</TableHead>
              <TableHead className={thClass}>Получатель</TableHead>
              <TableHead className={thClass}>Сумма</TableHead>
              <TableHead className={thClass}>Поз.</TableHead>
              <TableHead className={thClass}>Комм.</TableHead>
              <TableHead className={cn(thClass, 'w-10')} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((order) => (
              <TableRow key={order.id} className="border-border/40 hover:bg-muted/20">
                <TableCell className={cn(tdClass, 'whitespace-nowrap tabular-nums')}>
                  {new Date(order.createdAt).toLocaleString('ru-RU')}
                </TableCell>
                <TableCell className={cn(tdClass, 'whitespace-nowrap')}>
                  <AdminEditableStatusCell
                    value={order.status}
                    options={ORDER_STATUS_OPTIONS}
                    labels={ORDER_STATUS_LABELS}
                    onSave={(status) => patchOrderStatus(order.id, status as OrderStatus)}
                  />
                </TableCell>
                <TableCell className={cn(tdClass, 'min-w-[120px]')}>{order.customerName}</TableCell>
                <TableCell className={cn(tdClass, 'min-w-[160px]')}>
                  <div className="leading-5">
                    <p>{order.customerPhone}</p>
                    <p className="text-muted-foreground">{order.customerEmail}</p>
                    <p className="text-muted-foreground text-[0.7rem]">{order.contactMethod}</p>
                  </div>
                </TableCell>
                <TableCell className={cn(tdClass, 'whitespace-nowrap')}>
                  {order.customerType === 'legal' ? 'Юр.' : 'Физ.'}
                  {order.customerType === 'legal' && (
                    <div className="text-muted-foreground mt-1 font-normal">
                      <p className="line-clamp-2">{order.legalCompanyName || '—'}</p>
                      <p className="text-[0.7rem]">ИНН: {order.legalInn || '—'}</p>
                    </div>
                  )}
                </TableCell>
                <TableCell className={cn(tdClass, 'min-w-[140px]')}>
                  <div className="leading-5 text-muted-foreground">
                    <p>
                      {order.deliveryMethod} · {order.deliveryType}
                    </p>
                    <p>{order.city}</p>
                    <p className="line-clamp-2">{order.fullAddress || '—'}</p>
                  </div>
                </TableCell>
                <TableCell className={cn(tdClass, 'min-w-[100px]')}>
                  <div className="leading-5">
                    <p>{order.recipientType === 'self' ? 'Я' : 'Другой'}</p>
                    <p className="text-muted-foreground text-[0.7rem]">{order.recipientName || '—'}</p>
                  </div>
                </TableCell>
                <TableCell className={cn(tdClass, 'whitespace-nowrap tabular-nums')}>
                  {order.total.toLocaleString('ru-RU')} ₽
                </TableCell>
                <TableCell className={tdClass}>{Array.isArray(order.items) ? order.items.length : 0}</TableCell>
                <TableCell className={cn(tdClass, 'min-w-[100px] max-w-[180px] text-muted-foreground line-clamp-3')}>
                  {order.comment || '—'}
                </TableCell>
                <TableCell className={tdClass}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteId(order.id)}
                    aria-label="Удалить заявку"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredOrders.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={11} className="py-12 text-center text-sm text-muted-foreground">
                  Заявок нет
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
        title="Удалить заявку на товары?"
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
