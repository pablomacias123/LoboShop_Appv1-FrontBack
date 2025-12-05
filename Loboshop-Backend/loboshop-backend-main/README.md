# 🐺 LoboShop API Backend

API RESTful robusta y segura construida con Node.js, Express y MongoDB para la plataforma de e-commerce LoboShop.

Este backend maneja la autenticación de usuarios, la gestión de productos (CRUD), el manejo de categorías y la subida de imágenes.

## ✨ Características Principales

* **Autenticación JWT:** Sistema completo de registro y login basado en JSON Web Tokens (JWT).
* **Seguridad de Contraseñas:** Hashing de contraseñas automático antes de guardar en la base de datos usando `bcryptjs`.
* **Rutas Protegidas:** Middleware de autenticación (`proteger`) para asegurar endpoints que requieren un usuario logueado.
* **CRUD de Productos:** Funcionalidad completa para Crear, Leer, Actualizar y Eliminar productos, asociándolos a un vendedor (usuario) y una categoría.
* **Gestión de Categorías:** API para listar y crear categorías de productos.
* **Subida de Imágenes:** Manejo de subida de archivos (imágenes de productos) usando `multer`.
* **Scripts de Seeding:** Utilidades para poblar la base de datos con datos iniciales (categorías y productos).

## 🛠️ Stack de Tecnologías

* **Node.js**
* **Express**
* **MongoDB** (con **Mongoose** como ODM)
* **jsonwebtoken (`jwt`)**
* **bcryptjs**
* **Multer** (para subida de archivos)
* **dotenv** (para variables de entorno)
* **cors**

## 🚀 Instalación y Puesta en Marcha

1.  **Clonar el repositorio**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd loboshop-backend
    ```

2.  **Instalar dependencias**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno**
    Crea un archivo `.env` en la raíz del proyecto y añade las siguientes variables:
    ```env
    # Puerto del servidor
    PORT=3000

    # URL de conexión a tu base de datos MongoDB
    MONGODB_URI=mongodb://localhost:27017/loboshop

    # Clave secreta para firmar los JWT
    JWT_SECRET=tu_clave_secreta_aqui

    # Expiración del token (ej. 30d, 1h, 60s)
    JWT_EXPIRE=30d
    ```

4.  **Servir los archivos de imágenes**
    El backend está configurado para servir los archivos subidos en la carpeta `uploads`. Debes crear esta carpeta en la raíz:
    ```bash
    mkdir uploads
    ```
    Y en `src/app.js` se configura para que sea pública:
    ```javascript
    // src/app.js
    // ...
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    // ...
    ```

## 📜 Scripts Disponibles

* **Iniciar servidor en modo desarrollo (con `nodemon`):**
    ```bash
    npm run dev
    ```
* **Iniciar servidor en modo producción:**
    ```bash
    npm start
    ```
* **Poblar base de datos (seeding):**
    * Para poblar categorías:
        ```bash
        npm run seed:categorias
        ```
    * Para poblar productos de ejemplo:
        ```bash
        npm run seed:productos
        ```

## 🔌 Endpoints de la API

La URL base de la API es `/api/v1`.

### Autenticación (`/api/v1/auth`)


| Método | Ruta | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `POST` | `/registro` | Registra un nuevo usuario. | Público |
| `POST` | `/login` | Inicia sesión y devuelve un token JWT. | Público |
| `GET` | `/perfil` | Obtiene el perfil del usuario autenticado. | Protegido |

### Productos (`/api/v1/products`)


| Método | Ruta | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Obtiene una lista de todos los productos. | Público |
| `GET` | `/:id` | Obtiene un producto por su ID. | Público |
| `GET` | `/mis-productos` | Obtiene los productos del usuario autenticado. | Protegido |
| `POST` | `/` | Crea un nuevo producto (usa `form-data`). | Protegido |
| `PUT` | `/:id` | Actualiza un producto (usa `form-data`). | Protegido |
| `DELETE` | `/:id` | Elimina un producto. | Protegido |

### Categorías (`/api/v1/categories`)


| Método | Ruta | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Obtiene todas las categorías. | Público |
| `POST` | `/` | Crea una nueva categoría (requiere rol `admin`). | Protegido |

