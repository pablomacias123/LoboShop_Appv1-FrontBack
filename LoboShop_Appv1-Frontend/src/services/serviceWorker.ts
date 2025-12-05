/**
 * Servicio para registrar y manejar el Service Worker
 */

const SW_URL = '/sw.js';

class ServiceWorkerService {
  private registration: ServiceWorkerRegistration | null = null;

  /**
   * Registrar el Service Worker
   */
  async register(): Promise<ServiceWorkerRegistration | null> {
    try {
      if (!('serviceWorker' in navigator)) {
        console.warn('[SW] Service Workers no están soportados en este navegador');
        return null;
      }

      // Registrar Service Worker
      this.registration = await navigator.serviceWorker.register(SW_URL, {
        scope: '/',
      });

      console.log('[SW] Service Worker registrado:', this.registration.scope);

      // Escuchar actualizaciones
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[SW] Nueva versión disponible');
              // Aquí puedes mostrar un mensaje al usuario para actualizar
            }
          });
        }
      });

      // Verificar actualizaciones periódicamente
      setInterval(() => {
        if (this.registration) {
          this.registration.update();
        }
      }, 60000); // Cada minuto

      return this.registration;
    } catch (error) {
      console.error('[SW] Error al registrar Service Worker:', error);
      return null;
    }
  }

  /**
   * Obtener registro actual
   */
  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  /**
   * Verificar si el Service Worker está activo
   */
  async isActive(): Promise<boolean> {
    try {
      if (!('serviceWorker' in navigator)) {
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      return registration.active !== null;
    } catch (error) {
      console.error('[SW] Error al verificar estado:', error);
      return false;
    }
  }

  /**
   * Forzar actualización del Service Worker
   */
  async update(): Promise<void> {
    try {
      if (this.registration) {
        await this.registration.update();
        console.log('[SW] Actualización forzada');
      }
    } catch (error) {
      console.error('[SW] Error al actualizar:', error);
    }
  }

  /**
   * Desregistrar Service Worker
   */
  async unregister(): Promise<boolean> {
    try {
      if (this.registration) {
        const unregistered = await this.registration.unregister();
        if (unregistered) {
          console.log('[SW] Service Worker desregistrado');
          this.registration = null;
        }
        return unregistered;
      }
      return false;
    } catch (error) {
      console.error('[SW] Error al desregistrar:', error);
      return false;
    }
  }

  /**
   * Enviar mensaje al Service Worker
   */
  async sendMessage(message: any): Promise<void> {
    try {
      if (!this.registration || !this.registration.active) {
        console.warn('[SW] Service Worker no está activo');
        return;
      }

      this.registration.active.postMessage(message);
    } catch (error) {
      console.error('[SW] Error al enviar mensaje:', error);
    }
  }
}

// Exportar instancia singleton
export const serviceWorkerService = new ServiceWorkerService();
export default serviceWorkerService;

