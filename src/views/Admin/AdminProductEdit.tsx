'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, Product, ApiError } from '@/lib/api';
import { uploadImage } from '@/lib/cloudinary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, X, Upload, Loader2 } from 'lucide-react';

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
      const result = await uploadImage(file, 'feia/products');
      setValue(`images.${index}.url`, result.secure_url);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="id">ID товара</Label>
                <Input
                  id="id"
                  placeholder="ceramic-bowl-sage"
                  disabled={isEditing}
                  {...register('id')}
                />
                {errors.id && (
                  <p className="text-sm text-destructive">{errors.id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Название</Label>
                <Input
                  id="name"
                  placeholder="Керамическая миска"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
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
                <Label htmlFor="category">Категория</Label>
                <select
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  {...register('category')}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="collection">Коллекция</Label>
                <Input
                  id="collection"
                  placeholder="Минимализм"
                  {...register('collection')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Status & Details */}
          <Card>
            <CardHeader>
              <CardTitle>Статус и детали</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="inStock">В наличии</Label>
                <Switch
                  id="inStock"
                  checked={watch('inStock')}
                  onCheckedChange={(checked) => setValue('inStock', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isNew">Новинка</Label>
                <Switch
                  id="isNew"
                  checked={watch('isNew')}
                  onCheckedChange={(checked) => setValue('isNew', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dimensions">Размеры</Label>
                <Input
                  id="dimensions"
                  placeholder="Диаметр 18 см, высота 8 см"
                  {...register('dimensions')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="care">Уход</Label>
                <Input
                  id="care"
                  placeholder="Можно мыть в посудомоечной машине"
                  {...register('care')}
                />
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
              placeholder="Подробное описание товара..."
              className="min-h-32"
              {...register('description')}
            />
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Изображения</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-2">
                <div className="flex gap-2 items-start">
                  <Input
                    placeholder="URL изображения"
                    className="min-w-0"
                    {...register(`images.${index}.url`)}
                  />
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(index, file);
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      disabled={uploadingIndex === index}
                      asChild
                    >
                      <span>
                        {uploadingIndex === index
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Upload className="w-4 h-4" />}
                      </span>
                    </Button>
                  </label>
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
                {watch(`images.${index}.url`) && (
                  <img
                    src={watch(`images.${index}.url`)}
                    alt={`Превью ${index + 1}`}
                    className="h-24 w-24 object-cover rounded-md border"
                  />
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ url: '' })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить изображение
            </Button>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
            {isSaving ? 'Сохранение...' : isEditing ? 'Сохранить изменения' : 'Создать товар'}
          </Button>
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => router.push('/admin/products')}>
            Отмена
          </Button>
        </div>
      </form>
    </div>
  );
}
