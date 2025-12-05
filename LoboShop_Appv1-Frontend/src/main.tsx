import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { serviceWorkerService } from './services/serviceWorker';
import { notificationService } from './services/notificationService';
import { indexedDBService } from './services/indexedDB';

// Inicializar servicios PWA
async function initPWA() {
  try {
    // Solo registrar Service Worker en producción (no en localhost)
    const isProduction = !window.location.hostname.includes('localhost') && 
                         !window.location.hostname.includes('127.0.0.1') &&
                         window.location.protocol === 'https:';
    
    if (isProduction && 'serviceWorker' in navigator) {
      // Registrar Service Worker solo en producción
      await serviceWorkerService.register();
    } else {
      // En desarrollo, desregistrar cualquier SW existente
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
    }

    // Inicializar IndexedDB (siempre disponible)
    await indexedDBService.init();

    // Inicializar servicio de notificaciones (siempre disponible)
    await notificationService.init();

    if (isProduction) {
      console.log('[PWA] Servicios inicializados correctamente');
    } else {
      console.log('[PWA] Modo desarrollo - Service Worker deshabilitado');
    }
  } catch (error) {
    console.error('[PWA] Error al inicializar servicios:', error);
  }
}

// Inicializar PWA después de que la app se renderice
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Esperar un poco para que la app se renderice primero
    setTimeout(initPWA, 100);
  });
} else {
  setTimeout(initPWA, 100);
}

// Renderizar aplicación
const container = document.getElementById('root');
if (!container) {
  throw new Error('No se encontró el elemento root');
}

const root = createRoot(container);
root.render(<App />);
