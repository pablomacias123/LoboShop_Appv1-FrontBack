@echo off
echo Limpiando cache de Vite...

if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo Caché de Vite eliminado
) else (
    echo No hay caché para limpiar
)

echo.
echo Ahora ejecuta: npm run dev
pause

