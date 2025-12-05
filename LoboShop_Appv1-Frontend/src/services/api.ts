import axios from 'axios';
import { LoginCredentials, RegisterData, AuthResponse } from '../types/auth.types';
import { Product, ProductFilters, ProductsResponse, Category } from '../types/product.types';

// Configuración base de axios
const api = axios.create({
  // ANTES (para móvil):
  // baseURL: 'http://192.168.1.4:3000/api/v1',
  baseURL: 'http://localhost:3000/api/v1',
  timeout: 30000, // 30 segundos para permitir carga de imágenes
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('[API] Error en interceptor de request:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('[API] Error en interceptor de request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no hemos intentado refrescar el token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Limpiar token inválido
        localStorage.removeItem('token');
        // Redirigir al login si estamos en el navegador
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      } catch (refreshError) {
        console.error('[API] Error al manejar token expirado:', refreshError);
      }
    }

    // Manejar errores de red
    if (!error.response) {
      console.error('[API] Error de red:', error.message);
      throw new Error('Error de conexión. Verifica tu conexión a internet.');
    }

    // Manejar otros errores HTTP
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'Error desconocido';

    switch (status) {
      case 400:
        throw new Error(`Solicitud inválida: ${message}`);
      case 403:
        throw new Error(`Acceso denegado: ${message}`);
      case 404:
        throw new Error(`Recurso no encontrado: ${message}`);
      case 500:
        throw new Error(`Error del servidor: ${message}`);
      default:
        throw new Error(message);
    }
  }
);

// Servicios de autenticación
export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/registro', data);
    return response.data;
  },

  getProfile: async (): Promise<AuthResponse> => {
    const response = await api.get<AuthResponse>('/auth/perfil');
    return response.data;
  },

  verifyToken: async (): Promise<boolean> => {
    try {
      await api.get('/auth/perfil');
      return true;
    } catch {
      return false;
    }
  },
};

// Servicios de categorías
export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get('/categorias');
    return response.data.categorias;
  },

  getById: async (id: string): Promise<Category> => {
    const response = await api.get(`/categorias/${id}`);
    return response.data.categoria;
  },
};

// Servicios de productos
export const productService = {
  // Obtener productos con filtros
  getAll: async (filters?: ProductFilters): Promise<ProductsResponse> => {
    const response = await api.get('/productos', { params: filters });
    return response.data;
  },

  // Obtener un producto por ID
  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/productos/${id}`);
    return response.data.producto;
  },

  // Obtener mis productos
  getMyProducts: async (): Promise<Product[]> => {
    const response = await api.get('/productos/usuario/mis-productos');
    return response.data.productos;
  },

  // Crear producto con imágenes
  create: async (formData: FormData): Promise<Product> => {
    const response = await api.post('/productos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.producto;
  },

  // Actualizar producto
  update: async (id: string, formData: FormData): Promise<Product> => {
    const response = await api.put(`/productos/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.producto;
  },

  // Eliminar producto
  delete: async (id: string): Promise<void> => {
    await api.delete(`/productos/${id}`);
  },

  // Eliminar imagen específica
  deleteImage: async (productId: string, imageId: string): Promise<void> => {
    await api.delete(`/productos/${productId}/imagenes/${imageId}`);
  },
};

export default api;

