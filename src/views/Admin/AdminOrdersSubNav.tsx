'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Package, GraduationCap, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminOrdersData } from '@/views/Admin/AdminOrdersDataContext';
import { getTabFromSearchParams, type AdminOrdersTabId } from '@/views/Admin/AdminOrdersTabPanels';

const tabs: { tab: AdminOrdersTabId; label: string; icon: typeof Package; countKey: 'orders' | 'workshops' | 'gifts' }[] =
  [
    { tab: 'products', label: 'Заказы товаров', icon: Package, countKey: 'orders' },
    { tab: 'workshops', label: 'Мастер-классы', icon: GraduationCap, countKey: 'workshops' },
    { tab: 'gifts', label: 'Сертификаты', icon: Gift, countKey: 'gifts' },
  ];

export function AdminOrdersSubNav() {
  const searchParams = useSearchParams();
  const activeTab = getTabFromSearchParams(searchParams.get('tab'));
  const { orders, workshopBookings, giftCertificateOrders, isLoading } = useAdminOrdersData();

  const counts = {
    orders: orders.length,
    workshops: workshopBookings.length,
    gifts: giftCertificateOrders.length,
  };

  return (
    <nav
      className="flex flex-wrap gap-1.5 sm:gap-2 p-1 rounded-lg border border-border/60 bg-muted/20"
      aria-label="Разделы заявок"
    >
      {tabs.map(({ tab, label, icon: Icon, countKey }) => {
        const href = tab === 'products' ? '/admin/orders' : `/admin/orders?tab=${tab}`;
        const active = activeTab === tab;
        const n = counts[countKey];
        return (
          <Link
            key={tab}
            href={href}
            prefetch
            scroll={false}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
              active
                ? 'bg-background text-foreground shadow-sm ring-1 ring-border/80 font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/60',
            )}
          >
            <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
            <span className="font-serif">{label}</span>
            <span
              className={cn(
                'tabular-nums text-[0.7rem] px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center',
                active ? 'bg-[hsl(var(--pottery-sage))]/15 text-[hsl(var(--pottery-sage))]' : 'bg-muted text-muted-foreground',
              )}
            >
              {isLoading ? '…' : n}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
