-- Отзывы без текста: только звёзды (пустая строка по умолчанию).
ALTER TABLE "Review" ALTER COLUMN "text" SET DEFAULT '';
