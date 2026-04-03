param(
    [ValidateSet("dev", "deploy")]
    [string] $Mode = "dev"
)
# Применить Prisma-миграции (dev: migrate dev, prod: migrate deploy).
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")
if ($Mode -eq "deploy") {
    npx prisma migrate deploy
} else {
    npx prisma migrate dev
}
