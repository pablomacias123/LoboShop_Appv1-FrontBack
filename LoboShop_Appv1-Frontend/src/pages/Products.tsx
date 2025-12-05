import React, { useState, useEffect, useCallback } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonSearchbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonChip,
  IonLabel,
  IonFab,
  IonFabButton,
  IonCard,
  IonCardContent,
  IonText,
  IonSpinner,
} from '@ionic/react';
import {
  addOutline,
  homeOutline,
  alertCircleOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { productService, categoryService } from '../services/api';
import { Product, Category } from '../types/product.types';
import { indexedDBService } from '../services/indexedDB';
import './Products.css';

const Products: React.FC = () => {
  const history = useHistory();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  /**
   * Cargar datos iniciales desde la API o IndexedDB
   */
  const loadInitialData = useCallback(async () => {
    console.log('🔄 Iniciando carga de datos...');
    setLoading(true);
    setError('');

    try {
      // Intentar cargar desde la API
      try {
        // Cargar categorías
        console.log('📂 Cargando categorías desde API...');
        const cats = await categoryService.getAll();
        console.log('✅ Categorías cargadas:', cats.length);
        setCategories(cats);
        
        // Guardar en IndexedDB para uso offline
        await indexedDBService.saveCategories(cats);

        // Cargar productos
        console.log('📦 Cargando productos desde API...');
        const response = await productService.getAll({ page: 1, limit: 20 });
        console.log('✅ Productos cargados:', response);
        console.log('📊 Total de productos:', response.count);
        
        if (response.productos && Array.isArray(response.productos)) {
          setProducts(response.productos);
          console.log('✅ Productos guardados en estado:', response.productos.length);
          
          // Guardar en IndexedDB para uso offline
          await indexedDBService.saveProducts(response.productos);
        } else {
          throw new Error('Respuesta inválida del servidor');
        }
      } catch (apiError) {
        // Si falla la API, intentar cargar desde IndexedDB
        console.warn('⚠️ Error al cargar desde API, intentando IndexedDB...', apiError);
        
        try {
          const cachedProducts = await indexedDBService.getProducts();
          const cachedCategories = await indexedDBService.getCategories();
          
          if (cachedProducts.length > 0) {
            setProducts(cachedProducts);
            setCategories(cachedCategories);
            setError('Modo offline: Mostrando datos en caché');
            console.log('✅ Datos cargados desde IndexedDB');
          } else {
            throw new Error('No hay datos disponibles offline');
          }
        } catch (dbError) {
          console.error('❌ Error al cargar desde IndexedDB:', dbError);
          const errorMessage = apiError instanceof Error ? apiError.message : 'Error desconocido al cargar datos';
          setError(errorMessage);
        }
      }
    } catch (err) {
      console.error('❌ Error general al cargar datos:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar datos';
      setError(errorMessage);
    } finally {
      console.log('✅ Carga finalizada, ocultando loading');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  /**
   * Cargar productos filtrados
   */
  const loadFilteredProducts = useCallback(async (categoryId: string, search: string) => {
    try {
      setLoading(true);
      setError('');
      
      type ProductFilters = {
        page?: number;
        limit?: number;
        categoria?: string;
        busqueda?: string;
      };
      
      const filters: ProductFilters = { page: 1, limit: 20 };
      if (categoryId) filters.categoria = categoryId;
      if (search) filters.busqueda = search;

      try {
        const response = await productService.getAll(filters);
        if (response.productos && Array.isArray(response.productos)) {
          setProducts(response.productos);
          // Guardar en IndexedDB
          await indexedDBService.saveProducts(response.productos);
        } else {
          throw new Error('Respuesta inválida del servidor');
        }
      } catch (apiError) {
        // Si falla, usar datos de IndexedDB
        console.warn('⚠️ Error al filtrar desde API, usando IndexedDB...', apiError);
        const cachedProducts = await indexedDBService.getProducts();
        
        // Filtrar localmente
        let filtered = cachedProducts;
        if (categoryId) {
          filtered = filtered.filter(p => p.categoria === categoryId);
        }
        if (search) {
          const searchLower = search.toLowerCase();
          filtered = filtered.filter(p => 
            p.nombre.toLowerCase().includes(searchLower) ||
            p.descripcion.toLowerCase().includes(searchLower)
          );
        }
        
        setProducts(filtered);
        if (filtered.length === 0) {
          setError('No se encontraron productos con los filtros aplicados');
        }
      }
    } catch (err) {
      console.error('❌ Error al filtrar productos:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al filtrar productos';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Manejar filtro de categoría
   */
  const handleCategoryFilter = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    loadFilteredProducts(categoryId, searchText);
  }, [searchText, loadFilteredProducts]);

  /**
   * Limpiar filtros
   */
  const clearFilters = useCallback(() => {
    setSelectedCategory('');
    setSearchText('');
    loadInitialData();
  }, [loadInitialData]);

  /**
   * Formatear precio en formato de moneda mexicana
   */
  const formatPrice = useCallback((price: number): string => {
    try {
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
      }).format(price);
    } catch (error) {
      console.error('Error al formatear precio:', error);
      return `$${price.toFixed(2)}`;
    }
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>🐺 LoboShop</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => history.push('/home')}>
              <IonIcon icon={homeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar
            value={searchText}
            onIonChange={(e) => {
              const value = e.detail.value || '';
              setSearchText(value);
              // Filtrar cuando cambia el texto de búsqueda
              if (value.length === 0 || value.length >= 2) {
                // Usar setTimeout para evitar problemas de inicialización
                setTimeout(() => {
                  loadFilteredProducts(selectedCategory, value);
                }, 0);
              }
            }}
            placeholder="Buscar productos..."
            debounce={300}
          />
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Mostrar loading */}
        {loading && (
          <div className="products-loading-container">
            <IonSpinner name="crescent" className="products-loading-spinner" />
            <p className="products-loading-text">Cargando productos...</p>
          </div>
        )}

        {/* Mostrar error */}
        {!loading && error && (
          <IonCard color="danger">
            <IonCardContent>
              <div className="products-error-container">
                <IonIcon icon={alertCircleOutline} className="products-error-icon" />
                <h2 className="products-error-title">Error al cargar productos</h2>
                <p className="products-error-message">{error}</p>
                <IonButton onClick={loadInitialData} color="light">
                  Reintentar
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        )}

        {/* Mostrar contenido cuando NO está cargando y NO hay error */}
        {!loading && !error && (
          <>
            {/* Filtros de categorías */}
            <div className="category-filters">
              <IonChip
                color={!selectedCategory ? 'primary' : 'medium'}
                onClick={clearFilters}
              >
                <IonLabel>Todas</IonLabel>
              </IonChip>
              {categories.map((cat) => (
                <IonChip
                  key={cat._id}
                  color={selectedCategory === cat._id ? 'primary' : 'medium'}
                  onClick={() => handleCategoryFilter(cat._id)}
                >
                  <IonLabel>{cat.nombre}</IonLabel>
                </IonChip>
              ))}
            </div>

            {/* Lista de productos */}
            {products.length === 0 ? (
              <IonCard>
                <IonCardContent className="ion-text-center">
                  <h2>📦 No hay productos disponibles</h2>
                  <p>Sé el primero en publicar un producto</p>
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
                  <strong>Mostrando {products.length} productos</strong>
                </div>
                
                <IonGrid>
                  <IonRow>
                    {products.map((product) => (
                      <IonCol size="12" sizeMd="6" sizeLg="4" key={product._id}>
                        <IonCard 
                          button 
                          onClick={() => {
                            console.log('Click en producto:', product._id);
                            history.push(`/producto/${product._id}`);
                          }}
                          className="products-card"
                        >
                          {product.imagenes && product.imagenes.length > 0 ? (
                            <div className="products-image-container">
                              <img
                                src={`http://localhost:3000${product.imagenes[0].url}`}
                                alt={product.nombre}
                                className="products-image"
                                loading="lazy"
                                onError={(e) => {
                                  console.error('Error cargando imagen:', product.imagenes?.[0]?.url);
                                  const target = e.currentTarget;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<div class="products-no-image"><IonText color="medium">Sin imagen</IonText></div>';
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <div className="products-no-image">
                              <IonText color="medium">Sin imagen</IonText>
                            </div>
                          )}
                          
                          <IonCardContent>
                            <h2 className="products-card-title">
                              {product.nombre}
                            </h2>
                            
                            <p className="products-card-price">
                              {formatPrice(product.precio)}
                            </p>
                            
                            <p className="products-card-description">
                              {product.descripcion}
                            </p>
                            
                            <div className="products-card-seller">
                              <IonText color="medium">
                                <small>
                                  <strong>Vendedor:</strong> {product.vendedor.nombre}
                                </small>
                              </IonText>
                            </div>
                          </IonCardContent>
                        </IonCard>
                      </IonCol>
                    ))}
                  </IonRow>
                </IonGrid>
              </>
            )}
          </>
        )}

        {/* Botón flotante */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => history.push('/crear-producto')}>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Products;
