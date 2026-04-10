# Production-oriented image; для локальной разработки удобнее Postgres из compose + `npm run dev` на хосте.
#
# По умолчанию — public.ecr.aws (зеркало docker.io/library/node). Если с сервера docker.io недоступен (TLS timeout),
# сборка всё равно тянет тот же образ Node.
# Вернуть прямой Hub: docker compose build --build-arg NODE_IMAGE=node:20-bookworm-slim
# Другое зеркало: --build-arg NODE_IMAGE=mirror.gcr.io/library/node:20-bookworm-slim
ARG NODE_IMAGE=public.ecr.aws/docker/library/node:20-bookworm-slim
FROM ${NODE_IMAGE} AS deps
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl libheif1 libde265-0 && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* ./
# postinstall → prisma generate; схема должна быть в образе до npm install
COPY prisma ./prisma
RUN npm install

FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Next.js build поднимает NODE_ENV=production; env.ts требует валидные переменные на этапе импорта.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
ENV AUTH_SECRET="build-time-secret-must-be-32chars-minimum!!"
RUN npx prisma generate
RUN npm run build

FROM ${NODE_IMAGE} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN apt-get update -y && apt-get install -y openssl libheif1 libde265-0 && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
RUN mkdir -p /app/public/uploads
COPY --from=builder /app/next.config.ts ./
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
