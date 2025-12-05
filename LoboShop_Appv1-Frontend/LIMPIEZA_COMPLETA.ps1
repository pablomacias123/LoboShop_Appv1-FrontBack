# Script de LIMPIEZA COMPLETA para LoboShop
# Ejecutar este script cuando nada más funciona

Write-Host "🧹 LIMPIEZA COMPLETA DE LOBOSHOP" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# 1. Detener procesos de Node
Write-Host "1️⃣ Deteniendo procesos de Node..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# 2. Limpiar caché de Vite
Write-Host "2️⃣ Limpiando caché de Vite..." -ForegroundColor Yellow
if (Test-Path "node_modules\.vite") {
    Remove-Item -Recurse -Force "node_modules\.vite" -ErrorAction SilentlyContinue
    Write-Host "   ✓ Caché de Vite eliminado" -ForegroundColor Green
} else {
    Write-Host "   ✓ No hay caché de Vite" -ForegroundColor Green
}

# 3. Limpiar dist
Write-Host "3️⃣ Limpiando carpeta dist..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist" -ErrorAction SilentlyContinue
    Write-Host "   ✓ Carpeta dist eliminada" -ForegroundColor Green
} else {
    Write-Host "   ✓ No hay carpeta dist" -ForegroundColor Green
}

# 4. Limpiar caché de npm
Write-Host "4️⃣ Limpiando caché de npm..." -ForegroundColor Yellow
npm cache clean --force 2>$null
Write-Host "   ✓ Caché de npm limpiado" -ForegroundColor Green

# 5. Limpiar Service Workers del navegador (instrucciones)
Write-Host ""
Write-Host "5️⃣ IMPORTANTE: Limpia el caché del navegador:" -ForegroundColor Yellow
Write-Host "   - Abre Chrome/Edge" -ForegroundColor White
Write-Host "   - Presiona Ctrl+Shift+Delete" -ForegroundColor White
Write-Host "   - Selecciona 'Todo el tiempo'" -ForegroundColor White
Write-Host "   - Marca 'Imágenes y archivos en caché'" -ForegroundColor White
Write-Host "   - Click en 'Borrar datos'" -ForegroundColor White
Write-Host "   - O mejor: Abre en MODO INCÓGNITO (Ctrl+Shift+N)" -ForegroundColor Cyan
Write-Host ""

# 6. Verificar node_modules
Write-Host "6️⃣ Verificando node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   ✓ node_modules existe" -ForegroundColor Green
    Write-Host ""
    Write-Host "   ¿Quieres eliminar y reinstalar node_modules? (S/N)" -ForegroundColor Yellow
    $reinstall = Read-Host
    if ($reinstall -eq "S" -or $reinstall -eq "s") {
        Write-Host "   Eliminando node_modules..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
        Remove-Item "package-lock.json" -ErrorAction SilentlyContinue
        Write-Host "   ✓ node_modules eliminado" -ForegroundColor Green
        Write-Host ""
        Write-Host "   Instalando dependencias..." -ForegroundColor Yellow
        npm install
        Write-Host "   ✓ Dependencias instaladas" -ForegroundColor Green
    }
} else {
    Write-Host "   ⚠️ node_modules no existe, ejecuta: npm install" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ LIMPIEZA COMPLETA FINALIZADA" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PRÓXIMOS PASOS:" -ForegroundColor Cyan
Write-Host "   1. Abre el navegador en MODO INCÓGNITO (Ctrl+Shift+N)" -ForegroundColor White
Write-Host "   2. Ejecuta: npm run dev" -ForegroundColor White
Write-Host "   3. Ve a: http://localhost:8100" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Si aún hay problemas, ejecuta este script de nuevo y elige 'S' para reinstalar node_modules" -ForegroundColor Yellow
Write-Host ""

