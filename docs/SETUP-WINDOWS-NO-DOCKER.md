# Запуск МОСКАСТИНГ на Windows **без Docker**

## Почему «что-то всё равно нужно скачать»

Сайт на Next.js — это программа на **JavaScript**. Её запускает **Node.js** (или сервер хостинга, куда вы зальёте билд). **База данных** (PostgreSQL) хранит пользователей и кастинги. Без этих частей проект не «включится» — как без бензина машина.

**Docker** мы убрали как *лишнюю* оболочку: он сам тянет образы и часто тяжелее для новичка. Но **ноль скачиваний** на свой ПК при локальной разработке нереалистичен: минимум — **один установщик Node.js**.

---

## Рекомендуемый вариант для переноса в Яндекс.Облако

Чтобы потом **просто перенести** проект в YC (Managed PostgreSQL), на разработке нужен **тот же движок — PostgreSQL**, без привязки к Supabase/Neon и их панелям.

**Делайте так (бесплатно, 100% совместимо с YC):**

1. **Node.js LTS** на Windows — обязателен для Next.js.  
2. **PostgreSQL** на Windows (официальный установщик EDB) — бесплатно, это обычный Postgres.

Перенос в Яндекс.Облако позже: поднимаете **Managed Service for PostgreSQL**, меняете `DATABASE_URL` в `.env` (и при необходимости SSL), выполняете `npx prisma migrate deploy` и/или переносите данные через `pg_dump` / restore. Схема и миграции Prisma остаются теми же.

---

## Альтернатива (не для вашего сценария с YC)

Облачный Postgres (Neon и т.п.) — только если **специально** не готовы ставить Postgres локально; для цели «как в YC» это хуже как референс. Supabase — отдельный продукт с своей экосистемой; для чистого Postgres+Prisma он не нужен.

---

## Шаг 1. Установить Node.js

1. Откройте: https://nodejs.org/  
2. Скачайте **LTS** (рекомендуется **20.x**).  
3. Запустите установщик, оставьте галку **«Add to PATH»**.  
4. Закройте все окна PowerShell и откройте **новое**.  
5. Проверка:

```powershell
node -v
npm -v
```

Должны отобразиться версии (например `v20.x.x` и `10.x.x`). Если снова «не распознано» — перезагрузите ПК.

---

## Шаг 2. Установить PostgreSQL

1. Откройте: https://www.postgresql.org/download/windows/  
2. Используйте установщик **EDB** (кнопка «Download the installer»).  
3. В мастере запомните:
   - **порт** (по умолчанию **5432**);
   - **пароль суперпользователя** `postgres` — он понадобится для `DATABASE_URL`.  
4. Дождитесь окончания установки. Служба **postgresql-x64-…** должна быть запущена (Службы Windows).

---

## Шаг 3. Создать базу и пользователя

Откройте **SQL Shell (psql)** из меню «Пуск» (ищите `SQL Shell` / `psql`) или **pgAdmin** → Query Tool.

Подключитесь к серверу `localhost`, пользователь `postgres`, порт `5432`, пароль тот, что задали при установке.

Выполните по очереди:

```sql
CREATE USER moscasting WITH PASSWORD 'moscasting';
CREATE DATABASE moscasting OWNER moscasting;
GRANT ALL PRIVILEGES ON DATABASE moscasting TO moscasting;
```

Если хотите **своё** имя/пароль — замените в SQL и **точно так же** пропишите в `.env` в `DATABASE_URL`.

Для схемы `public` и пользователя `moscasting` строка подключения будет:

```text
postgresql://moscasting:moscasting@localhost:5432/moscasting?schema=public
```

---

## Шаг 4. Проект и файл `.env`

В PowerShell:

```powershell
cd C:\Users\firman\Desktop\МОСКАСТИНГ
Copy-Item .env.example .env -Force
```

Откройте `.env` в редакторе:

- **`DATABASE_URL`** — как в примере выше (или с вашим паролем `postgres`, если решите ходить под суперпользователем — не рекомендуется для прод, для локалки можно).  
- **`AUTH_SECRET`** — для локальной разработки можно оставить длинную строку из `.env.example` или сгенерировать:

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

Вставьте результат в кавычках в `AUTH_SECRET=`.

- **`AUTH_URL`** — `http://localhost:3000` (как в примере).

---

## Шаг 5. Зависимости и Prisma

В той же папке проекта:

```powershell
cd C:\Users\firman\Desktop\МОСКАСТИНГ
npm install
npx prisma generate
npx prisma migrate dev
```

На первом `migrate dev` Prisma может спросить имя миграции — можно ввести `init` или нажать Enter.

Если ошибка **«Can’t reach database»** — PostgreSQL не запущен или неверный `DATABASE_URL` (пароль, порт, имя БД).

---

## Шаг 6. Демо-данные (рекомендуется)

```powershell
npm run db:seed
```

Входы (пароль везде **`password123`**):

| Email | Роль |
|-------|------|
| `actor@moscasting.local` | Актёр |
| `producer@moscasting.local` | Продюсер |
| `admin@moscasting.local` | Админ |

---

## Шаг 7. Запуск сайта

```powershell
npm run dev
```

Откройте браузер: **http://localhost:3000**

Остановить сервер: в окне PowerShell **Ctrl+C**.

---

## Автоматическая проверка (опционально)

Из папки проекта:

```powershell
.\scripts\check-prerequisites.ps1
.\scripts\setup-local-no-docker.ps1
```

Второй скрипт делает `npm install` и `prisma generate`. Миграции и seed всё равно выполните вручную (шаги 5–6), когда БД уже создана.

---

## Частые проблемы

| Проблема | Что сделать |
|----------|-------------|
| `node` не найден | Переустановить Node с «Add to PATH», новый PowerShell, при необходимости перезагрузка. |
| Ошибка подключения к БД | Проверить службу PostgreSQL, порт 5432, логин/пароль в `DATABASE_URL`. |
| Порт 5432 занят | В `DATABASE_URL` указать другой порт или освободить 5432. |
| Ошибки миграций | `npx prisma migrate reset` (удалит данные в БД) → снова `migrate dev` → `npm run db:seed`. |
| `npm warn tar TAR_ENTRY_ERROR ENOENT` / долгий `npm install` | См. блок ниже. |

### `TAR_ENTRY_ERROR ENOENT` и медленная установка npm (Windows)

Частые причины: **слишком длинный путь** (лимит 260 символов), **кириллица в пути** (`...\МОСКАСТИНГ\...`), **антивирус** цепляет файлы при распаковке, **битая** папка `node_modules`.

**1) Надёжнее всего — перенести проект в короткий путь только из латиницы**, например:

`C:\dev\moscasting`

Скопируйте всю папку проекта туда (вместе с `.env`), затем в **cmd**:

```cmd
cd /d C:\dev\moscasting
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul
npm cache clean --force
npm install
```

**2)** На время установки **приостановите проверку в реальном времени** для папки проекта в Защитнике Windows (или добавьте исключение).

**3)** Включите **длинные пути** в Windows: «Параметры» → «Конфиденциальность и защита» → «Для разработчиков» → **Режим разработчика** (или политика «Включить длинные пути Win32»).

**4)** Установку делайте из **cmd**, не из PowerShell, если у вас были проблемы с политикой скриптов.

После успешного `npm install` снова: `npx prisma generate`, `npx prisma migrate dev`, и т.д.

---

После этого можно спокойно дорабатывать проект в Cursor без Docker.
