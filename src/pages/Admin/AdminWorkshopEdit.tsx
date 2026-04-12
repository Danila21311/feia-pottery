'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, Workshop, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, X } from 'lucide-react';

const workshopSchema = z.object({
  id: z.string().min(1, 'ID обязателен').regex(/^[a-z0-9-]+$/, 'Только строчные буквы, цифры и дефис'),
  title: z.string().min(1, 'Название обязательно'),
  date: z.string().min(1, 'Дата обязательна'),
  time: z.string().min(1, 'Время обязательно'),
  duration: z.string().min(1, 'Длительность обязательна'),
  format: z.string().min(1, 'Формат обязателен'),
  price: z.coerce.number().min(0, 'Цена должна быть положительной'),
  maxParticipants: z.coerce.number().min(1, 'Минимум 1 участник'),
  currentParticipants: z.coerce.number().min(0),
  description: z.string().optional(),
  level: z.string().optional(),
  includes: z.array(z.object({ item: z.string() })),
});

type WorkshopFormData = z.infer<typeof workshopSchema>;

const formats = ['Группа', 'Индивидуальный', 'Семейное', 'Парный'];
const levels = ['Начинающий', 'Продолжающий', 'Любой', 'Для всех возрастов'];

export default function AdminWorkshopEdit() {
  const { id } = useParams();
  const isEditing = !!id;
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<WorkshopFormData>({
    resolver: zodResolver(workshopSchema),
    defaultValues: {
      id: '',
      title: '',
      date: '',
      time: '',
      duration: '',
      format: 'Группа',
      price: 0,
      maxParticipants: 8,
      currentParticipants: 0,
      description: '',
      level: 'Начинающий',
      includes: [{ item: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'includes',
  });

  useEffect(() => {
    if (isEditing) {
      setIsLoading(true);
      api.getWorkshop(id)
        .then((workshop) => {
          reset({
            ...workshop,
            description: workshop.description || '',
            level: workshop.level || '',
            includes: workshop.includes.map(item => ({ item })),
          });
        })
        .catch((error) => {
          console.error('Failed to load workshop:', error);
          toast({
            title: 'Ошибка',
            description: 'Не удалось загрузить мастер-класс',
            variant: 'destructive',
          });
          router.push('/admin/workshops');
        })
        .finally(() => setIsLoading(false));
    }
  }, [id, isEditing, reset, router, toast]);

  const onSubmit = async (data: WorkshopFormData) => {
    setIsSaving(true);
    try {
      const workshopData = {
        ...data,
        includes: data.includes.map(inc => inc.item).filter(Boolean),
      };

      if (isEditing) {
        await api.updateWorkshop(id, workshopData);
        toast({
          title: 'Успешно',
          description: 'Мастер-класс обновлен',
        });
      } else {
        await api.createWorkshop(workshopData as Workshop);
        toast({
          title: 'Успешно',
          description: 'Мастер-класс создан',
        });
      }
      router.push('/admin/workshops');
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Не удалось сохранить мастер-класс';
      toast({
        title: 'Ошибка',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/admin/workshops')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-semibold text-foreground">
            {isEditing ? 'Редактирование мастер-класса' : 'Новый мастер-класс'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isEditing ? 'Измените данные мастер-класса' : 'Заполните данные нового мастер-класса'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="id">ID мастер-класса</Label>
                <Input
                  id="id"
                  placeholder="beginner-pottery"
                  disabled={isEditing}
                  {...register('id')}
                />
                {errors.id && (
                  <p className="text-sm text-destructive">{errors.id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Название</Label>
                <Input
                  id="title"
                  placeholder="Введение в гончарное дело"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Цена (₽)</Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  {...register('price')}
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">Формат</Label>
                <select
                  id="format"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  {...register('format')}
                >
                  {formats.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Уровень</Label>
                <select
                  id="level"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  {...register('level')}
                >
                  {levels.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Расписание и участники</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Дата</Label>
                <Input
                  id="date"
                  placeholder="2025-01-20 или По договоренности"
                  {...register('date')}
                />
                {errors.date && (
                  <p className="text-sm text-destructive">{errors.date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Время</Label>
                <Input
                  id="time"
                  placeholder="10:00"
                  {...register('time')}
                />
                {errors.time && (
                  <p className="text-sm text-destructive">{errors.time.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Длительность</Label>
                <Input
                  id="duration"
                  placeholder="3 часа"
                  {...register('duration')}
                />
                {errors.duration && (
                  <p className="text-sm text-destructive">{errors.duration.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Макс. участников</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    min={1}
                    {...register('maxParticipants')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentParticipants">Записано</Label>
                  <Input
                    id="currentParticipants"
                    type="number"
                    min={0}
                    {...register('currentParticipants')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Описание</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Подробное описание мастер-класса..."
              className="min-h-32"
              {...register('description')}
            />
          </CardContent>
        </Card>

        {/* Includes */}
        <Card>
          <CardHeader>
            <CardTitle>Что включено</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <Input
                  placeholder="Все материалы, Обжиг изделия..."
                  className="min-w-0"
                  {...register(`includes.${index}.item`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ item: '' })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить пункт
            </Button>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
            {isSaving ? 'Сохранение...' : isEditing ? 'Сохранить изменения' : 'Создать мастер-класс'}
          </Button>
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => router.push('/admin/workshops')}>
            Отмена
          </Button>
        </div>
      </form>
    </div>
  );
}
