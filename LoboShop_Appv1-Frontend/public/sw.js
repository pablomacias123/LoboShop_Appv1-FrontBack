// Service Worker para LoboShop PWA
// Versión del Service Worker - Incrementar para forzar actualización
const CACHE_VERSION = 'v2.0.0';
const CACHE_NAME = `loboshop-cache-${CACHE_VERSION}`;
const IMAGE_CACHE_NAME = `loboshop-images-${CACHE_VERSION}`;
const API_CACHE_NAME = `loboshop-api-${CACHE_VERSION}`;

// Archivos estáticos críticos para cachear (Cache First Strategy)
const STATIC_CACHE_FILES = [
  '/',
  '/index.html',
  '/favicon.png',
  '/manifest.json',
];

// Rutas de API que usan Network First Strategy
const API_ROUTES = [
  '/api/v1/productos',
  '/api/v1/categorias',
  '/api/v1/auth',
];

// Tiempo máximo de validez para caché (en milisegundos)
const CACHE_MAX_AGE = {
  STATIC: 7 * 24 * 60 * 60 * 1000, // 7 días
  IMAGES: 30 * 24 * 60 * 60 * 1000, // 30 días
  API: 5 * 60 * 1000, // 5 minutos
};

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...', CACHE_NAME);
  
  event.waitUntil(
    Promise.all([
      // Cachear archivos estáticos
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[SW] Cacheando archivos estáticos');
        return cache.addAll(STATIC_CACHE_FILES.map(url => new Request(url, { cache: 'reload' })));
      }),
      // Inicializar caché de imágenes
      caches.open(IMAGE_CACHE_NAME),
      // Inicializar caché de API
      caches.open(API_CACHE_NAME),
    ])
      .then(() => {
        console.log('[SW] Service Worker instalado correctamente');
        // Forzar activación inmediata
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Error al instalar:', error);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Eliminar caches antiguos
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== IMAGE_CACHE_NAME &&
              cacheName !== API_CACHE_NAME &&
              cacheName.startsWith('loboshop-')
            ) {
              console.log('[SW] Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker activado');
        // Limpiar cachés expirados
        return cleanExpiredCaches();
      })
      .then(() => {
        // Tomar control de todas las páginas
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('[SW] Error al activar:', error);
      })
  );
});

// Estrategia: Cache First para recursos estáticos
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Verificar si el caché no ha expirado
      const cacheDate = cachedResponse.headers.get('sw-cache-date');
      if (cacheDate) {
        const age = Date.now() - parseInt(cacheDate);
        if (age < CACHE_MAX_AGE.STATIC) {
          return cachedResponse;
        }
      } else {
        return cachedResponse;
      }
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      // Clonar la respuesta ANTES de usarla para cachear
      const responseClone = networkResponse.clone();
      // Agregar fecha de caché a los headers
      const headers = new Headers(responseClone.headers);
      headers.set('sw-cache-date', Date.now().toString());
      const modifiedResponse = new Response(responseClone.body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers: headers,
      });
      // Cachear la respuesta modificada
      cache.put(request, modifiedResponse).catch(err => {
        console.error('[SW] Error al cachear:', err);
      });
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Error en cacheFirst:', error);
    // Si falla, intentar devolver una respuesta offline
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Recurso no disponible offline', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

// Estrategia: Network First para APIs
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      // Clonar la respuesta ANTES de usarla para cachear
      const responseClone = networkResponse.clone();
      // Agregar fecha de caché
      const headers = new Headers(responseClone.headers);
      headers.set('sw-cache-date', Date.now().toString());
      const responseToCache = new Response(responseClone.body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers: headers,
      });
      // Cachear de forma asíncrona sin bloquear
      cache.put(request, responseToCache).catch(err => {
        console.error('[SW] Error al cachear API:', err);
      });
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Red no disponible, buscando en cache...');
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Verificar si el caché no ha expirado
      const cacheDate = cachedResponse.headers.get('sw-cache-date');
      if (cacheDate) {
        const age = Date.now() - parseInt(cacheDate);
        if (age < CACHE_MAX_AGE.API) {
          return cachedResponse;
        }
      } else {
        return cachedResponse;
      }
    }
    
    // Si no hay cache, devolver respuesta offline
    return new Response(
      JSON.stringify({ 
        error: 'Sin conexión a internet',
        offline: true 
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Estrategia: Stale While Revalidate para recursos que pueden actualizarse en segundo plano
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await caches.match(request);
  
  // Devolver caché inmediatamente si existe
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      // Clonar la respuesta ANTES de usarla
      const responseClone = networkResponse.clone();
      const headers = new Headers(responseClone.headers);
      headers.set('sw-cache-date', Date.now().toString());
      const responseToCache = new Response(responseClone.body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers: headers,
      });
      // Cachear de forma asíncrona sin bloquear
      cache.put(request, responseToCache).catch(err => {
        console.error('[SW] Error al cachear:', err);
      });
    }
    return networkResponse;
  }).catch(() => {
    // Si falla la red, no hacer nada
    return null;
  });
  
  return cachedResponse || fetchPromise || new Response('Recurso no disponible', {
    status: 503,
    statusText: 'Service Unavailable',
  });
}

// Estrategia: Cache Only para recursos que nunca cambian
async function cacheOnly(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  return new Response('Recurso no encontrado en caché', {
    status: 404,
    statusText: 'Not Found',
  });
}

// Estrategia para imágenes con lazy loading
async function imageCacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request, { cacheName: IMAGE_CACHE_NAME });
    if (cachedResponse) {
      const cacheDate = cachedResponse.headers.get('sw-cache-date');
      if (cacheDate) {
        const age = Date.now() - parseInt(cacheDate);
        if (age < CACHE_MAX_AGE.IMAGES) {
          return cachedResponse;
        }
      } else {
        return cachedResponse;
      }
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(IMAGE_CACHE_NAME);
      // Clonar la respuesta ANTES de usarla
      const responseClone = networkResponse.clone();
      const headers = new Headers(responseClone.headers);
      headers.set('sw-cache-date', Date.now().toString());
      const responseToCache = new Response(responseClone.body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers: headers,
      });
      // Cachear de forma asíncrona sin bloquear
      cache.put(request, responseToCache).catch(err => {
        console.error('[SW] Error al cachear imagen:', err);
      });
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Error en imageCacheFirst:', error);
    const cachedResponse = await caches.match(request, { cacheName: IMAGE_CACHE_NAME });
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Imagen no disponible', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

// Función para limpiar cachés expirados
async function cleanExpiredCaches() {
  const cacheNames = [CACHE_NAME, IMAGE_CACHE_NAME, API_CACHE_NAME];
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    const maxAge = cacheName === IMAGE_CACHE_NAME 
      ? CACHE_MAX_AGE.IMAGES 
      : cacheName === API_CACHE_NAME 
      ? CACHE_MAX_AGE.API 
      : CACHE_MAX_AGE.STATIC;
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const cacheDate = response.headers.get('sw-cache-date');
        if (cacheDate) {
          const age = Date.now() - parseInt(cacheDate);
          if (age > maxAge) {
            await cache.delete(request);
            console.log('[SW] Eliminado caché expirado:', request.url);
          }
        }
      }
    }
  }
}

// Estrategia: Network Only para autenticación
async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Se requiere conexión a internet',
        offline: true 
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Interceptar peticiones fetch
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar peticiones que no son GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Ignorar extensiones de Chrome y otros protocolos
  if (url.protocol === 'chrome-extension:' || url.protocol === 'chrome:') {
    return;
  }
  
  // Ignorar localhost en desarrollo (Vite dev server)
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return;
  }
  
  // Ignorar archivos TypeScript y otros archivos fuente
  if (url.pathname.endsWith('.ts') || 
      url.pathname.endsWith('.tsx') || 
      url.pathname.includes('/src/') ||
      url.pathname.includes('node_modules')) {
    return;
  }
  
  // Network Only para autenticación (nunca cachear)
  if (url.pathname.includes('/auth/login') || url.pathname.includes('/auth/registro')) {
    event.respondWith(networkOnly(request));
    return;
  }
  
  // Network First para APIs dinámicas
  if (API_ROUTES.some(route => url.pathname.includes(route))) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Cache First para imágenes
  if (
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.gif') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.includes('/uploads/')
  ) {
    event.respondWith(imageCacheFirst(request));
    return;
  }
  
  // Cache First para recursos estáticos críticos
  if (
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.ttf') ||
    url.pathname.endsWith('.eot')
  ) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
  
  // Cache First para HTML
  if (
    url.pathname === '/' ||
    url.pathname === '/index.html' ||
    url.pathname.endsWith('.html')
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // Stale While Revalidate para otras rutas de la app
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
  
  // Por defecto, Network First
  event.respondWith(networkFirst(request));
});

// Manejar notificaciones push
self.addEventListener('push', (event) => {
  console.log('[SW] Notificación push recibida:', event);
  
  let notificationData = {
    title: 'LoboShop',
    body: 'Tienes una nueva notificación',
    icon: '/favicon.png',
    badge: '/favicon.png',
    tag: 'loboshop-notification',
    requireInteraction: false,
    data: {},
  };
  
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data,
      };
    } catch (error) {
      notificationData.body = event.data.text();
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
      vibrate: [200, 100, 200],
      actions: [
        {
          action: 'open',
          title: 'Abrir',
        },
        {
          action: 'close',
          title: 'Cerrar',
        },
      ],
    })
  );
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Click en notificación:', event);
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si hay una ventana abierta, enfocarla
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Sincronización en segundo plano
self.addEventListener('sync', (event) => {
  console.log('[SW] Sincronización en segundo plano:', event.tag);
  
  if (event.tag === 'sync-products') {
    event.waitUntil(syncProducts());
  }
});

// Función para sincronizar productos
async function syncProducts() {
  try {
    console.log('[SW] Sincronizando productos...');
    
    // Notificar al cliente que se está sincronizando
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'SYNC_STARTED',
        data: { timestamp: Date.now() },
      });
    });
    
    // Aquí puedes implementar la lógica de sincronización
    // Ejemplo: enviar datos guardados en IndexedDB cuando vuelva la conexión
    // Esto se puede hacer mediante mensajes al cliente
    
    // Notificar que la sincronización terminó
    clients.forEach((client) => {
      client.postMessage({
        type: 'SYNC_COMPLETED',
        data: { timestamp: Date.now() },
      });
    });
  } catch (error) {
    console.error('[SW] Error al sincronizar:', error);
    
    // Notificar error
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'SYNC_ERROR',
        data: { error: error.message, timestamp: Date.now() },
      });
    });
  }
}

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  console.log('[SW] Mensaje recibido:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});

