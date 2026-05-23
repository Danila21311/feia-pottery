# Деплой на Railway

## Быстрый старт

1. Создайте проект на [Railway](https://railway.app) → **New Project** → **Deploy from GitHub**.
2. Добавьте **PostgreSQL** plugin в тот же project.
3. Подключите сервис приложения к переменной **`DATABASE_URL`** из PostgreSQL (Reference Variable).
4. Задайте остальные переменные (см. ниже).
5. Сборка идёт по **`Dockerfile`** (см. `railway.toml`). При старте контейнера выполняется `npm run db:migrate`, затем запускается Next.js.

## Переменные окружения

Обязательные:

| Переменная | Описание |
|------------|----------|
| `DATABASE_URL` | Internal URL PostgreSQL (из Railway plugin) |
| `AUTH_SECRET` | Секрет сессий NextAuth (≥ 32 символа) |

Рекомендуется:

| Переменная | Описание |
|------------|----------|
| `NEXT_PUBLIC_APP_URL` | Публичный URL сайта с `https://`, без слэша в конце |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Unsigned upload preset |
| `DADATA_API_KEY` / `DADATA_SECRET_KEY` | Подсказки адресов |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | Уведомления менеджеру |

Для локальной разработки с Railway Postgres используйте **public** connection string в `.env.local`.

## Порты

Контейнер слушает **`PORT`** (по умолчанию 3000). Railway подставляет свой `PORT` автоматически.

## Cutover с Supabase

1. Экспортируйте данные из Supabase (`pg_dump` public-схемы + CSV `auth.users`).
2. Разверните приложение с новой БД на Railway.
3. Импортируйте данные (`npm run db:import-supabase` или ручной SQL).
4. Создайте admin-пользователя или назначьте роль `admin` в `user_roles`.
5. Обновите `NEXT_PUBLIC_APP_URL`, удалите переменные `NEXT_PUBLIC_SUPABASE_*`.
6. Отключите Supabase project после проверки.

Пароли после миграции нужно сбросить — хэши Supabase Auth несовместимы с локальной таблицей `users`.

## После деплоя

- При смене домена обновите `NEXT_PUBLIC_APP_URL` и пересоберите сервис.
- После изменения `DATABASE_URL` или SQL-миграций — redeploy (миграции идемпотентны через `schema_migrations`).
