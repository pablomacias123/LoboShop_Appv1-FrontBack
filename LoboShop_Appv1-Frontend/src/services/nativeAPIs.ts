/**
 * Servicio para manejar APIs nativas del navegador
 * Incluye: Geolocation, Clipboard, Vibration, Camera
 */

interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

/**
 * Servicio de Geolocalización
 */
class GeolocationService {
  /**
   * Obtener posición actual del usuario
   */
  async getCurrentPosition(options?: GeolocationOptions): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Geolocalización no está soportada en este navegador'));
        return;
      }

      const defaultOptions: PositionOptions = {
        enableHighAccuracy: options?.enableHighAccuracy ?? false,
        timeout: options?.timeout ?? 10000,
        maximumAge: options?.maximumAge ?? 60000,
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          let errorMessage = 'Error al obtener la ubicación';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permiso de geolocalización denegado';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Información de ubicación no disponible';
              break;
            case error.TIMEOUT:
              errorMessage = 'Tiempo de espera agotado';
              break;
          }
          reject(new Error(errorMessage));
        },
        defaultOptions
      );
    });
  }

  /**
   * Observar cambios de posición
   */
  watchPosition(
    callback: (position: GeolocationPosition) => void,
    errorCallback?: (error: Error) => void,
    options?: GeolocationOptions
  ): number | null {
    if (!('geolocation' in navigator)) {
      errorCallback?.(new Error('Geolocalización no está soportada'));
      return null;
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: options?.enableHighAccuracy ?? false,
      timeout: options?.timeout ?? 10000,
      maximumAge: options?.maximumAge ?? 60000,
    };

    return navigator.geolocation.watchPosition(
      (position) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        let errorMessage = 'Error al obtener la ubicación';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de geolocalización denegado';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Información de ubicación no disponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado';
            break;
        }
        errorCallback?.(new Error(errorMessage));
      },
      defaultOptions
    );
  }

  /**
   * Detener observación de posición
   */
  clearWatch(watchId: number): void {
    navigator.geolocation.clearWatch(watchId);
  }
}

/**
 * Servicio de Portapapeles (Clipboard)
 */
class ClipboardService {
  /**
   * Copiar texto al portapapeles
   */
  async copyText(text: string): Promise<boolean> {
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        // Fallback para navegadores antiguos
        return this.fallbackCopyText(text);
      }

      await navigator.clipboard.writeText(text);
      console.log('[Clipboard] Texto copiado:', text);
      return true;
    } catch (error) {
      console.error('[Clipboard] Error al copiar:', error);
      return false;
    }
  }

  /**
   * Pegar texto del portapapeles
   */
  async pasteText(): Promise<string | null> {
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        console.warn('[Clipboard] Clipboard API no disponible');
        return null;
      }

      const text = await navigator.clipboard.readText();
      console.log('[Clipboard] Texto pegado');
      return text;
    } catch (error) {
      console.error('[Clipboard] Error al pegar:', error);
      return null;
    }
  }

  /**
   * Copiar imagen al portapapeles
   */
  async copyImage(imageBlob: Blob): Promise<boolean> {
    try {
      if (!navigator.clipboard || !navigator.clipboard.write) {
        console.warn('[Clipboard] Clipboard API no disponible');
        return false;
      }

      const clipboardItem = new ClipboardItem({ 'image/png': imageBlob });
      await navigator.clipboard.write([clipboardItem]);
      console.log('[Clipboard] Imagen copiada');
      return true;
    } catch (error) {
      console.error('[Clipboard] Error al copiar imagen:', error);
      return false;
    }
  }

  /**
   * Fallback para copiar texto (navegadores antiguos)
   */
  private fallbackCopyText(text: string): boolean {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (error) {
      console.error('[Clipboard] Error en fallback:', error);
      return false;
    }
  }
}

/**
 * Servicio de Vibración
 */
class VibrationService {
  /**
   * Vibrar con un patrón específico
   * @param pattern - Patrón de vibración en milisegundos
   */
  vibrate(pattern: number | number[]): boolean {
    try {
      if (!('vibrate' in navigator)) {
        console.warn('[Vibration] Vibration API no está soportada');
        return false;
      }

      navigator.vibrate(pattern);
      return true;
    } catch (error) {
      console.error('[Vibration] Error al vibrar:', error);
      return false;
    }
  }

  /**
   * Vibrar una vez
   */
  vibrateOnce(duration: number = 200): boolean {
    return this.vibrate(duration);
  }

  /**
   * Vibrar con patrón de éxito
   */
  vibrateSuccess(): boolean {
    return this.vibrate([100, 50, 100]);
  }

  /**
   * Vibrar con patrón de error
   */
  vibrateError(): boolean {
    return this.vibrate([200, 100, 200, 100, 200]);
  }

  /**
   * Detener vibración
   */
  stop(): boolean {
    return this.vibrate(0);
  }
}

/**
 * Servicio de Cámara/MediaDevices
 */
class CameraService {
  /**
   * Obtener acceso a la cámara
   */
  async getCameraStream(
    constraints: MediaStreamConstraints = { video: true, audio: false }
  ): Promise<MediaStream | null> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('[Camera] MediaDevices API no está soportada');
        return null;
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('[Camera] Acceso a cámara concedido');
      return stream;
    } catch (error: any) {
      let errorMessage = 'Error al acceder a la cámara';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Permiso de cámara denegado';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No se encontró ninguna cámara';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'La cámara está siendo usada por otra aplicación';
      }
      console.error('[Camera]', errorMessage, error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Capturar foto desde la cámara
   */
  async capturePhoto(videoElement: HTMLVideoElement): Promise<Blob | null> {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No se pudo obtener el contexto del canvas');
      }

      ctx.drawImage(videoElement, 0, 0);
      
      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Error al convertir canvas a blob'));
            }
          },
          'image/jpeg',
          0.9
        );
      });
    } catch (error) {
      console.error('[Camera] Error al capturar foto:', error);
      return null;
    }
  }

  /**
   * Detener stream de cámara
   */
  stopCameraStream(stream: MediaStream): void {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
    console.log('[Camera] Stream de cámara detenido');
  }
}

// Exportar instancias singleton
export const geolocationService = new GeolocationService();
export const clipboardService = new ClipboardService();
export const vibrationService = new VibrationService();
export const cameraService = new CameraService();

// Exportar tipos
export type { GeolocationPosition, GeolocationOptions };

