'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, Product, ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, X, Upload, Loader2 } from 'lucide-react';
import { minimalInputClass, minimalSelectClass, minimalTextareaClass } from '@/lib/formFieldStyles';

const productSchema = z.object({
  id: z.string().min(1, 'ID обязателен').regex(/^[a-z0-9-]+$/, 'Только строчные буквы, цифры и дефис'),
  name: z.string().min(1, 'Название обязательно'),
  price: z.coerce.number().min(0, 'Цена должна быть положительной'),
  category: z.string().min(1, 'Категория обязательна'),
  description: z.string().optional(),
  dimensions: z.string().optional(),
  care: z.string().optional(),
  collection: z.string().optional(),
  inStock: z.boolean(),
  isNew: z.boolean(),
  images: z.array(z.object({ url: z.string() })),
});

type ProductFormData = z.infer<typeof productSchema>;

const categories = ['Посуда', 'Декор', 'Наборы', 'Горшки'];

export default function AdminProductEdit() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const isEditing = !!id;
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      id: '',
      name: '',
      price: 0,
      category: 'Посуда',
      description: '',
      dimensions: '',
      care: '',
      collection: '',
      inStock: true,
      isNew: false,
      images: [{ url: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'images',
  });

  useEffect(() => {
    if (isEditing) {
      setIsLoading(true);
      api.getProduct(id)
        .then((product) => {
          reset({
            ...product,
            description: product.description || '',
            dimensions: product.dimensions || '',
            care: product.care || '',
            collection: product.collection || '',
            images: product.images.map(url => ({ url })),
          });
        })
        .catch((error) => {
          console.error('Failed to load product:', error);
          toast({
            title: 'Ошибка',
            description: 'Не удалось загрузить товар',
            variant: 'destructive',
          });
          router.push('/admin/products');
        })
        .finally(() => setIsLoading(false));
    }
  }, [id, isEditing, reset, router, toast]);

  const handleFileUpload = async (index: number, file: File) => {
    setUploadingIndex(index);
    try {
      const result = await api.uploadImage(file, 'feia/products');
      setValue(`images.${index}.url`, result.url);
      toast({ title: 'Фото загружено' });
    } catch (error) {
      toast({
        title: 'Ошибка загрузки',
        description: error instanceof Error ? error.message : 'Не удалось загрузить фото',
        variant: 'destructive',
      });
    } finally {
      setUploadingIndex(null);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSaving(true);
    try {
      const productData = {
        ...data,
        images: data.images.map(img => img.url).filter(Boolean),
      };

      if (isEditing) {
        await api.updateProduct(id, productData);
        toast({
          title: 'Успешно',
          description: 'Товар обновлен',
        });
      } else {
        await api.createProduct(productData as Product);
        toast({
          title: 'Успешно',
          description: 'Товар создан',
        });
      }
      router.push('/admin/products');
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Не удалось сохранить товар';
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground/30" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/admin/products')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-semibold text-foreground">
            {isEditing ? 'Редактирование товара' : 'Новый товар'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isEditing ? 'Измените данные товара' : 'Заполните данные нового товара'}
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
                  ID товара
                </Label>
                <Input
                  id="id"
                  placeholder="ceramic-bowl-sage"
                  disabled={isEditing}
                  className={minimalInputClass}
                  {...register('id')}
                />
                {errors.id && <p className="text-sm text-destructive">{errors.id.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs text-muted-foreground font-normal">
                  Название
                </Label>
                <Input id="name" placeholder="Керамическая миска" className={minimalInputClass} {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-xs text-muted-foreground font-normal">
                  Цена (₽)
                </Label>
                <Input id="price" type="number" min={0} className={minimalInputClass} {...register('price')} />
                {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs text-muted-foreground font-normal">
                  Категория
                </Label>
                <select id="category" className={minimalSelectClass} {...register('category')}>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="collection" className="text-xs text-muted-foreground font-normal">
                  Коллекция
                </Label>
                <Input id="collection" placeholder="Минимализм" className={minimalInputClass} {...register('collection')} />
              </div>
            </div>
          </section>

          <section className="space-y-4 border-b border-border/50 pb-8 md:border-0 md:pb-0">
            <h2 className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">Наличие и детали</h2>
            <div className="space-y-5 max-w-lg">
              <div className="flex items-center justify-between gap-4 border-b border-border/40 pb-3">
                <Label htmlFor="inStock" className="text-sm font-normal">
                  В наличии
                </Label>
                <Switch
                  id="inStock"
                  checked={watch('inStock')}
                  onCheckedChange={(checked) => setValue('inStock', checked)}
                />
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-border/40 pb-3">
                <Label htmlFor="isNew" className="text-sm font-normal">
                  Новинка
                </Label>
                <Switch id="isNew" checked={watch('isNew')} onCheckedChange={(checked) => setValue('isNew', checked)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dimensions" className="text-xs text-muted-foreground font-normal">
                  Размеры
                </Label>
                <Input
                  id="dimensions"
                  placeholder="Диаметр 18 см, высота 8 см"
                  className={minimalInputClass}
                  {...register('dimensions')}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="care" className="text-xs text-muted-foreground font-normal">
                  Уход
                </Label>
                <Input
                  id="care"
                  placeholder="Можно мыть в посудомоечной машине"
                  className={minimalInputClass}
                  {...register('care')}
                />
              </div>
            </div>
          </section>
        </div>

        <section className="space-y-4 border-b border-border/50 pb-8">
          <h2 className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">Описание</h2>
          <Textarea
            placeholder="Подробное описание товара..."
            className={cn(minimalTextareaClass, 'min-h-[140px]')}
            {...register('description')}
          />
        </section>

        <section className="space-y-4 pb-2">
          <h2 className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">Изображения</h2>
          <div className="space-y-4 max-w-3xl">
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-2">
                <div className="flex gap-2 items-start">
                  <Input
                    placeholder="URL изображения"
                    className={cn(minimalInputClass, 'min-w-0 flex-1')}
                    {...register(`images.${index}.url`)}
                  />
                  <label className="cursor-pointer shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(index, file);
                      }}
                    />
                    <Button type="button" variant="outline" size="icon" className="border-border/50" disabled={uploadingIndex === index} asChild>
                      <span>
                        {uploadingIndex === index ? (
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        ) : (
                          <Upload className="w-4 h-4 text-muted-foreground" />
                        )}
                      </span>
                    </Button>
                  </label>
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
                {watch(`images.${index}.url`) && (
                  <img
                    src={watch(`images.${index}.url`)}
                    alt={`Превью ${index + 1}`}
                    className="h-24 w-24 object-cover ring-1 ring-border/40"
                  />
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="border-border/60 text-xs" onClick={() => append({ url: '' })}>
              <Plus className="w-4 h-4 mr-2" />
              Добавить изображение
            </Button>
          </div>
        </section>

        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border/50">
          <Button type="submit" disabled={isSaving} className="w-full sm:w-auto sage-gradient">
            {isSaving ? 'Сохранение...' : isEditing ? 'Сохранить' : 'Создать товар'}
          </Button>
          <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={() => router.push('/admin/products')}>
            Отмена
          </Button>
        </div>
      </form>
    </div>
  );
}
