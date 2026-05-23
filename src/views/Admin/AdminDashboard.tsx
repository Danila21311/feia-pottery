'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, Product, Workshop } from '@/lib/api';

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [productsData, workshopsData] = await Promise.all([
          api.getAdminProducts(),
          api.getAdminWorkshops(),
        ]);
        setProducts(productsData);
        setWorkshops(workshopsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const stats = [
    { name: 'Всего товаров', value: products.length, href: '/admin/products' },
    { name: 'В каталоге', value: products.filter((p) => p.isPublished).length, href: '/admin/products' },
    { name: 'В наличии', value: products.filter((p) => p.inStock && p.isPublished).length, href: '/admin/products' },
    { name: 'Мастер-классов', value: workshops.filter((w) => w.isPublished).length, href: '/admin/workshops' },
    {
      name: 'Участников записано',
      value: workshops.reduce((sum, w) => sum + w.currentParticipants, 0),
      href: '/admin/workshops',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground/30" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-semibold text-foreground">Панель управления</h1>
        <p className="text-sm text-muted-foreground mt-1">Заказы и мастер-классы Фея</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 border-b border-border/50 pb-10">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href} className="group block">
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">{stat.name}</p>
            <p className="mt-2 text-3xl font-serif font-medium text-foreground tabular-nums group-hover:opacity-80 transition-opacity">
              {stat.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid gap-10 md:grid-cols-2 md:gap-14">
        <section>
          <div className="flex items-baseline justify-between gap-4 border-b border-border/50 pb-3 mb-4">
            <h2 className="font-serif text-lg font-medium text-foreground">Последние товары</h2>
            <Link href="/admin/products" className="text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground">
              Все товары →
            </Link>
          </div>
          <ul className="divide-y divide-border/40">
            {products.slice(0, 5).map((product) => (
              <li key={product.id} className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 py-3 first:pt-0">
                <div>
                  <p className="text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.category}</p>
                </div>
                <p className="text-sm tabular-nums sm:text-right">{product.price.toLocaleString('ru-RU')} ₽</p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="flex items-baseline justify-between gap-4 border-b border-border/50 pb-3 mb-4">
            <h2 className="font-serif text-lg font-medium text-foreground">Ближайшие мастер-классы</h2>
            <Link href="/admin/workshops" className="text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground">
              Все МК →
            </Link>
          </div>
          <ul className="divide-y divide-border/40">
            {workshops.length === 0 ? (
              <li className="py-6 text-sm text-muted-foreground">Сеансов пока нет</li>
            ) : (
              workshops.slice(0, 5).map((workshop) => (
                <li
                  key={workshop.id}
                  className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 py-3 first:pt-0"
                >
                  <div>
                    <p className="text-sm font-medium">{workshop.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {workshop.date} · {workshop.time}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground tabular-nums sm:text-right">
                    {workshop.currentParticipants}/{workshop.maxParticipants}
                  </p>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
