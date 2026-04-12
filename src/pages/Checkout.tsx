'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingBag, MapPin, CreditCard, Truck } from 'lucide-react';
import { useStore, Product, GiftCard } from '@/context/StoreContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

declare global {
  interface Window {
    cp: any;
  }
}

interface CustomerData {
  name: string;
  phone: string;
  email: string;
  comment?: string;
}

export default function Checkout() {
  const { state, dispatch } = useStore();
  const router = useRouter();
  
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    phone: '',
    email: '',
    comment: ''
  });
  
  const deliveryInfo = {
    address: 'Звёздный проспект, 26, 2 этаж (Мастерская Feia)',
    cost: 0
  };

  const [isLoading, setIsLoading] = useState(false);
  
  // Redirect to catalog if cart is empty
  useEffect(() => {
    if (state.cart.length === 0) {
      router.push('/catalog');
    }
  }, [state.cart.length, router]);

  // Load CloudPayments script
  useEffect(() => {
    if (!window.cp) {
      const cpScript = document.createElement('script');
      cpScript.src = 'https://widget.cloudpayments.ru/bundles/cloudpayments.js';
      cpScript.async = true;
      document.head.appendChild(cpScript);
    }
  }, []);

  const totalAmount = state.cart.reduce((sum, item) => {
    if ('type' in item && item.type === 'giftCard') {
      return sum + item.amount * item.quantity;
    }
    return sum + (item as Product & { quantity: number }).price * item.quantity;
  }, 0);

  const finalTotal = totalAmount;


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerData.name || !customerData.phone || !customerData.email) {
      toast.error('Пожалуйста, заполните все обязательные поля');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare order data
      const orderData = {
        items: state.cart,
        customer: customerData,
        delivery: deliveryInfo,
        total: finalTotal,
        timestamp: new Date().toISOString()
      };

      // Save order to localStorage
      localStorage.setItem('currentOrder', JSON.stringify(orderData));

      // Check if CloudPayments is available
      if (!window.cp?.CloudPayments) {
        toast.error('Сервис оплаты временно недоступен. Попробуйте позже.');
        return;
      }

      // Initialize CloudPayments payment (new widget.start API)
      const widget = new window.cp.CloudPayments();

      const intentParams = {
        publicTerminalId: 'test_api_00000000000000000000002', // Тестовый ключ, заменить на реальный
        description: 'Заказ в мастерской Feia',
        amount: finalTotal,
        currency: 'RUB',
        paymentSchema: 'Single',
        skin: 'modern',
        culture: 'ru-RU',
        externalId: Date.now().toString(),
        userInfo: {
          email: customerData.email,
          phone: customerData.phone,
          fullName: customerData.name,
        },
        metadata: {
          customerName: customerData.name,
          customerPhone: customerData.phone,
        },
        autoClose: 3,
      };

      widget.oncomplete = async (result: any) => {
        if (result.status === 'success') {
          // Save order to DB before navigating away
          try {
            await api.createOrder({
              customerName: customerData.name,
              customerPhone: customerData.phone,
              customerEmail: customerData.email,
              comment: customerData.comment,
              items: state.cart,
              total: finalTotal,
            });
          } catch {
            console.warn('Could not save order to DB');
          }

          // Clear cart in both React state and localStorage directly
          dispatch({ type: 'CLEAR_CART' });
          localStorage.setItem('feiaCart', '[]');
          localStorage.removeItem('currentOrder');

          // Use window.location for reliable navigation from payment widget callback
          window.location.href = '/checkout/success';
        } else if (result.type !== 'cancel') {
          toast.error('Ошибка при оплате. Попробуйте еще раз.');
        }
      };

      widget.start(intentParams).catch(() => {
        toast.error('Ошибка при оплате. Попробуйте еще раз.');
      });

    } catch (error) {
      console.error('Ошибка при оформлении заказа:', error);
      toast.error('Произошла ошибка при оформлении заказа');
    } finally {
      setIsLoading(false);
    }
  };

  if (state.cart.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <Link href="/catalog">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад в каталог
          </Button>
        </Link>
        <h1 className="text-2xl md:text-3xl font-serif font-bold">Оформление заказа</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Customer Info & Delivery */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Контактная информация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Имя *</Label>
                  <Input
                    id="name"
                    value={customerData.name}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Телефон *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerData.email}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="comment">Комментарий к заказу</Label>
                <Textarea
                  id="comment"
                  value={customerData.comment}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Особые пожелания к заказу..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Pickup Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Самовывоз
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-3 p-4 border rounded-lg bg-accent/50">
                <div className="flex-1">
                  <h3 className="font-medium mb-2">Забрать в мастерской</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {deliveryInfo.address}
                  </p>
                  <p className="text-sm font-semibold text-green-600">Бесплатно</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Пн-Вс: 10:00 - 20:00
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div>
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Ваш заказ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Items */}
              <div className="space-y-3">
                {state.cart.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    {('type' in item && item.type === 'giftCard') ? (
                      <div className="w-12 h-12 bg-gradient-to-br from-pottery-sage to-pottery-sage-light rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">GIFT</span>
                      </div>
                    ) : (
                      <img
                        src={(item as Product & { quantity: number }).images[0]}
                        alt={(item as Product & { quantity: number }).name}
                        className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {('type' in item && item.type === 'giftCard') 
                          ? `Сертификат на ${item.amount}₽` 
                          : (item as Product & { quantity: number }).name
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} × {('type' in item && item.type === 'giftCard') ? item.amount : (item as Product & { quantity: number }).price}₽
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Товары:</span>
                  <span>{totalAmount.toLocaleString()}₽</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Доставка:</span>
                  <span>Бесплатно</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Итого:</span>
                  <span>{finalTotal.toLocaleString()}₽</span>
                </div>
              </div>

              {/* Payment Button */}
              <Button 
                type="submit" 
                className="w-full sage-gradient"
                disabled={isLoading}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {isLoading ? 'Обработка...' : `Оплатить ${finalTotal.toLocaleString()}₽`}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Нажимая кнопку "Оплатить", вы соглашаетесь с{' '}
                <Link href="/terms" className="underline">условиями использования</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </form>

    </div>
  );
}