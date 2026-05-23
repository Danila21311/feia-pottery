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

## Первый запуск БД

1. После деплоя миграции применятся автоматически (`npm run db:migrate` в `Dockerfile`).
2. Seed-данные — в `db/migrations/002_seed_data.sql` (товары, мастер-классы, тестовый admin при необходимости).
3. Для production создайте admin-пользователя через регистрацию и назначьте роль `admin` в таблице `user_roles`, либо добавьте пользователя SQL-скриптом.

## После деплоя

- При смене домена обновите `NEXT_PUBLIC_APP_URL` и пересоберите сервис.
- После изменения `DATABASE_URL` или SQL-миграций — redeploy (миграции идемпотентны через `schema_migrations`).
