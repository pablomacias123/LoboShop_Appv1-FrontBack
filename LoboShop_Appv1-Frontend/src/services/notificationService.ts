/**
 * Servicio para manejar notificaciones PUSH
 * Usa la API nativa de notificaciones del navegador
 */

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
}

class NotificationService {
  private permission: NotificationPermission = 'default';
  private registration: ServiceWorkerRegistration | null = null;

  /**
   * Inicializar el servicio de notificaciones
   */
  async init(): Promise<void> {
    try {
      // Verificar soporte de notificaciones
      if (!('Notification' in window)) {
        console.warn('[Notifications] Las notificaciones no están soportadas en este navegador');
        return;
      }

      // Obtener permiso actual
      this.permission = Notification.permission;

      // Obtener registro del Service Worker
      if ('serviceWorker' in navigator) {
        this.registration = await navigator.serviceWorker.ready;
      }

      console.log('[Notifications] Servicio inicializado, permiso:', this.permission);
    } catch (error) {
      console.error('[Notifications] Error al inicializar:', error);
    }
  }

  /**
   * Solicitar permiso para notificaciones
   */
  async requestPermission(): Promise<boolean> {
    try {
      if (!('Notification' in window)) {
        console.warn('[Notifications] Las notificaciones no están soportadas');
        return false;
      }

      if (this.permission === 'granted') {
        return true;
      }

      if (this.permission === 'denied') {
        console.warn('[Notifications] Permiso denegado por el usuario');
        return false;
      }

      // Solicitar permiso
      const permission = await Notification.requestPermission();
      this.permission = permission;

      if (permission === 'granted') {
        console.log('[Notifications] Permiso concedido');
        return true;
      }

      return false;
    } catch (error) {
      console.error('[Notifications] Error al solicitar permiso:', error);
      return false;
    }
  }

  /**
   * Verificar si se tiene permiso
   */
  hasPermission(): boolean {
    return this.permission === 'granted';
  }

  /**
   * Mostrar notificación local
   */
  async showNotification(options: NotificationOptions): Promise<void> {
    try {
      if (!this.hasPermission()) {
        const granted = await this.requestPermission();
        if (!granted) {
          console.warn('[Notifications] No se puede mostrar notificación sin permiso');
          return;
        }
      }

      const notificationOptions: NotificationOptions = {
        icon: options.icon || '/icon-192x192.png',
        badge: options.badge || '/icon-72x72.png',
        tag: options.tag || 'loboshop-notification',
        requireInteraction: options.requireInteraction || false,
        data: options.data || {},
        ...options,
      };

      // Usar Service Worker si está disponible
      if (this.registration) {
        await this.registration.showNotification(options.title, notificationOptions);
      } else {
        // Fallback a notificación nativa
        new Notification(options.title, notificationOptions);
      }

      console.log('[Notifications] Notificación mostrada:', options.title);
    } catch (error) {
      console.error('[Notifications] Error al mostrar notificación:', error);
    }
  }

  /**
   * Suscribirse a notificaciones push
   */
  async subscribeToPush(): Promise<PushSubscription | null> {
    try {
      if (!this.registration) {
        console.warn('[Notifications] Service Worker no disponible');
        return null;
      }

      if (!('PushManager' in window)) {
        console.warn('[Notifications] Push API no está soportada');
        return null;
      }

      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          // Aquí deberías poner tu clave pública de VAPID
          // Por ahora usamos una clave de ejemplo
          'BEl62iUYgUivxIkv69yViEuiBIa40HI9j7kAb3ZFFyQvVKCgwFUKTj8sZbN7o2RgF7DF1gV5u8oYIr2nA1f4jE'
        ),
      });

      console.log('[Notifications] Suscrito a push notifications:', subscription);
      return subscription;
    } catch (error) {
      console.error('[Notifications] Error al suscribirse a push:', error);
      return null;
    }
  }

  /**
   * Obtener suscripción actual
   */
  async getSubscription(): Promise<PushSubscription | null> {
    try {
      if (!this.registration) {
        return null;
      }

      return await this.registration.pushManager.getSubscription();
    } catch (error) {
      console.error('[Notifications] Error al obtener suscripción:', error);
      return null;
    }
  }

  /**
   * Cancelar suscripción a push
   */
  async unsubscribeFromPush(): Promise<boolean> {
    try {
      const subscription = await this.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log('[Notifications] Suscripción cancelada');
        return true;
      }
      return false;
    } catch (error) {
      console.error('[Notifications] Error al cancelar suscripción:', error);
      return false;
    }
  }

  /**
   * Convertir clave VAPID de base64 URL a Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Notificar nuevo producto
   */
  async notifyNewProduct(productName: string, productId: string): Promise<void> {
    await this.showNotification({
      title: 'Nuevo Producto Disponible',
      body: `Se ha publicado: ${productName}`,
      tag: `product-${productId}`,
      data: {
        url: `/producto/${productId}`,
        type: 'product',
        id: productId,
      },
      requireInteraction: false,
    });
  }

  /**
   * Notificar actualización de producto
   */
  async notifyProductUpdate(productName: string, productId: string): Promise<void> {
    await this.showNotification({
      title: 'Producto Actualizado',
      body: `${productName} ha sido actualizado`,
      tag: `product-update-${productId}`,
      data: {
        url: `/producto/${productId}`,
        type: 'product-update',
        id: productId,
      },
    });
  }

  /**
   * Notificar mensaje genérico
   */
  async notifyMessage(title: string, message: string, data?: any): Promise<void> {
    await this.showNotification({
      title,
      body: message,
      data,
    });
  }
}

// Exportar instancia singleton
export const notificationService = new NotificationService();
export default notificationService;

