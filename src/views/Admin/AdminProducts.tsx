'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, Product, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const thClass = 'h-9 px-2 text-left text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground';
const tdClass = 'px-2 py-2.5 align-middle text-sm';

function productAvailabilityText(p: Product) {
  const parts: string[] = [];
  parts.push(p.inStock ? 'В наличии' : 'Нет в наличии');
  if (p.isNew) parts.push('Новинка');
  return parts.join(' · ');
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showStopList, setShowStopList] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadProducts = async () => {
    try {
      const data = await api.getAdminProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить товары',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await api.deleteProduct(deleteId);
      setProducts(products.filter((p) => p.id !== deleteId));
      toast({
        title: 'Успешно',
        description: 'Товар удален',
      });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Не удалось удалить товар';
      toast({
        title: 'Ошибка',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setDeleteId(null);
    }
  };

  const handleTogglePublished = async (product: Product) => {
    setTogglingId(product.id);
    try {
      const updated = await api.setProductPublished(product.id, !product.isPublished);
      setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)));
      toast({
        title: updated.isPublished ? 'Товар возвращён в каталог' : 'Товар добавлен в стоп-лист',
      });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Не удалось обновить видимость';
      toast({ title: 'Ошибка', description: message, variant: 'destructive' });
    } finally {
      setTogglingId(null);
    }
  };

  const visibleProducts = showStopList ? products : products.filter((p) => p.isPublished);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground/30" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-semibold text-foreground">Товары</h1>
          <p className="text-sm text-muted-foreground mt-1">Каталог</p>
        </div>
        <Button asChild variant="outline" size="sm" className="self-start sm:self-auto shrink-0 border-border/60 text-xs uppercase tracking-wide">
          <Link href="/admin/products/new" className="inline-flex items-center gap-2">
            <Plus className="w-4 h-4 text-muted-foreground" />
            Добавить товар
          </Link>
        </Button>
      </div>

      <label className="inline-flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
        <input
          type="checkbox"
          checked={showStopList}
          onChange={(e) => setShowStopList(e.target.checked)}
          className="rounded border-border"
        />
        Показывать стоп-лист
      </label>

      <div className="max-h-[min(68vh,620px)] overflow-y-auto overscroll-contain border-t border-border/40">
        <div className="hidden md:block">
          <table className="w-full caption-bottom text-sm">
            <TableHeader className="sticky top-0 z-[1] bg-background shadow-[0_1px_0_0_hsl(var(--border)/0.5)]">
              <TableRow className="border-b border-border/50 hover:bg-transparent">
                <TableHead className={thClass}>Название</TableHead>
                <TableHead className={thClass}>Категория</TableHead>
                <TableHead className={thClass}>Цена</TableHead>
                <TableHead className={cn(thClass, 'text-right w-[100px]')}>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleProducts.map((product) => (
                <TableRow key={product.id} className={cn('border-border/40 hover:bg-muted/20', !product.isPublished && 'opacity-75')}>
                  <TableCell className={cn(tdClass, 'font-medium')}>
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <div className="w-9 h-9 bg-muted/50 overflow-hidden flex-shrink-0 ring-1 ring-border/30">
                        {product.images[0] && (
                          <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span>{product.name}</span>
                        {!product.isPublished ? (
                          <Badge variant="secondary" className="ml-2 text-[0.6rem] uppercase tracking-wide">
                            Стоп-лист
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className={cn(tdClass, 'min-w-[140px]')}>
                    <p>{product.category}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{productAvailabilityText(product)}</p>
                  </TableCell>
                  <TableCell className={cn(tdClass, 'tabular-nums whitespace-nowrap')}>
                    {product.price.toLocaleString('ru-RU')} ₽
                  </TableCell>
                  <TableCell className={cn(tdClass, 'text-right')}>
                    <div className="flex justify-end gap-0.5">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" asChild>
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Pencil className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        disabled={togglingId === product.id}
                        title={product.isPublished ? 'В стоп-лист' : 'Вернуть в каталог'}
                        onClick={() => handleTogglePublished(product)}
                      >
                        {product.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => setDeleteId(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {visibleProducts.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={4} className="py-12 text-center text-sm text-muted-foreground">
                    Нет товаров. Добавьте первый.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-border/40">
          {visibleProducts.map((product) => (
            <div key={product.id} className={cn('py-4 space-y-3', !product.isPublished && 'opacity-75')}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-muted/50 overflow-hidden flex-shrink-0 ring-1 ring-border/30">
                  {product.images[0] && (
                    <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {product.name}
                    {!product.isPublished ? (
                      <Badge variant="secondary" className="ml-2 text-[0.6rem]">Стоп-лист</Badge>
                    ) : null}
                  </p>
                  <p className="text-xs text-muted-foreground">{product.category}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{productAvailabilityText(product)}</p>
                </div>
                <p className="text-sm tabular-nums whitespace-nowrap">{product.price.toLocaleString('ru-RU')} ₽</p>
              </div>
              <div className="flex justify-end gap-0.5">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" asChild>
                  <Link href={`/admin/products/${product.id}/edit`}>
                    <Pencil className="w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground"
                  disabled={togglingId === product.id}
                  onClick={() => handleTogglePublished(product)}
                >
                  {product.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground"
                  onClick={() => setDeleteId(product.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {visibleProducts.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">Нет товаров. Добавьте первый.</div>
          )}
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить товар?</AlertDialogTitle>
            <AlertDialogDescription>Действие нельзя отменить.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
