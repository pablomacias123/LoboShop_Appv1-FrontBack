# Script para limpiar caché de Vite en Windows PowerShell
Write-Host "🧹 Limpiando caché completo..." -ForegroundColor Yellow

# Limpiar caché de Vite
if (Test-Path "node_modules\.vite") {
    Remove-Item -Recurse -Force "node_modules\.vite" -ErrorAction SilentlyContinue
    Write-Host "✓ Caché de Vite eliminado" -ForegroundColor Green
} else {
    Write-Host "✓ No hay caché de Vite" -ForegroundColor Green
}

# Limpiar caché de npm
Write-Host "`n🧹 Limpiando caché de npm..." -ForegroundColor Yellow
npm cache clean --force 2>$null
Write-Host "✓ Caché de npm limpiado" -ForegroundColor Green

Write-Host "`n✅ Limpieza completada!" -ForegroundColor Green
Write-Host "`nAhora ejecuta: npm run dev" -ForegroundColor Cyan

