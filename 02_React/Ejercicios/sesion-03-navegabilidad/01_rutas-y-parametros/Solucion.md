# 🧭 Rutas y Parámetros – Solución paso a paso

## Racional previo: ¿qué problema resuelve React Router?

En una aplicación React "vanilla", solo existe un único componente `App` que se renderiza en la página. Si queremos que el usuario navegue a "vistas" diferentes (como una sección de "Sobre nosotros" o un perfil de usuario), tenemos dos opciones:

1. **Navegación tradicional (servidor):** cada clic carga una nueva página HTML. El navegador hace una petición al servidor, recibe HTML nuevo y lo renderiza desde cero. Es lento y destruye todo el estado de React.

2. **Navegación del lado del cliente (SPA):** la URL cambia pero **no se recarga la página**. JavaScript intercepta el cambio de URL y React intercambia los componentes visibles. Esto es lo que hace React Router.

### Conceptos clave que vamos a usar

| Concepto | Qué hace |
|---|---|
| `BrowserRouter` | Envuelve la app y "escucha" cambios en la URL del navegador (usa la History API). |
| `Routes` | Contenedor que evalúa todas las `Route` hijas y renderiza la que coincida con la URL actual. |
| `Route` | Asocia un `path` con un componente (`element`). |
| `Route` padre con hijos | Permite definir un layout común. El padre usa `<Outlet />` para marcar dónde se pintan los hijos. |
| `Outlet` | Punto de inserción donde React Router renderiza la ruta hija activa dentro de un layout. |
| `Link` | Equivale a un `<a>`, pero sin recargar la página. |
| `useParams()` | Hook que devuelve un objeto con los segmentos dinámicos de la URL (`:userId` → `{ userId: "3" }`). |
| `useSearchParams()` | Hook que devuelve `[searchParams, setSearchParams]` para leer/escribir los query params (`?category=tech`). |

---

## Paso 1 – Crear el proyecto

```bash
npm create vite@latest solucion -- --template react
cd solucion
npm install
npm install react-router-dom
```

Esto nos da React 19 con Vite y react-router-dom v7.

---

## Paso 2 – Decidir la estructura de rutas

Antes de escribir código, pensamos en **qué URLs queremos** y **qué se ve en cada una**:

```
/                →  Home           (bienvenida genérica)
/about           →  AboutUs        (estática, sin hooks de router)
/users/:userId   →  UserProfile    (dinámica, necesita useParams)
/products        →  Products       (con filtro, necesita useSearchParams)
```

Todas comparten un Navbar y un Footer. Esto nos lleva a definir un **Route padre** (Layout) con rutas hijas anidadas:

```
<Route element={<Layout />}>        ← renderiza Navbar + Outlet + Footer
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<AboutUs />} />
  <Route path="/users/:userId" element={<UserProfile />} />
  <Route path="/products" element={<Products />} />
</Route>
```

El `<Outlet />` dentro de `Layout` se sustituye automáticamente por el componente de la ruta hija que coincida con la URL.

---

## Paso 3 – Datos estáticos

Creamos archivos separados para simular datos que podrían venir de un backend.

### `src/data/users.js`

```js
export const users = [
  { id: 1, name: "Ana García", email: "ana@example.com", bio: "Desarrolladora frontend..." },
  { id: 2, name: "Carlos López", email: "carlos@example.com", bio: "Ingeniero de datos..." },
  { id: 3, name: "Lucía Martínez", email: "lucia@example.com", bio: "Diseñadora UX/UI..." },
];
```

### `src/data/products.js`

```js
export const products = [
  { id: 1, name: "Laptop Pro", category: "Electrónica", price: 1299 },
  // ... al menos 6 productos en 3 categorías
];
```

> **¿Por qué archivos separados?** Separar datos de presentación es siempre una buena práctica. Si mañana estos datos vienen de una API REST, solo cambiamos la fuente de datos, no los componentes.

---

## Paso 4 – `main.jsx`: el punto de entrada con BrowserRouter

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
```

**¿Por qué `BrowserRouter` aquí y no en `App`?** Porque queremos que **toda la aplicación** tenga acceso al contexto de routing. `BrowserRouter` usa la Context API internamente: si un componente está fuera de este provider, hooks como `useParams` o `Link` no funcionarán.

---

## Paso 5 – `App.jsx`: definición de rutas

```jsx
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import UserProfile from "./pages/UserProfile";
import Products from "./pages/Products";

export default function App() {
  console.log("🔄 [App] render");
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/users/:userId" element={<UserProfile />} />
        <Route path="/products" element={<Products />} />
      </Route>
    </Routes>
  );
}
```

**Detalle clave:** el `Route` padre **no tiene `path`**. Esto significa que siempre coincide y siempre renderiza `<Layout />`. Las rutas hijas definen cada path específico.

**¿Qué pasa con `:userId`?** Los dos puntos indican un **segmento dinámico**. La URL `/users/42` hará que `useParams()` devuelva `{ userId: "42" }`. Siempre es string; si necesitas un número, haz `Number(userId)`.

---

## Paso 6 – Layout: Navbar + Outlet + Footer

```jsx
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";

export default function Layout() {
  console.log("📐 [Layout] render");
  return (
    <div className="layout">
      <Navbar />
      <main className="layout__content">
        <Outlet />   {/* ← Aquí se inyecta la ruta hija activa */}
      </main>
      <Footer />
    </div>
  );
}
```

**¿Por qué `<Outlet />`?** Sin él, las rutas hijas no tendrían dónde renderizarse. `Outlet` es la pieza que conecta el layout padre con la vista hija actual. Cuando la URL cambia de `/about` a `/products`, React Router desmonta `<AboutUs />` y monta `<Products />` **dentro** del mismo `Outlet`, pero el `Layout` (con su Navbar y Footer) **no se desmonta ni se vuelve a montar**. Esto es eficiente y mantiene la experiencia fluida.

---

## Paso 7 – Navbar: navegación con `<Link>`

```jsx
import { Link } from "react-router-dom";

export default function Navbar() {
  console.log("🧭 [Navbar] render");
  return (
    <nav>
      <Link to="/">Inicio</Link>
      <Link to="/about">Sobre nosotros</Link>
      <Link to="/users/1">Usuario 1</Link>
      <Link to="/products">Productos</Link>
    </nav>
  );
}
```

**¿Por qué `Link` y no `<a href>`?** Un `<a>` haría una petición al servidor y recargaría la página entera, destruyendo el estado de React. `Link` usa `event.preventDefault()` internamente y actualiza la URL con `history.pushState()`, dejando que React Router maneje el cambio.

---

## Paso 8 – Vista `AboutUs` (sin hooks de router)

```jsx
export default function AboutUs() {
  console.log("ℹ️ [AboutUs] render");
  return (
    <div>
      <h1>Sobre nosotros</h1>
      <p>Somos un equipo apasionado...</p>
    </div>
  );
}
```

Esta vista demuestra que **no todas las páginas necesitan hooks de React Router**. Es un componente puro de presentación al que simplemente se llega mediante una ruta.

---

## Paso 9 – Vista `UserProfile` (useParams)

```jsx
import { useParams } from "react-router-dom";
import { users } from "../data/users";

export default function UserProfile() {
  const { userId } = useParams();
  console.log("👤 [UserProfile] render – userId:", userId);

  const user = users.find((u) => u.id === Number(userId));

  if (!user) {
    return <p>Usuario no encontrado</p>;
  }

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <p>{user.bio}</p>
    </div>
  );
}
```

**¿Cómo funciona `useParams`?**
1. En `App.jsx` definimos la ruta como `/users/:userId`.
2. Cuando la URL es `/users/2`, React Router hace match y extrae `{ userId: "2" }`.
3. `useParams()` devuelve ese objeto desde cualquier componente renderizado dentro de esa ruta.
4. Como siempre es string, usamos `Number(userId)` para comparar con el `id` numérico del array.

**¿Y si el usuario no existe?** Hacemos una guarda con `if (!user)` y mostramos un mensaje. Esto es un patrón defensivo habitual.

---

## Paso 10 – Vista `Products` (useSearchParams)

```jsx
import { useSearchParams } from "react-router-dom";
import { products, categories } from "../data/products";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category");

  console.log("📦 [Products] render – category:", activeCategory);

  const filtered = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products;

  return (
    <div>
      <h1>Productos</h1>
      <div>
        <button onClick={() => setSearchParams({})}>Todas</button>
        {categories.map((cat) => (
          <button key={cat} onClick={() => setSearchParams({ category: cat })}>
            {cat}
          </button>
        ))}
      </div>
      <ul>
        {filtered.map((p) => (
          <li key={p.id}>{p.name} – {p.category} – {p.price} €</li>
        ))}
      </ul>
    </div>
  );
}
```

**¿Cómo funciona `useSearchParams`?**
- Es similar a `useState`: devuelve el valor actual y una función para actualizarlo.
- `searchParams.get("category")` lee el valor de `?category=...` de la URL.
- `setSearchParams({ category: "Electrónica" })` cambia la URL a `?category=Electrónica` **sin recargar la página**.
- `setSearchParams({})` limpia todos los query params.

**¿Cuál es la diferencia con `useParams`?**
- `useParams` lee **path params** (segmentos de la ruta: `/users/42`).
- `useSearchParams` lee **query params** (después del `?`: `/products?category=Ropa`).
- Los path params son obligatorios en la estructura de la ruta; los query params son opcionales y no afectan al matching de rutas.

---

## Paso 11 – Observar los logs de renderizado

Al abrir la consola del navegador verás algo como:

```
🔄 [App] render
📐 [Layout] render
🧭 [Navbar] render
🏠 [Home] render
🦶 [Footer] render
```

Si ahora navegas a `/about`:
```
🔄 [App] render
📐 [Layout] render
🧭 [Navbar] render
ℹ️ [AboutUs] render
🦶 [Footer] render
```

Observa que **Layout, Navbar y Footer se vuelven a ejecutar** (sus funciones se invocan), pero React NO desmonta/monta esos nodos del DOM si no han cambiado. Lo que sí cambia es el contenido del `<Outlet />`. En StrictMode, React ejecuta los renders dos veces en desarrollo para detectar efectos secundarios.

---

## Árbol final de componentes

```
BrowserRouter                    ← en main.jsx
  └── App                        ← define Routes
       └── Routes
            └── Route (Layout)   ← Navbar + Outlet + Footer
                 ├── Route /          → Home
                 ├── Route /about     → AboutUs
                 ├── Route /users/:id → UserProfile (useParams)
                 └── Route /products  → Products (useSearchParams)
```

---

## Conceptos clave practicados

| Concepto | Dónde se aplica |
|---|---|
| **BrowserRouter** | `main.jsx` – envuelve toda la app |
| **Routes + Route** | `App.jsx` – define las rutas |
| **Route anidada (layout)** | `App.jsx` – Route padre sin path con `<Layout />` |
| **Outlet** | `Layout.jsx` – marca dónde se renderiza la vista activa |
| **Link** | `Navbar.jsx` y `Home.jsx` – navegación sin recarga |
| **useParams** | `UserProfile.jsx` – lee `:userId` de la URL |
| **useSearchParams** | `Products.jsx` – lee y modifica `?category=` |
| **console.log de render** | Todos los componentes – observar ciclo de vida |

---

## Para ejecutar la solución

```bash
cd solucion
npm install
npm run dev
```

La aplicación arrancará en `http://localhost:5173`. Abre la consola del navegador (F12) para ver los logs de renderizado mientras navegas entre vistas.

