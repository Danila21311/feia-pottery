'use client';

import { useEffect, useMemo, useState } from 'react';

export const ADMIN_TABLE_PAGE_SIZES = [10, 15, 25, 50] as const;

/**
 * Клиентская пагинация отфильтрованного списка. Сброс на 1-ю страницу при смене filterKey или pageSize.
 */
export function useAdminTablePagination<T>(items: T[], filterKey: string) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  useEffect(() => {
    setPage(1);
  }, [filterKey, pageSize]);

  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  return {
    page: safePage,
    setPage,
    pageSize,
    setPageSize,
    totalCount,
    totalPages,
    pageItems,
  };
}
