# Feia Crafts Studio

Интернет-магазин авторской керамики и мастер-классов.

## Стек

- **Frontend:** Next.js 16 (App Router), React 18, TypeScript
- **UI:** shadcn/ui, Tailwind CSS
- **Backend:** Supabase (Auth, PostgreSQL, Storage, RLS)
- **Оплата:** CloudPayments

## Запуск

```bash
npm install
npm run dev
```

Сервер запустится на `http://localhost:3000`.

## Переменные окружения

Создайте `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
