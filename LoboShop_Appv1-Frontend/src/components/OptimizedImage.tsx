/**
 * Componente de imagen optimizada con lazy loading, srcset y soporte para WebP
 * Implementa buenas prácticas de rendimiento para PWA
 */

import React, { useState, useRef, useEffect } from 'react';
import { IonImg, IonSpinner } from '@ionic/react';
import './OptimizedImage.css';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: string;
}

/**
 * Componente de imagen optimizada
 * - Lazy loading nativo
 * - Soporte para WebP con fallback
 * - Placeholder mientras carga
 * - Manejo de errores
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  fallback,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  loading = 'lazy',
  onLoad,
  onError,
  placeholder,
}) => {
  const [imageSrc, setImageSrc] = useState<string>(placeholder || '');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Cargar imagen cuando el componente esté en el viewport (Intersection Observer)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && isLoading && !imageSrc) {
            loadImage();
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Cargar 50px antes de entrar al viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  /**
   * Cargar imagen con soporte para WebP
   */
  const loadImage = async () => {
    try {
      setIsLoading(true);
      setHasError(false);

      // Intentar cargar WebP primero si está disponible
      const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      const supportsWebP = await checkWebPSupport();

      const imageToLoad = supportsWebP ? webpSrc : src;

      const img = new Image();
      img.onload = () => {
        setImageSrc(imageToLoad);
        setIsLoading(false);
        onLoad?.();
      };
      img.onerror = () => {
        // Si WebP falla, intentar formato original
        if (supportsWebP && imageToLoad === webpSrc) {
          const originalImg = new Image();
          originalImg.onload = () => {
            setImageSrc(src);
            setIsLoading(false);
            onLoad?.();
          };
          originalImg.onerror = handleImageError;
          originalImg.src = src;
        } else {
          handleImageError();
        }
      };
      img.src = imageToLoad;
    } catch (error) {
      console.error('[OptimizedImage] Error al cargar imagen:', error);
      handleImageError();
    }
  };

  /**
   * Manejar error al cargar imagen
   */
  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
    if (fallback) {
      setImageSrc(fallback);
    }
    onError?.();
  };

  /**
   * Verificar soporte para WebP
   */
  const checkWebPSupport = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src =
        'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  };

  /**
   * Generar srcset para diferentes tamaños
   */
  const generateSrcSet = (baseSrc: string): string => {
    const sizes = [320, 640, 768, 1024, 1280, 1920];
    return sizes
      .map((size) => {
        // Generar URL con parámetro de tamaño (ajustar según tu API)
        const url = new URL(baseSrc, window.location.origin);
        url.searchParams.set('w', size.toString());
        return `${url.toString()} ${size}w`;
      })
      .join(', ');
  };

  if (hasError && !fallback) {
    return (
      <div className={`optimized-image-error ${className}`} role="img" aria-label={alt}>
        <span className="error-icon">📷</span>
        <span className="error-text">Imagen no disponible</span>
      </div>
    );
  }

  return (
    <div className={`optimized-image-container ${className}`} ref={imgRef}>
      {isLoading && (
        <div className="optimized-image-placeholder">
          {placeholder ? (
            <img src={placeholder} alt="" className="placeholder-image" aria-hidden="true" />
          ) : (
            <IonSpinner name="crescent" className="loading-spinner" />
          )}
        </div>
      )}
      {imageSrc && (
        <IonImg
          src={imageSrc}
          alt={alt}
          loading={loading}
          className={`optimized-image ${isLoading ? 'loading' : 'loaded'}`}
          onIonImgDidLoad={() => {
            setIsLoading(false);
            onLoad?.();
          }}
          onIonError={handleImageError}
          // Agregar srcset si es necesario
          // srcSet={generateSrcSet(imageSrc)}
        />
      )}
    </div>
  );
};

export default OptimizedImage;

