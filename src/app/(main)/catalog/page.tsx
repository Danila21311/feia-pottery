import { Suspense } from 'react';
import Catalog from '@/views/Catalog';

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center"><p className="text-muted-foreground">Загрузка каталога...</p></div>}>
      <Catalog />
    </Suspense>
  );
}
