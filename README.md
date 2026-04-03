# МОСКАСТИНГ

Веб-платформа кастингов по логике взаимодействия, близкой к HH.ru: **кастинг → отклик (Application) → чат по отклику → «Кастинг пройден» → взаимные отзывы (только после подтверждения)**.

## Запуск на Windows без Docker (пошагово)

Полная инструкция: **[docs/SETUP-WINDOWS-NO-DOCKER.md](docs/SETUP-WINDOWS-NO-DOCKER.md)** — без Docker.

**Для переноса в Яндекс.Облако (рекомендуется):** **Node.js + PostgreSQL на своём ПК** — тот же Postgres, что в YC Managed PostgreSQL; потом только смена `DATABASE_URL` и миграции.

Кратко:

1. Установить **Node.js LTS** и **PostgreSQL** (ссылки в документе).  
2. Создать БД `moscasting` и пользователя (SQL в документе).  
3. `Copy-Item .env.example .env`, проверить `DATABASE_URL`.  
4. `npm install` → `npx prisma generate` → `npx prisma migrate dev` → `npm run db:seed` → `npm run dev`.  
5. Браузер: http://localhost:3000

Проверка окружения: `.\scripts\check-prerequisites.ps1` · подготовка зависимостей: `.\scripts\setup-local-no-docker.ps1`

## Стек

- **Next.js 15** (App Router), **TypeScript**, **Tailwind CSS**, компоненты в стиле **shadcn/ui** (Radix + CVA)
- **PostgreSQL** + **Prisma** (миграции, UUID, индексы)
- **Auth.js / next-auth v5** — credentials, **JWT**-сессии
- **Zod** (в т.ч. валидация окружения на сервере)
- **PowerShell**-скрипты для Windows; **Docker** опционален (см. низ README)
- Абстракция **S3-совместимого** хранилища (`src/server/storage/`)

## Структура проекта

```
src/app/           — маршруты App Router (публичные, actor/, producer/, admin/)
src/components/    — UI и общие блоки
src/features/      — server actions по доменам (auth, castings, applications, …)
src/lib/           — утилиты, env (server-only), db
src/server/        — сервисы и хранилище (слой над Prisma)
prisma/            — schema, migrations, seed
scripts/           — *.ps1 для локальной разработки
```

**Почему так:** `features` держит границы use-case’ов, `server/services` — переиспользуемая бизнес-логика без привязки к UI, что упрощает вынесение API или воркеров позже.

## Быстрый старт (локально)

Требования: **Node.js 20+**, **npm**, **PostgreSQL 16+** на машине или в облаке. Подробно для Windows: [docs/SETUP-WINDOWS-NO-DOCKER.md](docs/SETUP-WINDOWS-NO-DOCKER.md).

1. Скопируйте окружение:

   ```powershell
   Copy-Item .env.example .env
   ```

   Заполните `DATABASE_URL` и в production — `AUTH_SECRET` (≥ 32 символов). В development допускается значение по умолчанию из `src/lib/env.ts`.

2. Установите зависимости и примените миграции:

   ```powershell
   npm install
   .\scripts\prisma-generate.ps1
   .\scripts\db-migrate.ps1
   ```

3. (Опционально) Загрузите демо-данные:

   ```powershell
   .\scripts\seed.ps1
   ```

   Учётные записи: `actor@moscasting.local`, `producer@moscasting.local`, `admin@moscasting.local`, пароль **`password123`**.

4. Запуск:

   ```powershell
   .\scripts\dev.ps1
   ```

   Откройте [http://localhost:3000](http://localhost:3000).

## Docker (опционально)

Если установлены Docker Desktop и `docker` в PATH, можно поднять стек через `.\scripts\docker-up.ps1`. Для повседневной разработки без Docker см. [docs/SETUP-WINDOWS-NO-DOCKER.md](docs/SETUP-WINDOWS-NO-DOCKER.md).

## Переменные окружения

См. `.env.example`. Ключевые:

| Переменная | Назначение |
|------------|------------|
| `DATABASE_URL` | PostgreSQL |
| `AUTH_SECRET` | Подпись JWT (в prod обязателен, длинный) |
| `AUTH_URL` | Базовый URL приложения (для Auth.js в prod) |
| `NEXT_PUBLIC_*` | Имя приложения, slug города по умолчанию |
| `S3_*` | Object Storage (YC S3, MinIO) — подключение реализации позже |

## Дорожная карта — этап 2

- Платежи, платные размещения, верификация компаний и актёров
- Realtime-чат, вложения в сообщениях, push/email/Telegram
- Очереди задач, расширенная аналитика и BI
- Загрузка медиа в Object Storage (YC), CDN
- Документооборот, курсы, портфолио-сервисы

## Деплой в Яндекс.Облако

1. **Managed Service for PostgreSQL** — выдать `DATABASE_URL`, включить SSL при необходимости.
2. **Object Storage** (S3 API) — вынести ключи в Lockbox / переменные сервиса, реализовать `ObjectStorage` на `@aws-sdk/client-s3`.
3. **Контейнеры**: Container Registry + Serverless Container или ВМ с Docker; перед стартом `prisma migrate deploy`.
4. Секреты не хранить в образе; `AUTH_SECRET` и БД — из секрет-хранилища.
5. Горизонтальное масштабирование: JWT-сессии stateless, общая БД, общий S3.

## Скрипты PowerShell

| Скрипт | Действие |
|--------|----------|
| `scripts/dev.ps1` | `next dev` |
| `scripts/db-migrate.ps1` | `prisma migrate dev` (параметр `-Mode deploy` → `migrate deploy`) |
| `scripts/db-reset.ps1` | Полный сброс БД + миграции + seed |
| `scripts/seed.ps1` | Только seed |
| `scripts/build.ps1` / `start.ps1` | Production build / start |
| `scripts/check-prerequisites.ps1` | Node/npm в PATH |
| `scripts/setup-local-no-docker.ps1` | `npm install` + `prisma generate` |
| `scripts/docker-up.ps1` / `docker-down.ps1` | Compose (если Docker установлен) |
| `scripts/lint.ps1` | ESLint |
| `scripts/prisma-generate.ps1` | Генерация клиента |

---

## Итоговая фиксация (по ТЗ)

### 1. Принятые архитектурные решения

- Разделение **User** / **ActorProfile** / **ProducerProfile**; роли через enum `UserRole` с запасом на новые значения.
- **Application** как центр связи актёр–кастинг–продюсер; **Chat** с уникальным `applicationId`.
- **Review** как source of truth для рейтинга; агрегаты на профилях пересчитываются при одобрении/скрытии отзыва админом.
- **MediaFile** универсальная таблица с FK на профиль/кастинг (ровно один владелец — контроль в сервисе).
- **City** + slug; MVP — Москва через seed и `NEXT_PUBLIC_DEFAULT_CITY_SLUG`.
- Модерация: статусы на сущностях + **Report** с полиморфной целью (`targetType` + `targetId`).
- Лёгкая аналитика: **CastingView**, счётчики на `Casting`, заготовка **Notification**.

### 2. Компромиссы MVP

- Загрузка фото/видео в UI не реализована — есть модель и абстракция хранилища.
- Расширенное редактирование анкеты актёра — частично (ключевые поля + текстовые блоки); полный CRUD навыков/медиа — следующий шаг.
- Чат без WebSocket (обновление через `router.refresh()`).
- Отзывы создаются со статусом **PENDING**; рейтинг на профиле обновляется после **одобрения** в админке (прозрачная модерация).

### 3. Вынести на этап 2

- Реальная загрузка в S3, лимиты 10 фото / видеовизитка, превью.
- Уведомления, очереди, realtime, автоматическая модерация контента.
- Тесты (unit/e2e), CI, наблюдаемость (метрики, логи, трейсы).

### 4. Архитектурные риски

- Рост N+1 запросов в списках без пагинации и `select`.
- Жёсткая связка бизнес-правил с server actions — при росте команды может понадобиться явный HTTP API.
- JWT без ротации и без серверного отзыва сессий — для высоких требований безопасности добавить refresh/stored sessions.

### 5. План масштабирования

- Кэш каталогов (Redis), read-replicas PostgreSQL, вынос тяжёлых задач в очередь (YC YMQ / Redis).
- Горизонтальное масштабирование stateless-инстансов Next.js за балансировщиком.

### 6. Мониторинг в проде

- Доступность БД, ошибки 5xx, latency p95, размер очередей миграций, failed jobs, использование Object Storage, rate limit на auth.

### 7. Приоритетные улучшения после MVP

1. Загрузка и модерация медиа в S3.  
2. Пагинация и фильтры каталогов (навыки, возраст из `birthDate`).  
3. E2E сценарий: отклик → чат → cast_passed → отзывы.  
4. Email-верификация и восстановление пароля.

---

Лицензия и юридические условия не заданы — добавьте при публикации.
