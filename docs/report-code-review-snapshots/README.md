# Снимки для отчёта (до / после ревью)

В каталоге лежат **резервные копии** рабочего кода:

- `StoreContext.tsx.ORIGINAL` — восстановить → `src/context/StoreContext.tsx`
- `orders-route.ts.ORIGINAL` — восстановить → `src/app/api/orders/route.ts`

Сейчас в проекте временно включены **наивные** версии этих файлов (для скриншотов «до ревью»).

## Как вернуть всё как было

**Вариант А — копирование:**

```bash
copy docs\report-code-review-snapshots\StoreContext.tsx.ORIGINAL src\context\StoreContext.tsx
copy docs\report-code-review-snapshots\orders-route.ts.ORIGINAL src\app\api\orders\route.ts
```

**Вариант Б — из Cursor:** открыть `.ORIGINAL`, скопировать содержимое и вставить обратно в целевой файл.

После восстановления можно удалить наивные комментарии в начале файлов (если остались).
