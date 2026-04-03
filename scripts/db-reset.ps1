# Сброс БД и повторное применение миграций + seed (ОПАСНО для prod).
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")
npx prisma migrate reset --force
