# 🔐 Rutas Protegidas con Context – Ejercicio de Navegabilidad

## Objetivo

Aprender a **proteger rutas** en una SPA con React Router combinando el patrón **PrivateRoute** con la **Context API** de React. Partiendo de la base del ejercicio anterior (rutas, layout, params), añadirás:

- Un **contexto de autenticación** (`AuthContext` + `AuthProvider`) para gestionar el estado de sesión.
- Un **custom hook** (`useAuth`) que encapsule la lógica de login/logout.
- Un componente **`PrivateRoute`** que redirija a `/login` si el usuario no está autenticado.
- Una página de **Login** con formulario y validación.
- Una página de **Dashboard** privada que muestre datos del usuario logueado.
- Un **Navbar condicional** que muestre "Iniciar sesión" o "Mi perfil / Cerrar sesión" según el estado de autenticación.

---

## Descripción de la aplicación

Se amplía **RoutExplorer** del ejercicio anterior con las siguientes rutas:

```
/                → Home              (pública)
/about           → Sobre nosotros    (pública)
/login           → Login             (pública – redirige a /dashboard si ya está logueado)
/dashboard       → Panel de usuario  (🔒 protegida)
/users/:userId   → Perfil de usuario (🔒 protegida)
/products        → Productos         (🔒 protegida)
```

---

## Diseño de la pantalla

```
┌────────────────────────────────────────────────────────────────┐
│  🧭 RoutExplorer     Inicio · About · Productos · 🔒 Login   │  ← sin sesión
│  🧭 RoutExplorer     Inicio · About · Productos · 👤 Panel   │  ← con sesión
├────────────────────────────────────────────────────────────────┤
│                                                                │
│                  [ Vista según la ruta ]                       │  ← Outlet
│                                                                │
├────────────────────────────────────────────────────────────────┤
│              © 2026 RoutExplorer – React Router 7              │
└────────────────────────────────────────────────────────────────┘
```

### Flujo de protección

```
Usuario pulsa "Productos" (no logueado)
  → PrivateRoute detecta que no hay user en AuthContext
  → Redirige a /login con state = { from: "/products" }

Usuario rellena el formulario y hace login
  → useAuth().login() valida credenciales mock
  → setUser(datos) en el AuthContext
  → Navigate redirige a la ruta original (state.from) o a /dashboard
```

---

## Requisitos

### Generales

- Proyecto creado con **React 19 + Vite** (JavaScript, sin TypeScript).
- Usa **react-router-dom v7**.
- Estilos en **CSS plano**.
- Todos los componentes deben incluir **`console.log`** al renderizarse.

### Datos mock

Crea `src/data/credentials.js` con al menos **2 usuarios** de prueba:

```js
{ username: "admin", password: "admin123", name: "Administrador", email: "admin@routexplorer.com", role: "admin" }
{ username: "user",  password: "user123",  name: "Usuario Demo", email: "demo@routexplorer.com", role: "user" }
```

Reutiliza `src/data/users.js` y `src/data/products.js` del ejercicio anterior.

### Context de autenticación

| Archivo | Responsabilidad |
|---|---|
| `context/AuthContext.jsx` | `createContext()` para compartir el estado de sesión. |
| `context/AuthProvider.jsx` | Componente que envuelve la app con `AuthContext.Provider`. Gestiona `user` con `useState(null)`. |

### Custom hook `useAuth`

| Archivo | Responsabilidad |
|---|---|
| `hooks/useAuth.js` | Encapsula `login(username, password)`, `logout()`, `user` e `isAuthenticated`. Usa `useContext(AuthContext)` y `useNavigate()`. |

- `login` debe:
  1. Buscar las credenciales en `credentials.js`.
  2. Si coinciden, llamar a `setUser(datos)` y devolver `{ success: true }`.
  3. Si no, devolver `{ success: false, error: "..." }`.
- `logout` debe llamar a `setUser(null)` y navegar a `/`.

### Componente `PrivateRoute`

```
PrivateRoute({ children })
  → Lee user de AuthContext
  → Si no hay user → <Navigate to="/login" state={{ from: location.pathname }} replace />
  → Si hay user → renderiza children
```

### Páginas

| Ruta | Componente | Protegida | Descripción |
|---|---|---|---|
| `/` | `Home` | No | Bienvenida con enlaces. |
| `/about` | `AboutUs` | No | Estática. |
| `/login` | `Login` | No | Formulario de login. Si ya está logueado, redirige a `/dashboard`. |
| `/dashboard` | `Dashboard` | **Sí** | Muestra nombre, email y rol del usuario logueado. Botón de logout. |
| `/users/:userId` | `UserProfile` | **Sí** | Igual que ejercicio 1, pero protegida. |
| `/products` | `Products` | **Sí** | Igual que ejercicio 1, pero protegida. |

### Navbar condicional

- Si **no hay sesión**: mostrar enlaces a Home, About y **"🔒 Iniciar sesión"** (→ `/login`).
- Si **hay sesión**: mostrar enlaces a Home, About, Productos, Usuarios y **"👤 Panel"** (→ `/dashboard`).

---

## Estructura de carpetas sugerida

```
src/
├── main.jsx
├── index.css
├── App.jsx
├── context/
│   ├── AuthContext.jsx
│   └── AuthProvider.jsx
├── hooks/
│   └── useAuth.js
├── data/
│   ├── credentials.js
│   ├── users.js
│   └── products.js
├── components/
│   ├── Layout/
│   │   ├── Layout.jsx
│   │   └── Layout.css
│   ├── Navbar/
│   │   ├── Navbar.jsx
│   │   └── Navbar.css
│   ├── Footer/
│   │   ├── Footer.jsx
│   │   └── Footer.css
│   └── PrivateRoute/
│       └── PrivateRoute.jsx
└── pages/
    ├── Home.jsx
    ├── AboutUs.jsx
    ├── Login.jsx
    ├── Dashboard.jsx
    ├── UserProfile.jsx
    └── Products.jsx
```

---

## Criterios de evaluación

- ✅ `AuthProvider` envuelve toda la aplicación (por encima de `BrowserRouter` o al mismo nivel).
- ✅ `AuthContext` expone `user` y `setUser`.
- ✅ `useAuth` encapsula la lógica de login/logout sin que los componentes accedan directamente al contexto.
- ✅ `PrivateRoute` redirige a `/login` si no hay sesión, pasando la ruta original en `state.from`.
- ✅ Tras un login exitoso, el usuario es redirigido a la ruta que intentaba visitar.
- ✅ Las rutas protegidas (`/dashboard`, `/users/:id`, `/products`) son inaccesibles sin sesión.
- ✅ El Navbar cambia dinámicamente según el estado de autenticación.
- ✅ Todos los componentes imprimen un `console.log` al renderizarse.

---

## Pistas

- `AuthProvider` debe estar **por encima** de `BrowserRouter` para que el contexto esté disponible en toda la app, incluyendo las rutas.
- `PrivateRoute` no es una `Route`, es un **componente wrapper** que envuelve el `element` de la `Route` protegida:
  ```jsx
  <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
  ```
- `<Navigate to="/login" state={{ from: location.pathname }} replace />` guarda la ruta de origen; el componente `Login` puede leerla con `location.state?.from`.
- En `Login`, si el usuario ya está autenticado (`user !== null`), devuelve `<Navigate to="/dashboard" />` directamente.
- `useAuth` usa `useContext(AuthContext)` y `useNavigate()` internamente; los componentes solo llaman a `login()` y `logout()`.

