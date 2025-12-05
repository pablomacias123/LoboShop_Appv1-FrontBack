import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonBadge,
  IonChip,
  IonLabel,
  IonLoading,
  IonAlert,
  IonText,
} from '@ionic/react';
import {
  logoWhatsapp,
  callOutline,
  eyeOutline,
  calendarOutline,
  personOutline,
  trashOutline,
  createOutline,
  chevronBackOutline,
  chevronForwardOutline,
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { productService } from '../services/api';
import { Product } from '../types/product.types';
import { useAuth } from '../context/AuthContext';
import './ProductDetail.css';

interface ProductDetailParams {
  id: string;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<ProductDetailParams>();
  const history = useHistory();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const prod = await productService.getById(id);
      setProduct(prod);
    } catch (error) {
      console.error('Error al cargar producto:', error);
      alert('Error al cargar el producto');
      history.push('/productos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await productService.delete(id);
      alert('Producto eliminado exitosamente');
      history.push('/mis-productos');
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar el producto');
    } finally {
      setDeleting(false);
    }
  };

  const handleWhatsApp = () => {
    if (product?.contacto?.whatsapp) {
      const phone = product.contacto.whatsapp.replace(/\D/g, '');
      const message = encodeURIComponent(
        `Hola, me interesa tu producto: ${product.nombre}`
      );
      window.open(`https://wa.me/521${phone}?text=${message}`, '_blank');
    }
  };

  const handleCall = () => {
    if (product?.contacto?.telefono) {
      window.open(`tel:${product.contacto.telefono}`);
    }
  };

  const nextImage = () => {
    if (product && product.imagenes) {
      setCurrentImageIndex((prev) =>
        prev === product.imagenes.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product && product.imagenes) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? product.imagenes.length - 1 : prev - 1
      );
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(price);
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'nuevo':
        return 'success';
      case 'como_nuevo':
        return 'primary';
      case 'usado':
        return 'warning';
      default:
        return 'medium';
    }
  };

  const isOwner = user && product && user.id === product.vendedor._id;

  if (loading) {
    return (
      <IonPage>
        <IonContent>
          <IonLoading isOpen={true} message="Cargando producto..." />
        </IonContent>
      </IonPage>
    );
  }

  if (!product) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <h2>Producto no encontrado</h2>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/productos" />
          </IonButtons>
          <IonTitle>Detalle del Producto</IonTitle>
          {isOwner && (
            <IonButtons slot="end">
              <IonButton onClick={() => history.push(`/editar-producto/${id}`)}>
                <IonIcon icon={createOutline} />
              </IonButton>
              <IonButton onClick={() => setShowDeleteAlert(true)}>
                <IonIcon icon={trashOutline} />
              </IonButton>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Galería de imágenes simplificada */}
        {product.imagenes && product.imagenes.length > 0 ? (
          <div className="image-gallery">
            <img
              src={`http://localhost:3000${product.imagenes[currentImageIndex].url}`}
              alt={`${product.nombre} ${currentImageIndex + 1}`}
              className="product-detail-image"
            />
            
            {product.imagenes.length > 1 && (
              <>
                <IonButton
                  className="nav-button prev-button"
                  fill="clear"
                  onClick={prevImage}
                >
                  <IonIcon icon={chevronBackOutline} />
                </IonButton>
                
                <IonButton
                  className="nav-button next-button"
                  fill="clear"
                  onClick={nextImage}
                >
                  <IonIcon icon={chevronForwardOutline} />
                </IonButton>

                <div className="image-indicators">
                  {product.imagenes.map((_, index) => (
                    <span
                      key={index}
                      className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="no-image-placeholder">
            <IonText color="medium">
              <h3>Sin imágenes disponibles</h3>
            </IonText>
          </div>
        )}

        <div className="ion-padding">
          {/* Información principal */}
          <IonCard>
            <IonCardContent>
              <div className="product-header">
                <div>
                  <h1 className="product-title">{product.nombre}</h1>
                  <IonBadge color={getEstadoBadgeColor(product.estado)}>
                    {product.estado.replace('_', ' ')}
                  </IonBadge>
                </div>
                <div className="product-price">{formatPrice(product.precio)}</div>
              </div>

              <div className="product-meta">
                <IonChip>
                  <IonIcon icon={product.categoria.icono} />
                  <IonLabel>{product.categoria.nombre}</IonLabel>
                </IonChip>
                <IonChip>
                  <IonIcon icon={eyeOutline} />
                  <IonLabel>{product.vistas} vistas</IonLabel>
                </IonChip>
                <IonChip>
                  <IonIcon icon={calendarOutline} />
                  <IonLabel>{formatDate(product.fechaCreacion)}</IonLabel>
                </IonChip>
              </div>

              <div className="product-description">
                <h3>Descripción</h3>
                <p>{product.descripcion}</p>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Información del vendedor */}
          <IonCard>
            <IonCardContent>
              <h3 className="section-title">
                <IonIcon icon={personOutline} /> Vendedor
              </h3>
              <div className="seller-info">
                <p>
                  <strong>{product.vendedor.nombre}</strong>
                </p>
                <p className="seller-email">{product.vendedor.email}</p>
                {product.vendedor.telefono && (
                  <p>📱 {product.vendedor.telefono}</p>
                )}
              </div>
            </IonCardContent>
          </IonCard>

          {/* Botones de contacto */}
          {!isOwner && (
            <div className="contact-buttons">
              {product.contacto?.whatsapp && (
                <IonButton
                  expand="block"
                  color="success"
                  onClick={handleWhatsApp}
                  className="contact-button"
                >
                  <IonIcon icon={logoWhatsapp} slot="start" />
                  Contactar por WhatsApp
                </IonButton>
              )}

              {product.contacto?.telefono && (
                <IonButton
                  expand="block"
                  color="primary"
                  onClick={handleCall}
                  className="contact-button"
                >
                  <IonIcon icon={callOutline} slot="start" />
                  Llamar al Vendedor
                </IonButton>
              )}
            </div>
          )}

          {isOwner && (
            <IonCard color="light">
              <IonCardContent>
                <IonText color="medium">
                  <p className="owner-message">
                    Este es tu producto. Puedes editarlo o eliminarlo.
                  </p>
                </IonText>
              </IonCardContent>
            </IonCard>
          )}
        </div>

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Confirmar eliminación"
          message="¿Estás seguro de que deseas eliminar este producto?"
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
            },
            {
              text: 'Eliminar',
              role: 'destructive',
              handler: handleDelete,
            },
          ]}
        />

        <IonLoading isOpen={deleting} message="Eliminando producto..." />
      </IonContent>
    </IonPage>
  );
};

export default ProductDetail;
