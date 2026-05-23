'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { api, ApiError } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import {
  FORM_LIMITS,
  minimalFormCardClass,
  minimalInputClass,
  minimalLabelRowClass,
  minimalSelectClass,
  minimalTextareaClass,
} from '@/lib/formFieldStyles';

const { giftRecipientName, giftMessage, giftCustomAmountDigits, giftCustomAmountMax } = FORM_LIMITS;

const GIFT_CONTACT_NOTE = 'Для связи по оплате и отправке сертификата на email.';

function CertificateCornerSprig({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden>
      <path d="M10 54C10 28 26 10 52 6" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
      <path
        d="M14 48c8-14 22-26 38-34"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinecap="round"
        opacity={0.85}
      />
      <path
        d="M24 40c6-8 14-14 24-18"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinecap="round"
        opacity={0.75}
      />
      <ellipse cx="20" cy="34" rx="6" ry="3" fill="currentColor" opacity={0.14} transform="rotate(-38 20 34)" />
      <ellipse cx="32" cy="22" rx="7" ry="3.2" fill="currentColor" opacity={0.12} transform="rotate(-52 32 22)" />
    </svg>
  );
}

function CertificateNatureCorners() {
  const base =
    'pointer-events-none absolute h-12 w-12 text-[hsl(var(--pottery-sage))] opacity-[0.38] md:h-16 md:w-16 md:opacity-[0.42]';
  return (
    <>
      <CertificateCornerSprig className={cn(base, 'left-2 top-2')} />
      <CertificateCornerSprig className={cn(base, 'right-2 top-2 scale-x-[-1]')} />
      <CertificateCornerSprig className={cn(base, 'bottom-2 left-2 scale-y-[-1]')} />
      <CertificateCornerSprig className={cn(base, 'bottom-2 right-2 scale-[-1]')} />
    </>
  );
}

function giftErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Войдите в аккаунт, чтобы отправить заявку.';
    return error.message;
  }
  return 'Не удалось отправить заявку. Попробуйте позже.';
}

export default function GiftCard() {
  const { user } = useAuth();
  const router = useRouter();

  const [presetAmount, setPresetAmount] = useState(3000);
  const [customAmount, setCustomAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [contactMethod, setContactMethod] = useState<'telegram' | 'max' | 'phone'>('telegram');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setCustomerName((n) => n || user.name || '');
      setCustomerEmail((e) => e || user.email || '');
    }
  }, [user]);

  const predefinedAmounts = [1000, 3000, 5000, 10000];

  const handleAmountSelect = (amount: number) => {
    setPresetAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, giftCustomAmountDigits);
    setCustomAmount(digits);
  };

  const finalAmount = customAmount
    ? Math.min(Math.max(parseInt(customAmount, 10) || 0, 0), giftCustomAmountMax)
    : presetAmount;

  const openContactsModal = () => {
    if (!recipientName.trim()) {
      toast({ title: 'Укажите получателя', variant: 'destructive' });
      return;
    }
    if (!finalAmount || finalAmount < 500) {
      toast({ title: 'Минимальная сумма 500 ₽', variant: 'destructive' });
      return;
    }
    setIsContactsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!recipientName.trim()) {
      toast({ title: 'Укажите получателя', variant: 'destructive' });
      return;
    }
    if (!finalAmount || finalAmount < 500) {
      toast({ title: 'Минимальная сумма 500 ₽', variant: 'destructive' });
      return;
    }
    if (!customerName.trim() || !customerPhone.trim() || !customerEmail.trim()) {
      toast({ title: 'Заполните ваши контакты', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createGiftCertificateOrder({
        amount: finalAmount,
        recipientName: recipientName.trim(),
        message: message.trim() || undefined,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        contactMethod,
        comment: comment.trim() || undefined,
      });
      toast({
        title: 'Заявка отправлена',
        description: 'Менеджер свяжется с вами для оплаты и отправки сертификата на email.',
      });
      setIsContactsModalOpen(false);
      router.push('/profile');
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: giftErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif font-bold mb-4">Подарочные сертификаты</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Подарите возможность выбрать уникальную керамику или записаться на мастер-класс. Электронный сертификат
          оформляется отдельной заявкой — без корзины и доставки, как заказ изделий.
        </p>
      </div>

      {!user ? (
        <Card className={cn('max-w-lg mx-auto', minimalFormCardClass)}>
          <CardHeader>
            <CardTitle className="text-xl font-serif">Вход для оформления</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Чтобы оставить заявку на сертификат и видеть её в личном кабинете, войдите в аккаунт или зарегистрируйтесь.
            </p>
            <Button asChild className="w-full sage-gradient">
              <Link href="/auth?from=/gift-card">Войти или зарегистрироваться</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <Card className={minimalFormCardClass}>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-serif font-semibold tracking-tight">Параметры сертификата</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <p className="text-sm text-muted-foreground mb-3">Номинал</p>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {predefinedAmounts.map((amount) => (
                      <Button
                        key={amount}
                        type="button"
                        variant={presetAmount === amount && !customAmount ? 'default' : 'outline'}
                        onClick={() => handleAmountSelect(amount)}
                        className={cn(
                          'rounded-lg',
                          presetAmount === amount && !customAmount ? 'sage-gradient' : 'border-border/60',
                        )}
                      >
                        {amount.toLocaleString()}₽
                      </Button>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div className={minimalLabelRowClass}>
                      <label className="text-muted-foreground">Своя сумма</label>
                      <span className="text-muted-foreground/80">{customAmount.length}/{giftCustomAmountDigits}</span>
                    </div>
                    <Input
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="Введите сумму"
                      value={customAmount}
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
                      maxLength={giftCustomAmountDigits}
                      className={minimalInputClass}
                    />
                    <p className="text-xs text-muted-foreground">От 500₽ до {giftCustomAmountMax.toLocaleString('ru-RU')}₽</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className={minimalLabelRowClass}>
                    <Label htmlFor="recipient">Имя получателя *</Label>
                    <span className="text-muted-foreground/80">{recipientName.length}/{giftRecipientName}</span>
                  </div>
                  <Input
                    id="recipient"
                    placeholder="Кому адресован сертификат"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    maxLength={giftRecipientName}
                    className={minimalInputClass}
                  />
                </div>

                <div className="space-y-3">
                  <div className={minimalLabelRowClass}>
                    <Label htmlFor="gift-msg">Пожелание (необязательно)</Label>
                    <span className="text-muted-foreground/80">{message.length}/{giftMessage}</span>
                  </div>
                  <Textarea
                    id="gift-msg"
                    placeholder="Тёплые слова получателю..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    maxLength={giftMessage}
                    className={minimalTextareaClass}
                  />
                </div>

                <Button
                  type="button"
                  onClick={openContactsModal}
                  className="w-full sage-gradient rounded-lg"
                  size="lg"
                >
                  Указать контакты и отправить · {finalAmount ? finalAmount.toLocaleString('ru-RU') : '0'} ₽
                </Button>
              </CardContent>
            </Card>

            <Card className={minimalFormCardClass}>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-serif font-semibold tracking-tight">Как это работает?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { n: '1', t: 'Заявка на сайте', d: 'Укажите номинал и контакты — без корзины и адреса доставки' },
                  { n: '2', t: 'Связь менеджера', d: 'Мы подтвердим детали и способ оплаты' },
                  { n: '3', t: 'Получение', d: 'Электронный сертификат отправим на email после оплаты' },
                ].map((step) => (
                  <div key={step.n} className="flex gap-4">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-xs text-muted-foreground">
                      {step.n}
                    </span>
                    <div>
                      <p className="font-medium text-sm">{step.t}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{step.d}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="text-xl font-serif font-semibold mb-6">Предпросмотр</h3>
            <div
              className="relative mx-auto max-w-lg bg-gradient-to-b from-[hsl(40_38%_98%)] to-[hsl(38_32%_94%)] p-2.5 shadow-[var(--shadow-card)] ring-1 ring-[hsl(var(--pottery-sage))]/20"
              role="img"
              aria-label="Предпросмотр подарочного сертификата"
            >
              <div className="border-2 border-[hsl(var(--pottery-sage))] p-2 md:p-2.5">
                <div className="relative border border-[hsl(var(--pottery-sage))]/50 px-5 py-8 md:px-8 md:py-10">
                  <CertificateNatureCorners />
                  <div className="relative text-center">
                    <p className="text-[0.65rem] uppercase tracking-[0.28em] text-muted-foreground mb-2">Фея Керамика</p>
                    <h2 className="text-3xl md:text-4xl font-serif font-semibold text-[hsl(var(--pottery-sage))] tracking-tight">
                      Фея
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">Подарочный сертификат</p>

                    <div className="my-7 border-y border-[hsl(var(--pottery-sage))]/25 py-6">
                      <p className="text-4xl md:text-[2.75rem] font-serif font-medium text-foreground tabular-nums">
                        {finalAmount ? finalAmount.toLocaleString('ru-RU') : '0'}₽
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed max-w-[16rem] mx-auto">
                        на покупки в мастерской или мастер-классы
                      </p>
                    </div>

                    <div className="text-left space-y-1 border-b border-[hsl(var(--pottery-sage))]/20 pb-5 mb-5">
                      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">Получатель</p>
                      <p className="font-medium text-foreground break-words border-b border-foreground/15 pb-2 min-h-[1.75rem]">
                        {recipientName || 'Имя получателя'}
                      </p>
                      {message ? (
                        <div className="pt-3">
                          <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground mb-1">
                            Пожелание
                          </p>
                          <p className="text-sm italic text-muted-foreground leading-snug line-clamp-4 break-words">
                            &ldquo;{message}&rdquo;
                          </p>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-baseline text-[0.7rem] text-muted-foreground">
                      <span>
                        Действителен до:{' '}
                        {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU')}
                      </span>
                      <span className="font-mono tabular-nums shrink-0 sm:text-right">
                        № {Date.now().toString().slice(-10)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-pottery-sage mt-0.5 flex-shrink-0" />
                <span>Сертификат действителен в течение года с момента покупки</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-pottery-sage mt-0.5 flex-shrink-0" />
                <span>Можно использовать частично, остаток сохраняется</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {user && isContactsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Закрыть"
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            onClick={() => setIsContactsModalOpen(false)}
          />

          <div
            className={cn(
              'relative w-full max-w-lg max-h-[min(90vh,720px)] overflow-y-auto rounded-lg border border-border/60 bg-background p-6 sm:p-8 shadow-lg',
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby="gift-contact-title"
          >
            <div className="flex justify-between items-start gap-4 mb-6">
              <h3 id="gift-contact-title" className="text-xl font-serif font-semibold leading-snug pr-2">
                Ваши контакты
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsContactsModalOpen(false)}
                className="shrink-0 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="mb-6 space-y-3 rounded-md border border-border/40 bg-muted/25 px-4 py-4 text-sm">
              <p className="text-muted-foreground leading-relaxed">{GIFT_CONTACT_NOTE}</p>
              <div className="space-y-1.5 text-foreground/90 border-t border-border/30 mt-3 pt-3">
                <p>
                  <span className="text-muted-foreground">Номинал: </span>
                  <span className="tabular-nums font-medium">{finalAmount.toLocaleString('ru-RU')} ₽</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Получатель: </span>
                  {recipientName.trim() || '—'}
                </p>
                {message.trim() ? (
                  <p className="text-muted-foreground line-clamp-3">
                    <span className="text-muted-foreground">Пожелание: </span>
                    {message.trim()}
                  </p>
                ) : null}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm font-medium text-foreground">Контакты для связи</p>
              <div className="space-y-3">
                <Label htmlFor="gift-cust-name" className="text-muted-foreground text-sm font-normal">
                  Ваше имя *
                </Label>
                <Input
                  id="gift-cust-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  maxLength={FORM_LIMITS.workshopName}
                  className={minimalInputClass}
                  required
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="gift-cust-phone" className="text-muted-foreground text-sm font-normal">
                  Телефон *
                </Label>
                <Input
                  id="gift-cust-phone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  maxLength={FORM_LIMITS.checkoutPhone}
                  className={minimalInputClass}
                  required
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="gift-cust-email" className="text-muted-foreground text-sm font-normal">
                  Email *
                </Label>
                <Input
                  id="gift-cust-email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  maxLength={FORM_LIMITS.checkoutEmail}
                  className={minimalInputClass}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gift-contact-method" className="text-muted-foreground text-sm font-normal">
                  Удобная связь *
                </Label>
                <select
                  id="gift-contact-method"
                  className={minimalSelectClass}
                  value={contactMethod}
                  onChange={(e) => setContactMethod(e.target.value as typeof contactMethod)}
                >
                  <option value="telegram">Telegram</option>
                  <option value="max">MAX</option>
                  <option value="phone">Телефон</option>
                </select>
              </div>
              <div className="space-y-3">
                <div className={minimalLabelRowClass}>
                  <Label className="text-muted-foreground text-sm font-normal">Комментарий к заявке</Label>
                  <span className="text-muted-foreground/80">{comment.length}/{FORM_LIMITS.workshopComment}</span>
                </div>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                  maxLength={FORM_LIMITS.workshopComment}
                  placeholder="По желанию"
                  className={minimalTextareaClass}
                />
              </div>
              <Button type="submit" className="w-full sage-gradient rounded-lg uppercase tracking-wide" size="lg" disabled={isSubmitting}>
                {isSubmitting
                  ? 'Отправка...'
                  : `Отправить заявку · ${finalAmount ? finalAmount.toLocaleString('ru-RU') : '0'} ₽`}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
