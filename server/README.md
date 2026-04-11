# Feia Pottery Workshop - Backend Server

Express + Sequelize backend для административной панели.

## Быстрый старт

1. Установите зависимости:
```bash
cd server
npm install
```

2. Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

3. Инициализируйте базу данных:
```bash
npm run db:init
```

Это создаст базу данных SQLite с:
- Администратором (admin@feia.ru / admin123)
- Товарами из каталога
- Мастер-классами

4. Запустите сервер:
```bash
npm run dev
```

Сервер будет доступен на http://localhost:3001

## API Endpoints

### Аутентификация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Текущий пользователь
- `POST /api/auth/logout` - Выход

### Товары
- `GET /api/products` - Список товаров (публичный)
- `GET /api/products/:id` - Один товар (публичный)
- `POST /api/products` - Создать товар (админ)
- `PUT /api/products/:id` - Обновить товар (админ)
- `DELETE /api/products/:id` - Удалить товар (админ)

### Мастер-классы
- `GET /api/workshops` - Список мастер-классов (публичный)
- `GET /api/workshops/:id` - Один мастер-класс (публичный)
- `POST /api/workshops` - Создать МК (админ)
- `PUT /api/workshops/:id` - Обновить МК (админ)
- `DELETE /api/workshops/:id` - Удалить МК (админ)

### Загрузка файлов
- `POST /api/upload/image` - Загрузить изображение (админ)
- `POST /api/upload/images` - Загрузить несколько изображений (админ)

## Структура

```
server/
├── src/
│   ├── index.js          # Точка входа
│   ├── models/           # Sequelize модели
│   ├── routes/           # Express роуты
│   ├── middleware/       # Auth middleware
│   └── scripts/          # Скрипты инициализации
├── uploads/              # Загруженные файлы
├── database.sqlite       # База данных
└── .env                  # Конфигурация
```
