# 🔐 Rutas Protegidas con Context – Solución paso a paso

## Racional previo: ¿por qué proteger rutas?

En una aplicación real, no todas las páginas son públicas. Un panel de usuario, un historial de pedidos o un catálogo de precios exclusivos requieren que el usuario haya iniciado sesión. Si alguien intenta acceder a esas URLs directamente (pegando la URL en el navegador), debemos **redirigirle al login**.

En aplicaciones de servidor tradicionales, la protección ocurre en el backend: el servidor comprueba la sesión/cookie y devuelve un 401 o redirige. En una **SPA con React Router**, la protección es **del lado del cliente**: antes de renderizar un componente, comprobamos si hay un usuario autenticado en nuestro estado global.

> ⚠️ **Importante:** la protección del lado del cliente es una cuestión de **UX**, no de **seguridad**. Los datos sensibles siempre deben protegerse en el backend. Lo que hacemos aquí es evitar que el usuario vea una pantalla vacía o rota si no tiene permisos.

### Piezas del puzzle

| Pieza | Responsabilidad |
|---|---|
| **Context API** (`AuthContext` + `AuthProvider`) | Almacena el estado de sesión (`user`) y lo hace accesible a cualquier componente del árbol. |
| **Custom hook** (`useAuth`) | Encapsula la lógica de `login`/`logout` para que los componentes no manejen directamente el contexto. |
| **`PrivateRoute`** | Componente "guardia" que comprueba la autenticación antes de renderizar la vista. Si no hay sesión, redirige a `/login`. |
| **`Navigate`** | Componente de React Router que ejecuta una redirección programática en el render. |
| **`location.state`** | Mecanismo de React Router para pasar datos entre rutas sin usar la URL visible. Lo usamos para recordar "de dónde venía" el usuario. |

---

## Paso 1 – Crear el proyecto

```bash
npm create vite@latest solucion -- --template react
cd solucion
npm install
npm install react-router-dom
```

Partimos de React 19 + Vite + react-router-dom v7, igual que en el ejercicio anterior.

---

## Paso 2 – Planificar las rutas y su accesibilidad

```
Ruta              Componente      Pública    Protegida
──────────────────────────────────────────────────────
/                 Home            ✅
/about            AboutUs         ✅
/login            Login           ✅          (redirige si ya logueado)
/dashboard        Dashboard                   🔒
/users/:userId    UserProfile                 🔒
/products         Products                    🔒
```

Todas comparten el layout (Navbar + Outlet + Footer). Las rutas protegidas envuelven su `element` con `<PrivateRoute>`.

---

## Paso 3 – Datos mock

### `src/data/credentials.js`

```js
export const credentials = [
  { username: "admin", password: "admin123", name: "Administrador", email: "admin@routexplorer.com", role: "admin" },
  { username: "user",  password: "user123",  name: "Usuario Demo", email: "demo@routexplorer.com", role: "user" },
];
```

Simulamos una "base de datos" de usuarios. En una app real, las credenciales se validarían contra un backend y nunca se almacenarían en el frontend.

### `src/data/users.js` y `src/data/products.js`

Se reutilizan del ejercicio anterior sin cambios.

---

## Paso 4 – Context de autenticación

### `src/context/AuthContext.jsx`

```jsx
import { createContext } from "react";
export const AuthContext = createContext();
```

`createContext()` crea un "canal" para compartir datos entre componentes sin pasar props manualmente. Es el paso más sencillo, pero el más importante: define **qué vamos a compartir**.

### `src/context/AuthProvider.jsx`

```jsx
import { useState } from "react";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**¿Por qué separar `AuthContext` de `AuthProvider`?**
- `AuthContext` es solo la definición del contexto (el "tipo" del canal).
- `AuthProvider` es el componente que **provee** los valores reales. Lo separamos porque cualquier fichero que necesite **consumir** el contexto solo importa `AuthContext`, sin depender de la implementación del provider.

**¿Por qué `useState(null)`?**
- `null` significa "no hay sesión activa". Cuando el usuario haga login, `setUser` recibirá un objeto con sus datos. Cuando haga logout, volverá a `null`.

---

## Paso 5 – Custom hook `useAuth`

```js
// src/hooks/useAuth.js
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { credentials } from "../data/credentials";

export function useAuth() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const login = (username, password) => {
    const found = credentials.find(
      (c) => c.username === username && c.password === password
    );
    if (found) {
      const { password: _, ...userData } = found;  // excluir password
      setUser(userData);
      return { success: true };
    }
    return { success: false, error: "Credenciales incorrectas" };
  };

  const logout = () => {
    setUser(null);
    navigate("/");
  };

  return { user, isAuthenticated: !!user, login, logout };
}
```

**¿Por qué un custom hook y no usar `useContext` directamente?**
1. **Encapsulación:** los componentes no necesitan saber que usamos `AuthContext` internamente. Si mañana cambiamos a Zustand o Redux, solo cambiamos el hook.
2. **Lógica centralizada:** `login` y `logout` viven en un solo sitio, no duplicados en cada componente.
3. **API limpia:** el componente llama a `login("admin", "admin123")` y recibe `{ success: true/false }`.

**¿Por qué `{ password: _, ...userData }`?** Usamos desestructuración con rest para excluir el campo `password` del objeto que guardamos en el contexto. No queremos que la contraseña circule por toda la app.

---

## Paso 6 – `PrivateRoute`: el componente guardián

```jsx
// src/components/PrivateRoute/PrivateRoute.jsx
import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  console.log("🛡️ [PrivateRoute] check –", user ? "✅ autenticado" : "❌ sin sesión", "– ruta:", location.pathname);

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
```

**¿Cómo funciona?**
1. Lee `user` del contexto. Si es `null`, no hay sesión.
2. Lee `location.pathname` para saber **qué ruta intentaba visitar** el usuario.
3. Si no hay sesión, renderiza `<Navigate>`, que ejecuta una redirección inmediata a `/login`.
4. Pasa `state={{ from: location.pathname }}` para que el componente Login pueda redirigir de vuelta tras un login exitoso.
5. `replace` evita que la redirección quede en el historial (el botón "atrás" no vuelve a la ruta protegida).
6. Si hay sesión, simplemente renderiza `children` (el componente protegido).

**¿Por qué no es una `Route`?** `PrivateRoute` es un **componente wrapper**, no una ruta en sí. Se usa **dentro** del `element` de una `Route`:

```jsx
<Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
```

---

## Paso 7 – Jerarquía de providers en `main.jsx`

```jsx
<StrictMode>
  <AuthProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AuthProvider>
</StrictMode>
```

**¿Por qué `AuthProvider` envuelve a `BrowserRouter`?**
- `useAuth` usa `useNavigate()`, que requiere estar dentro de `BrowserRouter`.
- Pero `AuthProvider` NO usa hooks de router; solo gestiona estado con `useState`.
- Al ponerlo fuera, garantizamos que el contexto de autenticación está disponible incluso antes de que el router se inicialice.
- Si lo pusiéramos dentro de `BrowserRouter`, también funcionaría, pero conceptualmente el estado de autenticación es más "global" que el routing.

---

## Paso 8 – `App.jsx`: rutas con protección

```jsx
<Routes>
  <Route element={<Layout />}>
    {/* Rutas públicas */}
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<AboutUs />} />
    <Route path="/login" element={<Login />} />

    {/* Rutas protegidas */}
    <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
    <Route path="/users/:userId" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
    <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
  </Route>
</Routes>
```

Observa que la estructura de `Routes` es idéntica al ejercicio 1, pero las rutas protegidas tienen su `element` envuelto por `<PrivateRoute>`. Esto es lo elegante del patrón: **no cambiamos la definición de rutas**, solo añadimos un wrapper.

---

## Paso 9 – Navbar condicional

```jsx
const { user } = useContext(AuthContext);

// Mostrar diferentes enlaces según la sesión
{user ? (
  <>
    <Link to="/products">Productos</Link>
    <Link to="/users/1">Usuarios</Link>
    <Link to="/dashboard">👤 Panel</Link>
  </>
) : (
  <Link to="/login">🔒 Iniciar sesión</Link>
)}
```

El Navbar **consume** el `AuthContext` para saber si hay sesión. Si la hay, muestra enlaces a las rutas protegidas y al panel. Si no, muestra el enlace de login. Esto es una mejora de UX: no mostramos enlaces que van a redirigir al login.

---

## Paso 10 – Login con redirección inteligente

```jsx
// En Login.jsx
const location = useLocation();
const from = location.state?.from || "/dashboard";

// Tras login exitoso:
navigate(from, { replace: true });
```

**El flujo completo:**
1. El usuario intenta ir a `/products` sin sesión.
2. `PrivateRoute` redirige a `/login` con `state: { from: "/products" }`.
3. El componente `Login` lee `location.state?.from` → `"/products"`.
4. Tras un login exitoso, `navigate("/products", { replace: true })`.
5. El usuario llega a donde quería originalmente.

Si el usuario accede a `/login` directamente (sin haber sido redirigido), `state?.from` es `undefined`, así que usamos `"/dashboard"` como destino por defecto.

---

## Paso 11 – Observar los logs en consola

### Acceso a ruta protegida sin sesión:
```
🔄 [App] render
📐 [Layout] render
🧭 [Navbar] render – user: null
🛡️ [PrivateRoute] check – ❌ sin sesión – ruta: /products
🔑 [Login] render – from: /products
🦶 [Footer] render
```

### Después de login exitoso:
```
🔑 [useAuth] login exitoso – usuario: Administrador
🔄 [App] render
📐 [Layout] render
🧭 [Navbar] render – user: Administrador
📦 [Products] render – category: (todas)
🦶 [Footer] render
```

### Logout:
```
🔑 [useAuth] logout
🔄 [App] render
📐 [Layout] render
🧭 [Navbar] render – user: null
🏠 [Home] render
🦶 [Footer] render
```

---

## Árbol de componentes y flujo de datos

```
StrictMode
  └── AuthProvider              ← useState(user) + AuthContext.Provider
       └── BrowserRouter
            └── App             ← define Routes
                 └── Routes
                      └── Route (Layout)     ← Navbar + Outlet + Footer
                           ├── Route /            → Home
                           ├── Route /about       → AboutUs
                           ├── Route /login       → Login (lee state.from)
                           ├── Route /dashboard   → PrivateRoute → Dashboard
                           ├── Route /users/:id   → PrivateRoute → UserProfile
                           └── Route /products    → PrivateRoute → Products

Flujo de autenticación:
  AuthProvider (user state)
       ↕ AuthContext
  useAuth hook ← login / logout / user
       ↕
  PrivateRoute ← lee user → redirige o renderiza
  Navbar       ← lee user → muestra links condicionales
  Login        ← llama login() → redirige a state.from
  Dashboard    ← lee user → muestra datos
```

---

## Conceptos clave practicados

| Concepto | Dónde se aplica |
|---|---|
| **Context API** (`createContext` + `Provider`) | `AuthContext.jsx` + `AuthProvider.jsx` |
| **Custom hook** | `useAuth.js` – encapsula login/logout |
| **Patrón PrivateRoute** | `PrivateRoute.jsx` – guarda las rutas protegidas |
| **`Navigate` programático** | `PrivateRoute` (redirección a login) y `Login` (redirección post-login) |
| **`useNavigate`** | `useAuth` → logout redirige a `/` |
| **`useLocation` + `state`** | Pasar `from` entre PrivateRoute → Login → navigate |
| **Renderizado condicional** | Navbar muestra links diferentes según `user` |
| **Desestructuración con rest** | `useAuth` → excluir password del objeto user |
| **Separación de responsabilidades** | Contexto (estado), hook (lógica), componente (UI) |

---

## Para ejecutar la solución

```bash
cd solucion
npm install
npm run dev
```

La aplicación arrancará en `http://localhost:5173`.

**Credenciales de prueba:**
- `admin` / `admin123` (rol: admin)
- `user` / `user123` (rol: user)

Abre la consola del navegador (F12) para ver los logs de renderizado y el flujo de autenticación.

