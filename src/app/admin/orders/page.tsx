'use client';

import { Suspense } from 'react';
import { AdminOrdersTabPanels } from '@/views/Admin/AdminOrdersTabPanels';

function OrdersTabFallback() {
  return (
    <div className="flex justify-center py-16" aria-busy>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground/30" />
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<OrdersTabFallback />}>
      <AdminOrdersTabPanels />
    </Suspense>
  );
}
