# Фея Crafts Studio

Интернет-магазин авторской керамики и мастер-классов с менеджерской обработкой заявок.

## Возможности

- Каталог товаров и карточки изделий.
- Оформление заказа с расширенными данными клиента, доставки и получателя.
- Запись на мастер-классы отдельным потоком.
- Заявки на подарочные сертификаты.
- Профиль пользователя с историей заявок.
- Менеджерская панель с фильтрацией, пагинацией и экспортом CSV.
- Форма обратной связи с сохранением в БД и уведомлением в Telegram (если настроено).

## Технологический стек

- **Frontend:** Next.js 16 (App Router), React 18, TypeScript.
- **UI:** shadcn/ui, Radix UI, Tailwind CSS.
- **Backend/API:** Next.js Route Handlers (`src/app/api/**`).
- **База данных:** PostgreSQL (Railway plugin), доступ через `pg`.
- **Auth:** NextAuth (Credentials + httpOnly cookie).
- **Интеграции:** DaData, Telegram Bot API, Cloudinary.
- **Деплой:** Docker + Railway (`Dockerfile`, `railway.toml`, `RAILWAY.md`).

## Быстрый старт (локально)

Требования:

- Node.js 22+
- npm 10+
- PostgreSQL 15+ (локально или Railway public URL)

```bash
npm install
cp .env.example .env.local   # заполните переменные
npm run db:migrate           # применить схему и seed
npm run dev
```

Приложение: `http://localhost:3000`.

## Переменные окружения

```env
# PostgreSQL (обязательно)
DATABASE_URL=postgres://user:pass@localhost:5432/feia

# Auth.js (обязательно, минимум 32 символа)
AUTH_SECRET=your-long-random-secret

# Публичный URL приложения
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cloudinary (загрузка изображений в админке)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset

# DaData (подсказки адресов)
DADATA_API_KEY=your-dadata-api-key
DADATA_SECRET_KEY=your-dadata-secret-key

# Telegram (уведомления менеджеру)
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-telegram-chat-id
```

## Архитектура (кратко)

- `src/app` — маршруты App Router и серверные API (`/api`).
- `src/views` — бизнес-экраны.
- `src/lib/repositories` — запросы к PostgreSQL.
- `src/lib/db.ts` — пул подключений `pg`.
- `src/auth.ts` — конфигурация NextAuth.
- `db/migrations` — SQL-миграции схемы.

## Миграции БД

```bash
npm run db:migrate
```

Файлы в `db/migrations/` применяются по порядку и фиксируются в `schema_migrations`.

При деплое на Railway миграции запускаются автоматически перед стартом (`Dockerfile` → `node scripts/migrate.mjs`).

## Импорт данных из Supabase

См. `scripts/migrate-from-supabase.mjs` и `npm run db:import-supabase`.

Пароли пользователей Supabase Auth **не переносятся** — после cutover нужен сброс пароля или временный `DEFAULT_PASSWORD` при импорте.

## API (основные группы)

- Auth: `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`, `/api/auth/me`.
- Публичные: `/api/products`, `/api/workshops`.
- Пользовательские: `/api/orders`, `/api/workshop-bookings`, `/api/gift-certificate-orders`, `/api/feedback`.
- Профиль: `/api/profile/*`.
- Админ: `/api/admin/*`, CRUD через `/api/products`, `/api/workshops`.
- Загрузка: `/api/upload` (Cloudinary, admin).
- Интеграции: `/api/dadata/suggest`, `/api/manager/notify`.

## Деплой

- Docker/standalone: `Dockerfile`.
- Railway: `railway.toml`, `RAILWAY.md`.
- Добавьте PostgreSQL plugin в тот же Railway project и привяжите `DATABASE_URL` к сервису Next.js.
