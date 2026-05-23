'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, Workshop, ApiError } from '@/lib/api';
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

export default function AdminWorkshops() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showStopList, setShowStopList] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadWorkshops = async () => {
    try {
      const data = await api.getAdminWorkshops();
      setWorkshops(data);
    } catch (error) {
      console.error('Failed to load workshops:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить мастер-классы',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkshops();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await api.deleteWorkshop(deleteId);
      setWorkshops(workshops.filter((w) => w.id !== deleteId));
      toast({
        title: 'Успешно',
        description: 'Мастер-класс удален',
      });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Не удалось удалить мастер-класс';
      toast({
        title: 'Ошибка',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setDeleteId(null);
    }
  };

  const handleTogglePublished = async (workshop: Workshop) => {
    setTogglingId(workshop.id);
    try {
      const updated = await api.setWorkshopPublished(workshop.id, !workshop.isPublished);
      setWorkshops((prev) => prev.map((w) => (w.id === workshop.id ? updated : w)));
      toast({
        title: updated.isPublished ? 'Мастер-класс возвращён на сайт' : 'Мастер-класс добавлен в стоп-лист',
      });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Не удалось обновить видимость';
      toast({ title: 'Ошибка', description: message, variant: 'destructive' });
    } finally {
      setTogglingId(null);
    }
  };

  const visibleWorkshops = showStopList ? workshops : workshops.filter((w) => w.isPublished);

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
          <h1 className="text-2xl md:text-3xl font-serif font-semibold text-foreground">Мастер-классы</h1>
          <p className="text-sm text-muted-foreground mt-1">Расписание</p>
        </div>
        <Button asChild variant="outline" size="sm" className="self-start sm:self-auto shrink-0 border-border/60 text-xs uppercase tracking-wide">
          <Link href="/admin/workshops/new" className="inline-flex items-center gap-2">
            <Plus className="w-4 h-4 text-muted-foreground" />
            Добавить мастер-класс
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
                <TableHead className={thClass}>Дата и время</TableHead>
                <TableHead className={thClass}>Формат</TableHead>
                <TableHead className={thClass}>Участники</TableHead>
                <TableHead className={thClass}>Цена</TableHead>
                <TableHead className={cn(thClass, 'text-right w-[100px]')}>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleWorkshops.map((workshop) => (
                <TableRow key={workshop.id} className={cn('border-border/40 hover:bg-muted/20', !workshop.isPublished && 'opacity-75')}>
                  <TableCell className={cn(tdClass, 'min-w-[180px]')}>
                    <p className="font-medium">
                      {workshop.title}
                      {!workshop.isPublished ? (
                        <Badge variant="secondary" className="ml-2 text-[0.6rem] uppercase tracking-wide">
                          Стоп-лист
                        </Badge>
                      ) : null}
                    </p>
                    {workshop.level ? (
                      <p className="text-xs text-muted-foreground mt-0.5">{workshop.level}</p>
                    ) : null}
                  </TableCell>
                  <TableCell className={cn(tdClass, 'whitespace-nowrap tabular-nums')}>
                    {workshop.date} · {workshop.time}
                  </TableCell>
                  <TableCell className={tdClass}>{workshop.format}</TableCell>
                  <TableCell className={cn(tdClass, 'tabular-nums')}>
                    {workshop.currentParticipants}/{workshop.maxParticipants}
                  </TableCell>
                  <TableCell className={cn(tdClass, 'tabular-nums whitespace-nowrap')}>
                    {workshop.price.toLocaleString('ru-RU')} ₽
                  </TableCell>
                  <TableCell className={cn(tdClass, 'text-right')}>
                    <div className="flex justify-end gap-0.5">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" asChild>
                        <Link href={`/admin/workshops/${workshop.id}/edit`}>
                          <Pencil className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        disabled={togglingId === workshop.id}
                        title={workshop.isPublished ? 'В стоп-лист' : 'Вернуть на сайт'}
                        onClick={() => handleTogglePublished(workshop)}
                      >
                        {workshop.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => setDeleteId(workshop.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {visibleWorkshops.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                    Нет мастер-классов. Добавьте первый.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-border/40">
          {visibleWorkshops.map((workshop) => (
            <div key={workshop.id} className={cn('py-4 space-y-2', !workshop.isPublished && 'opacity-75')}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">
                    {workshop.title}
                    {!workshop.isPublished ? (
                      <Badge variant="secondary" className="ml-2 text-[0.6rem]">Стоп-лист</Badge>
                    ) : null}
                  </p>
                  {workshop.level ? <p className="text-xs text-muted-foreground">{workshop.level}</p> : null}
                </div>
                <p className="text-sm tabular-nums whitespace-nowrap">{workshop.price.toLocaleString('ru-RU')} ₽</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {workshop.date} · {workshop.time} · {workshop.format} · {workshop.currentParticipants}/
                {workshop.maxParticipants}
              </p>
              <div className="flex justify-end gap-0.5 pt-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" asChild>
                  <Link href={`/admin/workshops/${workshop.id}/edit`}>
                    <Pencil className="w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground"
                  disabled={togglingId === workshop.id}
                  onClick={() => handleTogglePublished(workshop)}
                >
                  {workshop.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground"
                  onClick={() => setDeleteId(workshop.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {visibleWorkshops.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">Нет мастер-классов. Добавьте первый.</div>
          )}
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить мастер-класс?</AlertDialogTitle>
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
