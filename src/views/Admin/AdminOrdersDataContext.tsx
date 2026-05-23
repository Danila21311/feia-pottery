'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api, Order, WorkshopBooking, GiftCertificateOrder } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { getAdminOrdersErrorMessage } from '@/views/Admin/adminOrdersShared';

type AdminOrdersDataContextValue = {
  orders: Order[];
  workshopBookings: WorkshopBooking[];
  giftCertificateOrders: GiftCertificateOrder[];
  isLoading: boolean;
  refetch: () => void;
  patchOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  patchBookingPaymentStatus: (id: string, paymentStatus: WorkshopBooking['paymentStatus']) => Promise<void>;
  patchGiftPaymentStatus: (id: string, paymentStatus: GiftCertificateOrder['paymentStatus']) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  deleteWorkshopBooking: (id: string) => Promise<void>;
  deleteGiftCertificateOrder: (id: string) => Promise<void>;
};

const AdminOrdersDataContext = createContext<AdminOrdersDataContextValue | null>(null);

export function AdminOrdersDataProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [workshopBookings, setWorkshopBookings] = useState<WorkshopBooking[]>([]);
  const [giftCertificateOrders, setGiftCertificateOrders] = useState<GiftCertificateOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadKey, setLoadKey] = useState(0);
  const { toast } = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    api
      .getAdminApplicationsBundle()
      .then(({ orders, workshopBookings: bookings, giftCertificateOrders: gifts }) => {
        if (cancelled) return;
        setOrders(orders);
        setWorkshopBookings(bookings);
        setGiftCertificateOrders(gifts);
      })
      .catch((error) => {
        if (cancelled) return;
        const msg = getAdminOrdersErrorMessage(error);
        toastRef.current({ title: 'Ошибка', description: msg, variant: 'destructive' });
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loadKey]);

  const refetch = useCallback(() => setLoadKey((k) => k + 1), []);

  const patchOrderStatus = useCallback(async (id: string, status: Order['status']) => {
    const { order } = await api.updateOrderStatus(id, status);
    setOrders((prev) => prev.map((o) => (o.id === id ? order : o)));
  }, []);

  const patchBookingPaymentStatus = useCallback(
    async (id: string, paymentStatus: WorkshopBooking['paymentStatus']) => {
      const { booking } = await api.updateWorkshopBookingPaymentStatus(id, paymentStatus);
      setWorkshopBookings((prev) => prev.map((b) => (b.id === id ? booking : b)));
    },
    [],
  );

  const patchGiftPaymentStatus = useCallback(
    async (id: string, paymentStatus: GiftCertificateOrder['paymentStatus']) => {
      const { order } = await api.updateGiftCertificateOrderPaymentStatus(id, paymentStatus);
      setGiftCertificateOrders((prev) => prev.map((g) => (g.id === id ? order : g)));
    },
    [],
  );

  const deleteOrder = useCallback(async (id: string) => {
    await api.deleteOrder(id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const deleteWorkshopBooking = useCallback(async (id: string) => {
    await api.deleteWorkshopBooking(id);
    setWorkshopBookings((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const deleteGiftCertificateOrder = useCallback(async (id: string) => {
    await api.deleteGiftCertificateOrder(id);
    setGiftCertificateOrders((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      orders,
      workshopBookings,
      giftCertificateOrders,
      isLoading,
      refetch,
      patchOrderStatus,
      patchBookingPaymentStatus,
      patchGiftPaymentStatus,
      deleteOrder,
      deleteWorkshopBooking,
      deleteGiftCertificateOrder,
    }),
    [
      orders,
      workshopBookings,
      giftCertificateOrders,
      isLoading,
      refetch,
      patchOrderStatus,
      patchBookingPaymentStatus,
      patchGiftPaymentStatus,
      deleteOrder,
      deleteWorkshopBooking,
      deleteGiftCertificateOrder,
    ],
  );

  return <AdminOrdersDataContext.Provider value={value}>{children}</AdminOrdersDataContext.Provider>;
}

export function useAdminOrdersData() {
  const ctx = useContext(AdminOrdersDataContext);
  if (!ctx) throw new Error('useAdminOrdersData must be used within AdminOrdersDataProvider');
  return ctx;
}
