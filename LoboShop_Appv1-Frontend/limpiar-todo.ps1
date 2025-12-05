# Script de LIMPIEZA TOTAL - Último Recurso
Write-Host "🧹 LIMPIEZA TOTAL DE LOBOSHOP" -ForegroundColor Red
Write-Host "=================================" -ForegroundColor Red
Write-Host ""
Write-Host "⚠️  Este script eliminará node_modules y reinstalará todo" -ForegroundColor Yellow
Write-Host ""

# 1. Detener procesos
Write-Host "1️⃣ Deteniendo procesos de Node..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# 2. Eliminar node_modules
Write-Host "2️⃣ Eliminando node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
    Write-Host "   ✓ node_modules eliminado" -ForegroundColor Green
}

# 3. Eliminar caché de Vite
Write-Host "3️⃣ Eliminando caché de Vite..." -ForegroundColor Yellow
if (Test-Path "node_modules\.vite") {
    Remove-Item -Recurse -Force "node_modules\.vite" -ErrorAction SilentlyContinue
}
Write-Host "   ✓ Caché de Vite eliminado" -ForegroundColor Green

# 4. Eliminar dist
Write-Host "4️⃣ Eliminando dist..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist" -ErrorAction SilentlyContinue
    Write-Host "   ✓ dist eliminado" -ForegroundColor Green
}

# 5. Eliminar package-lock.json
Write-Host "5️⃣ Eliminando package-lock.json..." -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue
    Write-Host "   ✓ package-lock.json eliminado" -ForegroundColor Green
}

# 6. Limpiar caché de npm
Write-Host "6️⃣ Limpiando caché de npm..." -ForegroundColor Yellow
npm cache clean --force 2>$null
Write-Host "   ✓ Caché de npm limpiado" -ForegroundColor Green

Write-Host ""
Write-Host "✅ LIMPIEZA COMPLETA FINALIZADA" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PRÓXIMOS PASOS:" -ForegroundColor Cyan
Write-Host "   1. Ejecuta: npm install" -ForegroundColor White
Write-Host "   2. Ejecuta: npm run dev" -ForegroundColor White
Write-Host "   3. Abre en MODO INCÓGNITO (Ctrl+Shift+N)" -ForegroundColor White
Write-Host ""

