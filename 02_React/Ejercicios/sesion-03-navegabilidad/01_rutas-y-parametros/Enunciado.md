# 🧭 Rutas y Parámetros – Ejercicio de Navegabilidad con React Router

## Objetivo

Comprender los fundamentos de **React Router** construyendo una SPA (Single Page Application) con múltiples vistas. Aprenderás a:

- Configurar `BrowserRouter`, `Routes` y `Route`.
- Crear un **layout común** con una barra de navegación compartida usando `Outlet`.
- Navegar entre vistas con `Link`.
- Acceder a **path params** con `useParams`.
- Acceder a **query params** con `useSearchParams`.

---

## Descripción de la aplicación

Construirás una mini aplicación llamada **RoutExplorer** con la siguiente estructura de navegación:

```
/                → Página de inicio (Home)
/about           → Página "Sobre nosotros" (sin hooks de router)
/users/:userId   → Perfil de usuario (usa useParams)
/products        → Catálogo de productos (usa useSearchParams)
```

Todas las páginas comparten un **layout común** con una barra de navegación superior y un pie de página.

---

## Diseño de la pantalla

```
┌────────────────────────────────────────────────────────────────┐
│  🧭 RoutExplorer      Inicio  ·  Sobre nosotros  ·  Usuarios │  ← Navbar (común)
│                        ·  Productos                            │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│                   [ Contenido de la vista ]                    │  ← Outlet (cambia)
│                                                                │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│              © 2026 RoutExplorer – React Router 7              │  ← Footer (común)
└────────────────────────────────────────────────────────────────┘
```

---

## Requisitos

### Generales

- Proyecto creado con **React 19 + Vite** (JavaScript, sin TypeScript).
- Usa **react-router-dom v7** (`npm install react-router-dom`).
- Estilos en **CSS plano** (sin librerías externas).
- **Todos los componentes** deben incluir un `console.log` al inicio de su función para visualizar cuándo se renderizan. Ejemplo: `console.log("🏠 [Home] render");`

### Estructura de rutas

| Ruta | Componente | Descripción |
|---|---|---|
| `/` | `Home` | Página de bienvenida. Muestra un título y enlaces de ejemplo a usuarios y productos. |
| `/about` | `AboutUs` | Página estática "Sobre nosotros". **No usa ningún hook de react-router.** |
| `/users/:userId` | `UserProfile` | Muestra el perfil de un usuario. Usa **`useParams`** para leer `userId` de la URL. |
| `/products` | `Products` | Lista productos con filtro por categoría. Usa **`useSearchParams`** para leer/modificar `?category=...` en la URL. |

### Layout común

- Un componente `Layout` que incluya:
  - **`Navbar`**: barra de navegación con `<Link>` a cada vista.
  - **`<Outlet />`**: marca dónde se renderiza la vista hija.
  - **`Footer`**: pie de página.

### Datos

Crea un archivo `src/data/users.js` con al menos **3 usuarios** (`id`, `name`, `email`, `bio`).

Crea un archivo `src/data/products.js` con al menos **6 productos** (`id`, `name`, `category`, `price`) repartidos en al menos **3 categorías** distintas.

### Vista `UserProfile`

- Lee el parámetro `:userId` de la URL con `useParams()`.
- Busca el usuario correspondiente en el array de datos.
- Si el usuario no existe, muestra un mensaje de error.

### Vista `Products`

- Lee el query param `category` de la URL con `useSearchParams()`.
- Filtra los productos por categoría si el parámetro existe.
- Muestra botones para cambiar la categoría (actualizan la URL con `setSearchParams`).
- Un botón "Todas" limpia el filtro.

---

## Estructura de carpetas sugerida

```
src/
├── main.jsx
├── index.css
├── App.jsx
├── App.css
├── data/
│   ├── users.js
│   └── products.js
├── components/
│   ├── Layout/
│   │   ├── Layout.jsx
│   │   └── Layout.css
│   ├── Navbar/
│   │   ├── Navbar.jsx
│   │   └── Navbar.css
│   └── Footer/
│       ├── Footer.jsx
│       └── Footer.css
└── pages/
    ├── Home.jsx
    ├── AboutUs.jsx
    ├── UserProfile.jsx
    └── Products.jsx
```

---

## Criterios de evaluación

- ✅ `BrowserRouter` envuelve toda la aplicación en `main.jsx`.
- ✅ Existe un `Route` padre con `element={<Layout />}` que usa `<Outlet />`.
- ✅ Cada ruta renderiza el componente correcto.
- ✅ La navegación funciona con `<Link>` (sin recargar la página).
- ✅ `UserProfile` usa `useParams()` correctamente para leer `:userId`.
- ✅ `Products` usa `useSearchParams()` correctamente para leer y modificar `?category=...`.
- ✅ Todos los componentes imprimen un `console.log` al renderizarse.
- ✅ El layout (Navbar + Footer) se mantiene al cambiar de vista.

---

## Pistas

- `BrowserRouter` se coloca en `main.jsx`, envolviendo a `<App />`.
- Un `Route` puede tener hijos (`children`) cuando quieres que compartan un layout.
- `<Outlet />` es el "hueco" donde React Router inyecta la ruta hija actual.
- `useParams()` devuelve un objeto con los segmentos dinámicos (`:userId` → `{ userId: "3" }`).
- `useSearchParams()` devuelve un par `[searchParams, setSearchParams]`, similar a `useState`.
- `searchParams.get("category")` lee el valor del query param.
- Abre la consola del navegador para ver los logs de renderizado.

