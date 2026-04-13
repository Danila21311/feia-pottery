'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, Workshop, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
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
import { Plus, Pencil, Trash2, Calendar, Users } from 'lucide-react';

export default function AdminWorkshops() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadWorkshops = async () => {
    try {
      const data = await api.getWorkshops();
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
      setWorkshops(workshops.filter(w => w.id !== deleteId));
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-semibold text-foreground">Мастер-классы</h1>
          <p className="text-muted-foreground mt-1">Управление расписанием мастер-классов</p>
        </div>
        <Button asChild className="self-start sm:self-auto">
          <Link href="/admin/workshops/new">
            <Plus className="w-4 h-4 mr-2" />
            Добавить мастер-класс
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Дата и время</TableHead>
                  <TableHead>Формат</TableHead>
                  <TableHead>Участники</TableHead>
                  <TableHead>Цена</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workshops.map((workshop) => (
                  <TableRow key={workshop.id}>
                    <TableCell className="font-medium">
                      <div>
                        <p>{workshop.title}</p>
                        <p className="text-sm text-muted-foreground">{workshop.level}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{workshop.date} • {workshop.time}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{workshop.format}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{workshop.currentParticipants}/{workshop.maxParticipants}</span>
                      </div>
                    </TableCell>
                    <TableCell>{workshop.price.toLocaleString('ru-RU')} ₽</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/workshops/${workshop.id}/edit`}>
                            <Pencil className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(workshop.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {workshops.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Нет мастер-классов. Добавьте первый.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-border">
            {workshops.map((workshop) => (
              <div key={workshop.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{workshop.title}</p>
                    <p className="text-sm text-muted-foreground">{workshop.level}</p>
                  </div>
                  <p className="font-semibold whitespace-nowrap">{workshop.price.toLocaleString('ru-RU')} ₽</p>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>{workshop.date} • {workshop.time}</span>
                  <span>{workshop.format}</span>
                  <span>{workshop.currentParticipants}/{workshop.maxParticipants} чел.</span>
                </div>
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/workshops/${workshop.id}/edit`}>
                      <Pencil className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(workshop.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {workshops.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                Нет мастер-классов. Добавьте первый.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить мастер-класс?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Мастер-класс будет удален навсегда.
            </AlertDialogDescription>
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
