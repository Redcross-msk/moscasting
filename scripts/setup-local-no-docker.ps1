# Установка npm-зависимостей и генерация Prisma Client (PostgreSQL должна быть уже настроена в .env).
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $root

Write-Host "Папка проекта: $root" -ForegroundColor Cyan

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Ошибка: node не найден. Установите Node.js LTS: https://nodejs.org/" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path (Join-Path $root ".env"))) {
    Write-Host "Файл .env не найден. Копирую из .env.example ..." -ForegroundColor Yellow
    Copy-Item (Join-Path $root ".env.example") (Join-Path $root ".env")
    Write-Host "Отредактируйте .env (DATABASE_URL, AUTH_SECRET) и снова запустите этот скрипт или выполните команды вручную." -ForegroundColor Yellow
}

Write-Host "npm install ..." -ForegroundColor Cyan
npm install

Write-Host "npx prisma generate ..." -ForegroundColor Cyan
npx prisma generate

Write-Host ""
Write-Host "Готово. Следующие шаги (вручную):" -ForegroundColor Green
Write-Host "  1) Убедитесь, что PostgreSQL запущен и DATABASE_URL в .env верный." -ForegroundColor White
Write-Host "  2) npx prisma migrate dev" -ForegroundColor White
Write-Host "  3) npm run db:seed" -ForegroundColor White
Write-Host "  4) npm run dev  ->  http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Подробно: docs\SETUP-WINDOWS-NO-DOCKER.md" -ForegroundColor Gray
