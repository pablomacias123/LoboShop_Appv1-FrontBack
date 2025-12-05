# Solución Error "Invalid Hook Call" - React Hooks

## Problema

Error: `Invalid hook call. Hooks can only be called inside of the body of a function component.`

Este error generalmente ocurre cuando hay múltiples copias de React en la aplicación.

## Soluciones Aplicadas

### 1. ✅ Resolución única de React en Vite
Se agregó configuración en `vite.config.ts` para forzar una sola copia de React:
```typescript
resolve: {
  dedupe: ['react', 'react-dom'],
},
optimizeDeps: {
  force: true,
}
```

### 2. ✅ Orden de importaciones corregido
Se corrigió el orden de importaciones en `App.tsx` para que React se importe primero.

### 3. ✅ Mejoras en AuthContext
- Se agregó manejo de errores en `useEffect`
- Se usó `useCallback` para `logout` para evitar recreaciones innecesarias

## Pasos para Solucionar

### Opción 1: Limpiar caché de Vite (Recomendado)

**Windows PowerShell (Más fácil):**
```powershell
# Detener el servidor (Ctrl+C)
# Luego ejecutar:
.\clean-cache.ps1
npm run dev
```

**Windows CMD:**
```cmd
# Detener el servidor (Ctrl+C)
# Luego ejecutar:
clean-cache.bat
npm run dev
```

**O manualmente en PowerShell:**
```powershell
Remove-Item -Recurse -Force node_modules\.vite
npm run dev
```

**Linux/Mac:**
```bash
rm -rf node_modules/.vite
npm run dev
```

### Opción 2: Reinstalar dependencias

```bash
# Detener el servidor (Ctrl+C)
rm -rf node_modules
npm install
npm run dev
```

### Opción 3: Usar el script nuevo

```bash
npm run dev:clean
```

## Verificación

Después de limpiar el caché:

1. **Recarga la página** (Ctrl+Shift+R)
2. **Abre la consola** (F12)
3. **Deberías ver:**
   - ✅ Sin errores de "Invalid hook call"
   - ✅ `[PWA] Modo desarrollo - Service Worker deshabilitado`
   - ✅ `[IndexedDB] Base de datos abierta correctamente`
   - ✅ La aplicación carga correctamente

## Si Persisten los Errores

1. **Cierra completamente el navegador**
2. **Abre una ventana de incógnito**
3. **Ve a `http://localhost:8100`**
4. Si funciona en incógnito, el problema es el caché del navegador

## Notas Técnicas

- React 19.0.0 puede tener problemas de compatibilidad con algunas librerías
- La configuración `dedupe` en Vite asegura que solo haya una copia de React
- El `force: true` en `optimizeDeps` fuerza la reoptimización de dependencias

