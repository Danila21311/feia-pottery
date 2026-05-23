'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AdminOrdersProductsTab } from '@/views/Admin/AdminOrdersProductsTab';
import { AdminOrdersWorkshopsTab } from '@/views/Admin/AdminOrdersWorkshopsTab';
import { AdminOrdersGiftsTab } from '@/views/Admin/AdminOrdersGiftsTab';

const VALID_TABS = new Set(['products', 'workshops', 'gifts']);
export type AdminOrdersTabId = 'products' | 'workshops' | 'gifts';

export function getTabFromSearchParams(tabParam: string | null): AdminOrdersTabId {
  if (tabParam && VALID_TABS.has(tabParam)) return tabParam as AdminOrdersTabId;
  return 'products';
}

/**
 * Одна страница без вложенных routes — переключение вкладок не триггерит навигацию Next.js
 * и компиляцию отдельных page-chunk (главная причина «долгого рендера» в dev).
 * Панели после первого открытия остаются смонтированными (скрыты), чтобы не терять состояние фильтров.
 */
export function AdminOrdersTabPanels() {
  const searchParams = useSearchParams();
  const tab = getTabFromSearchParams(searchParams.get('tab'));

  const [everMounted, setEverMounted] = useState<Record<AdminOrdersTabId, boolean>>({
    products: true,
    workshops: false,
    gifts: false,
  });

  useEffect(() => {
    setEverMounted((m) => (m[tab] ? m : { ...m, [tab]: true }));
  }, [tab]);

  return (
    <div className="min-h-[200px]">
      {everMounted.products ? (
        <div className={tab === 'products' ? 'block' : 'hidden'} aria-hidden={tab !== 'products'}>
          <AdminOrdersProductsTab />
        </div>
      ) : null}
      {everMounted.workshops ? (
        <div className={tab === 'workshops' ? 'block' : 'hidden'} aria-hidden={tab !== 'workshops'}>
          <AdminOrdersWorkshopsTab />
        </div>
      ) : null}
      {everMounted.gifts ? (
        <div className={tab === 'gifts' ? 'block' : 'hidden'} aria-hidden={tab !== 'gifts'}>
          <AdminOrdersGiftsTab />
        </div>
      ) : null}
    </div>
  );
}
