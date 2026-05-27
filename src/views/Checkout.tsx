'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingBag, Truck, MessageCircle } from 'lucide-react';
import { useStore, Product } from '@/context/StoreContext';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  FORM_LIMITS,
  minimalFormCardClass,
  minimalInputClass,
  minimalLabelRowClass,
  minimalSelectClass,
  minimalTextareaClass,
} from '@/lib/formFieldStyles';
import {
  DELIVERY_METHOD_OPTIONS,
  WORKSHOP_ADDRESS,
  type DeliveryMethodId,
} from '@/lib/workshopInfo';

interface CustomerData {
  lastName: string;
  firstName: string;
  middleName: string;
  phone: string;
  email: string;
  city: string;
  fullAddress: string;
  legalCompanyName: string;
  legalInn: string;
  recipientName: string;
  recipientPhone: string;
  comment: string;
  customerType: 'individual' | 'legal';
  deliveryMethod: DeliveryMethodId;
  deliveryType: 'address' | 'pickup_point';
  recipientType: 'self' | 'other';
  contactMethod: 'telegram' | 'max' | 'phone';
}

interface SuggestionItem {
  value: string;
  unrestrictedValue: string;
}

function getCheckoutErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'Сессия истекла. Войдите в аккаунт заново и повторите оформление.';
    }
    if (error.status === 403) {
      return 'Недостаточно прав для оформления заказа с текущей сессией.';
    }
    if (error.status >= 500) {
      return 'Сервер временно недоступен. Попробуйте снова через минуту.';
    }
    return error.message;
  }

  if (error instanceof Error && /fetch|network|timeout|abort/i.test(error.message)) {
    return 'Проблема с сетью. Проверьте подключение и повторите попытку.';
  }

  return 'Произошла ошибка при оформлении заказа';
}

export default function Checkout() {
  const { state, dispatch } = useStore();
  const router = useRouter();

  const [customerData, setCustomerData] = useState<CustomerData>({
    lastName: '',
    firstName: '',
    middleName: '',
    phone: '',
    email: '',
    city: '',
    fullAddress: '',
    legalCompanyName: '',
    legalInn: '',
    recipientName: '',
    recipientPhone: '',
    comment: '',
    customerType: 'individual',
    deliveryMethod: 'cdek',
    deliveryType: 'address',
    recipientType: 'self',
    contactMethod: 'telegram',
  });

  const deliveryInfo = {
    address: `${WORKSHOP_ADDRESS.full}, ${WORKSHOP_ADDRESS.floor}`,
    cost: 0,
  };

  const [isLoading, setIsLoading] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState<SuggestionItem[]>([]);
  const [addressSuggestions, setAddressSuggestions] = useState<SuggestionItem[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [isCityLoading, setIsCityLoading] = useState(false);
  const [isAddressLoading, setIsAddressLoading] = useState(false);

  useEffect(() => {
    if (state.cart.length === 0) {
      router.push('/catalog');
    }
  }, [state.cart.length, router]);

  useEffect(() => {
    const query = customerData.city.trim();
    if (query.length < 2) {
      setCitySuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setIsCityLoading(true);
        const res = await fetch('/api/dadata/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, type: 'city' }),
        });
        if (!res.ok) return;
        const data = await res.json();
        setCitySuggestions(data.suggestions ?? []);
      } catch {
        setCitySuggestions([]);
      } finally {
        setIsCityLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [customerData.city]);

  useEffect(() => {
    const query = customerData.fullAddress.trim();
    if (query.length < 3 || customerData.deliveryType !== 'address') {
      setAddressSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setIsAddressLoading(true);
        const res = await fetch('/api/dadata/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, type: 'address' }),
        });
        if (!res.ok) return;
        const data = await res.json();
        setAddressSuggestions(data.suggestions ?? []);
      } catch {
        setAddressSuggestions([]);
      } finally {
        setIsAddressLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [customerData.fullAddress, customerData.deliveryType]);

  const totalAmount = state.cart.reduce(
    (sum, item) => sum + (item as Product & { quantity: number }).price * item.quantity,
    0,
  );

  const finalTotal = totalAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerData.lastName || !customerData.firstName || !customerData.phone || !customerData.email || !customerData.city) {
      toast.error('Пожалуйста, заполните все обязательные поля');
      return;
    }

    if (customerData.customerType === 'legal' && (!customerData.legalCompanyName || !customerData.legalInn)) {
      toast.error('Для юридического лица заполните реквизиты');
      return;
    }

    if (customerData.recipientType === 'other' && !customerData.recipientName) {
      toast.error('Укажите получателя');
      return;
    }

    setIsLoading(true);
    try {
      const customerName = `${customerData.lastName} ${customerData.firstName} ${customerData.middleName}`.trim();
      await api.createOrder({
        customerName,
        customerPhone: customerData.phone,
        customerEmail: customerData.email,
        customerType: customerData.customerType,
        deliveryMethod: customerData.deliveryMethod,
        deliveryType: customerData.deliveryType,
        city: customerData.city,
        fullAddress: customerData.fullAddress || undefined,
        recipientType: customerData.recipientType,
        recipientName: customerData.recipientName || undefined,
        recipientPhone: customerData.recipientPhone || undefined,
        legalCompanyName: customerData.legalCompanyName || undefined,
        legalInn: customerData.legalInn || undefined,
        contactMethod: customerData.contactMethod,
        paymentMethod: 'manager_confirmation',
        comment: customerData.comment || undefined,
        items: state.cart,
        total: finalTotal,
      });

      dispatch({ type: 'CLEAR_CART' });
      localStorage.setItem('feiaCart', '[]');
      localStorage.removeItem('currentOrder');
      router.push('/checkout/success');
    } catch (error) {
      console.error('Ошибка при оформлении заказа:', error);
      toast.error(getCheckoutErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  if (state.cart.length === 0) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
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
        <div className="lg:col-span-2 space-y-6">
          <Card className={cn(minimalFormCardClass)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-serif font-semibold">
                <ShoppingBag className="w-5 h-5" />
                Контактные данные
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Тип клиента</Label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={customerData.customerType === 'individual'}
                    onChange={() => setCustomerData(prev => ({ ...prev, customerType: 'individual' }))}
                  />
                  Физическое лицо
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={customerData.customerType === 'legal'}
                    onChange={() => setCustomerData(prev => ({ ...prev, customerType: 'legal' }))}
                  />
                  Юридическое лицо
                </label>
              </div>

              <div>
                <Input
                  id="lastName"
                  value={customerData.lastName}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Фамилия*"
                  required
                  maxLength={FORM_LIMITS.checkoutPersonName}
                  className={minimalInputClass}
                />
              </div>
              <div>
                <Input
                  id="firstName"
                  value={customerData.firstName}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Имя*"
                  required
                  maxLength={FORM_LIMITS.checkoutPersonName}
                  className={minimalInputClass}
                />
              </div>
              <div>
                <Input
                  id="middleName"
                  value={customerData.middleName}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, middleName: e.target.value }))}
                  placeholder="Отчество (если есть)"
                  maxLength={FORM_LIMITS.checkoutPersonName}
                  className={minimalInputClass}
                />
              </div>
              <div className="grid grid-cols-[84px_1fr] gap-3 items-end">
                <Input value="RU" readOnly className={cn(minimalInputClass, 'text-muted-foreground cursor-default')} />
                <Input
                  id="phone"
                  type="tel"
                  value={customerData.phone}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Ваш номер телефона*"
                  required
                  maxLength={FORM_LIMITS.checkoutPhone}
                  className={minimalInputClass}
                />
              </div>
              <div>
                <Input
                  id="email"
                  type="email"
                  value={customerData.email}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Ваша электронная почта*"
                  required
                  maxLength={FORM_LIMITS.checkoutEmail}
                  className={minimalInputClass}
                />
              </div>

              {customerData.customerType === 'legal' && (
                <>
                  <p className="text-sm text-muted-foreground">
                    Заполните ваши реквизиты. Это сильно упростит и ускорит процесс работы.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      value={customerData.legalCompanyName}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, legalCompanyName: e.target.value }))}
                      placeholder="Название*"
                      maxLength={FORM_LIMITS.checkoutLegalCompany}
                      className={minimalInputClass}
                    />
                    <Input
                      value={customerData.legalInn}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, legalInn: e.target.value }))}
                      placeholder="ИНН*"
                      maxLength={FORM_LIMITS.checkoutLegalInn}
                      className={minimalInputClass}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Truck className="w-5 h-5" />
                Доставка
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Input
                  value={customerData.city}
                  onChange={(e) => {
                    setCustomerData(prev => ({ ...prev, city: e.target.value }));
                    setShowCitySuggestions(true);
                  }}
                  onFocus={() => setShowCitySuggestions(true)}
                  placeholder="Город*"
                  required
                />
                {showCitySuggestions && (citySuggestions.length > 0 || isCityLoading) && (
                  <div className="absolute z-20 mt-1 w-full border border-input bg-background max-h-56 overflow-y-auto">
                    {isCityLoading && <div className="px-3 py-2 text-sm text-muted-foreground">Поиск...</div>}
                    {citySuggestions.map((suggestion) => (
                      <button
                        key={suggestion.unrestrictedValue}
                        type="button"
                        className="block w-full text-left px-3 py-2 text-sm hover:bg-accent"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setCustomerData(prev => ({ ...prev, city: suggestion.value }));
                          setShowCitySuggestions(false);
                        }}
                      >
                        {suggestion.value}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {DELIVERY_METHOD_OPTIONS.map(({ value, label }) => (
                  <label key={value} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      checked={customerData.deliveryMethod === value}
                      onChange={() => setCustomerData(prev => ({ ...prev, deliveryMethod: value }))}
                    />
                    {label}
                  </label>
                ))}
              </div>
              <select
                value={customerData.deliveryType}
                onChange={(e) => setCustomerData(prev => ({ ...prev, deliveryType: e.target.value as CustomerData['deliveryType'] }))}
                className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="address">Доставка по указанному адресу</option>
                <option value="pickup_point">Самовывоз из ПВЗ</option>
              </select>
              <div className="relative">
                <Input
                  value={customerData.fullAddress}
                  onChange={(e) => {
                    setCustomerData(prev => ({ ...prev, fullAddress: e.target.value }));
                    setShowAddressSuggestions(true);
                  }}
                  onFocus={() => setShowAddressSuggestions(true)}
                  placeholder="Полный адрес доставки*"
                  required={customerData.deliveryType === 'address'}
                />
                {showAddressSuggestions && customerData.deliveryType === 'address' && (addressSuggestions.length > 0 || isAddressLoading) && (
                  <div className="absolute z-20 mt-1 w-full border border-input bg-background max-h-56 overflow-y-auto">
                    {isAddressLoading && <div className="px-3 py-2 text-sm text-muted-foreground">Поиск...</div>}
                    {addressSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.unrestrictedValue}
                        type="button"
                        className="block w-full text-left px-3 py-2 text-sm hover:bg-accent"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setCustomerData(prev => ({ ...prev, fullAddress: suggestion.unrestrictedValue || suggestion.value }));
                          setShowAddressSuggestions(false);
                        }}
                      >
                        {suggestion.value}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className={cn(minimalFormCardClass)}>
            <CardHeader>
              <CardTitle className="text-xl font-serif font-semibold">Получатель</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={customerData.recipientType === 'self'}
                  onChange={() => setCustomerData(prev => ({ ...prev, recipientType: 'self' }))}
                />
                Получатель - я
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={customerData.recipientType === 'other'}
                  onChange={() => setCustomerData(prev => ({ ...prev, recipientType: 'other' }))}
                />
                Получатель - другой человек
              </label>
              {customerData.recipientType === 'other' && (
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    value={customerData.recipientName}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, recipientName: e.target.value }))}
                    placeholder="Имя получателя*"
                    maxLength={FORM_LIMITS.checkoutRecipientName}
                    className={minimalInputClass}
                  />
                  <Input
                    value={customerData.recipientPhone}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, recipientPhone: e.target.value }))}
                    placeholder="Телефон получателя"
                    maxLength={FORM_LIMITS.checkoutPhone}
                    className={minimalInputClass}
                  />
                </div>
              )}
              <div className="space-y-3">
                <div className={minimalLabelRowClass}>
                  <span className="text-muted-foreground">Комментарий</span>
                  <span className="text-muted-foreground/80">
                    {customerData.comment.length}/{FORM_LIMITS.checkoutComment}
                  </span>
                </div>
                <Textarea
                  id="comment"
                  value={customerData.comment}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Комментарий к заказу или адресу"
                  maxLength={FORM_LIMITS.checkoutComment}
                  className={minimalTextareaClass}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card className={cn(minimalFormCardClass)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-serif font-semibold">
                <MessageCircle className="w-5 h-5" />
                Связаться с вами
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={customerData.contactMethod === 'telegram'}
                  onChange={() => setCustomerData(prev => ({ ...prev, contactMethod: 'telegram' }))}
                />
                Через Telegram
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={customerData.contactMethod === 'max'}
                  onChange={() => setCustomerData(prev => ({ ...prev, contactMethod: 'max' }))}
                />
                Через мессенджер MAX
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={customerData.contactMethod === 'phone'}
                  onChange={() => setCustomerData(prev => ({ ...prev, contactMethod: 'phone' }))}
                />
                Звонок по телефону
              </label>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className={cn('sticky top-8', minimalFormCardClass)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-lg">
                <ShoppingBag className="w-5 h-5" />
                Ваш заказ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {state.cart.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={(item as Product & { quantity: number }).images[0]}
                      alt={(item as Product & { quantity: number }).name}
                      className="w-12 h-12 object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {(item as Product & { quantity: number }).name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} × {(item as Product & { quantity: number }).price}₽
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

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

              <div className="bg-accent/40 p-3 text-sm">
                <p className="font-medium mb-1">Оплата заказа</p>
                <p className="text-muted-foreground">
                  Только после подтверждения заказа менеджером.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full sage-gradient"
                disabled={isLoading}
              >
                {isLoading ? 'Отправка...' : 'Оформить мой заказ'}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Оформляя заказ, вы соглашаетесь на обработку персональных данных.
              </p>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}