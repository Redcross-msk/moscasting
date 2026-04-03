# Запуск Next.js в режиме разработки (Postgres должен быть доступен по DATABASE_URL).
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")
npm run dev
