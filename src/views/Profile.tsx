'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api, Order, WorkshopBooking, GiftCertificateOrder, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { User, Package, LogOut, Save, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  FORM_LIMITS,
  minimalFormCardClass,
  minimalInputClass,
  minimalLabelRowClass,
} from '@/lib/formFieldStyles';

import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_VARIANTS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_VARIANTS,
} from '@/lib/applicationStatusLabels';

function getProfileErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Сессия истекла. Войдите в аккаунт заново.';
    if (error.status === 403) return 'Недостаточно прав для выполнения действия.';
    if (error.status >= 500) return 'Сервер временно недоступен. Попробуйте позже.';
    return error.message;
  }

  if (error instanceof Error && /fetch|network|timeout|abort/i.test(error.message)) {
    return 'Проблема с сетью. Проверьте подключение и обновите страницу.';
  }

  return fallback;
}

export default function Profile() {
  const { user, isLoading, logout } = useAuth();
  const { toast } = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;
  const router = useRouter();

  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [workshopBookings, setWorkshopBookings] = useState<WorkshopBooking[]>([]);
  const [giftOrders, setGiftOrders] = useState<GiftCertificateOrder[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setApplicationsLoading(true);
    api
      .getMyProfileApplications()
      .then(({ orders, workshopBookings: bookings, giftCertificateOrders }) => {
        setOrders(orders);
        setWorkshopBookings(bookings);
        setGiftOrders(giftCertificateOrders);
      })
      .catch((error) => {
        setOrders([]);
        setWorkshopBookings([]);
        setGiftOrders([]);
        toastRef.current({
          title: 'Не удалось загрузить заявки',
          description: getProfileErrorMessage(
            error,
            'Не удалось загрузить заказы, записи на мастер-классы и заявки на сертификаты',
          ),
          variant: 'destructive',
        });
      })
      .finally(() => setApplicationsLoading(false));
  }, [user]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await api.updateProfile(name);
      toast({ title: 'Данные сохранены' });
    } catch (error) {
      const msg = getProfileErrorMessage(error, 'Ошибка сохранения');
      toast({ title: 'Ошибка', description: msg, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl md:text-3xl font-serif font-semibold mb-8">Личный кабинет</h1>

      {/* Profile Info */}
      <Card className={cn('mb-8', minimalFormCardClass)}>
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <User className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg font-serif">Личная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className={minimalLabelRowClass}>
              <Label htmlFor="profile-name" className="text-muted-foreground font-normal">
                Имя
              </Label>
              <span className="text-muted-foreground/80">
                {name.length}/{FORM_LIMITS.profileName}
              </span>
            </div>
            <Input
              id="profile-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ваше имя"
              maxLength={FORM_LIMITS.profileName}
              className={minimalInputClass}
            />
          </div>
          <div className="space-y-3">
            <Label className="text-muted-foreground text-sm font-normal">Email</Label>
            <Input
              value={user.email}
              disabled
              className={cn(minimalInputClass, 'opacity-70 cursor-not-allowed')}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleSaveProfile} disabled={isSaving} size="sm" className="w-full sm:w-auto">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => logout()}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Выйти
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className={cn('mb-8', minimalFormCardClass)}>
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <Package className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg font-serif">Мои мастер-классы</CardTitle>
        </CardHeader>
        <CardContent>
          {applicationsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : workshopBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">Пока нет записей на мастер-классы</p>
          ) : (
            <div className="space-y-4">
              {workshopBookings.map((booking, idx) => (
                <div key={booking.id}>
                  {idx > 0 && <Separator className="my-4" />}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <p className="font-medium">{booking.workshopTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.workshopDate} · {booking.workshopTime} · {booking.selectedFormat}
                      </p>
                      <p className="text-sm mt-1 tabular-nums">{booking.price.toLocaleString('ru-RU')} ₽</p>
                    </div>
                    <Badge variant={PAYMENT_STATUS_VARIANTS[booking.paymentStatus] ?? 'outline'}>
                      {PAYMENT_STATUS_LABELS[booking.paymentStatus] ?? booking.paymentStatus}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className={cn('mb-8', minimalFormCardClass)}>
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <Gift className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg font-serif">Подарочные сертификаты</CardTitle>
        </CardHeader>
        <CardContent>
          {applicationsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : giftOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Пока нет заявок на сертификаты.{' '}
              <Link href="/gift-card" className="text-primary underline-offset-4 hover:underline">
                Оформить сертификат
              </Link>
            </p>
          ) : (
            <div className="space-y-4">
              {giftOrders.map((g, idx) => (
                <div key={g.id}>
                  {idx > 0 && <Separator className="my-4" />}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <p className="font-medium">
                        {g.amount.toLocaleString('ru-RU')} ₽ · для {g.recipientName}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(g.createdAt).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      {g.message ? (
                        <p className="text-sm text-muted-foreground mt-2 italic">&ldquo;{g.message}&rdquo;</p>
                      ) : null}
                    </div>
                    <Badge variant={PAYMENT_STATUS_VARIANTS[g.paymentStatus] ?? 'outline'}>
                      {PAYMENT_STATUS_LABELS[g.paymentStatus] ?? g.paymentStatus}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Orders */}
      <Card className={minimalFormCardClass}>
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <Package className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg font-serif">Заказы товаров</CardTitle>
        </CardHeader>
        <CardContent>
          {applicationsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Заказов пока нет</p>
              <Button variant="link" asChild className="mt-2">
                <Link href="/catalog">Перейти в каталог</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, idx) => (
                <div key={order.id}>
                  {idx > 0 && <Separator className="my-4" />}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        № {order.id.slice(0, 8).toUpperCase()}
                        {' · '}
                        {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </p>
                      <p className="font-medium mt-0.5">
                        {Array.isArray(order.items) ? order.items.length : 0} позиций · {order.total.toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                    <Badge variant={ORDER_STATUS_VARIANTS[order.status] ?? 'outline'}>
                      {ORDER_STATUS_LABELS[order.status] ?? order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
