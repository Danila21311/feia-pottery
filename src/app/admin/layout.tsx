'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminLayout } from '@/components/Admin/AdminLayout';

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}
