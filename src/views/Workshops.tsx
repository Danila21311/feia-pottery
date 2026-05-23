'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, Clock, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import teamMain from '@/assets/team-main.jpg';
import { cn } from '@/lib/utils';
import { FORM_LIMITS, minimalInputClass, minimalLabelRowClass, minimalTextareaClass } from '@/lib/formFieldStyles';

const MANAGER_CONTACT_NOTE = 'Менеджер свяжется с вами в ближайшее время.';

interface Workshop {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  format: string;
  price: number;
  maxParticipants: number;
  currentParticipants: number;
  description: string;
  includes: string[];
  level: string;
  whatYouCreate?: string | null;
  takeHome?: string | null;
  resultImage?: string | null;
}

function getWorkshopsErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'Сессия истекла. Войдите в аккаунт снова и повторите запись.';
    }
    if (error.status === 408) {
      return 'Сервер не ответил вовремя. Проверьте интернет и попробуйте снова.';
    }
    if (error.status === 409) {
      return 'Свободных мест больше нет. Выберите другой сеанс.';
    }
    if (error.status >= 500) {
      return 'Сервер временно недоступен. Попробуйте снова через минуту.';
    }
    return error.message;
  }

  if (error instanceof Error && /fetch|network|timeout|abort/i.test(error.message)) {
    return 'Не удалось связаться с сервером. Проверьте интернет и попробуйте снова.';
  }

  return 'Не удалось завершить запись';
}

export default function Workshops() {
  const { user } = useAuth();
  const router = useRouter();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    comment: ''
  });

  useEffect(() => {
    api.getWorkshops().then((items) => {
      setWorkshops(items as unknown as Workshop[]);
    }).catch((error) => {
      console.error(error);
      toast({
        title: 'Не удалось загрузить мастер-классы',
        description: getWorkshopsErrorMessage(error),
        variant: 'destructive',
      });
    }).finally(() => setIsLoading(false));
  }, []);

  const handleRegister = (workshop: Workshop) => {
    if (!user) {
      toast({
        title: 'Требуется вход',
        description: 'Для записи на мастер-класс сначала войдите в аккаунт',
      });
      router.push('/auth');
      return;
    }

    setSelectedWorkshop(workshop);
    setFormData({
      name: user.name ?? '',
      phone: '',
      email: user.email,
      comment: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedWorkshop) {
      toast({
        title: 'Ошибка',
        description: 'Мастер-класс не выбран. Закройте окно и попробуйте снова.',
        variant: 'destructive',
      });
      return;
    }

    const bookingFormat = parseFormats(selectedWorkshop.format)[0] ?? selectedWorkshop.format.trim();
    if (!bookingFormat) {
      toast({
        title: 'Ошибка',
        description: 'У этого мастер-класса не указан формат. Обратитесь к администратору.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.name || !formData.phone || !formData.email) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createWorkshopBooking({
        workshopId: selectedWorkshop.id,
        selectedFormat: bookingFormat,
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: formData.email,
        comment: formData.comment || undefined,
      });
      toast({
        title: "Заявка на мастер-класс отправлена",
        description: "Менеджер свяжется с вами для подтверждения и оплаты. Запись сохранена в профиле.",
      });
      setFormData({ name: '', phone: '', email: '', comment: '' });
      setIsModalOpen(false);
    } catch (error) {
      toast({
        title: 'Ошибка записи',
        description: getWorkshopsErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvailableSpots = (workshop: Workshop) => {
    return workshop.maxParticipants - workshop.currentParticipants;
  };

  const formatDate = (dateString: string) => {
    if (!dateString?.trim()) return '—';
    if (dateString === 'По договоренности') return dateString;

    const tryParse = (raw: string): Date | null => {
      const iso = new Date(raw);
      if (!Number.isNaN(iso.getTime())) return iso;
      const dm = raw.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
      if (dm) {
        const d = Number(dm[1]);
        const m = Number(dm[2]) - 1;
        const y = Number(dm[3]);
        const dt = new Date(y, m, d);
        if (!Number.isNaN(dt.getTime())) return dt;
      }
      return null;
    };

    const parsed = tryParse(dateString);
    if (!parsed) return dateString;

    return parsed.toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const parseFormats = (format: string) =>
    format
      .split(/[\/,|]/g)
      .map((f) => f.trim())
      .filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif font-bold mb-4">Мастер-классы</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Откройте для себя удивительный мир керамики. Научитесь создавать уникальные изделия своими руками 
          под руководством опытных мастеров.
        </p>
      </div>

      {/* Workshops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {workshops.map((workshop) => {
          const availableSpots = getAvailableSpots(workshop);
          
          return (
            <Card
              key={workshop.id}
              className={cn(
                'overflow-hidden border border-border/50 bg-card/40 shadow-none transition-shadow duration-300 hover:shadow-md',
              )}
            >
              <CardContent className="space-y-4 p-0">
                <div className="relative aspect-[16/10] overflow-hidden bg-muted/30">
                  <img
                    src={workshop.resultImage || teamMain.src}
                    alt={`Результат занятия ${workshop.title}`}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                  />
                </div>

                <div className="space-y-4 px-5 pb-5 pt-1 sm:px-6">
                  <div className="flex justify-between items-start gap-3">
                    <CardTitle className="text-xl font-serif leading-tight pr-2">{workshop.title}</CardTitle>
                    <Badge
                      variant="secondary"
                      className="shrink-0 rounded-full border border-border/50 bg-background/80 text-xs font-normal"
                    >
                      {workshop.level === 'Начинающий' ? 'Новичок' : workshop.level || 'Опыт'}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">{workshop.description}</p>

                  <div className="rounded-md border border-border/40 bg-muted/20 px-3 py-3 text-sm space-y-2.5">
                    <p className="flex items-start gap-2.5">
                      <CalendarDays className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" aria-hidden />
                      <span>
                        <span className="text-muted-foreground">Дата: </span>
                        {formatDate(workshop.date)}
                      </span>
                    </p>
                    <p className="flex items-start gap-2.5">
                      <Clock className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" aria-hidden />
                      <span>
                        <span className="text-muted-foreground">Время: </span>
                        {workshop.time || '—'}
                      </span>
                    </p>
                    <p className="flex items-start gap-2.5">
                      <Tag className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" aria-hidden />
                      <span>
                        <span className="text-muted-foreground">Формат: </span>
                        {parseFormats(workshop.format).join(' · ') || workshop.format || '—'}
                      </span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <p>
                      <span className="text-muted-foreground">Длительность: </span>
                      {workshop.duration}
                    </p>
                    <p className="text-right sm:text-left">
                      <span className="text-muted-foreground">Цена: </span>
                      {workshop.price.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>

                  <div className="space-y-2 text-sm leading-relaxed">
                    <p>
                      <span className="text-muted-foreground">Что сделаете: </span>
                      {workshop.whatYouCreate ||
                        workshop.description ||
                        'Изделие из глины под руководством мастера'}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Что заберёте: </span>
                      {workshop.takeHome || workshop.includes[0] || 'Готовое изделие после обжига'}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-border/40 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                      {availableSpots > 0 ? `Свободных мест: ${availableSpots}` : 'Мест нет'}
                    </p>
                    <Button
                      onClick={() => handleRegister(workshop)}
                      disabled={availableSpots === 0}
                      className="w-full sm:w-auto sage-gradient uppercase tracking-wide"
                    >
                      {availableSpots === 0 ? 'Нет мест' : 'Записаться'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Registration Modal */}
      {isModalOpen && selectedWorkshop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Закрыть"
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            onClick={() => setIsModalOpen(false)}
          />

          <div
            className={cn(
              'relative w-full max-w-lg rounded-lg border border-border/60 bg-background p-6 sm:p-8 shadow-lg',
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby="workshop-booking-title"
          >
            <div className="flex justify-between items-start gap-4 mb-6">
              <h3 id="workshop-booking-title" className="text-xl font-serif font-semibold leading-snug pr-2">
                Запись на мастер-класс
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsModalOpen(false)}
                className="shrink-0 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="mb-6 space-y-3 rounded-md border border-border/40 bg-muted/25 px-4 py-4 text-sm">
              <h4 className="font-serif text-base font-medium text-foreground">{selectedWorkshop.title}</h4>
              <p className="text-muted-foreground leading-relaxed">{MANAGER_CONTACT_NOTE}</p>
              <div className="space-y-1.5 text-foreground/90 border-t border-border/30 mt-3 pt-3">
                <p className="flex items-baseline gap-2 flex-wrap">
                  <CalendarDays className="w-3.5 h-3.5 shrink-0 text-muted-foreground" aria-hidden />
                  <span>
                    {formatDate(selectedWorkshop.date)}
                    {selectedWorkshop.time ? ` · ${selectedWorkshop.time}` : ''}
                  </span>
                </p>
                <p className="flex items-baseline gap-2 flex-wrap">
                  <Tag className="w-3.5 h-3.5 shrink-0 text-muted-foreground" aria-hidden />
                  <span>{parseFormats(selectedWorkshop.format).join(' · ') || selectedWorkshop.format}</span>
                </p>
                <p className="text-muted-foreground">
                  Стоимость:{' '}
                  <span className="text-foreground tabular-nums">
                    {selectedWorkshop.price.toLocaleString('ru-RU')} ₽
                  </span>{' '}
                  <span>(оплата после согласования с менеджером)</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm font-medium text-foreground">Контакты для связи</p>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Имя *"
                required
                maxLength={FORM_LIMITS.workshopName}
                className={minimalInputClass}
              />
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Телефон *"
                required
                maxLength={FORM_LIMITS.checkoutPhone}
                className={minimalInputClass}
              />
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email *"
                required
                maxLength={FORM_LIMITS.checkoutEmail}
                className={minimalInputClass}
              />
              <div className="space-y-3">
                <div className={minimalLabelRowClass}>
                  <span className="text-muted-foreground text-sm">Комментарий</span>
                  <span className="text-muted-foreground/80 text-sm">
                    {formData.comment.length}/{FORM_LIMITS.workshopComment}
                  </span>
                </div>
                <Textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="По желанию: удобное время звонка, вопросы к мастеру…"
                  rows={3}
                  maxLength={FORM_LIMITS.workshopComment}
                  className={minimalTextareaClass}
                />
              </div>
              <Button type="submit" className="w-full sage-gradient uppercase tracking-wide" disabled={isSubmitting}>
                {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}