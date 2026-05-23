'use client';

import { Suspense } from 'react';
import { AdminOrdersDataProvider } from '@/views/Admin/AdminOrdersDataContext';
import { AdminOrdersSubNav } from '@/views/Admin/AdminOrdersSubNav';

function SubNavSkeleton() {
  return <div className="h-[52px] rounded-lg border border-border/60 bg-muted/20 animate-pulse" aria-hidden />;
}

export default function AdminOrdersLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminOrdersDataProvider>
      <div className="mx-auto max-w-[1400px] space-y-5">
        <header className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-serif font-semibold text-foreground tracking-tight">Заявки клиентов</h1>
          <p className="text-sm text-muted-foreground">
            Заказы из каталога, записи на мастер-классы и подарочные сертификаты
          </p>
        </header>
        <Suspense fallback={<SubNavSkeleton />}>
          <AdminOrdersSubNav />
        </Suspense>
        <div className="rounded-lg border border-border/60 bg-card/25 p-4 shadow-sm md:p-5">{children}</div>
      </div>
    </AdminOrdersDataProvider>
  );
}
