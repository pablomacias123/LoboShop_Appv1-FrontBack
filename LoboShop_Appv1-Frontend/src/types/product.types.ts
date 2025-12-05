export interface Category {
  _id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  activa: boolean;
  fechaCreacion: string;
}

export interface Product {
  _id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: Category;
  imagenes: ProductImage[];
  estado: 'nuevo' | 'usado' | 'como_nuevo';
  disponible: boolean;
  vendedor: {
    _id: string;
    nombre: string;
    email: string;
    telefono?: string;
  };
  contacto: {
    telefono?: string;
    whatsapp?: string;
  };
  vistas: number;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface ProductImage {
  _id?: string;
  url: string;
  publicId: string;
}

export interface ProductFormData {
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  estado: 'nuevo' | 'usado' | 'como_nuevo';
  contacto: {
    telefono?: string;
    whatsapp?: string;
  };
}

export interface ProductFilters {
  categoria?: string;
  busqueda?: string;
  minPrecio?: number;
  maxPrecio?: number;
  estado?: string;
  vendedor?: string;
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  productos: Product[];
}
