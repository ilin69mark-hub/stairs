# Stairs — Лестницы на заказ

Платформа для проектирования, расчёта стоимости и заказа деревянных лестниц с 3D-конфигуратором.

## 🛠️ Стек

### Frontend
- **Next.js 14** — React фреймворк с App Router
- **TypeScript** — типизация
- **Tailwind CSS** — стилизация
- **Zustand** — управление состоянием
- **Framer Motion** — анимации
- **React Three Fiber** — 3D-рендеринг
- **React Hook Form + Zod** — валидация форм

### Backend
- **Go** — REST API
- **Chi** — маршрутизация
- **PostgreSQL** — база данных
- **Redis** — кеширование
- **MinIO** — объектное хранилище
- **Asynq** — очередь задач

### DevOps
- **Docker** — контейнеризация
- **GitHub Actions** — CI/CD
- **Vercel** — деплой фронтенда
- **Caddy** — reverse proxy

## 🚀 Быстрый старт

### Требования
- Docker & Docker Compose
- Node.js 20+
- Go 1.22+

### Локальная разработка

```bash
# Клонирование репозитория
git clone https://github.com/yourorg/stairs.git
cd stairs

# Запуск инфраструктуры
docker compose up -d

# Запуск фронтенда
cd frontend
npm install
npm run dev
```

Откройте http://localhost:3000

## 📁 Структура проекта

```
stairs/
├── frontend/                 # Next.js приложение
│   ├── src/
│   │   ├── app/             # App Router страницы
│   │   ├── components/       # React компоненты
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # API клиент
│   │   ├── stores/          # Zustand сторы
│   │   └── types/           # TypeScript типы
│   └── package.json
│
├── backend/                  # Go API
│   ├── cmd/server/          # Точка входа
│   ├── internal/
│   │   ├── api/             # HTTP handlers
│   │   ├── calculator/       # Бизнес-логика
│   │   ├── config/          # Конфигурация
│   │   ├── models/          # Модели данных
│   │   ├── storage/          # Подключения к БД
│   │   └── tasks/           # Asynq задачи
│   ├── migrations/          # SQL миграции
│   ├── go.mod
│   └── Dockerfile.prod
│
├── docker-compose.yml       # Локальная разработка
├── docker-compose.prod.yml   # Продакшен
├── docker-compose.strapi.yml # CMS
├── Caddyfile                # Reverse proxy
└── README.md
```

## 🔧 API Endpoints

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/api/v1/calculate` | POST | Расчёт стоимости лестницы |
| `/api/v1/catalog` | GET | Каталог (типы, материалы, ограждения) |
| `/api/v1/orders` | POST | Создание заказа |
| `/api/v1/contacts` | POST | Отправка контактной формы |
| `/api/v1/materials` | GET | Список материалов |
| `/api/cms/*` | * | Прокси к Strapi CMS |

## 🏗️ Продакшен

### Docker (Backend + Infrastructure)
```bash
# Сборка и запуск
docker compose -f docker-compose.prod.yml up -d --build
```

### Frontend (Vercel)
Настраивается через GitHub Actions при пуше в main.

### HTTPS
Автоматически настраивается через Caddy.

## 🔐 Переменные окружения

### Backend (.env)
```env
PORT=8080
DATABASE_URL=postgres://stairs:secret@localhost:5432/stairs?sslmode=disable
REDIS_URL=localhost:6379
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## 📝 License

MIT License — см. LICENSE файл.

## 📧 Контакты

- Email: info@stairs.local
- Телефон: +7 (999) 123-45-67