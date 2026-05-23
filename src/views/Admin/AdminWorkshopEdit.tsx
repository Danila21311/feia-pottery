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
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, X, Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { minimalInputClass, minimalSelectClass, minimalTextareaClass } from '@/lib/formFieldStyles';

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
  whatYouCreate: z.string().optional(),
  takeHome: z.string().optional(),
  resultImage: z.string().optional(),
  includes: z.array(z.object({ item: z.string() })),
});

type WorkshopFormData = z.infer<typeof workshopSchema>;

const formats = ['Группа', 'Индивидуальный', 'Семейное', 'Парный'];
const levels = ['Начинающий', 'Продолжающий', 'Любой', 'Для всех возрастов'];

export default function AdminWorkshopEdit() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const isEditing = !!id;
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingResultImage, setIsUploadingResultImage] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
    watch,
    setValue,
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
      whatYouCreate: '',
      takeHome: '',
      resultImage: '',
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
            whatYouCreate: workshop.whatYouCreate || '',
            takeHome: workshop.takeHome || '',
            resultImage: workshop.resultImage || '',
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

  const handleResultImageUpload = async (file: File) => {
    setIsUploadingResultImage(true);
    try {
      const result = await api.uploadImage(file, 'feia/workshops');
      setValue('resultImage', result.url, { shouldDirty: true });
      toast({
        title: 'Фото загружено',
        description: 'Ссылка на изображение добавлена в поле',
      });
    } catch (error) {
      toast({
        title: 'Ошибка загрузки',
        description: error instanceof Error ? error.message : 'Не удалось загрузить изображение',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingResultImage(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground/30" />
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        <div className="grid gap-10 md:grid-cols-2 md:gap-14">
          <section className="space-y-4 border-b border-border/50 pb-8 md:border-0 md:pb-0">
            <h2 className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">Основная информация</h2>
            <div className="space-y-5 max-w-lg">
              <div className="space-y-1.5">
                <Label htmlFor="id" className="text-xs text-muted-foreground font-normal">
                  ID
                </Label>
                <Input
                  id="id"
                  placeholder="beginner-pottery"
                  disabled={isEditing}
                  className={minimalInputClass}
                  {...register('id')}
                />
                {errors.id && <p className="text-sm text-destructive">{errors.id.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs text-muted-foreground font-normal">
                  Название
                </Label>
                <Input
                  id="title"
                  placeholder="Введение в гончарное дело"
                  className={minimalInputClass}
                  {...register('title')}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-xs text-muted-foreground font-normal">
                  Цена (₽)
                </Label>
                <Input id="price" type="number" min={0} className={minimalInputClass} {...register('price')} />
                {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="format" className="text-xs text-muted-foreground font-normal">
                  Формат
                </Label>
                <select id="format" className={minimalSelectClass} {...register('format')}>
                  {formats.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="level" className="text-xs text-muted-foreground font-normal">
                  Уровень
                </Label>
                <select id="level" className={minimalSelectClass} {...register('level')}>
                  {levels.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="space-y-4 border-b border-border/50 pb-8 md:border-0 md:pb-0">
            <h2 className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">Расписание и участники</h2>
            <div className="space-y-5 max-w-lg">
              <div className="space-y-1.5">
                <Label htmlFor="date" className="text-xs text-muted-foreground font-normal">
                  Дата
                </Label>
                <Input
                  id="date"
                  placeholder="2025-01-20 или По договоренности"
                  className={minimalInputClass}
                  {...register('date')}
                />
                {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="time" className="text-xs text-muted-foreground font-normal">
                  Время
                </Label>
                <Input id="time" placeholder="10:00" className={minimalInputClass} {...register('time')} />
                {errors.time && <p className="text-sm text-destructive">{errors.time.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="duration" className="text-xs text-muted-foreground font-normal">
                  Длительность
                </Label>
                <Input id="duration" placeholder="3 часа" className={minimalInputClass} {...register('duration')} />
                {errors.duration && <p className="text-sm text-destructive">{errors.duration.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="maxParticipants" className="text-xs text-muted-foreground font-normal">
                    Макс. участников
                  </Label>
                  <Input id="maxParticipants" type="number" min={1} className={minimalInputClass} {...register('maxParticipants')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="currentParticipants" className="text-xs text-muted-foreground font-normal">
                    Записано
                  </Label>
                  <Input
                    id="currentParticipants"
                    type="number"
                    min={0}
                    className={minimalInputClass}
                    {...register('currentParticipants')}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="space-y-4 border-b border-border/50 pb-8">
          <h2 className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">Описание</h2>
          <Textarea
            placeholder="Подробное описание мастер-класса..."
            className={cn(minimalTextareaClass, 'min-h-[140px]')}
            {...register('description')}
          />
        </section>

        <section className="space-y-4 border-b border-border/50 pb-8">
          <h2 className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">Контент карточки</h2>
          <div className="space-y-5 max-w-3xl">
            <div className="space-y-1.5">
              <Label htmlFor="whatYouCreate" className="text-xs text-muted-foreground font-normal">
                Что сделает человек
              </Label>
              <Input
                id="whatYouCreate"
                placeholder="Например: слепит и задекорирует чайную пару"
                className={minimalInputClass}
                {...register('whatYouCreate')}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="takeHome" className="text-xs text-muted-foreground font-normal">
                Что заберёт домой
              </Label>
              <Input
                id="takeHome"
                placeholder="Например: готовую кружку после обжига"
                className={minimalInputClass}
                {...register('takeHome')}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="resultImage" className="text-xs text-muted-foreground font-normal">
                Фото результата (URL)
              </Label>
              <div className="flex gap-2 items-start">
                <Input
                  id="resultImage"
                  placeholder="https://..."
                  className={cn(minimalInputClass, 'min-w-0 flex-1')}
                  {...register('resultImage')}
                />
                <label className="cursor-pointer shrink-0">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleResultImageUpload(file);
                    }}
                  />
                  <Button type="button" variant="outline" size="icon" className="border-border/50" disabled={isUploadingResultImage} asChild>
                    <span>
                      {isUploadingResultImage ? (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      ) : (
                        <Upload className="w-4 h-4 text-muted-foreground" />
                      )}
                    </span>
                  </Button>
                </label>
              </div>
              {watch('resultImage') && (
                <img
                  src={watch('resultImage') as string}
                  alt="Превью результата"
                  className="h-24 w-24 object-cover ring-1 ring-border/40"
                />
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4 pb-2">
          <h2 className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">Что включено</h2>
          <div className="space-y-3 max-w-3xl">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <Input
                  placeholder="Все материалы, Обжиг изделия..."
                  className={cn(minimalInputClass, 'min-w-0 flex-1')}
                  {...register(`includes.${index}.item`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="border-border/60 text-xs" onClick={() => append({ item: '' })}>
              <Plus className="w-4 h-4 mr-2" />
              Добавить пункт
            </Button>
          </div>
        </section>

        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border/50">
          <Button type="submit" disabled={isSaving} className="w-full sm:w-auto sage-gradient">
            {isSaving ? 'Сохранение...' : isEditing ? 'Сохранить' : 'Создать мастер-класс'}
          </Button>
          <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={() => router.push('/admin/workshops')}>
            Отмена
          </Button>
        </div>
      </form>
    </div>
  );
}
