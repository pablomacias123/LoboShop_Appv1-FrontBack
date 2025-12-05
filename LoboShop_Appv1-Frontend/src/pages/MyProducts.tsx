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
  IonGrid,
  IonRow,
  IonCol,
  IonLoading,
  IonFab,
  IonFabButton,
  IonAlert,
  IonText,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/react';
import {
  addOutline,
  createOutline,
  trashOutline,
  eyeOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { productService } from '../services/api';
import { Product } from '../types/product.types';
import './MyProducts.css';

const MyProducts: React.FC = () => {
  const history = useHistory();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteAlert, setDeleteAlert] = useState<{
    show: boolean;
    productId: string;
    productName: string;
  }>({
    show: false,
    productId: '',
    productName: '',
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadMyProducts();
  }, []);

  const loadMyProducts = async () => {
    try {
      setLoading(true);
      const myProducts = await productService.getMyProducts();
      setProducts(myProducts);
    } catch (error) {
      console.error('Error al cargar mis productos:', error);
      alert('Error al cargar tus productos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    setDeleting(true);
    try {
      await productService.delete(productId);
      setProducts(products.filter((p) => p._id !== productId));
      alert('Producto eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar el producto');
    } finally {
      setDeleting(false);
      setDeleteAlert({ show: false, productId: '', productName: '' });
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(price);
  };

  const handleRefresh = (event: CustomEvent) => {
    loadMyProducts().then(() => {
      event.detail.complete();
    });
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent>
          <IonLoading isOpen={true} message="Cargando tus productos..." />
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
          <IonTitle>Mis Productos</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="ion-padding">
          {products.length === 0 ? (
            <IonCard>
              <IonCardContent className="ion-text-center">
                <h2>📦 No tienes productos publicados</h2>
                <p>Comienza a vender publicando tu primer producto</p>
                <IonButton
                  onClick={() => history.push('/crear-producto')}
                  color="primary"
                >
                  <IonIcon icon={addOutline} slot="start" />
                  Publicar Producto
                </IonButton>
              </IonCardContent>
            </IonCard>
          ) : (
            <>
              <div className="products-count">
                <IonText>
                  <h2>Tienes {products.length} producto{products.length !== 1 ? 's' : ''} publicado{products.length !== 1 ? 's' : ''}</h2>
                </IonText>
              </div>

              <IonGrid>
                <IonRow>
                  {products.map((product) => (
                    <IonCol size="12" sizeMd="6" sizeLg="4" key={product._id}>
                      <IonCard className="my-product-card">
                        {product.imagenes && product.imagenes.length > 0 ? (
                          <img
                            src={`http://localhost:3000${product.imagenes[0].url}`}
                            alt={product.nombre}
                            className="product-image"
                            onClick={() => history.push(`/producto/${product._id}`)}
                          />
                        ) : (
                          <div
                            className="no-image"
                            onClick={() => history.push(`/producto/${product._id}`)}
                          >
                            <IonText color="medium">Sin imagen</IonText>
                          </div>
                        )}

                        <IonCardContent>
                          <h2
                            className="product-name"
                            onClick={() => history.push(`/producto/${product._id}`)}
                          >
                            {product.nombre}
                          </h2>

                          <div className="product-price-row">
                            <span className="price">{formatPrice(product.precio)}</span>
                            <span className="views">
                              <IonIcon icon={eyeOutline} /> {product.vistas}
                            </span>
                          </div>

                          <p className="product-description">
                            {product.descripcion}
                          </p>

                          <div className="action-buttons">
                            <IonButton
                              size="small"
                              fill="outline"
                              onClick={() =>
                                history.push(`/editar-producto/${product._id}`)
                              }
                            >
                              <IonIcon icon={createOutline} slot="start" />
                              Editar
                            </IonButton>

                            <IonButton
                              size="small"
                              fill="outline"
                              color="danger"
                              onClick={() =>
                                setDeleteAlert({
                                  show: true,
                                  productId: product._id,
                                  productName: product.nombre,
                                })
                              }
                            >
                              <IonIcon icon={trashOutline} slot="start" />
                              Eliminar
                            </IonButton>
                          </div>
                        </IonCardContent>
                      </IonCard>
                    </IonCol>
                  ))}
                </IonRow>
              </IonGrid>
            </>
          )}
        </div>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => history.push('/crear-producto')}>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>

        <IonAlert
          isOpen={deleteAlert.show}
          onDidDismiss={() =>
            setDeleteAlert({ show: false, productId: '', productName: '' })
          }
          header="Confirmar eliminación"
          message={`¿Estás seguro de que deseas eliminar "${deleteAlert.productName}"?`}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
            },
            {
              text: 'Eliminar',
              role: 'destructive',
              handler: () => handleDelete(deleteAlert.productId),
            },
          ]}
        />

        <IonLoading isOpen={deleting} message="Eliminando producto..." />
      </IonContent>
    </IonPage>
  );
};

export default MyProducts;
