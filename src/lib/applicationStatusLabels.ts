import type { OrderStatus, WorkshopBookingStatus, GiftCertificatePaymentStatus } from '@/lib/api';

/** Подписи статусов заказов товаров (админка + профиль) */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Новая заявка',
  processing: 'В обработке',
  shipped: 'Передан',
  delivered: 'Завершён',
  cancelled: 'Отменён',
};

export const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

export const ORDER_STATUS_VARIANTS: Record<
  OrderStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  pending: 'outline',
  processing: 'secondary',
  shipped: 'default',
  delivered: 'default',
  cancelled: 'destructive',
};

/** Подписи статусов записей на МК и сертификатов */
export const PAYMENT_STATUS_LABELS: Record<
  WorkshopBookingStatus | GiftCertificatePaymentStatus,
  string
> = {
  pending_manager: 'Ожидает менеджера',
  paid: 'Оплачено',
  cancelled: 'Отменено',
};

export const PAYMENT_STATUS_OPTIONS: WorkshopBookingStatus[] = [
  'pending_manager',
  'paid',
  'cancelled',
];

export const PAYMENT_STATUS_VARIANTS: Record<
  WorkshopBookingStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  pending_manager: 'outline',
  paid: 'default',
  cancelled: 'destructive',
};

/** @deprecated используйте ORDER_STATUS_LABELS */
export const STATUS_LABELS = ORDER_STATUS_LABELS;

/** @deprecated используйте PAYMENT_STATUS_LABELS */
export const BOOKING_PAYMENT_LABELS = PAYMENT_STATUS_LABELS;

/** @deprecated используйте PAYMENT_STATUS_LABELS */
export const GIFT_PAYMENT_LABELS = PAYMENT_STATUS_LABELS;

export const VALID_ORDER_STATUSES = new Set<string>(ORDER_STATUS_OPTIONS);
export const VALID_PAYMENT_STATUSES = new Set<string>(PAYMENT_STATUS_OPTIONS);
