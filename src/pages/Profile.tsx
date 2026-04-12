'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api, Order, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { User, Package, LogOut, Save } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Ожидает обработки',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'outline',
  processing: 'secondary',
  shipped: 'default',
  delivered: 'default',
  cancelled: 'destructive',
};

export default function Profile() {
  const { user, isLoading, logout } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setOrdersLoading(true);
    api.getMyOrders()
      .then(({ orders }) => setOrders(orders))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const router = useRouter();

  if (!user) {
    router.replace('/auth');
    return null;
  }

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await api.updateProfile(name);
      toast({ title: 'Данные сохранены' });
    } catch (error) {
      const msg = error instanceof ApiError ? error.message : 'Ошибка сохранения';
      toast({ title: 'Ошибка', description: msg, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-serif font-semibold mb-8">Личный кабинет</h1>

      {/* Profile Info */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <User className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">Личная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Имя</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ваше имя"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user.email} disabled className="bg-muted" />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSaveProfile} disabled={isSaving} size="sm">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logout()}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Выйти
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <Package className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">История заказов</CardTitle>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
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
                        {Array.isArray(order.items) ? order.items.length : 0} позиций · {(order.total / 100).toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                    <Badge variant={STATUS_VARIANTS[order.status] ?? 'outline'}>
                      {STATUS_LABELS[order.status] ?? order.status}
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
