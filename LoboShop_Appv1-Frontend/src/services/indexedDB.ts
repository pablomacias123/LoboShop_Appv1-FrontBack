/**
 * Servicio para manejar IndexedDB
 * Almacena productos y datos offline
 */

const DB_NAME = 'LoboShopDB';
const DB_VERSION = 1;

// Stores de IndexedDB
const STORES = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  USER_DATA: 'userData',
  OFFLINE_ACTIONS: 'offlineActions',
} as const;

interface Product {
  _id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  estado: string;
  categoria: string;
  imagenes?: Array<{ url: string; _id: string }>;
  vendedor: {
    _id: string;
    nombre: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface Category {
  _id: string;
  nombre: string;
  descripcion?: string;
}

interface OfflineAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  data: any;
  timestamp: number;
  synced: boolean;
}

class IndexedDBService {
  private db: IDBDatabase | null = null;

  /**
   * Inicializar la base de datos
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('[IndexedDB] Error al abrir la base de datos:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[IndexedDB] Base de datos abierta correctamente');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Crear store de productos
        if (!db.objectStoreNames.contains(STORES.PRODUCTS)) {
          const productStore = db.createObjectStore(STORES.PRODUCTS, { keyPath: '_id' });
          productStore.createIndex('nombre', 'nombre', { unique: false });
          productStore.createIndex('categoria', 'categoria', { unique: false });
          productStore.createIndex('precio', 'precio', { unique: false });
        }

        // Crear store de categorías
        if (!db.objectStoreNames.contains(STORES.CATEGORIES)) {
          const categoryStore = db.createObjectStore(STORES.CATEGORIES, { keyPath: '_id' });
          categoryStore.createIndex('nombre', 'nombre', { unique: false });
        }

        // Crear store de datos de usuario
        if (!db.objectStoreNames.contains(STORES.USER_DATA)) {
          db.createObjectStore(STORES.USER_DATA, { keyPath: 'key' });
        }

        // Crear store de acciones offline
        if (!db.objectStoreNames.contains(STORES.OFFLINE_ACTIONS)) {
          const actionStore = db.createObjectStore(STORES.OFFLINE_ACTIONS, { keyPath: 'id', autoIncrement: true });
          actionStore.createIndex('synced', 'synced', { unique: false });
          actionStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        console.log('[IndexedDB] Base de datos actualizada');
      };
    });
  }

  /**
   * Guardar productos en IndexedDB
   */
  async saveProducts(products: Product[]): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Base de datos no inicializada'));
        return;
      }

      const transaction = this.db.transaction([STORES.PRODUCTS], 'readwrite');
      const store = transaction.objectStore(STORES.PRODUCTS);

      const promises = products.map((product) => {
        return new Promise<void>((resolve, reject) => {
          const request = store.put(product);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      });

      Promise.all(promises)
        .then(() => {
          console.log(`[IndexedDB] ${products.length} productos guardados`);
          resolve();
        })
        .catch(reject);
    });
  }

  /**
   * Obtener productos de IndexedDB
   */
  async getProducts(): Promise<Product[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Base de datos no inicializada'));
        return;
      }

      const transaction = this.db.transaction([STORES.PRODUCTS], 'readonly');
      const store = transaction.objectStore(STORES.PRODUCTS);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Guardar categorías en IndexedDB
   */
  async saveCategories(categories: Category[]): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Base de datos no inicializada'));
        return;
      }

      const transaction = this.db.transaction([STORES.CATEGORIES], 'readwrite');
      const store = transaction.objectStore(STORES.CATEGORIES);

      const promises = categories.map((category) => {
        return new Promise<void>((resolve, reject) => {
          const request = store.put(category);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      });

      Promise.all(promises)
        .then(() => {
          console.log(`[IndexedDB] ${categories.length} categorías guardadas`);
          resolve();
        })
        .catch(reject);
    });
  }

  /**
   * Obtener categorías de IndexedDB
   */
  async getCategories(): Promise<Category[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Base de datos no inicializada'));
        return;
      }

      const transaction = this.db.transaction([STORES.CATEGORIES], 'readonly');
      const store = transaction.objectStore(STORES.CATEGORIES);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Guardar acción offline para sincronizar después
   */
  async saveOfflineAction(action: Omit<OfflineAction, 'id' | 'synced'>): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Base de datos no inicializada'));
        return;
      }

      const transaction = this.db.transaction([STORES.OFFLINE_ACTIONS], 'readwrite');
      const store = transaction.objectStore(STORES.OFFLINE_ACTIONS);

      const offlineAction: OfflineAction = {
        ...action,
        id: Date.now().toString(),
        synced: false,
      };

      const request = store.add(offlineAction);

      request.onsuccess = () => {
        console.log('[IndexedDB] Acción offline guardada:', offlineAction);
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Obtener acciones offline pendientes de sincronizar
   */
  async getPendingOfflineActions(): Promise<OfflineAction[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Base de datos no inicializada'));
        return;
      }

      const transaction = this.db.transaction([STORES.OFFLINE_ACTIONS], 'readonly');
      const store = transaction.objectStore(STORES.OFFLINE_ACTIONS);
      const index = store.index('synced');
      const request = index.getAll(false);

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Marcar acción como sincronizada
   */
  async markActionAsSynced(actionId: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Base de datos no inicializada'));
        return;
      }

      const transaction = this.db.transaction([STORES.OFFLINE_ACTIONS], 'readwrite');
      const store = transaction.objectStore(STORES.OFFLINE_ACTIONS);
      const request = store.get(actionId);

      request.onsuccess = () => {
        const action = request.result;
        if (action) {
          action.synced = true;
          const updateRequest = store.put(action);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Limpiar datos antiguos
   */
  async clearOldData(daysOld: number = 7): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Base de datos no inicializada'));
        return;
      }

      const cutoffDate = Date.now() - daysOld * 24 * 60 * 60 * 1000;
      const transaction = this.db.transaction([STORES.OFFLINE_ACTIONS], 'readwrite');
      const store = transaction.objectStore(STORES.OFFLINE_ACTIONS);
      const index = store.index('timestamp');
      const request = index.openCursor(IDBKeyRange.upperBound(cutoffDate));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          console.log('[IndexedDB] Datos antiguos eliminados');
          resolve();
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Guardar datos de usuario
   */
  async saveUserData(key: string, data: any): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Base de datos no inicializada'));
        return;
      }

      const transaction = this.db.transaction([STORES.USER_DATA], 'readwrite');
      const store = transaction.objectStore(STORES.USER_DATA);
      const request = store.put({ key, data, timestamp: Date.now() });

      request.onsuccess = () => {
        console.log('[IndexedDB] Datos de usuario guardados:', key);
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Obtener datos de usuario
   */
  async getUserData(key: string): Promise<any | null> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Base de datos no inicializada'));
        return;
      }

      const transaction = this.db.transaction([STORES.USER_DATA], 'readonly');
      const store = transaction.objectStore(STORES.USER_DATA);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result?.data || null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Eliminar datos de usuario
   */
  async deleteUserData(key: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Base de datos no inicializada'));
        return;
      }

      const transaction = this.db.transaction([STORES.USER_DATA], 'readwrite');
      const store = transaction.objectStore(STORES.USER_DATA);
      const request = store.delete(key);

      request.onsuccess = () => {
        console.log('[IndexedDB] Datos de usuario eliminados:', key);
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Buscar productos por nombre
   */
  async searchProducts(query: string): Promise<Product[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Base de datos no inicializada'));
        return;
      }

      const transaction = this.db.transaction([STORES.PRODUCTS], 'readonly');
      const store = transaction.objectStore(STORES.PRODUCTS);
      const index = store.index('nombre');
      const request = index.getAll();

      request.onsuccess = () => {
        const products = request.result || [];
        const filtered = products.filter((product: Product) =>
          product.nombre.toLowerCase().includes(query.toLowerCase()) ||
          product.descripcion?.toLowerCase().includes(query.toLowerCase())
        );
        resolve(filtered);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Obtener productos por categoría
   */
  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Base de datos no inicializada'));
        return;
      }

      const transaction = this.db.transaction([STORES.PRODUCTS], 'readonly');
      const store = transaction.objectStore(STORES.PRODUCTS);
      const index = store.index('categoria');
      const request = index.getAll(categoryId);

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Obtener estadísticas de la base de datos
   */
  async getStats(): Promise<{
    products: number;
    categories: number;
    offlineActions: number;
    pendingActions: number;
  }> {
    if (!this.db) {
      await this.init();
    }

    return new Promise(async (resolve, reject) => {
      if (!this.db) {
        reject(new Error('Base de datos no inicializada'));
        return;
      }

      try {
        const [products, categories, offlineActions, pendingActions] = await Promise.all([
          this.getProducts().then((p) => p.length),
          this.getCategories().then((c) => c.length),
          new Promise<number>((resolve, reject) => {
            const transaction = this.db!.transaction([STORES.OFFLINE_ACTIONS], 'readonly');
            const store = transaction.objectStore(STORES.OFFLINE_ACTIONS);
            const request = store.count();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          }),
          this.getPendingOfflineActions().then((a) => a.length),
        ]);

        resolve({
          products,
          categories,
          offlineActions,
          pendingActions,
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Limpiar toda la base de datos
   */
  async clearAll(): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Base de datos no inicializada'));
        return;
      }

      const transaction = this.db.transaction(
        [STORES.PRODUCTS, STORES.CATEGORIES, STORES.OFFLINE_ACTIONS, STORES.USER_DATA],
        'readwrite'
      );

      Promise.all([
        new Promise<void>((resolve, reject) => {
          const request = transaction.objectStore(STORES.PRODUCTS).clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        }),
        new Promise<void>((resolve, reject) => {
          const request = transaction.objectStore(STORES.CATEGORIES).clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        }),
        new Promise<void>((resolve, reject) => {
          const request = transaction.objectStore(STORES.OFFLINE_ACTIONS).clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        }),
        new Promise<void>((resolve, reject) => {
          const request = transaction.objectStore(STORES.USER_DATA).clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        }),
      ])
        .then(() => {
          console.log('[IndexedDB] Base de datos limpiada');
          resolve();
        })
        .catch(reject);
    });
  }
}

// Exportar instancia singleton
export const indexedDBService = new IndexedDBService();
export default indexedDBService;

