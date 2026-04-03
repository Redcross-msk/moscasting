import "server-only";

import { z } from "zod";

const isProd = process.env.NODE_ENV === "production";

const server = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z
    .string()
    .min(1)
    .refine((v) => v.startsWith("postgresql://") || v.startsWith("postgres://"), "Ожидается PostgreSQL URL"),
  AUTH_SECRET: isProd
    ? z.string().min(32, "В production задайте AUTH_SECRET ≥ 32 символов")
    : z.string().min(16).optional().default("dev-only-change-me-32chars!!"),
  AUTH_URL: z.string().url().optional(),
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_PUBLIC_BASE_URL: z.string().optional(),
});

const client = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default("МОСКАСТИНГ"),
  NEXT_PUBLIC_DEFAULT_CITY_SLUG: z.string().default("moscow"),
});

const merged = server.merge(client);
export type Env = z.infer<typeof merged>;

function createEnv(): Env {
  const parsed = merged.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_URL: process.env.AUTH_URL,
    S3_ENDPOINT: process.env.S3_ENDPOINT,
    S3_REGION: process.env.S3_REGION,
    S3_BUCKET: process.env.S3_BUCKET,
    S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
    S3_SECRET_KEY: process.env.S3_SECRET_KEY,
    S3_PUBLIC_BASE_URL: process.env.S3_PUBLIC_BASE_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_DEFAULT_CITY_SLUG: process.env.NEXT_PUBLIC_DEFAULT_CITY_SLUG,
  });

  if (!parsed.success) {
    console.error("Invalid env:", parsed.error.flatten().fieldErrors);
    throw new Error("Некорректные переменные окружения — см. .env.example");
  }
  return parsed.data;
}

export const env = createEnv();
