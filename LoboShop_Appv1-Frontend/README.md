# 🐺 LoboShop App v1 (Frontend)

Aplicación cliente para la plataforma de e-commerce LoboShop.

Construida con **Ionic**, **React** y **Vite**, esta aplicación ofrece una experiencia de usuario fluida y moderna para interactuar con la API de LoboShop, permitiendo el despliegue como aplicación web (PWA) y móvil (iOS/Android) desde una única base de código TypeScript.

## ✨ Características Principales

* **Autenticación de Usuarios:** Páginas de Registro e Inicio de Sesión con manejo de errores y estado de carga.
* **Gestión de Estado Global:** Uso de **React Context** (`AuthContext`) para gestionar el estado de autenticación (usuario y token) en toda la aplicación.
* **Sesión Persistente:** Utiliza `@ionic/storage` para guardar el token y los datos del usuario, manteniendo la sesión activa después de cerrar la app.
* **Enrutamiento Protegido:** Implementación de `PrivateRoute` que redirige automáticamente a los usuarios no autenticados a la página de login.
* **CRUD de Productos:**
    * **Ver Productos:** Lista pública de todos los productos (`/products`) y vista de detalle (`/product/:id`).
    * **Mis Productos:** Sección privada (`/my-products`) para que los usuarios vean, editen y eliminen sus propios productos.
    * **Crear y Editar:** Formularios completos para crear y editar productos, incluyendo un selector de imagen.
* **Componentes Reutilizables:** Componentes modulares como `Input`, `Button`, `ProductCard` y `ImagePicker`.
* **Capacitor:** Configurado para integración nativa (cámara, almacenamiento, etc.).

## 🛠️ Stack de Tecnologías

* **Ionic Framework 8** (con `@ionic/react`)
* **React 19**
* **Vite** (Bundler y Servidor de Desarrollo)
* **TypeScript**
* **React Router 5** (con `@ionic/react-router`)
* **Axios** (para peticiones HTTP)
* **Ionic Storage** (para persistencia de datos)
* **Capacitor** (para funcionalidades nativas)
* **Vitest** y **Cypress** (para testing)

## 🚀 Instalación y Puesta en Marcha

1.  **Clonar el repositorio**
    ```bash
    git clone https://github.com/RodrigoVilla101/LoboShop_Appv1
    cd LoboShop_Appv1
    ```

2.  **Instalar dependencias**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno**
    Crea un archivo `.env` en la raíz del proyecto para apuntar a tu API backend.
    ```env
    # URL base de tu API backend (ej. http://localhost:3000/api/v1)
    VITE_API_URL=http://localhost:3000/api/v1
    ```
    *Importante: El servicio `api.ts` está configurado para leer esta variable (`import.meta.env.VITE_API_URL`).*

4.  **Iniciar el servidor de desarrollo**
    ```bash
    npm run dev
    ```

## 📜 Scripts Disponibles



* `npm run dev`: Inicia el servidor de desarrollo de Vite.
* `npm run build`: Compila la aplicación para producción (genera la carpeta `dist`).
* `npm run preview`: Sirve la build de producción localmente.
* `npm run test.unit`: Ejecuta las pruebas unitarias con Vitest.
* `npm run test.e2e`: Ejecuta las pruebas E2E con Cypress.
* `npm run lint`: Revisa el código con ESLint.

## 🏗️ Estructura del Proyecto

* `src/components`: Componentes de React reutilizables (Botones, Inputs, Cards).
* `src/context`: React Context API para gestión de estado global (ej. `AuthContext`).
* `src/pages`: Componentes principales que representan cada página/ruta de la app.
* `src/services`: Lógica de comunicación con APIs externas (ej. `api.ts` con Axios).
* `src/types`: Definiciones de interfaces de TypeScript (ej. `auth.types.ts`, `product.types.ts`).
* `src/App.tsx`: Componente raíz, define el enrutador principal y las rutas (públicas y privadas).
* `src/main.tsx`: Punto de entrada de la aplicación React.