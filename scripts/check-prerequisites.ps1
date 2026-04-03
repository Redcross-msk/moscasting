# Проверка: Node.js и npm доступны в PATH.
Set-StrictMode -Version Latest
$ErrorActionPreference = "Continue"
$ok = $true

Write-Host "=== МОСКАСТИНГ: проверка окружения (без Docker) ===" -ForegroundColor Cyan

try {
    $nodeV = node -v 2>&1
    if ($LASTEXITCODE -ne 0 -or $nodeV -match "error|не распознано|not recognized") { throw "node failed" }
    Write-Host "[OK] Node.js: $nodeV" -ForegroundColor Green
} catch {
    Write-Host "[!] Node.js не найден. Установите LTS с https://nodejs.org/ (галка Add to PATH)." -ForegroundColor Red
    $ok = $false
}

try {
    $npmV = npm -v 2>&1
    if ($LASTEXITCODE -ne 0) { throw "npm failed" }
    Write-Host "[OK] npm: $npmV" -ForegroundColor Green
} catch {
    Write-Host "[!] npm не найден." -ForegroundColor Red
    $ok = $false
}

Write-Host ""
Write-Host "PostgreSQL проверяется только при наличии psql в PATH (необязательно)." -ForegroundColor Gray
$psql = Get-Command psql -ErrorAction SilentlyContinue
if ($psql) {
    Write-Host "[i] psql найден: $($psql.Source)" -ForegroundColor Gray
} else {
    Write-Host "[i] psql не в PATH — это нормально. Главное, чтобы служба PostgreSQL работала и DATABASE_URL в .env верный." -ForegroundColor Gray
}

Write-Host ""
if (-not $ok) {
    Write-Host "Исправьте ошибки и запустите скрипт снова." -ForegroundColor Yellow
    exit 1
}

Write-Host "Дальше: создайте БД (см. docs\SETUP-WINDOWS-NO-DOCKER.md), скопируйте .env.example в .env, затем:" -ForegroundColor Cyan
Write-Host "  npm install" -ForegroundColor White
Write-Host "  npx prisma generate" -ForegroundColor White
Write-Host "  npx prisma migrate dev" -ForegroundColor White
Write-Host "  npm run db:seed" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
exit 0
